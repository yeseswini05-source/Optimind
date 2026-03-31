const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  password: "postgres",   // ✅ FIXED (closing quote added)
  host: "localhost",
  port: 5432,
  database: "ai_diary"
});

pool.connect((err) => {
  if (err) {
    console.error("❌ Database connection error:", err.message);
  } else {
    console.log("✅ Connected to PostgreSQL database");
  }
});

module.exports = pool;