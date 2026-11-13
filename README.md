# Coding Garden — C & C++ practice

A small, file-driven learning site for the existing C and C++ exercises. The original programs stay in `coding/`; the site discovers every `.c` and `.cpp` file there, so adding a source file does not require adding a page or editing an index.

## Run locally

1. Install Node.js 20 or newer.
2. From the repository root, run `npm start`.
3. Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

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
