// src/routes/email.routes.ts
import express from 'express';
import { fetchEmails } from '../services/email.service';

const router = express.Router();

router.post('/fetch', async (req, res) => {
  try {
    const { accounts } = req.body;
    console.log("📨 Incoming IMAP accounts:", accounts); // [{host, port, secure, auth: {user, pass}}, {...}]
    const allEmails = [];

    for (const acc of accounts) {
      const emails = await fetchEmails(acc);
      allEmails.push(...emails);
    }

    res.json({ emails: allEmails });
  } catch (e) {
    console.error(e);
    console.error("❌ Fetch failed:", e);
    res.status(500).send('Error fetching emails');
  }
});

export default router;
