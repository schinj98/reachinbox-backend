"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/email.routes.ts
const express_1 = __importDefault(require("express"));
const email_service_1 = require("../services/email.service");
const router = express_1.default.Router();
router.post('/fetch', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { accounts } = req.body; // [{host, port, secure, auth: {user, pass}}, {...}]
        const allEmails = [];
        for (const acc of accounts) {
            const emails = yield (0, email_service_1.fetchEmails)(acc);
            allEmails.push(...emails);
        }
        res.json({ emails: allEmails });
    }
    catch (e) {
        console.error(e);
        res.status(500).send('Error fetching emails');
    }
}));
exports.default = router;
