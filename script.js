// scripts.js
let count = 0;
let incClicks = 0;
let decClicks = 0;

// Cache DOM elements for performance
const countElement = document.getElementById('count');
const incCountElement = document.getElementById('incCount');
const decCountElement = document.getElementById('decCount');

// Get references to the buttons
const decrementBtn = document.getElementById('decrementBtn');
const incrementBtn = document.getElementById('incrementBtn');
const resetBtn = document.getElementById('resetBtn');
const storyBtn = document.getElementById('storyBtn'); // New button for Gemini API
const storyDisplay = document.getElementById('storyDisplay'); // New element for story display

const clickSound = document.getElementById('clickSound');
const resetSound = document.getElementById('resetSound');
const toggleSound = document.getElementById('toggleSound');

/**
 * Updates the display of the counter and click counts.
 * This function is called after every increment, decrement, or reset operation.
 */
function updateDisplay() {
    countElement.textContent = count;
    incCountElement.textContent = incClicks;
    decCountElement.textContent = decClicks;
}

/**
 * Increments the main counter and the increment click count.
 * Then updates the display.
 */
function inc() {
    count++;
    incClicks++;
    updateDisplay();
}

/**
 * Decrements the main counter and the decrement click count.
 * Then updates the display.
 */
function dec() {
    count--;
    decClicks++;
    updateDisplay();
}

/**
 * Resets all counters (main, increment clicks, decrement clicks) to zero.
 * Then updates the display.
 */
function reset() {
    count = 0;
    incClicks = 0;
    decClicks = 0;
    updateDisplay();
    storyDisplay.textContent = 'Click "✨ Get Counter Story ✨" to get a fun fact or story!'; // Clear story on reset
}

/**
 * Generates a quirky story or fun fact related to the current counter value
 * using the Gemini API.
 */
async function generateStory() {
    storyDisplay.textContent = 'Generating a unique story...'; // Loading indicator
    storyBtn.disabled = true; // Disable button while fetching

    const prompt = `Generate a very short, quirky, and imaginative story (2-3 sentences) or a fun fact that somehow relates to the number ${count}. Make it whimsical and unique.`;

    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    const payload = { contents: chatHistory };
    const apiKey = "AIzaSyDCzrVNRpCwvd6y3rV5EIKDBzgGU14n6zo"; // Canvas will provide this at runtime. DO NOT change this.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    let retries = 0;
    const maxRetries = 5;
    const baseDelay = 1000; // 1 second

    while (retries < maxRetries) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.status === 429) { // Too Many Requests
                const delay = baseDelay * Math.pow(2, retries) + Math.random() * 1000; // Exponential backoff with jitter
                retries++;
                await new Promise(resolve => setTimeout(resolve, delay));
                continue; // Retry the request
            }

            if (!response.ok) {
                // More specific error message for 403
                if (response.status === 403) {
                    throw new Error(`HTTP error! status: ${response.status}. This usually means your API key is invalid or lacks permissions. Please ensure the "Generative Language API" is enabled in your Google Cloud Project and billing is set up if required.`);
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }

            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                storyDisplay.textContent = text;
            } else {
                storyDisplay.textContent = 'Could not generate a story. Please try again.';
                console.error('Unexpected API response structure:', result);
            }
            break; // Exit loop on success
        } catch (error) {
            storyDisplay.textContent = 'Error generating story. Please try again.';
            console.error('Fetch error:', error);
            retries++;
            if (retries >= maxRetries) {
                console.error('Max retries reached. Failed to fetch story.');
                break;
            }
            const delay = baseDelay * Math.pow(2, retries) + Math.random() * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    storyBtn.disabled = false; // Re-enable button
}

// Add event listeners to buttons
incrementBtn.addEventListener('click', inc);
decrementBtn.addEventListener('click', dec);
resetBtn.addEventListener('click', reset);
storyBtn.addEventListener('click', generateStory); // Event listener for the new story button

// Initial update to ensure display matches initial variable states
updateDisplay();