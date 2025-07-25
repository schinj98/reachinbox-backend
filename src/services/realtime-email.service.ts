import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { Server } from 'socket.io';

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

export async function startEmailListeners(io: Server, accounts: any[]) {
  for (const config of accounts) {
    const client = new ImapFlow({ ...config });

    await client.connect();
    await client.mailboxOpen('INBOX');

    console.log(`📡 Listening for new emails on ${config.auth.user}`);

    client.on('exists', async () => {
      const lock = await client.getMailboxLock('INBOX');
      try {
        if (!client.mailbox || !client.mailbox.exists) return;

        const message = await client.fetchOne(client.mailbox.exists, { source: true, uid: true });
        if (!message || !message.source) return;

        const parsed = await simpleParser(message.source);

        const email = {
          id: message.uid,
          subject: parsed.subject,
          description: parsed.html || convertPlainTextToHTML(parsed.text || ''),
          preview: parsed.text?.slice(0, 120) || '',
          date: parsed.date,
          from: parsed.from?.text,
          category: categorize(parsed.text || ''),
        };

        console.log(`📩 New email on ${config.auth.user}: ${email.subject}`);
        io.emit('new_email', email);
      } catch (err) {
        console.error("⚠️ Error handling new email:", err);
      } finally {
        lock.release();
      }
    });
  }
}
