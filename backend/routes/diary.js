const router = require("express").Router();
const pool = require("../db");
const auth = require("../middleware/authMiddleware");

const extractMetrics = require("../ai/extractMetrics");
const calculateMetrics = require("../analytics/calculateMetrics");

/* ================= SAVE DIARY ENTRY ================= */

router.post("/", auth, async (req, res) => {
  try {

    const { content } = req.body;

    // NLP Extraction
    const metrics = extractMetrics(content);

    // Analytics Calculation
    const analytics = calculateMetrics(metrics);

    console.log("EXTRACTED METRICS:");
    console.log(metrics);

    console.log("ANALYTICS:");
    console.log(analytics);

    // Save into PostgreSQL
    await pool.query(
      `
      INSERT INTO diary_entries
      (
        user_id,
        content,
        sleep_hours,
        study_hours,
        mood,
        focus_level,
        stress_level,
        sentiment_score,
        productivity_score
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `,
      [
        req.user.id,
        content,
        metrics.sleepHours,
        metrics.studyHours,
        metrics.mood,
        metrics.focusLevel,
        metrics.stressLevel,
        metrics.sentimentScore,
        analytics.productivityScore
      ]
    );

    res.json({
      success: true,
      message: "Diary entry saved successfully",
      metrics,
      analytics
    });

  } catch (err) {

    console.error("DIARY SAVE ERROR:");
    console.error(err);

    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

/* ================= GET USER ENTRIES ================= */

router.get("/", auth, async (req, res) => {

  try {

    const entries = await pool.query(
      `
      SELECT *
      FROM diary_entries
      WHERE user_id = $1
      ORDER BY id DESC
      `,
      [req.user.id]
    );

    res.json(entries.rows);

  } catch (err) {

    console.error("FETCH ENTRIES ERROR:");
    console.error(err);

    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

module.exports = router;