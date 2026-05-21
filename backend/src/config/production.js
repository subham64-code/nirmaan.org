const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const env = require('./env');

const localConnectSrc = [
  "'self'",
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  env.appBaseUrl,
].filter(Boolean);

// Security middleware
const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: localConnectSrc,
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false
  }),
  
  // Rate limiting
  rateLimit({
    windowMs: parseInt(env.rateLimitWindowMs) || 15 * 60 * 1000, // 15 minutes
    max: env.nodeEnv === 'development' ? 10000 : (parseInt(env.rateLimitMaxRequests) || 100),
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),
  
  // CORS configuration
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (env.nodeEnv === 'development') {
        return callback(null, true);
      }

      const allowedOrigins = env.corsOrigin
        ? env.corsOrigin.split(',')
        : [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            env.appBaseUrl,
          ].filter(Boolean);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
];

// Trust proxy for rate limiting behind reverse proxy
const trustProxy = (app) => {
  app.set('trust proxy', 1);
};

module.exports = {
  securityMiddleware,
  trustProxy
};
