require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// User-supplied values (name, user agent) must be escaped before going into HTML
const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * Shared email layout. Uses tables + inline styles because most email
 * clients (Gmail, Outlook) strip <style> blocks and ignore flexbox/grid.
 */
function renderLayout({ preheader, accent, badge, title, bodyHtml }) {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
            <!-- Header -->
            <tr>
              <td style="background-color:#0f172a;padding:24px 32px;">
                <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">Backend&nbsp;Ledger</span>
              </td>
            </tr>
            <tr>
              <td style="height:4px;background-color:${accent};line-height:4px;font-size:0;">&nbsp;</td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:32px;">
                <span style="display:inline-block;padding:4px 12px;border-radius:999px;background-color:${accent}1a;color:${accent};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;">${badge}</span>
                <h1 style="margin:16px 0 12px;font-size:22px;line-height:1.3;color:#0f172a;">${title}</h1>
                ${bodyHtml}
                <p style="margin:28px 0 0;font-size:15px;line-height:1.6;color:#334155;">Best regards,<br /><strong>The Backend Ledger Team</strong></p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding:20px 32px;background-color:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;line-height:1.6;color:#64748b;">
                This is an automated message from Backend Ledger. Please do not reply to this email.<br />
                &copy; ${new Date().getFullYear()} Backend Ledger. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

const paragraph = (html) =>
  `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">${html}</p>`;

async function sendRegistrationEmail(userEmail, name) {
  const safeName = escapeHtml(name);
  const subject = "Welcome to Backend Ledger";
  const text = `Hello ${name},\n\nThank you for registering at Backend Ledger! Your account has been created successfully and you're ready to start managing your ledger.\n\nIf you didn't create this account, please contact our support team immediately.\n\nBest regards,\nThe Backend Ledger Team`;

  const bodyHtml = `
    ${paragraph(`Hi <strong>${safeName}</strong>,`)}
    ${paragraph(`Thank you for registering at Backend Ledger! Your account has been created successfully and you're ready to start managing your ledger.`)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
      <tr>
        <td style="padding:16px 20px;font-size:14px;line-height:1.8;color:#334155;">
          <strong style="color:#0f172a;">Here's what you can do next:</strong><br />
          &#10003;&nbsp; Open your first account<br />
          &#10003;&nbsp; Record and track transactions<br />
          &#10003;&nbsp; Keep your balances in sync
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;">Didn't create this account? Please contact our support team immediately.</p>
  `;

  const html = renderLayout({
    preheader: `Welcome aboard, ${safeName}! Your Backend Ledger account is ready.`,
    accent: '#16a34a',
    badge: 'Account created',
    title: `Welcome aboard, ${safeName}!`,
    bodyHtml,
  });

  await sendEmail(userEmail, subject, text, html);
}

async function sendLoginEmail(userEmail, name, { ip, userAgent, time = new Date() } = {}) {
  const safeName = escapeHtml(name);
  const formattedTime = time.toUTCString();
  const subject = "New login to your Backend Ledger account";
  const text = `Hello ${name},\n\nWe noticed a new login to your Backend Ledger account.\n\nTime: ${formattedTime}\nIP address: ${ip || 'Unknown'}\nDevice: ${userAgent || 'Unknown'}\n\nIf this was you, no action is needed. If you don't recognise this activity, please reset your password immediately and contact our support team.\n\nBest regards,\nThe Backend Ledger Team`;

  const detailRow = (label, value) => `
      <tr>
        <td style="padding:10px 20px;font-size:13px;color:#64748b;width:110px;vertical-align:top;border-bottom:1px solid #e2e8f0;">${label}</td>
        <td style="padding:10px 20px;font-size:14px;color:#0f172a;vertical-align:top;border-bottom:1px solid #e2e8f0;word-break:break-word;">${escapeHtml(value || 'Unknown')}</td>
      </tr>`;

  const bodyHtml = `
    ${paragraph(`Hi <strong>${safeName}</strong>,`)}
    ${paragraph(`We noticed a new login to your Backend Ledger account. Here are the details:`)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;border-collapse:separate;">
      ${detailRow('Time', formattedTime)}
      ${detailRow('IP address', ip)}
      ${detailRow('Device', userAgent)}
    </table>
    ${paragraph(`If this was you, no action is needed.`)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef2f2;border-left:4px solid #dc2626;border-radius:6px;">
      <tr>
        <td style="padding:12px 16px;font-size:14px;line-height:1.6;color:#991b1b;">
          <strong>Wasn't you?</strong> Reset your password immediately and contact our support team.
        </td>
      </tr>
    </table>
  `;

  const html = renderLayout({
    preheader: `New login detected on ${formattedTime}.`,
    accent: '#2563eb',
    badge: 'Security alert',
    title: 'New login detected',
    bodyHtml,
  });

  await sendEmail(userEmail, subject, text, html);
}

module.exports = { sendRegistrationEmail, sendLoginEmail };
