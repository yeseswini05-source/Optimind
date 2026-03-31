
const router = require("express").Router();
const pool = require("../db");
const auth = require("../middleware/authMiddleware");

router.post("/", auth, async (req, res) => {
  const { content } = req.body;

  await pool.query(
    "INSERT INTO diary_entries (user_id, content) VALUES ($1,$2)",
    [req.user, content]
  );

  res.json("Saved");
});

router.get("/", auth, async (req, res) => {
  const entries = await pool.query(
    "SELECT * FROM diary_entries WHERE user_id=$1",
    [req.user]
  );

  res.json(entries.rows);
});

module.exports = router;
