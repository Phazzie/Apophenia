# How to Run the Demo

Follow these steps to get the game running on your local machine for demonstration purposes.

## 1. Install Dependencies

First, you need to install all the necessary project dependencies. Open a terminal in the project's root directory and run:

```bash
npm install
```

This will download and install all the packages defined in `package.json`.

## 2. Set Up Environment Variables

The game requires API keys for the AI services to function. 

1.  Find the file named `.env.local.example` in the root of the project.
2.  Create a copy of this file and rename it to `.env.local`.
3.  Open the new `.env.local` file and fill in the required API keys. The primary models used are Google Gemini and X.AI Grok.

```env
# Example .env.local file

# Google AI API Key for Gemini
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE

# X.AI API Key for Grok
VITE_XAI_API_KEY=YOUR_XAI_API_KEY_HERE
```

## 3. Run the Development Server

Once the dependencies are installed and your environment variables are set, you can start the local development server.

Run the following command:

```bash
npm run dev
```

This will start the application. The terminal will output a local URL, which is typically `http://localhost:5173/`.

## 4. Open in Browser

Open your web browser and navigate to the URL provided in the terminal (e.g., `http://localhost:5173/`).

The game's start screen should appear, and you are now ready to begin the demo.
