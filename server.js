require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { getShortLinkBase, getLanIp, getLinkMode } = require('./utils/linkBase');

const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');
const publicRoutes = require('./routes/publicRoutes');
const redirectRoutes = require('./routes/redirectRoutes');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Copy backend/.env.example to backend/.env');
  process.exit(1);
}

const app = express();

const clientOrigins = [process.env.CLIENT_URL, 'http://localhost:3000'].filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || clientOrigins.includes(origin) || process.env.CLIENT_URL === '*') {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', true);

app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/public', publicRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

app.get('/api/config', (req, res) => {
  const mode = getLinkMode();
  const shortLinkBase = getShortLinkBase();
  res.status(200).json({
    success: true,
    data: {
      shortLinkBase,
      mode,
      lanIp: getLanIp(),
      hint:
        mode === 'public'
          ? 'QR codes use your public URL — works from any network.'
          : mode === 'lan'
            ? 'QR codes use your Wi‑Fi IP. Phone must be on the same network as this laptop.'
            : 'Set PUBLIC_URL in backend/.env (e.g. ngrok) so phones can scan QR codes.',
    },
  });
});

app.use('/', redirectRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

connectDB().then(() => {
  app.listen(PORT, HOST, () => {
    const base = getShortLinkBase();
    const mode = getLinkMode();
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Short links & QR codes → ${base}/{code}`);
    if (mode === 'lan') {
      console.log('  (same Wi‑Fi: phone can scan QR codes)');
      console.log('  (different network: set PUBLIC_URL in .env — use ngrok or deploy)');
    }
    if (mode === 'localhost') {
      console.log('  WARNING: could not detect LAN IP — QR codes may not work on phones');
    }
  });
});
