const app = require('./index');
const openai = require('./index').openai;

app.post('/api/chat', async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ success: false, message: "Query is required." });
  }

  if (req.session.userState !== 'domain_suggested') {
    return res.status(400).json({ success: false, message: "Please get domain suggestions first." });
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

    res.json({
      success: true,
      answer: response.choices[0].message.content,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to process your question." });
  }
});
