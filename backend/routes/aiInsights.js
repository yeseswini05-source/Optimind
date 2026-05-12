const router = require("express").Router();

const OpenAI = require("openai");

const {
  GoogleGenerativeAI
} = require("@google/generative-ai");

/* ================= OPENAI ================= */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* ================= GEMINI ================= */

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const geminiModel =
  genAI.getGenerativeModel({
    model: "gemini-1.5-flash"
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
- short personalized insight
- supportive tone
- actionable recommendation
- maximum 3 sentences
`;

    /* =======================================================
       STEP 1 — TRY OPENAI
    ======================================================= */

    try {

      const response =
        await openai.chat.completions.create({

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

      console.log("✅ OpenAI insight used");

      return res.json({
        success: true,
        provider: "OpenAI",
        insight:
          response.choices[0].message.content
      });

    } catch (openaiError) {

      console.log(
        "⚠️ OpenAI failed — switching to Gemini"
      );

    }

    /* =======================================================
       STEP 2 — TRY GEMINI
    ======================================================= */

    try {

      const result =
        await geminiModel.generateContent(prompt);

      const response =
        await result.response;

      const text =
        response.text();

      console.log("✅ Gemini insight used");

      return res.json({
        success: true,
        provider: "Gemini",
        insight: text
      });

    } catch (geminiError) {

      console.log(
        "⚠️ Gemini failed — switching to local fallback"
      );

    }

    /* =======================================================
       STEP 3 — LOCAL FALLBACK AI
    ======================================================= */

    let insight = "";

    if (analytics.average_productivity >= 80) {

      insight =
        "You are maintaining strong productivity habits consistently. Your study discipline and journaling routine are helping you stay focused and balanced. Keep maintaining your current momentum while avoiding burnout.";

    } else if (
      analytics.average_productivity >= 50
    ) {

      insight =
        "Your productivity is moderate and has room for improvement. Improving sleep consistency and maintaining a better journaling routine may help increase your focus and daily performance.";

    } else {

      insight =
        "Your recent patterns suggest stress or reduced productivity levels. Prioritize better sleep, lighter workloads, and smaller achievable goals to gradually rebuild consistency and motivation.";

    }

    if (analytics.average_sleep < 5) {

      insight +=
        " Your average sleep is currently low, which may significantly affect focus, energy, and emotional balance.";

    }

    if (analytics.average_study < 2) {

      insight +=
        " Study hours are currently below your potential, so creating a structured daily routine could help improve consistency.";

    }

    if (analytics.journalStreak >= 5) {

      insight +=
        " Your journaling consistency is excellent and shows strong self-awareness habits.";

    }

    console.log("✅ Local fallback insight used");

    return res.json({
      success: true,
      provider: "Local AI",
      insight
    });

  } catch (err) {

    console.error("AI INSIGHT ERROR:");
    console.error(err);

    res.status(500).json({
      success: false,
      error: "AI insight failed"
    });

  }

});

module.exports = router;