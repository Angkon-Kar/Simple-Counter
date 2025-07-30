let count = 0;
let incClicks = 0;
let decClicks = 0;

const countElement = document.getElementById('count');
const incCountElement = document.getElementById('incCount');
const decCountElement = document.getElementById('decCount');

const decrementBtn = document.getElementById('decrementBtn');
const incrementBtn = document.getElementById('incrementBtn');
const resetBtn = document.getElementById('resetBtn');
const storyBtn = document.getElementById('storyBtn');
const storyDisplay = document.getElementById('storyDisplay');

function updateDisplay() {
    countElement.textContent = count;
    incCountElement.textContent = incClicks;
    decCountElement.textContent = decClicks;
}

function inc() {
    count++;
    incClicks++;
    updateDisplay();
}

function dec() {
    count--;
    decClicks++;
    updateDisplay();
}

function reset() {
    count = 0;
    incClicks = 0;
    decClicks = 0;
    updateDisplay();
    storyDisplay.textContent = 'Click "✨ Get Counter Story ✨" to get a fun fact or story!';
}

async function generateStory() {
    storyDisplay.textContent = 'Generating a unique story...';
    storyBtn.disabled = true;

    const prompt = `Generate a very short, quirky, and imaginative story (2-3 sentences) or a fun fact that somehow relates to the number ${count}. Make it whimsical and unique.`;

    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    const payload = { contents: chatHistory };
    const apiKey = ""; // Add your Gemini API key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    let retries = 0;
    const maxRetries = 5;
    const baseDelay = 1000;

    while (retries < maxRetries) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.status === 429) {
                const delay = baseDelay * Math.pow(2, retries) + Math.random() * 1000;
                retries++;
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                storyDisplay.textContent = result.candidates[0].content.parts[0].text;
            } else {
                storyDisplay.textContent = 'Could not generate a story. Please try again.';
            }
            break;
        } catch (error) {
            console.error('Fetch error:', error);
            retries++;
            storyDisplay.textContent = 'Error generating story. Please try again.';
            if (retries >= maxRetries) break;
            const delay = baseDelay * Math.pow(2, retries) + Math.random() * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    storyBtn.disabled = false;
}

incrementBtn.addEventListener('click', inc);
decrementBtn.addEventListener('click', dec);
resetBtn.addEventListener('click', reset);
storyBtn.addEventListener('click', generateStory);

updateDisplay();