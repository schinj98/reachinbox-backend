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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchEmails = fetchEmails;
// src/services/email.service.ts
const imapflow_1 = require("imapflow");
const mailparser_1 = require("mailparser");
function fetchEmails(config) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
        var _d, _e;
        const client = new imapflow_1.ImapFlow(Object.assign({}, config));
        yield client.connect();
        yield client.mailboxOpen('INBOX');
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // last 30 days
        const emails = [];
        try {
            for (var _f = true, _g = __asyncValues(client.fetch({ since }, { source: true })), _h; _h = yield _g.next(), _a = _h.done, !_a; _f = true) {
                _c = _h.value;
                _f = false;
                const msg = _c;
                const parsed = yield (0, mailparser_1.simpleParser)(msg.source);
                emails.push({
                    id: msg.uid,
                    subject: parsed.subject,
                    description: parsed.html || convertPlainTextToHTML(parsed.text || ''),
                    preview: ((_d = parsed.text) === null || _d === void 0 ? void 0 : _d.slice(0, 120)) || '',
                    date: parsed.date,
                    from: (_e = parsed.from) === null || _e === void 0 ? void 0 : _e.text,
                    category: categorize(parsed.text || ''),
                });
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_f && !_a && (_b = _g.return)) yield _b.call(_g);
            }
            finally { if (e_1) throw e_1.error; }
        }
        yield client.logout();
        return emails;
    });
}
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
