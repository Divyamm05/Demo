import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({ success: false, message: "Domain is required." });
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an assistant that provides creative domain name suggestions." },
          { role: "user", content: `Provide 10 domain name suggestions related to: ${domain}` },
        ],
        max_tokens: 100,
      });

      const suggestions = response.choices[0].message.content.trim();
      const suggestionArray = suggestions.split("\n").map(s => s.trim());

      res.json({
        success: true,
        suggestions: suggestionArray,
        message: "Domain suggestions provided.",
      });
    } catch (error) {
      console.error('Error generating domain suggestions:', error);
      res.status(500).json({ success: false, message: "Error generating suggestions." });
    }
  } else {
    res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
}
