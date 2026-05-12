const router = require("express").Router();

const pool = require("../db");

const auth = require("../middleware/authMiddleware");

/* ================= GET ANALYTICS ================= */

router.get("/", auth, async (req, res) => {

  try {

    /* ================= FETCH USER ENTRIES ================= */

    const result = await pool.query(
      `
      SELECT *
      FROM diary_entries
      WHERE user_id = $1
      ORDER BY created_at ASC
      `,
      [req.user.id]
    );

    const entries = result.rows;

    console.log("ANALYTICS USER:", req.user.id);
    console.log("ENTRIES FOUND:", entries.length);

    /* ================= EMPTY STATE ================= */

    if (entries.length === 0) {

      return res.json({
        average_sleep: 0,
        average_study: 0,
        average_productivity: 0,
        total_entries: 0,
        chartData: [],
        moodData: [],
        recentEntries: [],
        journalStreak: 0
      });

    }

    /* ================= VARIABLES ================= */

    let totalSleep = 0;
    let totalStudy = 0;
    let totalProductivity = 0;

    const moodMap = {};

    /* ================= PROCESS ENTRIES ================= */

    const processedEntries = entries.map((entry) => {

      const sleepHours =
        Number(entry.sleep_hours) || 0;

      const studyHours =
        Number(entry.study_hours) || 0;

      /* ===== TEXT-BASED LEVEL MAPPING ===== */

      const focusMap = {
        low: 3,
        medium: 6,
        high: 9
      };

      const stressMap = {
        low: 2,
        medium: 5,
        high: 8
      };

      const focusLevel =
        focusMap[
          String(entry.focus_level).toLowerCase()
        ] || 5;

      const stressLevel =
        stressMap[
          String(entry.stress_level).toLowerCase()
        ] || 5;

      const sentimentScore =
        Number(entry.sentiment_score) || 0;

      /* ================= PRODUCTIVITY FORMULA ================= */

      const sleepBonus =
        sleepHours >= 7 ? 20 : 5;

      const studyBonus =
        studyHours * 10;

      const focusBonus =
        focusLevel * 4;

      const stressPenalty =
        stressLevel * 3;

      const sentimentBonus =
        sentimentScore * 10;

      let productivityScore =

        sleepBonus +
        studyBonus +
        focusBonus +
        sentimentBonus -
        stressPenalty;

      /* ===== CLAMP SCORE ===== */

      productivityScore = Math.max(
        0,
        Math.min(100, productivityScore)
      );

      /* ================= TOTALS ================= */

      totalSleep += sleepHours;

      totalStudy += studyHours;

      totalProductivity += productivityScore;

      /* ================= MOOD COUNTS ================= */

      if (entry.mood) {

        moodMap[entry.mood] =
          (moodMap[entry.mood] || 0) + 1;

      }

      return {
        ...entry,
        productivity_score:
          Math.round(productivityScore)
      };

    });

    /* ================= AVERAGES ================= */

    const average_sleep =
      totalSleep / processedEntries.length;

    const average_study =
      totalStudy / processedEntries.length;

    const average_productivity =
      totalProductivity /
      processedEntries.length;

    /* ================= CHART DATA ================= */

    const chartData =
      processedEntries.map((entry, index) => ({

        day: `Day ${index + 1}`,

        productivity:
          entry.productivity_score || 0,

        sleep:
          entry.sleep_hours || 0,

        study:
          entry.study_hours || 0

      }));

    /* ================= MOOD DATA ================= */

    const moodData =
      Object.keys(moodMap).map((mood) => ({

        name: mood,
        value: moodMap[mood]

      }));

    /* ================= STREAK LOGIC ================= */

    let journalStreak = 1;

    for (
      let i = processedEntries.length - 1;
      i > 0;
      i--
    ) {

      const currentDate =
        new Date(
          processedEntries[i].created_at
        );

      const previousDate =
        new Date(
          processedEntries[i - 1].created_at
        );

      const difference =
        Math.abs(currentDate - previousDate);

      const daysDifference =
        difference / (1000 * 60 * 60 * 24);

      if (daysDifference <= 1.5) {

        journalStreak++;

      } else {

        break;

      }

    }

    /* ================= RECENT ENTRIES ================= */

    const recentEntries =
      [...processedEntries]
        .reverse()
        .slice(0, 5);

    /* ================= RESPONSE ================= */

    res.json({

      average_sleep:
        Number(average_sleep.toFixed(1)),

      average_study:
        Number(average_study.toFixed(1)),

      average_productivity:
        Number(
          average_productivity.toFixed(1)
        ),

      total_entries:
        processedEntries.length,

      journalStreak,

      chartData,

      moodData,

      recentEntries

    });

  } catch (err) {

    console.error("ANALYTICS ERROR:");
    console.error(err);

    res.status(500).json({
      error: "Server error"
    });

  }

});

module.exports = router;