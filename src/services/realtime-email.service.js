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
Object.defineProperty(exports, "__esModule", { value: true });
exports.startEmailListeners = startEmailListeners;
const imapflow_1 = require("imapflow");
const mailparser_1 = require("mailparser");
function convertPlainTextToHTML(text) {
    if (!text)
        return '<p>No content available</p>';
    const escaped = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const linkified = escaped.replace(/(https?:\/\/[^\s]+)/g, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">${url}</a>`);
    return linkified.replace(/\n/g, "<br/>");
}
function categorize(text) {
    const lower = text.toLowerCase();
    if (lower.includes('interested') || lower.includes("let's go") || lower.includes("yes"))
        return 'interested';
    if (lower.includes('meeting'))
        return 'meeting_booked';
    if (lower.includes('not interested'))
        return 'not_interested';
    if (lower.includes('spam'))
        return 'spam';
    if (lower.includes('out of office'))
        return 'out_of_office';
    return 'uncategorized';
}
function startEmailListeners(io, accounts) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const config of accounts) {
            const client = new imapflow_1.ImapFlow(Object.assign({}, config));
            yield client.connect();
            yield client.mailboxOpen('INBOX');
            console.log(`📡 Listening for new emails on ${config.auth.user}`);
            client.on('exists', () => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const lock = yield client.getMailboxLock('INBOX');
                try {
                    if (!client.mailbox || !client.mailbox.exists)
                        return;
                    const message = yield client.fetchOne(client.mailbox.exists, { source: true, uid: true });
                    if (!message || !message.source)
                        return;
                    const parsed = yield (0, mailparser_1.simpleParser)(message.source);
                    const email = {
                        id: message.uid,
                        subject: parsed.subject,
                        description: parsed.html || convertPlainTextToHTML(parsed.text || ''),
                        preview: ((_a = parsed.text) === null || _a === void 0 ? void 0 : _a.slice(0, 120)) || '',
                        date: parsed.date,
                        from: (_b = parsed.from) === null || _b === void 0 ? void 0 : _b.text,
                        category: categorize(parsed.text || ''),
                    };
                    console.log(`📩 New email on ${config.auth.user}: ${email.subject}`);
                    io.emit('new_email', email);
                }
                catch (err) {
                    console.error("⚠️ Error handling new email:", err);
                }
                finally {
                    lock.release();
                }
            }));
        }
    });
}
