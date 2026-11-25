# Browser integration tests

The fixture generator creates minimal synthetic OOXML workbooks. No real data is required. These fixtures exercise the production ZIP/XML reader, parser and controls in Chromium, but do not establish compatibility with every real Excel template.

Run from the repository root:

    python3 tests/fixtures/generate.py
    npm install --no-save --package-lock=false @playwright/test@1.56.1
    npx playwright install chromium
    npx playwright test --config=playwright.config.cjs

The fallback upload test uses actual browser file inputs, not the native writable directory picker. Native filesystem permissions, Excel round trips, persistent DEMO mode and full visual coverage remain future work.

Generated fixtures and test outputs must not be committed. All dependencies are development-only.