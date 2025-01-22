const app = require('./index');
const openai = require('./index').openai;

app.post('/api/chat', async (req, res) => {
  const { query } = req.body;

  // Ensure query is provided
  if (!query) {
    return res.status(400).json({ success: false, message: "Query is required." });
  }

  try {
    // Call OpenAI's chat API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an assistant helping with domain suggestions." },
        { role: "user", content: query },
      ],
      max_tokens: 150,
    });

    // Respond with OpenAI's answer
    res.json({
      success: true,
      answer: response.choices[0].message.content,
    });
  } catch (error) {
    console.error("Error processing OpenAI request:", error); // Log the error
    res.status(500).json({ success: false, message: "Failed to process your question." });
  }
});
