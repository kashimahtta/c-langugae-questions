"use strict";

const http = require("node:http");
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs/promises");
const { spawn } = require("node:child_process");
const { createHash, randomUUID } = require("node:crypto");

const ROOT = __dirname;
const CODING_DIR = path.join(ROOT, "coding");
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";
const MAX_BODY_BYTES = 160 * 1024;
const MAX_INPUT_BYTES = 16 * 1024;
const MAX_SOURCE_BYTES = 128 * 1024;
const MAX_OUTPUT_BYTES = 64 * 1024;
const MAX_BATCH_SIZE = 8;
const MAX_CONCURRENT_RUNS = 2;
const RUN_TIMEOUT_MS = 8000;
const DOCKER_IMAGE = "gcc:14";
const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};
let activeRuns = 0;

const escapeTitle = (name) => {
  const withoutExtension = name.replace(/\.(c|cpp)$/i, "");
  const readable = withoutExtension.replace(/^\d+[-_. ]*/, "").replace(/[-_.]+/g, " ").replace(/\s+/g, " ").trim();
  return readable.replace(/\b[a-z]/g, (letter) => letter.toLocaleUpperCase()) || "Untitled program";
};

const parseMetadata = (source) => {
  const trimmed = source.replace(/^\uFEFF/, "").trimStart();
  const comment = trimmed.match(/^\/\*([\s\S]*?)\*\//) || trimmed.match(/^(?:\/\/[^\n]*(?:\n|$))+/);
  if (!comment) return {};
  const fields = {};
  let current = null;
  const knownFields = new Set(["TITLE", "DESCRIPTION", "STATEMENT", "DIFFICULTY", "INPUT", "OUTPUT", "SAMPLE_INPUT", "SAMPLE_OUTPUT"]);
  for (const rawLine of comment[0].replace(/^\/\*|^\s*\/\/|\/\*|\*\/$/gm, "").split(/\r?\n/)) {
    const line = rawLine.replace(/^\s*\*?\s?/, "").trimEnd();
    const field = line.match(/^\s*([A-Z_]+)\s*:\s*(.*)$/);
    if (field && knownFields.has(field[1])) {
      current = field[1];
      fields[current] = field[2].trim();
    } else if (current && line.trim()) {
      fields[current] += `${fields[current] ? "\n" : ""}${line.trim()}`;
    }
  }
  return fields;
};

const slugBase = (filename) => filename
  .replace(/\.(c|cpp)$/i, "")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

const discoverProblems = async () => {
  const entries = await fs.readdir(CODING_DIR, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && /\.(c|cpp)$/i.test(entry.name))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" }));
  const slugs = new Set();
  const problems = [];
  for (const filename of files) {
    const extension = path.extname(filename).toLocaleLowerCase();
    const language = extension === ".cpp" ? "cpp" : "c";
    const baseSlug = slugBase(filename);
    if (!baseSlug) continue;
    let slug = baseSlug;
    let suffix = 2;
    while (slugs.has(slug)) {
      slug = `${baseSlug}-${language}${suffix === 2 ? "" : `-${suffix}`}`;
      suffix += 1;
    }
    slugs.add(slug);
    const source = await fs.readFile(path.join(CODING_DIR, filename));
    const metadata = parseMetadata(source.toString("utf8"));
    const title = metadata.TITLE || escapeTitle(filename);
    const description = metadata.DESCRIPTION || `Explore this ${language === "cpp" ? "C++" : "C"} practice program.`;
    problems.push({
      slug,
      filename,
      title,
      description,
      difficulty: metadata.DIFFICULTY || "Practice",
      statement: metadata.STATEMENT || description,
      inputFormat: metadata.INPUT || "Use standard input as requested by the program.",
      outputFormat: metadata.OUTPUT || "The program writes its result to standard output.",
      sampleInput: metadata.SAMPLE_INPUT || "",
      sampleOutput: metadata.SAMPLE_OUTPUT || "",
      language,
      revision: createHash("sha256").update(source).digest("hex")
    });
  }
  return problems;
};

const getProblem = async (slug) => {
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) return null;
  const problems = await discoverProblems();
  const problem = problems.find((item) => item.slug === slug);
  if (!problem) return null;
  const sourcePath = path.resolve(CODING_DIR, problem.filename);
  if (path.dirname(sourcePath) !== CODING_DIR) return null;
  const source = await fs.readFile(sourcePath, "utf8");
  if (Buffer.byteLength(source, "utf8") > MAX_SOURCE_BYTES) {
    const error = new Error("This source file is too large to display or execute.");
    error.statusCode = 413;
    throw error;
  }
  return { ...problem, source };
};

