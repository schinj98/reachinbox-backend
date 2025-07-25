"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const email_routes_1 = __importDefault(require("./routes/email.routes"));
const realtime_email_service_1 = require("./services/realtime-email.service");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:5173", // frontend URL or Vercel domain
        methods: ["GET", "POST"]
    }
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/emails', email_routes_1.default);
const accounts = [
    {
        host: "imap.gmail.com",
        port: 993,
        secure: true,
        auth: {
            user: process.env.EMAIL1_USER,
            pass: process.env.EMAIL1_PASS
        }
    },
    {
        host: "imap.gmail.com",
        port: 993,
        secure: true,
        auth: {
            user: process.env.EMAIL2_USER,
            pass: process.env.EMAIL2_PASS
        }
    }
];
(0, realtime_email_service_1.startEmailListeners)(io, accounts).catch(console.error);
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
