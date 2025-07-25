import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import emailRoutes from './routes/email.routes';
import { startEmailListeners } from './services/realtime-email.service';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      const allowedOrigins = ["http://localhost:5173", "https://reachinbox-lovat.vercel.app"];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use('/api/emails', emailRoutes);

const accounts = [
  {
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: {
      user: process.env.EMAIL1_USER!,
      pass: process.env.EMAIL1_PASS!
    }
  },
  {
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: {
      user: process.env.EMAIL2_USER!,
      pass: process.env.EMAIL2_PASS!
    }
  }
];

startEmailListeners(io, accounts).catch(console.error);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
