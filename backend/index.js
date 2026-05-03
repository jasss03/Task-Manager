import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import mongoose from "mongoose"
import cookieParser from "cookie-parser"
import path from "path"

import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.route.js"
import taskRoutes from "./routes/task.route.js"
import reportRoutes from "./routes/report.route.js"
import { fileURLToPath } from "url"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const mongoURI = process.env.MONGO_URI || process.env.MONGO_URL

if (!mongoURI) {
  console.error(
    "❌ ERROR: MONGO_URI or MONGO_URL is not defined in environment variables!"
  )
} else {
  mongoose
    .connect(mongoURI)
    .then(() => {
      console.log("✅ Database is connected successfully")
    })
    .catch((err) => {
      console.error("❌ Database connection error:", err.message)
    })
}

const app = express()

// Middleware to handle cors
app.use(
  cors({
    origin: [
      process.env.FRONT_END_URL,
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ].filter(Boolean), // Remove undefined values
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
)

// Middleware to handle JSON object in req body
app.use(express.json())

app.use(cookieParser())

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}!`)
})

app.use("/api/auth", authRoutes)
app.get("/health", (req, res) => res.status(200).send("OK"))
app.use("/api/users", userRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/reports", reportRoutes)

// serve static files from "uploads" folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend/dist")))

// Catch-all route to serve index.html for React Router
app.get("/*path", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"))
})

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500

  const message = err.message || "Internal Server Error"

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  })
})