const sendJson = (response, statusCode, body) => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(JSON.stringify(body));
};

const readJsonBody = async (request) => {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      const error = new Error("Request body exceeds the allowed size.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("Request body must be valid JSON.");
    error.statusCode = 400;
    throw error;
  }
};

const stopContainer = (name) => {
  return new Promise((resolve) => {
    const stop = spawn("docker", ["stop", "--time", "0", name], { stdio: "ignore", windowsHide: true });
    stop.on("error", resolve);
    stop.on("close", resolve);
  });
};

const executeInDocker = async (problem, input) => {
  const source = problem.source;
  if (Buffer.byteLength(source, "utf8") > MAX_SOURCE_BYTES) {
    return { status: "source-too-large", stdout: "", stderr: "Source file exceeds the execution size limit.", exitCode: null };
  }
  if (Buffer.byteLength(input, "utf8") > MAX_INPUT_BYTES) {
    return { status: "input-too-large", stdout: "", stderr: "Input exceeds the 16 KB limit.", exitCode: null };
  }
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "coding-garden-"));
  const sourceName = problem.language === "cpp" ? "program.cpp" : "program.c";
  const containerName = `coding-garden-${randomUUID()}`;
  let child;
  let stopPromise = null;
  let timedOut = false;
  let outputExceeded = false;
  let stdout = "";
  let stderr = "";
  try {
    await fs.writeFile(path.join(tempDir, sourceName), source, { encoding: "utf8", flag: "wx" });
    const compiler = problem.language === "cpp" ? "g++" : "gcc";
    const standard = problem.language === "cpp" ? "c++17" : "c17";
    const command = `${compiler} -std=${standard} -O0 /workspace/${sourceName} -o /tmp/program || exit 125; printf '\\n__CODING_GARDEN_COMPILED__\\n' >&2; exec /tmp/program`;
    const args = [
      "run", "--rm", "--pull=never", "--name", containerName,
      "--network=none", "--memory=128m", "--memory-swap=128m", "--cpus=0.5", "--pids-limit=32",
      "--read-only", "--tmpfs", "/tmp:rw,nosuid,size=32m",
      "--cap-drop=ALL", "--security-opt=no-new-privileges", "--user=65534:65534",
      "--mount", `type=bind,source=${tempDir},target=/workspace,readonly`,
      DOCKER_IMAGE, "sh", "-c", command
    ];
    const result = await new Promise((resolve) => {
      child = spawn("docker", args, { stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
      const timer = setTimeout(() => {
        timedOut = true;
        stopPromise = stopContainer(containerName);
        child.kill();
      }, RUN_TIMEOUT_MS);
      const appendOutput = (target, chunk) => {
        const value = chunk.toString("utf8");
        const existing = target === "stdout" ? stdout : stderr;
        const next = existing + value;
        if (Buffer.byteLength(next, "utf8") > MAX_OUTPUT_BYTES) {
          outputExceeded = true;
          stopPromise = stopContainer(containerName);
          child.kill();
          return;
        }
        if (target === "stdout") stdout = next;
        else stderr = next;
      };
      child.stdout.on("data", (chunk) => appendOutput("stdout", chunk));
      child.stderr.on("data", (chunk) => appendOutput("stderr", chunk));
      child.on("error", (error) => {
        clearTimeout(timer);
        resolve({ error });
      });
      child.on("close", (code) => {
        clearTimeout(timer);
        resolve({ code });
      });
      child.stdin.on("error", () => {});
      child.stdin.end(input);
    });
    if (result.error) {
      if (result.error.code === "ENOENT") {
        return { status: "unavailable", stdout: "", stderr: "Docker is required to run programs. Install and start Docker Desktop, then pull the gcc:14 image.", exitCode: null };
      }
      return { status: "unavailable", stdout: "", stderr: `Could not start Docker: ${result.error.message}`, exitCode: null };
    }
    if (timedOut) return { status: "timeout", stdout, stderr, exitCode: null };
    if (outputExceeded) return { status: "output-limit", stdout: stdout.slice(0, 12000), stderr: "Output exceeded the 64 KB limit.", exitCode: null };
    const compiled = stderr.includes("__CODING_GARDEN_COMPILED__");
    stderr = stderr.replace(/\n?__CODING_GARDEN_COMPILED__\n?/, "").trim();
    if (!compiled && result.code !== 0) {
      if (/cannot connect to the docker daemon|no such image:|pull access denied|permission denied while trying to connect|error during connect|failed to connect/i.test(stderr)) {
        return { status: "unavailable", stdout: "", stderr: `Docker could not start the compiler container. ${stderr}`, exitCode: result.code };
      }
      return { status: "compile-error", stdout, stderr: stderr || "Compilation failed.", exitCode: result.code };
    }
    return {
      status: result.code === 0 ? "success" : "runtime-error",
      stdout,
      stderr,
      exitCode: result.code
    };
  } finally {
    if (child && child.exitCode === null && child.signalCode === null) {
      stopPromise = stopContainer(containerName);
      child.kill();
    }
    if (stopPromise) await stopPromise;
    await fs.rm(tempDir, { recursive: true, force: true });
  }
};

const handleRun = async (request, response) => {
  if (activeRuns >= MAX_CONCURRENT_RUNS) {
    sendJson(response, 429, { error: "The execution queue is full. Please wait a moment and try again." });
    return;
  }
  activeRuns += 1;
  try {
    const body = await readJsonBody(request);
    if (!body || typeof body.slug !== "string" || !Array.isArray(body.inputs) || body.inputs.length < 1 || body.inputs.length > MAX_BATCH_SIZE) {
      sendJson(response, 400, { error: `Provide a problem slug and between 1 and ${MAX_BATCH_SIZE} input case(s).` });
      return;
    }
    if (!body.inputs.every((input) => typeof input === "string")) {
      sendJson(response, 400, { error: "Every input case must be a string." });
      return;
    }
    const problem = await getProblem(body.slug);
    if (!problem) {
      sendJson(response, 404, { error: "That problem was not found in coding/." });
      return;
    }
    const results = [];
    for (const input of body.inputs) {
      results.push(await executeInDocker(problem, input));
    }
    sendJson(response, 200, { results });
  } catch (error) {
    sendJson(response, error.statusCode || 500, { error: error.message || "Execution failed unexpectedly." });
  } finally {
    activeRuns -= 1;
  }
};

const serveFile = async (pathname, response) => {
  const knownFiles = new Map([
    ["/", path.join(ROOT, "index.html")],
    ["/index.html", path.join(ROOT, "index.html")],
    ["/styles.css", path.join(ROOT, "styles.css")],
    ["/app.js", path.join(ROOT, "app.js")]
  ]);
  const filename = knownFiles.get(pathname);
  if (filename) {
    const data = await fs.readFile(filename);
    response.writeHead(200, {
      "Content-Type": MIME_TYPES[path.extname(filename)] || "application/octet-stream",
      "Content-Length": data.length,
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer"
    });
    response.end(data);
    return;
  }
  if (/^\/problems\/[a-z0-9-]+\/?$/.test(pathname)) {
    const data = await fs.readFile(path.join(ROOT, "index.html"));
    response.writeHead(200, { "Content-Type": MIME_TYPES[".html"], "Content-Length": data.length, "X-Content-Type-Options": "nosniff" });
    response.end(data);
    return;
  }
  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" });
  response.end("Not found");
};

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
    if (request.method === "GET" && url.pathname === "/api/problems") {
      const problems = await discoverProblems();
      sendJson(response, 200, {
        problems: problems.map(({ source, ...problem }, index) => ({ ...problem, number: index + 1 }))
      });
      return;
    }
    const detailMatch = request.method === "GET" && url.pathname.match(/^\/api\/problems\/([a-z0-9-]+)$/);
    if (detailMatch) {
      const problem = await getProblem(detailMatch[1]);
      if (!problem) {
        sendJson(response, 404, { error: "Problem not found." });
        return;
      }
      sendJson(response, 200, { problem });
      return;
    }
    if (request.method === "POST" && url.pathname === "/api/run") {
      await handleRun(request, response);
      return;
    }
    if (request.method === "GET") {
      await serveFile(url.pathname, response);
      return;
    }
    response.writeHead(405, { Allow: "GET, POST", "Content-Type": "text/plain; charset=utf-8" });
    response.end("Method not allowed");
  } catch (error) {
    sendJson(response, error.statusCode || 500, { error: error.message || "The server could not complete the request." });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Coding Garden is running at http://${HOST}:${PORT}`);
  console.log(`Discovering C and C++ programs in ${CODING_DIR}`);
});
