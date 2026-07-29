const nodemailer = require("nodemailer");

// Uses a regular Gmail account + an "App Password" (not your normal Gmail
// password — Google requires a separate 16-character app password for this).
// See: https://myaccount.google.com/apppasswords
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

async function sendVerificationEmail(toEmail, code) {
  await transporter.sendMail({
    from: `"Ballet Enterprise" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your Ballet Enterprise verification code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 420px; margin: 0 auto;">
        <h2 style="color:#1a1a1a;">Verify your account</h2>
        <p style="color:#4d4d4d; font-size:15px;">Use the code below to finish creating your Ballet Enterprise account:</p>
        <p style="font-size:32px; font-weight:bold; letter-spacing:6px; color:#d9782d; text-align:center; margin:24px 0;">${code}</p>
        <p style="color:#767676; font-size:13px;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
}

// Notifies the admin the moment a new order comes in — sent to ADMIN_EMAIL
// (the same address used to log into the admin dashboard), so they don't
// need to have the dashboard open to know a sale just happened.
async function sendAdminOrderNotification(order, currencySymbol) {
  const itemsHTML = order.items
    .map(function (item) {
      return `
      <tr>
        <td style="padding:8px; border-bottom:1px solid #eee;">
          <img src="${item.image}" alt="${item.name}" width="48" height="48" style="border-radius:6px; object-fit:cover; vertical-align:middle;">
        </td>
        <td style="padding:8px; border-bottom:1px solid #eee; font-size:14px; color:#1a1a1a;">${item.name} &times;${item.qty}</td>
        <td style="padding:8px; border-bottom:1px solid #eee; font-size:14px; color:#1a1a1a; text-align:right;">${currencySymbol}${(item.price * item.qty).toFixed(2)}</td>
      </tr>
    `;
    })
    .join("");

  await transporter.sendMail({
    from: `"Ballet Enterprise" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `🛍️ New order ${order.orderNumber} — ${currencySymbol}${order.total.toFixed(2)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#1a1a1a;">New order received!</h2>
        <p style="color:#4d4d4d; font-size:15px;"><strong>${order.orderNumber}</strong> from ${order.customerName} (${order.customerContact})</p>
        <p style="color:#767676; font-size:13px;">Delivery address: ${order.address}</p>
        <table style="width:100%; border-collapse:collapse; margin:16px 0;">
          ${itemsHTML}
        </table>
        <p style="font-size:16px; font-weight:bold; color:#1a1a1a;">Total: ${currencySymbol}${order.total.toFixed(2)} (paid via ${order.paymentMethod === "momo" ? "Mobile Money" : "Card"})</p>
        <p style="color:#767676; font-size:13px;">Log into the admin dashboard to view full order details and update its status.</p>
      </div>
    `,
  });
}

module.exports = { sendVerificationEmail, sendAdminOrderNotification };
