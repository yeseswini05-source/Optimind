const router = require("express").Router();

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const pool = require("../db");

/* ================= REGISTER ================= */

router.post("/register", async (req, res) => {

  try {

    const { email, password } = req.body;

    /* VALIDATION */

    if (!email || !password) {

      return res.status(400).json({
        error: "Email and password required"
      });

    }

    /* CHECK EXISTING USER */

    const existingUser = await pool.query(
      `
      SELECT *
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (existingUser.rows.length > 0) {

      return res.status(400).json({
        error: "User already exists"
      });

    }

    /* HASH PASSWORD */

    const hashedPassword =
      await bcrypt.hash(password, 10);

    /* INSERT USER */

    const newUser = await pool.query(
      `
      INSERT INTO users
      (email, password)
      VALUES ($1, $2)
      RETURNING id, email
      `,
      [email, hashedPassword]
    );

    /* CREATE JWT TOKEN */

    const token = jwt.sign(
      {
        id: newUser.rows[0].id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.json({
      success: true,
      message: "User registered successfully",
      token,
      user: newUser.rows[0]
    });

  } catch (err) {

    console.error("REGISTER ERROR:");
    console.error(err);

    res.status(500).json({
      success: false,
      error: "Server error"
    });

  }

});

/* ================= LOGIN ================= */

router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    /* VALIDATION */

    if (!email || !password) {

      return res.status(400).json({
        error: "Email and password required"
      });

    }

    /* FIND USER */

    const userQuery = await pool.query(
      `
      SELECT *
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (userQuery.rows.length === 0) {

      return res.status(400).json({
        error: "User not found"
      });

    }

    const user = userQuery.rows[0];

    /* CHECK PASSWORD */

    const validPassword =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!validPassword) {

      return res.status(400).json({
        error: "Invalid password"
      });

    }

    /* CREATE JWT */

    const token = jwt.sign(
      {
        id: user.id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.json({
      success: true,
      message: "Login successful",
      token
    });

  } catch (err) {

    console.error("LOGIN ERROR:");
    console.error(err);

    res.status(500).json({
      success: false,
      error: "Server error"
    });

  }

});

module.exports = router;