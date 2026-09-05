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

// Middleware
app.use(cors())
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

app.listen(PORT, () => {
  console.log(`🚀 rawMitra Backend API & Database Service live on http://localhost:${PORT}`)
})
