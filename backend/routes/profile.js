const router = require("express").Router();
const pool = require("../db");
const auth = require("../middleware/authMiddleware");

/* ===== CREATE OR UPDATE PROFILE ===== */
router.post("/", auth, async (req, res) => {
  try {
    const { name, age, gender, height, weight } = req.body;

    const existing = await pool.query(
      "SELECT * FROM profiles WHERE user_id = $1",
      [req.user.id]
    );

    let result;

    if (existing.rows.length > 0) {
      result = await pool.query(
        `UPDATE profiles
         SET name=$1, age=$2, gender=$3, height=$4, weight=$5
         WHERE user_id=$6
         RETURNING *`,
        [name, age, gender, height, weight, req.user.id]
      );
    } else {
      result = await pool.query(
        `INSERT INTO profiles (user_id, name, age, gender, height, weight)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [req.user.id, name, age, gender, height, weight]
      );
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;