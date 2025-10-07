from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Navigate to the application
        page.goto("http://localhost:5173", timeout=60000)

        # Fill in the login form
        page.get_by_label("Email").fill("test.user@example.com")
        page.get_by_label("Password").fill("password123")

        # Click the Sign In button
        page.get_by_role("button", name="Sign In").click()

        # After login, the StartScreen should be visible
        # We can verify this by looking for the "Start New Game" button
        expect(page.get_by_role("button", name="Start New Game")).to_be_visible(timeout=30000)

        # Take a screenshot of the start screen after login
        page.screenshot(path="jules-scratch/verification/verification.png")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)