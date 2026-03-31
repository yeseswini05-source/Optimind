
const express = require("express");
const cors = require("cors");

const app = express();
const profileRoutes = require("./routes/profile");

app.use(cors());
app.use(express.json());

app.use("/auth", require("./routes/auth"));
app.use("/profile", require("./routes/profile"));
app.use("/diary", require("./routes/diary"));

app.listen(5000, () => console.log("Server running on 5000"));
app.use("/profile", profileRoutes);