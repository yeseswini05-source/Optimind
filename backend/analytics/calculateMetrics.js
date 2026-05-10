function calculateMetrics(entry) {

  let productivityScore = 40;

  /* ================= STUDY HOURS ================= */

  if (entry.studyHours >= 6) {
    productivityScore += 30;
  }

  else if (entry.studyHours >= 4) {
    productivityScore += 22;
  }

  else if (entry.studyHours >= 2) {
    productivityScore += 12;
  }

  else if (entry.studyHours > 0) {
    productivityScore += 5;
  }

  /* ================= SLEEP QUALITY ================= */

  if (
    entry.sleepHours >= 7 &&
    entry.sleepHours <= 9
  ) {
    productivityScore += 20;
  }

  else if (
    entry.sleepHours >= 6 &&
    entry.sleepHours < 7
  ) {
    productivityScore += 10;
  }

  else if (entry.sleepHours < 5) {
    productivityScore -= 20;
  }

  else if (entry.sleepHours > 10) {
    productivityScore -= 10;
  }

  /* ================= FOCUS LEVEL ================= */

  if (entry.focusLevel === "high") {
    productivityScore += 15;
  }

  else if (entry.focusLevel === "medium") {
    productivityScore += 8;
  }

  else if (entry.focusLevel === "low") {
    productivityScore -= 10;
  }

  /* ================= STRESS LEVEL ================= */

  if (entry.stressLevel === "high") {
    productivityScore -= 20;
  }

  else if (entry.stressLevel === "medium") {
    productivityScore -= 8;
  }

  else if (entry.stressLevel === "low") {
    productivityScore += 5;
  }

  /* ================= MOOD ANALYSIS ================= */

  if (entry.mood === "productive") {
    productivityScore += 10;
  }

  else if (entry.mood === "motivated") {
    productivityScore += 8;
  }

  else if (entry.mood === "tired") {
    productivityScore -= 10;
  }

  else if (entry.mood === "stressed") {
    productivityScore -= 12;
  }

  /* ================= SENTIMENT SCORE ================= */

  if (entry.sentimentScore > 0.5) {
    productivityScore += 5;
  }

  else if (entry.sentimentScore < -0.3) {
    productivityScore -= 8;
  }

  /* ================= FINAL NORMALIZATION ================= */

  if (productivityScore > 100) {
    productivityScore = 100;
  }

  if (productivityScore < 0) {
    productivityScore = 0;
  }

  productivityScore = Math.round(productivityScore);

  return {
    productivityScore
  };
}

module.exports = calculateMetrics;