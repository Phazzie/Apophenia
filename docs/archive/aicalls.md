> **ARCHIVED DOCUMENT**
>
> This document is archived and is no longer maintained. It is kept for historical purposes only.

# AI Call Audit (Apophenia)

This document provides a comprehensive audit of all AI calls within the Apophenia application. It details their implementation status, effectiveness, and provides suggestions for improvement.

---

## Existing AI Calls

### 1. Narrative Generation (Text)

*   **Purpose**: This is the core AI call responsible for generating the game's narrative, including story progression, character development, and player choices.
*   **AI Service & Model**:
    *   **Primary**: XAI's `grok-4-fast-reasoning`
    *   **Backup**: Google's Gemini models (`gemini-2.5-pro` and `gemini-flash-2.5-experimental`)
*   **Implementation Status**:
    *   **Completeness**: The implementation is comprehensive, with a clear primary and fallback system. The `unifiedAIService.ts` correctly routes requests to the appropriate model based on user selection or failure.
    *   **Effectiveness**: The prompts are well-engineered to leverage the models' capabilities, especially the "thinking mode" of Grok-4 and the extensive context window. The use of a `systemInstruction` to set the AI's persona as a "malevolent cosmic AI entity" is particularly effective for the game's theme.
*   **Suggestions & Improvements**:
    *   **Dynamic Prompt Adaptation**: The prompts are currently static. To enhance the experience, the system could dynamically adjust the prompts based on the player's psychological profile. For example, if a player consistently chooses "intrusive thought" options, the prompts could become more aggressive or surreal.
    *   **Refine Gemini Implementation**: The `generateWithGemini` function in `unifiedAIService.ts` uses a mock world state. This should be refactored to use the actual game state to ensure the Gemini fallback is as contextually aware as the Grok primary.

### 2. Image Generation

*   **Purpose**: This call generates atmospheric images to accompany the narrative, enhancing the cosmic horror experience.
*   **AI Service & Model**:
    *   **Primary**: XAI's `grok-4-fast-reasoning` (experimental)
    *   **Backup**: Google's `Imagen` models, with a fallback to Unsplash.
*   **Implementation Status**:
    *   **Completeness**: The implementation is functional but has some inconsistencies. The `grokService.ts` includes an experimental `generateImage` function that attempts to generate images with a text model, which is not ideal. The primary image generation logic resides in `imageGeneration.ts` and `genkit.ts`, which correctly use Imagen but are not fully aligned with your preference for Gemini.
    *   **Effectiveness**: The prompts for image generation are well-crafted, with specific instructions to create a "cosmic horror" aesthetic. The fallback to Unsplash is a good safety net, but it can break immersion if the images don't perfectly match the narrative.
*   **Suggestions & Improvements**:
    *   **Use Gemini for Image Generation**: As you requested, the image generation should be updated to use `gemini-2.5-pro` and `gemini-flash-2.5-experimental`. This will require refactoring the `imageGeneration.ts` and `genkit.ts` files to use the Gemini API for image generation instead of Imagen. This will also align the image generation with the text generation models, creating a more consistent AI ecosystem.
    *   **Remove Experimental Grok Image Generation**: The experimental `generateImage` function in `grokService.ts` should be removed to avoid confusion and potential errors. Image generation should be handled exclusively by the Google models, as per your direction.

### 3. Concept Generation

*   **Purpose**: This call generates the initial story concept, including the protagonist, setting, and dilemma.
*   **AI Service & Model**:
    *   **Primary**: XAI's `grok-4-fast-reasoning`
    *   **Backup**: Google's Gemini models
*   **Implementation Status**:
    *   **Completeness**: The implementation is robust, with a clear primary and fallback system. The `generateConceptWithSelectedModel` function in `unifiedAIService.ts` correctly routes requests to the appropriate model.
    *   **Effectiveness**: The prompts are well-designed to generate creative and engaging story concepts that align with the game's theme. The use of a detailed `systemInstruction` helps to ensure the generated concepts are consistent with the desired cosmic horror tone.
*   **Suggestions & Improvements**:
    *   **Allow for More Player Input**: The concept generation is currently driven entirely by the AI. To increase player agency, the system could allow players to provide a few keywords or a short phrase to influence the concept generation process. This would make the initial story feel more personalized.

---

## Missing AI Calls (Suggestions)

### 1. Dynamic Audio Generation

*   **Purpose**: To generate dynamic, atmospheric audio that adapts to the narrative in real-time. This could include background music, ambient sounds, and even subtle audio cues that correspond to in-game events.
*   **AI Service & Model**: There are several AI audio generation services available, such as Google's Lyria, or other open-source models.
*   **Benefits**:
    *   **Enhanced Immersion**: Adaptive audio would significantly enhance the game's cosmic horror atmosphere, making the experience more immersive and unsettling.
    *   **Increased Personalization**: The audio could be tailored to the player's psychological state, becoming more intense or distorted as their sanity declines.

### 2. Player Psychological Profiling

