const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();

// Trust proxy - MUST be set before other middleware for Vercel
app.set('trust proxy', 1);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    process.env.CLIENT_URL || "http://localhost:3000",
    /https:\/\/.*\.vercel\.app$/  // Allow all Vercel preview deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased to 500 requests per 15 minutes for better UX
  skip: (req) => {
    // Skip rate limiting for progress updates to allow continuous video watching
    return req.path === '/api/progress/update';
  }
});
app.use(limiter);

// Separate, more lenient rate limiter for progress updates
const progressLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Allow 100 progress updates per minute (more than enough for 15s intervals)
  message: 'Too many progress updates, please try again later'
});
app.use('/api/progress', progressLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/community', require('./routes/community'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/rewards', require('./routes/rewards'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/reviews', require('./routes/reviews'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'EdUx Platform API',
    status: 'Running',
    version: '1.0.0',
    endpoints: {
      test: '/api/test',
      auth: '/api/auth',
      courses: '/api/courses',
      users: '/api/users'
    }
  });
});

// Favicon handler - prevent 404 errors
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

app.get('/favicon.png', (req, res) => {
  res.status(204).end();
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!', timestamp: new Date().toISOString() });
});

// Socket.io for real-time features
io.on('connection', (socket) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('User connected:', socket.id);
  }

  socket.on('join-community', (userId) => {
    socket.join('community');
  });

  socket.on('new-post', (post) => {
    socket.to('community').emit('post-created', post);
  });

  socket.on('disconnect', () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('User disconnected:', socket.id);
    }
  });
});

// MongoDB connection with proper timeout settings for Vercel and Atlas
// Use cached connection for serverless to avoid cold start issues
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  const mongooseOptions = {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    maxPoolSize: 10,
    minPoolSize: 2,
    retryWrites: true,
    retryReads: true,
    // Optimize for Atlas
    maxIdleTimeMS: 10000,
    compressors: 'zlib',
    // Better error handling
    autoIndex: process.env.NODE_ENV !== 'production',
  };

  try {
    if (mongoose.connection.readyState === 0) {
      const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edux_platform';
      await mongoose.connect(uri, mongooseOptions);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('MongoDB connected successfully');
        console.log('Database:', mongoose.connection.name);
      }
      
      // Set up connection event handlers
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        cachedDb = null;
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
      });
    }
    cachedDb = mongoose.connection;
    return cachedDb;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    cachedDb = null;
    throw err;
  }
}

// Initialize connection for non-serverless environments
if (process.env.NODE_ENV !== 'production') {
  connectToDatabase().catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
}

// Middleware to ensure DB connection on each request (for serverless)
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('Database connection failed:', err);
    
    // Provide helpful error messages
    let errorMessage = 'Database connection unavailable.';
    let hints = [];
    
    if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
      hints.push('Check your MongoDB Atlas connection string');
      hints.push('Verify your cluster is running');
    } else if (err.message.includes('authentication failed')) {
      hints.push('Check your database username and password');
    } else if (err.message.includes('IP') || err.message.includes('whitelist')) {
      hints.push('Add 0.0.0.0/0 to MongoDB Atlas IP whitelist for Vercel');
      hints.push('Or add your current IP address');
    } else if (err.message.includes('timeout')) {
      hints.push('Check your network connection');
      hints.push('Verify MongoDB Atlas cluster is accessible');
    }
    
    res.status(503).json({ 
      message: errorMessage,
      hints: hints.length > 0 ? hints : undefined,
      error: process.env.NODE_ENV !== 'production' ? err.message : undefined
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server running on port ${PORT}`);
  }
});

// Export for Vercel serverless
module.exports = app;