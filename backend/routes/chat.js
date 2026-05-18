const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const HOTEL_CONTEXT = `You are Aria, the elegant AI concierge of Groks Hotel & Resort in Victoria Island, Lagos.
Personality: Warm, sophisticated, and refined.
Rooms: Deluxe (85k), Executive (150k), Presidential (350k), Family (120k).
Keep responses concise (2-4 sentences).`;

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;
    const lastUserMessage = messages[messages.length - 1].content;

    // UPDATE: Use the current stable model for 2026
    // If 'gemini-2.5-flash' still 404s, use 'gemini-pro'
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `${HOTEL_CONTEXT}\n\nGuest: ${lastUserMessage}\nAria:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reply = response.text();

    res.json({ success: true, reply });
  } catch (err) {
    console.error('--- Gemini Error Details ---');
    console.error(err.message);
    
    // Fallback message for the frontend
    res.status(500).json({ success: false, message: 'Aria is briefly unavailable.' });
  }
});

module.exports = router;