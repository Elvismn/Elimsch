const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Throttle login brute-force
app.use(
  '/api/auth/login',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, data: null, message: 'Too many login attempts. Try again later.', errors: null },
  })
);

app.get('/health', (req, res) =>
  res.status(200).json({ success: true, data: { status: 'ok', uptime: process.uptime() }, message: 'OK', errors: null })
);

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;