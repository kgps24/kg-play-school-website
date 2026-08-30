const nodemailer = require('nodemailer');

function clean(value, maxLength = 1000) {
  return String(value ?? '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function escapeHtml(value) {
  return clean(value, 3000)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const {
    parentName,
    mobile,
    childAge,
    city,
    message = '',
    consent,
    website = ''
  } = req.body || {};

  // Honeypot: real visitors never see or fill this field.
  if (clean(website, 200)) {
    return res.status(200).json({ ok: true });
  }

  const name = clean(parentName, 120);
  const phone = clean(mobile, 20);
  const age = clean(childAge, 40);
  const location = clean(city, 120);
  const note = clean(message, 1500);

  if (!name || !/^[0-9]{10}$/.test(phone) || !age || !location || consent !== true) {
    return res.status(400).json({ error: 'Please complete all required fields correctly.' });
  }

  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_APP_PASSWORD;
  const emailTo = process.env.EMAIL_TO || emailUser;

  if (!emailUser || !emailPassword || !emailTo) {
    console.error('Missing required email environment variables.');
    return res.status(500).json({ error: 'Email service is not configured.' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPassword
    }
  });

  const submittedAt = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const subject = `New admission enquiry - ${name}`;
  const text = [
    'New KG Play School admission enquiry',
    '',
    `Parent / guardian: ${name}`,
    `Mobile: ${phone}`,
    `Child age: ${age}`,
    `City: ${location}`,
    `Message: ${note || 'No additional message'}`,
    'Consent: Yes - agreed to be contacted about this admission enquiry',
    `Submitted: ${submittedAt}`
  ].join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:680px;margin:auto">
      <h2 style="color:#103f68">New KG Play School admission enquiry</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;border-bottom:1px solid #ddd"><strong>Parent / guardian</strong></td><td style="padding:8px;border-bottom:1px solid #ddd">${escapeHtml(name)}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #ddd"><strong>Mobile</strong></td><td style="padding:8px;border-bottom:1px solid #ddd">${escapeHtml(phone)}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #ddd"><strong>Child age</strong></td><td style="padding:8px;border-bottom:1px solid #ddd">${escapeHtml(age)}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #ddd"><strong>City</strong></td><td style="padding:8px;border-bottom:1px solid #ddd">${escapeHtml(location)}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #ddd"><strong>Message</strong></td><td style="padding:8px;border-bottom:1px solid #ddd">${escapeHtml(note || 'No additional message')}</td></tr>
        <tr><td style="padding:8px"><strong>Submitted</strong></td><td style="padding:8px">${escapeHtml(submittedAt)}</td></tr>
      </table>
      <p style="font-size:12px;color:#6b7280">Consent was provided to be contacted about this admission enquiry.</p>
    </div>`;

  try {
    await transporter.sendMail({
      from: `KG Play School Website <${emailUser}>`,
      to: emailTo,
      replyTo: emailUser,
      subject,
      text,
      html
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Email send failed:', error);
    return res.status(500).json({ error: 'Unable to send the enquiry email.' });
  }
};
