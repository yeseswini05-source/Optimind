const router = require("express").Router();

const pool = require("../db");

const auth =
  require("../middleware/authMiddleware");

/* ======================================================
   CREATE PROFILES TABLE IF NOT EXISTS
====================================================== */

const createProfilesTable = async () => {

  try {

    await pool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id)
        ON DELETE CASCADE,
        name TEXT,
        age INTEGER,
        gender TEXT,
        height NUMERIC,
        weight NUMERIC,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log(
      "✅ Profiles table ready"
    );

  } catch (err) {

    console.error(
      "PROFILE TABLE ERROR:"
    );

    console.error(err);

  }

};

createProfilesTable();

/* ======================================================
   GET PROFILE
====================================================== */

router.get("/", auth, async (req, res) => {

  try {

    const profile = await pool.query(
      `
      SELECT *
      FROM profiles
      WHERE user_id = $1
      `,
      [req.user.id]
    );

    if (profile.rows.length === 0) {

      return res.json({
        success: true,
        profile: null
      });

    }

    res.json({
      success: true,
      profile: profile.rows[0]
    });

  } catch (err) {

    console.error(
      "GET PROFILE ERROR:"
    );

    console.error(err);

    res.status(500).json({
      success: false,
      error: "Server error"
    });

  }

});

/* ======================================================
   CREATE OR UPDATE PROFILE
====================================================== */

router.post("/", auth, async (req, res) => {

  try {

    const {
      name,
      age,
      gender,
      height,
      weight
    } = req.body;

    /* VALIDATION */

    if (!name || name.trim() === "") {

      return res.status(400).json({
        success: false,
        error: "Name is required"
      });

    }

    if (
      age &&
      (age < 1 || age > 120)
    ) {

      return res.status(400).json({
        success: false,
        error: "Invalid age"
      });

    }

    /* CHECK EXISTING PROFILE */

    const existing = await pool.query(
      `
      SELECT *
      FROM profiles
      WHERE user_id = $1
      `,
      [req.user.id]
    );

    let result;

    /* UPDATE */

    if (existing.rows.length > 0) {

      result = await pool.query(
        `
        UPDATE profiles
        SET
          name = $1,
          age = $2,
          gender = $3,
          height = $4,
          weight = $5
        WHERE user_id = $6
        RETURNING *
        `,
        [
          name,
          age || null,
          gender || null,
          height || null,
          weight || null,
          req.user.id
        ]
      );

    }

    /* INSERT */

    else {

      result = await pool.query(
        `
        INSERT INTO profiles
        (
          user_id,
          name,
          age,
          gender,
          height,
          weight
        )
        VALUES
        ($1,$2,$3,$4,$5,$6)
        RETURNING *
        `,
        [
          req.user.id,
          name,
          age || null,
          gender || null,
          height || null,
          weight || null
        ]
      );

    }

    res.json({
      success: true,
      message:
        "Profile saved successfully",
      profile: result.rows[0]
    });

  } catch (err) {

    console.error(
      "PROFILE SAVE ERROR:"
    );

    console.error(err);

    res.status(500).json({
      success: false,
      error: "Server error"
    });

  }

});

module.exports = router;