*   **Purpose**: To create a persistent psychological profile of the player based on their choices throughout the game. This profile could then be used to influence the narrative, image generation, and audio.
*   **AI Service & Model**: This could be implemented using the existing text generation models (Grok-4 or Gemini) with a specialized prompt that asks the AI to analyze the player's choices and update their profile.
*   **Benefits**:
    *   **Deeper Personalization**: A detailed psychological profile would allow the AI to tailor the horror to the individual player, making the experience more impactful.
    *   **Evolving Narrative**: The narrative could evolve in response to the player's changing psychological state, creating a truly dynamic and unpredictable story.

### 3. "Intrusive Thought" Expansion

*   **Purpose**: To expand on the existing "intrusive thought" mechanic by using AI to generate a wider and more unpredictable range of disturbing choices.
*   **AI Service & Model**: This would use the existing text generation models, but with a specific prompt that encourages the AI to generate more creative and unsettling intrusive thoughts.
*   **Benefits**:
    *   **Increased Unpredictability**: AI-generated intrusive thoughts would be less predictable than a predefined list, making the game more surprising and replayable.
    *   **Deeper Psychological Insight**: The intrusive thoughts could be tailored to the player's psychological profile, revealing their deepest fears and anxieties.

---

## Advanced AI Calls (Mega-Context Features)

These AI calls are found in `src/services/ai/megaContextFeatures.ts` and represent a more advanced, backend-driven layer of AI integration. They appear to be designed to leverage the large context windows of models like Gemini 2.5 Pro to create a deeply personalized and consistent narrative experience.

### 4. Mega-Context Story Analysis

*   **Purpose**: To analyze the entire game session, including the full history of player choices and the current world state, to identify deep patterns and maintain narrative consistency.
*   **AI Service & Model**: This feature is designed to be used with a large context window model, such as Google's `gemini-2.5-pro`. The code makes a `fetch` call to a backend API, which would then presumably make the call to the AI model.
*   **Implementation Status**:
    *   **Completeness**: The frontend implementation is in place, but it relies on a backend API that is not fully defined (it uses a placeholder URL: `https://your-backend-api.ondigitalocean.app`). The local fallback implementation is a good temporary solution, but it does not provide the same level of analysis as the full AI-powered version.
    *   **Effectiveness**: When fully implemented, this feature would be highly effective at creating a coherent and deeply personalized narrative experience. The ability to analyze the entire session history would allow the AI to maintain perfect continuity, even in very long playthroughs.
*   **Suggestions & Improvements**:
    *   **Implement the Backend API**: The most critical next step for this feature is to implement the backend API that makes the actual call to the AI model. This will require setting up a server that can receive requests from the frontend, format the data for the AI model, and then send the request to the Google AI API.
    *   **Secure the API**: The backend API should be secured to prevent unauthorized access. This could be done using API keys, OAuth, or another authentication mechanism.

### 5. Adaptive Horror Intensity

*   **Purpose**: To dynamically adjust the intensity of the horror based on a full analysis of the player's session.
*   **AI Service & Model**: Like the story analysis feature, this would use a large context window model on the backend.
*   **Implementation Status**:
    *   **Completeness**: The implementation is similar to the story analysis feature, with a frontend implementation that calls a placeholder backend API. The local fallback is a simple calculation based on the number of "trauma events" and "fear profile" entries.
    *   **Effectiveness**: This is a powerful feature that could significantly enhance the player experience. By adapting the horror to the individual player, the game could avoid becoming too overwhelming or not scary enough.
*   **Suggestions & Improvements**:
    *   **Define "Horror Intensity"**: The concept of "horror intensity" is subjective. The implementation could be improved by defining more clearly what this means in the context of the game. For example, does it affect the number of "intrusive thought" options, the tone of the narrative, or the content of the generated images?
    *   **Flesh out the Backend Logic**: The backend API for this feature will need to have a clear and well-defined logic for how it translates the AI's analysis into a specific "horror intensity" score.

### 6. Cross-Session Narrative Continuity

*   **Purpose**: To maintain narrative elements across multiple play sessions, creating a meta-narrative that connects different playthroughs.
*   **AI Service & Model**: This would also use a large context window model on the backend.
*   **Implementation Status**:
    *   **Completeness**: The implementation is consistent with the other mega-context features, with a frontend implementation that calls a placeholder backend API.
    *   **Effectiveness**: This is a highly innovative feature that could create a unique and memorable experience for players. The idea of a meta-narrative that spans multiple playthroughs is a powerful one, and it would be a great way to leverage the capabilities of modern AI models.
*   **Suggestions & Improvements**:
    *   **Consider Player Agency**: While a meta-narrative can be a powerful tool, it's important to consider player agency. Players should feel like their choices matter, even within the context of a larger, overarching story. The implementation should be careful not to make the player feel like they are just a pawn in a predetermined narrative.
    *   **Backend Implementation**: As with the other mega-context features, the backend API for this feature needs to be implemented.