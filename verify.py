import sys
from playwright.sync_api import sync_playwright, expect

def run_verification(page):
    """
    This script verifies that the game starts correctly,
    loads the first step, and displays choices to the player.
    """
    # 1. Arrange: Go to the application's URL.
    page.goto("http://localhost:5173")

    # 2. Act: Find the "Begin" button and click it.
    begin_button = page.get_by_role("button", name="Begin")
    expect(begin_button).to_be_visible()
    begin_button.click()

    # 3. Assert: Wait for the game to enter and then exit the loading state.
    # We expect to see "Loading..." text, which confirms the game is fetching the first step.
    loading_text = page.get_by_text("Loading...")
    expect(loading_text).to_be_visible(timeout=15000) # Increased timeout for AI call

    # Now, wait for the loading text to disappear.
    expect(loading_text).to_be_hidden(timeout=60000) # Long timeout for the AI to respond

    # 4. Assert: Check that choices are now visible.
    # We check for a button with the text "Begin the story", which is the first "choice".
    # In a real scenario, we'd check for the actual choices returned by the AI.
    first_choice = page.get_by_role("button", name="Begin the story")
    expect(first_choice).to_be_visible()

    # 5. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="verification.png")
    print("Screenshot taken successfully.")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            run_verification(page)
        except Exception as e:
            print(f"Verification script failed: {e}", file=sys.stderr)
            # Take a screenshot even on failure for debugging
            page.screenshot(path="error_screenshot.png")
            sys.exit(1)
        finally:
            browser.close()

if __name__ == "__main__":
    main()
