import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import apiRoutes from './routes/api.js'
import { initDatabase } from './db/database.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Initialize Database Schema
initDatabase()

// Allowed origins for cross-origin requests
const allowedOrigins = [
  'https://raw-mitra.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean)

// Middleware - Configured for Vercel cross-origin requests
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, cURL, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('CORS policy violation: Origin not allowed'))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.use(express.json())

// Request Logger
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`)
  })
  next()
})

// Mount API router
app.use('/api', apiRoutes)

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err)
  res.status(500).json({ error: 'Internal server error', message: err.message })
})

// Listen on 0.0.0.0 for cloud host compatibility
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 rawMitra Backend API & Database Service live on port ${PORT}`)
})
