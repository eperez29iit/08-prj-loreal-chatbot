/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// OpenAI API configuration
const API_KEY = key; // from secrets.js
const API_URL = "https://api.openai.com/v1/chat/completions";

// L'Oréal brand system prompt - guides AI to focus on L'Oréal products and beauty advice
const SYSTEM_PROMPT = `You are a knowledgeable and friendly L'Oréal Beauty Advisor. Your role is to help customers with:
- L'Oréal product recommendations (hair care, skincare, makeup)
- Beauty routines and tips tailored to different hair and skin types
- Information about L'Oréal brands and product lines (including but not limited to: L'Oréal Paris, Garnier, Lancôme, Kérastase, Redken, etc.)
- General beauty and wellness advice related to L'Oréal expertise

IMPORTANT GUIDELINES:
✓ Always provide helpful, accurate information about L'Oréal products and services
✓ Offer personalized beauty recommendations based on customer needs
✓ Be warm, professional, and enthusiastic about L'Oréal's mission: "Because you're worth it"

✗ POLITELY REFUSE topics that are NOT related to L'Oréal products, routines, or beauty:
- Politics, religion, or controversial topics
- Medical advice (instead suggest consulting a dermatologist)
- Product comparisons with non-L'Oréal brands
- Non-beauty related questions

When refusing off-topic questions, use a friendly response like:
"I appreciate the question, but I'm specifically here to help with L'Oréal products and beauty advice. Is there anything L'Oréal-related I can help you with?"`;

// Set initial message
chatWindow.innerHTML =
  "<div class=\"msg ai\">👋 Welcome to L'Oréal Beauty Advisor! I'm here to help you find the perfect products and beauty routines. Ask me about L'Oréal products, skincare, haircare, makeup, or personalized beauty recommendations. How can I assist you today?</div>";

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user message
  const userMessage = userInput.value.trim();

  // Clear input field
  userInput.value = "";

  // Don't process empty messages
  if (!userMessage) return;

  // Display user message in chat
  displayMessage(userMessage, "user");

  try {
    // Show loading indicator while waiting for response
    displayMessage("✨ Thinking...", "ai");

    // Prepare the API request payload with messages array
    const payload = {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    };

    const workerURL = "https://sweet-king-182a.manolo596perez.workers.dev/";

    // Send request to OpenAI Chat Completions API
    const response = await fetch(workerURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Check if response is successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `API Error: ${response.status} ${errorData.error?.message || "Unknown error"}`,
      );
    }

    // Parse response JSON
    const data = await response.json();

    // Extract AI message from response - using data.choices[0].message.content
    const aiMessage = data.choices[0].message.content;

    // Remove loading indicator and display AI response
    removeLastMessage();
    displayMessage(aiMessage, "ai");
  } catch (error) {
    // Remove loading indicator and show error message
    removeLastMessage();

    console.error("Error:", error);

    // Display user-friendly error message
    let errorMsg =
      "I'm having trouble connecting right now. Please check your API key and try again.";
    if (error.message.includes("API Error")) {
      errorMsg =
        "Sorry, I encountered an error. Please make sure your API key is valid and try again.";
    }

    displayMessage(errorMsg, "ai");
  }
});

/* Display a message in the chat window */
function displayMessage(message, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `msg ${sender}`;
  messageDiv.textContent = message;
  chatWindow.appendChild(messageDiv);

  // Auto-scroll to bottom of chat
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Remove the last message (for removing loading indicator) */
function removeLastMessage() {
  const messages = chatWindow.querySelectorAll(".msg");
  if (messages.length > 0) {
    messages[messages.length - 1].remove();
  }
}
