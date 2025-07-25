// src/services/email.service.ts
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';

export async function fetchEmails(config: {
  host: string;
  port: number;
  secure: boolean;
  auth: { user: string; pass: string };
}) {
  const client = new ImapFlow({ ...config });

  await client.connect();
  await client.mailboxOpen('INBOX');

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // last 30 days
  const emails = [];

  for await (const msg of client.fetch({ since }, { source: true })) {
    const parsed = await simpleParser(msg.source);
    emails.push({
      id: msg.uid,
      subject: parsed.subject,
      description: parsed.html || convertPlainTextToHTML(parsed.text || ''),
      preview: parsed.text?.slice(0, 120) || '',
      date: parsed.date,
      from: parsed.from?.text,
      category: categorize(parsed.text || ''),
    });
    
  }

  await client.logout();
  return emails;
}

function convertPlainTextToHTML(text: string): string {
  if (!text) return '<p>No content available</p>';

  const escaped = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const linkified = escaped.replace(
    /(https?:\/\/[^\s]+)/g,
    (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">${url}</a>`
  );

  return linkified.replace(/\n/g, "<br/>");
}


function categorize(text: string): string {
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
