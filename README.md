# Coding Garden — C & C++ practice

A small, file-driven learning site for the existing C and C++ exercises. The original programs stay in `coding/`; the site discovers every `.c` and `.cpp` file there, so adding a source file does not require adding a page or editing an index.

## live deployed link

[dsaseries.vercel.app](https://dsaseries.vercel.app/)

## Run locally

1. Install [Node.js](https://nodejs.org/) 20 or newer. npm is included with Node.js.
2. Open this repository folder in VS Code and select **Terminal > New Terminal**. Make sure the terminal is in the repository root, where `package.json` is located.
3. Start the website:

   ```powershell
   npm start
   ```

4. Open [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser. Keep the terminal open while using the site. Press **Ctrl+C** in the terminal to stop the server; run `npm start` again to restart it.

The website runs locally on your computer; pushing to GitHub does not automatically make it a live website. Docker is optional for browsing but required to run programs, as described below.

## Deploying to Vercel

Import this repository into Vercel and keep the project root set to the repository root, where `vercel.json` and `package.json` are located. The Vercel configuration serves the HTML, CSS, and browser JavaScript as static files, routes API requests to the Node.js handler, and includes the `coding/` source files in the function bundle.

Program execution is disabled on Vercel because serverless functions cannot start Docker containers. The site and problem listings remain available; use the local Docker-backed server to compile and run programs.

The problem list refreshes automatically while the page is open, including new files and edits to existing source; an open problem refreshes when its source changes. On the detail page, the code viewer reads the original source file and is read-only. Optional metadata can be added in a leading comment:

```c
/*
TITLE: Reverse Number
DESCRIPTION: Reverse the digits of an integer.
DIFFICULTY: Easy

STATEMENT:
Write a program to reverse the digits of a given integer.

INPUT:
A single integer.

OUTPUT:
Print the reversed integer.

SAMPLE_INPUT:
12345

SAMPLE_OUTPUT:
54321
*/
```

Supported fields are `TITLE`, `DESCRIPTION`, `STATEMENT`, `DIFFICULTY`, `INPUT`, `OUTPUT`, `SAMPLE_INPUT`, and `SAMPLE_OUTPUT`. Missing fields receive readable defaults based on the filename.

## Running programs

Execution is intentionally isolated: the local Node server passes the original source to a short-lived Docker container with no network, a read-only source mount, resource limits, and an execution timeout. Install and start Docker Desktop, then pull the compiler image once with `docker pull gcc:14`. If Docker is not available, the site reports that execution is unavailable; it does not pretend to run the program.

The server binds to `127.0.0.1` by default. Keep it on loopback; do not expose this development execution endpoint to the public internet. The runner accepts standard input only, not source uploads. Batch mode treats each non-empty line as a separate, independent run.

## Existing files

All existing files in `coding/`, including the C++, C, and HTML exercises, are preserved. Only `.c` and `.cpp` files are shown in the problem index.
