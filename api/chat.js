import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, message: "Query is required." });
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an assistant helping with domain suggestions." },
          { role: "user", content: query },
        ],
        max_tokens: 150,
      });

      const botResponse = response.choices[0].message.content;

      res.json({
        success: true,
        answer: botResponse,
      });
    } catch (error) {
      console.error('Error during AI chat:', error);
      res.status(500).json({ success: false, message: "Failed to process your question." });
    }
  } else {
    res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
}
