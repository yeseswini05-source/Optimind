const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {

  try {

    const token = req.header("token");

    if (!token) {

      return res.status(401).json({
        error: "No token, access denied"
      });

    }

    const verified = jwt.verify(
      token,
      process.env.JWT_SECRET || "SECRET"
    );

    req.user = verified;

    next();

  } catch (err) {

    console.error("TOKEN ERROR:");
    console.error(err);

    return res.status(401).json({
      error: "Invalid token"
    });

  }

};