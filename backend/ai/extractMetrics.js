const vader = require("vader-sentiment");

const positiveWords = [
  "happy",
  "motivated",
  "focused",
  "productive",
  "energetic"
];

const negativeWords = [
  "stressed",
  "tired",
  "burned out",
  "distracted",
  "anxious"
];

const focusWords = [
  "focused",
  "productive",
  "concentrated",
  "deep work"
];

function extractMetrics(text) {

  const sleepRegex =
    /(sleep|slept)(?:.*?)(\d+)\s*(hours|hrs)/i;

  const studyRegex =
    /(study|studied|coding|coded|revised)(?:.*?)(\d+)\s*(hours|hrs)/i;

  let sleepHours = 0;
  let studyHours = 0;
  let mood = "neutral";
  let focusLevel = "medium";
  let stressLevel = "low";

  const sleepMatch = text.match(sleepRegex);
  const studyMatch = text.match(studyRegex);

  if (sleepMatch) {
    sleepHours = parseInt(sleepMatch[2]);
  }

  if (studyMatch) {
    studyHours = parseInt(studyMatch[2]);
  }

  const lowerText = text.toLowerCase();

  // Mood detection
  for (const word of positiveWords) {
    if (lowerText.includes(word)) {
      mood = word;
    }
  }

  for (const word of negativeWords) {
    if (lowerText.includes(word)) {
      mood = word;
    }
  }

  // Sentiment
  const sentiment =
    vader.SentimentIntensityAnalyzer.polarity_scores(text);

  // Focus detection
  for (const word of focusWords) {
    if (lowerText.includes(word)) {
      focusLevel = "high";
    }
  }

  // Stress detection
  if (
    sentiment.compound < -0.3 ||
    lowerText.includes("stressed") ||
    lowerText.includes("anxious")
  ) {
    stressLevel = "high";
  }

  return {
    sleepHours,
    studyHours,
    mood,
    focusLevel,
    stressLevel,
    sentimentScore: sentiment.compound
  };
}

module.exports = extractMetrics;