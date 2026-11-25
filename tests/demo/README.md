# Standalone DEMO / QA edition

Build the disposable edition from the repository root:

    python3 tests/demo/build.py

Serve the repository locally:

    python3 -m http.server 8000 --bind 127.0.0.1

Open http://127.0.0.1:8000/demo/index.html.

The generator embeds only synthetic fixtures produced by tests/fixtures/generate.py.
It does not modify the production index.html. The generated demo is excluded from Git.
The existing application parser, analysis, validation, financial logic and presentation
run with virtual file handles. Changes live in memory and reset on reload.
Production handle restoration, persistent handle access, native file pickers, external
email opening and native printing are disabled. Preferences are held in memory.

The browser workflow builds the demo, executes the browser tests, and uploads the
generated HTML, Playwright report and screenshots as the browser-test-evidence artifact.
This is not a GitHub Pages deployment; publishing a public demo would be a separate step.

Visual samples: 1920x1080 English/light/expanded, 1440x900 French/dark/expanded,
1280x800 Italian/light/collapsed. These are representative samples, not a full
cross-product of themes, locales and viewports, and not approved visual baselines.
Native file permission, cross-computer concurrency, Excel round trips, accessibility
and physical printing require separate testing.
