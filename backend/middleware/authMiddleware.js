const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("token");

  if (!token) {
    return res.status(401).json({ error: "No token, access denied" });
  }

  try {
    const verified = jwt.verify(token, "SECRET");
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
};