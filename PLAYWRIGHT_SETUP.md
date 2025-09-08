# Playwright Setup (Optional)

The `verify.py` script is an end-to-end testing tool that requires Playwright.

## Installation

```bash
pip install playwright
playwright install
```

## Usage

```bash
# Start the dev server first
npm run dev

# Then run verification (in another terminal)
python verify.py
```

## Note

This is optional for development. The main application will work without Playwright installed.