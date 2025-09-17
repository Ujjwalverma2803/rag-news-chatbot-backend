const express = require("express");
const cors = require("cors");
const chatRoutes = require("./routes/chat");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use("/api", chatRoutes);

// Optional: health check
app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("Server listening on", PORT));
