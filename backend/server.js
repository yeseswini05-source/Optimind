require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

/* ================= ROUTES ================= */

const authRoutes =
  require("./routes/auth");

const profileRoutes =
  require("./routes/profile");

const diaryRoutes =
  require("./routes/diary");

const analyticsRoutes =
  require("./routes/analytics");

const aiInsightsRoute =
  require("./routes/aiInsights");

/* ================= MIDDLEWARE ================= */

app.use(cors());

app.use(express.json());

/* ================= API ROUTES ================= */

app.use("/auth", authRoutes);

app.use("/profile", profileRoutes);

app.use("/diary", diaryRoutes);

app.use("/api/analytics", analyticsRoutes);

app.use("/api/ai-insight", aiInsightsRoute);

/* ================= HEALTH CHECK ================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Diary Backend Running"
  });
});

/* ================= SERVER ================= */

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `🚀 Server running on port ${PORT}`
  );

});