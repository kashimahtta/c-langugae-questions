(() => {
  "use strict";

  const grid = document.querySelector("#problem-grid");
  const status = document.querySelector("#list-status");
  const detailSection = document.querySelector("#problem-detail");
  const detailContent = document.querySelector("#detail-content");
  const filterButtons = [...document.querySelectorAll(".filter-button")];
  const searchInput = document.querySelector("#problem-search");
  const emptyState = document.querySelector("#empty-state");
  const collection = document.querySelector("#problems");
  let problems = [];
  let activeFilter = "all";
  let activeSlug = null;
  let loading = false;

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);

  const highlightCode = (source) => {
    const tokenPattern = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|#\s*[^\n]*|\b(?:auto|bool|break|case|char|class|const|continue|default|do|double|else|enum|extern|float|for|if|int|long|namespace|private|printf|public|return|scanf|short|signed|sizeof|static|std|string|struct|switch|template|typedef|unsigned|using|void|while|cout|cin|endl)\b|\b\d+(?:\.\d+)?\b)/g;
    let output = "";
    let cursor = 0;
    for (const match of source.matchAll(tokenPattern)) {
      output += escapeHtml(source.slice(cursor, match.index));
      const token = match[0];
      let kind = "syntax-number";
      if (token.startsWith("//") || token.startsWith("/*")) kind = "syntax-comment";
      else if (token.startsWith('"') || token.startsWith("'")) kind = "syntax-string";
      else if (token.startsWith("#")) kind = "syntax-preprocessor";
      else if (/^[A-Za-z_]/.test(token)) kind = "syntax-keyword";
      output += `<span class="${kind}">${escapeHtml(token)}</span>`;
      cursor = match.index + token.length;
    }
    return output + escapeHtml(source.slice(cursor));
  };

  const getVisibleProblems = () => {
    const query = searchInput.value.trim().toLocaleLowerCase();
    return problems.filter((problem) => {
      const languageMatches = activeFilter === "all" || problem.language === activeFilter;
      const queryMatches = !query || `${problem.title} ${problem.description} ${problem.filename}`.toLocaleLowerCase().includes(query);
      return languageMatches && queryMatches;
    });
  };

  const renderProblems = () => {
    const visible = getVisibleProblems();
    grid.classList.remove("has-active");
    grid.innerHTML = visible.map((problem) => `
      <article class="problem-card" data-slug="${escapeHtml(problem.slug)}" tabindex="0">
        <div class="card-top">
          <span class="problem-number">${String(problem.number).padStart(2, "0")}</span>
          <span class="language-pill">${problem.language === "cpp" ? "C++" : "C"}</span>
        </div>
        <h3>${escapeHtml(problem.title)}</h3>
        <p>${escapeHtml(problem.description)}</p>
        <div class="card-bottom">
          <a class="see-code" href="/problems/${encodeURIComponent(problem.slug)}" data-problem-link="${escapeHtml(problem.slug)}">Explore code <span aria-hidden="true">→</span></a>
          <span class="difficulty-pill">${escapeHtml(problem.difficulty)}</span>
        </div>
      </article>
    `).join("");
    emptyState.hidden = visible.length > 0;
    document.querySelector("#collection-count").textContent = String(problems.length).padStart(2, "0");
    document.querySelector("#problem-count").textContent = `${problems.length} ${problems.length === 1 ? "program" : "programs"} in the collection`;
    if (!loading) status.textContent = `${visible.length} ${visible.length === 1 ? "program" : "programs"} shown`;
  };

  const fetchProblemList = async () => {
    const response = await fetch("/api/problems", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Problem discovery returned ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.problems)) throw new Error("The problem index response was invalid");
    const previousProblems = problems;
    const previousActive = activeSlug && previousProblems.find((problem) => problem.slug === activeSlug);
    const nextActive = activeSlug && data.problems.find((problem) => problem.slug === activeSlug);
    const changed = JSON.stringify(previousProblems) !== JSON.stringify(data.problems);
    problems = data.problems;
    if (changed) renderProblems();
    if (activeSlug) {
      if (!nextActive) navigateToHome();
      else if (previousActive && previousActive.revision !== nextActive.revision) loadProblem(activeSlug);
    }
    loading = false;
  };

  const renderDetails = (problem) => {
    const lines = problem.source.split("\n").length;
    const sampleMarkup = problem.sampleInput || problem.sampleOutput ? `
      <div class="sample-grid">
        ${problem.sampleInput ? `<div><p class="panel-label">Sample input</p><pre>${escapeHtml(problem.sampleInput)}</pre></div>` : ""}
        ${problem.sampleOutput ? `<div><p class="panel-label">Sample output</p><pre>${escapeHtml(problem.sampleOutput)}</pre></div>` : ""}
      </div>
    ` : "";
    detailContent.innerHTML = `
      <header class="detail-header">
        <p class="eyebrow"><span class="eyebrow-line"></span>${problem.language === "cpp" ? "C++" : "C"} practice · ${escapeHtml(problem.filename)}</p>
        <div class="detail-heading-line">
          <h1>${escapeHtml(problem.title)}</h1>
          <span class="difficulty-pill">${escapeHtml(problem.difficulty)}</span>
        </div>
        <p class="detail-summary">${escapeHtml(problem.description)}</p>
      </header>
      <div class="detail-layout">
        <div class="detail-main">
          <section class="problem-statement">
            <p class="panel-label">The problem</p>
            <p>${escapeHtml(problem.statement)}</p>
          </section>
          <div class="format-grid">
            <div><p class="panel-label">Input</p><p>${escapeHtml(problem.inputFormat)}</p></div>
            <div><p class="panel-label">Output</p><p>${escapeHtml(problem.outputFormat)}</p></div>
          </div>
          ${sampleMarkup}
          <section class="code-panel" aria-label="Read-only source code">
            <div class="code-toolbar">
              <span class="code-file">${escapeHtml(problem.filename)} · ${lines} lines</span>
              <button class="copy-button" type="button" id="copy-code">Copy code</button>
            </div>
            <div class="code-scroll" tabindex="0">
              <div class="line-numbers" aria-hidden="true">${Array.from({ length: lines }, (_, index) => index + 1).join("<br>")}</div>
              <pre><code>${highlightCode(problem.source)}</code></pre>
            </div>
          </section>
        </div>
        <aside class="execution-panel" aria-label="Program execution workspace">
          <div class="execution-heading"><p class="panel-label">Try it yourself</p><h2>Input &amp; output</h2></div>
          <div class="execution-body">
            <div class="terminal-label-row">
              <label for="program-input">Standard input</label>
              <button class="text-button" type="button" id="sample-input">Use sample</button>
            </div>
            <textarea class="terminal-input" id="program-input" spellcheck="false" aria-label="Program standard input" placeholder="Type input for this program…">${escapeHtml(problem.sampleInput)}</textarea>
            <div class="run-row">
              <button class="button button-primary run-button" type="button" id="run-program">Run program <span aria-hidden="true">▶</span></button>
              <span class="run-hint">Runs the saved source in a sandbox</span>
            </div>
            <div class="terminal-label-row">
              <label for="program-output">Output</label>
              <button class="text-button" type="button" id="clear-output">Clear</button>
            </div>
            <pre class="output-box" id="program-output" aria-live="polite">Run the program to see its output here.</pre>
            <p class="execution-status" id="execution-status" role="status"></p>
            <details class="batch-inputs">
              <summary>Run independent test cases</summary>
              <p class="batch-help">Put one complete input per line. Each line is a separate program run.</p>
              <textarea class="batch-input" id="batch-input" spellcheck="false" placeholder="123&#10;456"></textarea>
              <button class="button batch-run" type="button" id="run-batch">Run test cases <span aria-hidden="true">→</span></button>
            </details>
          </div>
        </aside>
      </div>
    `;
    document.querySelector("#copy-code").addEventListener("click", async (event) => {
      try {
        await navigator.clipboard.writeText(problem.source);
        event.currentTarget.textContent = "Copied";
        setTimeout(() => { event.currentTarget.textContent = "Copy code"; }, 1600);
      } catch {
        event.currentTarget.textContent = "Copy unavailable";
      }
    });
    document.querySelector("#sample-input").addEventListener("click", () => {
      document.querySelector("#program-input").value = problem.sampleInput;
    });
    document.querySelector("#clear-output").addEventListener("click", () => {
      const output = document.querySelector("#program-output");
      output.textContent = "";
      output.className = "output-box";
      document.querySelector("#execution-status").textContent = "";
    });
    document.querySelector("#run-program").addEventListener("click", () => runProgram(problem.slug, [document.querySelector("#program-input").value], false));
    document.querySelector("#run-batch").addEventListener("click", () => {
      const cases = document.querySelector("#batch-input").value.split(/\r?\n/).filter((input) => input.trim().length > 0);
      if (!cases.length) {
        setExecutionResult("Add at least one test case, with one complete input per line.", "error");
        return;
      }
      runProgram(problem.slug, cases, true);
    });
  };

  const setExecutionResult = (message, kind, statusText = "") => {
    const output = document.querySelector("#program-output");
    const statusLine = document.querySelector("#execution-status");
    if (!output || !statusLine) return;
    output.textContent = message;
    output.className = `output-box${kind === "error" ? " is-error" : kind === "success" ? " is-success" : ""}`;
    statusLine.textContent = statusText;
    statusLine.className = `execution-status${kind === "error" ? " is-error" : ""}`;
  };

  const runProgram = async (slug, inputs, batch) => {
    const button = document.querySelector(batch ? "#run-batch" : "#run-program");
    button.disabled = true;
    setExecutionResult("Preparing the isolated run…", "pending", "Compiling and running the saved source.");
    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ slug, inputs })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `Execution request failed (${response.status})`);
      const runs = result.results;
      const combined = runs.map((run, index) => {
        const label = `${batch ? `Test ${index + 1}` : "Run"} · ${run.status}${run.exitCode === null ? "" : ` · exit ${run.exitCode}`}`;
        const outputText = [run.stdout, run.stderr].filter(Boolean).join("\n");
        return `${label}\n${outputText || (run.status === "success" ? "(no output)" : "No output")}`;
      }).join("\n\n");
      const hasFailure = runs.some((run) => run.status !== "success");
      setExecutionResult(combined, hasFailure ? "error" : "success", hasFailure ? "One or more runs did not complete successfully." : `${runs.length} ${runs.length === 1 ? "run" : "runs"} completed successfully.`);
    } catch (error) {
      setExecutionResult(error instanceof Error ? error.message : "The program could not be run.", "error", "Execution is unavailable or failed.");
    } finally {
      button.disabled = false;
    }
  };

  const loadProblem = async (slug) => {
    loading = true;
    status.textContent = "Loading the selected program…";
    collection.hidden = true;
    document.querySelector(".intro").hidden = true;
    detailSection.hidden = false;
    detailContent.innerHTML = '<p class="live-message">Opening the original source file…</p>';
    try {
      const response = await fetch(`/api/problems/${encodeURIComponent(slug)}`, { headers: { Accept: "application/json" } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Problem request failed (${response.status})`);
      activeSlug = slug;
      renderDetails(data.problem);
    } catch (error) {
      detailContent.innerHTML = `<div class="empty-state"><h3>Could not open this problem</h3><p>${escapeHtml(error instanceof Error ? error.message : "Please try again.")}</p></div>`;
    } finally {
      loading = false;
    }
  };

  const navigateToHome = () => {
    activeSlug = null;
    document.querySelector(".intro").hidden = false;
    collection.hidden = false;
    detailSection.hidden = true;
    renderProblems();
  };

  const routeFromLocation = () => {
    const match = window.location.pathname.match(/^\/problems\/([a-z0-9-]+)\/?$/);
    if (match) {
      loadProblem(decodeURIComponent(match[1]));
    } else {
      navigateToHome();
      if (window.location.hash === "#problems") {
        requestAnimationFrame(() => document.querySelector("#problems").scrollIntoView());
      }
    }
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      filterButtons.forEach((item) => {
        const selected = item === button;
        item.classList.toggle("is-selected", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      renderProblems();
    });
  });
  searchInput.addEventListener("input", renderProblems);
  grid.addEventListener("pointerover", (event) => {
    const card = event.target.closest(".problem-card");
    if (!card || card.contains(event.relatedTarget)) return;
    grid.querySelectorAll(".problem-card").forEach((item) => item.classList.toggle("is-active", item === card));
    grid.classList.add("has-active");
  });
  grid.addEventListener("pointerleave", () => {
    grid.classList.remove("has-active");
    grid.querySelectorAll(".problem-card").forEach((item) => item.classList.remove("is-active"));
  });
  grid.addEventListener("focusin", (event) => {
    const card = event.target.closest(".problem-card");
    if (!card) return;
    grid.querySelectorAll(".problem-card").forEach((item) => item.classList.toggle("is-active", item === card));
    grid.classList.add("has-active");
  });
  grid.addEventListener("focusout", (event) => {
    if (grid.contains(event.relatedTarget)) return;
    grid.classList.remove("has-active");
    grid.querySelectorAll(".problem-card").forEach((item) => item.classList.remove("is-active"));
  });
  grid.addEventListener("click", (event) => {
    const link = event.target.closest("[data-problem-link]");
    if (!link) return;
    event.preventDefault();
    const slug = link.dataset.problemLink;
    history.pushState({}, "", `/problems/${encodeURIComponent(slug)}`);
    loadProblem(slug);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  window.addEventListener("popstate", routeFromLocation);
  fetchProblemList().then(routeFromLocation).catch((error) => {
    loading = false;
    status.textContent = `Could not discover programs: ${error.message}`;
    document.querySelector("#problem-count").textContent = "Problem discovery unavailable";
  });
  window.setInterval(() => {
    if (loading) return;
    fetchProblemList().catch((error) => { status.textContent = `Could not refresh the problem list: ${error.message}`; });
  }, 4000);
})();
