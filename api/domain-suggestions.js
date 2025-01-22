const app = require('./index');
const openai = require('./index').openai;

app.post('/api/domain-suggestions', async (req, res) => {
  const { domain } = req.body;
  const email = req.session.email;

  if (req.session.userState !== 'awaiting_domain_input') {
    return res.status(400).json({ success: false, message: "Please verify your email first." });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an assistant that provides 10 creative domain name suggestions based on the input domain." },
        { role: "user", content: `Provide 10 domain name suggestions related to: ${domain}` },
      ],
      max_tokens: 100,
    });

    const suggestions = response.choices[0].message.content.trim();

    if (!suggestions) {
      return res.status(404).json({ success: false, message: "No suggestions found." });
    }

    const suggestionArray = suggestions.split("\n").map(s => s.trim());

    res.json({
      success: true,
      suggestions: suggestionArray,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error generating suggestions." });
  }
});
