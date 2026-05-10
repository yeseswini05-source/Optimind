const router = require("express").Router();

const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* ================= AI INSIGHT ROUTE ================= */

router.post("/", async (req, res) => {

  try {

    const analytics = req.body;

    const prompt = `
You are an AI productivity and behavioral coach.

Analyze the following user analytics:

Average Sleep: ${analytics.average_sleep} hours
Average Study: ${analytics.average_study} hours
Average Productivity: ${analytics.average_productivity}
Journal Streak: ${analytics.journalStreak} days

Generate:
- a short personalized insight
- supportive tone
- actionable recommendation
- maximum 3 sentences
`;

    const response =
      await client.chat.completions.create({

        model: "gpt-4.1-mini",

        messages: [
          {
            role: "system",
            content:
              "You are a supportive productivity coach."
          },
          {
            role: "user",
            content: prompt
          }
        ],

        temperature: 0.7,

        max_tokens: 120

      });

    const insight =
      response.choices[0].message.content;

    res.json({
      insight
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "AI insight failed"
    });

  }

});

module.exports = router;