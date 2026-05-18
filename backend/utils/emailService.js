const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// ── Base email template ──────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Groks Hotel</title>
</head>
<body style="margin:0;padding:0;background:#0B1320;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B1320;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="background:#0d1b2a;padding:40px;text-align:center;border-bottom:1px solid rgba(200,169,106,0.3);">
              <h1 style="margin:0;color:#F7F3EE;font-size:32px;font-weight:300;letter-spacing:10px;">GROKS</h1>
              <p style="margin:6px 0 0;color:#C8A96A;font-size:10px;letter-spacing:6px;text-transform:uppercase;font-family:Arial,sans-serif;">Hotel & Resort</p>
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="background:#111827;padding:40px;">
              ${content}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#0d1b2a;padding:30px 40px;text-align:center;border-top:1px solid rgba(200,169,106,0.2);">
              <p style="margin:0 0 8px;color:#F7F3EE;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">GROKS HOTEL & RESORT</p>
              <p style="margin:0 0 4px;color:rgba(247,243,238,0.4);font-size:11px;font-family:Arial,sans-serif;">1 Victoria Island Boulevard, Lagos Island, Lagos, Nigeria</p>
              <p style="margin:0 0 4px;color:rgba(247,243,238,0.4);font-size:11px;font-family:Arial,sans-serif;">+234 800 000 0000 · reservations@grokshotel.com</p>
              <p style="margin:16px 0 0;color:rgba(200,169,106,0.5);font-size:10px;font-family:Arial,sans-serif;font-style:italic;">Thank you for choosing Groks Hotel & Resort</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

// ── Info row helper ──────────────────────────────
const infoRow = (label, value) => `
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
      <span style="color:rgba(247,243,238,0.4);font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">${label}</span>
      <br/>
      <span style="color:#F7F3EE;font-size:14px;font-family:Arial,sans-serif;margin-top:4px;display:inline-block;">${value}</span>
    </td>
  </tr>
`

// ── 1. Booking Confirmation Email ────────────────
const sendBookingConfirmation = async (booking, user, room) => {
  const content = `
    <h2 style="color:#C8A96A;font-size:22px;font-weight:300;letter-spacing:3px;margin:0 0 8px;text-transform:uppercase;font-family:Arial,sans-serif;">Booking Confirmed</h2>
    <p style="color:rgba(247,243,238,0.6);font-size:14px;margin:0 0 30px;font-family:Arial,sans-serif;">Dear ${user.name}, your reservation has been received and is pending payment.</p>

    <!-- Booking Code Box -->
    <div style="background:rgba(200,169,106,0.1);border:1px solid rgba(200,169,106,0.3);border-radius:8px;padding:20px;text-align:center;margin-bottom:30px;">
      <p style="margin:0 0 6px;color:rgba(247,243,238,0.4);font-size:10px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">Your Booking Code</p>
      <h2 style="margin:0;color:#C8A96A;font-size:28px;letter-spacing:6px;font-family:Arial,sans-serif;">${booking.bookingCode}</h2>
    </div>

    <!-- Details Table -->
    <table width="100%" cellpadding="0" cellspacing="0">
      ${infoRow('Room', room.title)}
      ${infoRow('Category', room.category)}
      ${infoRow('Check-in', new Date(booking.checkIn).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))}
      ${infoRow('Check-out', new Date(booking.checkOut).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))}
      ${infoRow('Duration', `${booking.nights} Night${booking.nights !== 1 ? 's' : ''}`)}
      ${infoRow('Guests', `${booking.guests?.adults} Adult${booking.guests?.adults > 1 ? 's' : ''}${booking.guests?.children > 0 ? `, ${booking.guests.children} Children` : ''}`)}
    </table>

    <!-- Total -->
    <div style="background:#0d1b2a;border-radius:8px;padding:20px;margin-top:24px;display:flex;justify-content:space-between;align-items:center;">
      <span style="color:rgba(247,243,238,0.5);font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Total Amount</span>
      <span style="color:#C8A96A;font-size:26px;font-family:Arial,sans-serif;">₦${booking.totalPrice?.toLocaleString()}</span>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-top:32px;">
      <p style="color:rgba(247,243,238,0.5);font-size:13px;font-family:Arial,sans-serif;margin-bottom:16px;">Complete your payment to confirm your reservation.</p>
      <a href="${process.env.CLIENT_URL}/bookings" style="background:linear-gradient(135deg,#C8A96A,#A58E6F);color:#0B1320;text-decoration:none;padding:14px 36px;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;border-radius:2px;display:inline-block;">Complete Payment</a>
    </div>
  `
  await transporter.sendMail({
    from: `"Groks Hotel & Resort" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Booking Received — ${booking.bookingCode} | Groks Hotel`,
    html: baseTemplate(content),
  })
}

// ── 2. Payment Success Email ─────────────────────
const sendPaymentSuccess = async (booking, user, room) => {
  const content = `
    <h2 style="color:#4CAF88;font-size:22px;font-weight:300;letter-spacing:3px;margin:0 0 8px;text-transform:uppercase;font-family:Arial,sans-serif;">Payment Successful</h2>
    <p style="color:rgba(247,243,238,0.6);font-size:14px;margin:0 0 30px;font-family:Arial,sans-serif;">Dear ${user.name}, your payment has been confirmed and your reservation is now active.</p>

    <!-- Success Badge -->
    <div style="background:rgba(76,175,136,0.1);border:1px solid rgba(76,175,136,0.3);border-radius:8px;padding:20px;text-align:center;margin-bottom:30px;">
      <p style="margin:0 0 4px;color:#4CAF88;font-size:18px;font-family:Arial,sans-serif;">✓ Reservation Confirmed</p>
      <p style="margin:0;color:#C8A96A;font-size:22px;letter-spacing:5px;font-family:Arial,sans-serif;">${booking.bookingCode}</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0">
      ${infoRow('Room', room.title)}
      ${infoRow('Check-in', new Date(booking.checkIn).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))}
      ${infoRow('Check-out', new Date(booking.checkOut).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))}
      ${infoRow('Duration', `${booking.nights} Night${booking.nights !== 1 ? 's' : ''}`)}
      ${infoRow('Amount Paid', `₦${booking.totalPrice?.toLocaleString()}`)}
      ${infoRow('Payment Reference', booking.paymentReference || '—')}
    </table>

    <div style="background:#0d1b2a;border-radius:8px;padding:20px;margin-top:24px;text-align:center;">
      <p style="margin:0 0 6px;color:rgba(247,243,238,0.4);font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Check-in Time</p>
      <p style="margin:0;color:#C8A96A;font-size:18px;font-family:Arial,sans-serif;">3:00 PM on ${new Date(booking.checkIn).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
    </div>

    <div style="text-align:center;margin-top:32px;">
      <p style="color:rgba(247,243,238,0.5);font-size:13px;font-family:Arial,sans-serif;margin-bottom:16px;">Download your receipt from your bookings page.</p>
      <a href="${process.env.CLIENT_URL}/bookings" style="background:linear-gradient(135deg,#C8A96A,#A58E6F);color:#0B1320;text-decoration:none;padding:14px 36px;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;border-radius:2px;display:inline-block;">View My Bookings</a>
    </div>
  `
  await transporter.sendMail({
    from: `"Groks Hotel & Resort" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Payment Confirmed — ${booking.bookingCode} | Groks Hotel`,
    html: baseTemplate(content),
  })
}

// ── 3. Booking Cancellation Email ────────────────
const sendCancellationEmail = async (booking, user, room) => {
  const content = `
    <h2 style="color:#D96C6C;font-size:22px;font-weight:300;letter-spacing:3px;margin:0 0 8px;text-transform:uppercase;font-family:Arial,sans-serif;">Booking Cancelled</h2>
    <p style="color:rgba(247,243,238,0.6);font-size:14px;margin:0 0 30px;font-family:Arial,sans-serif;">Dear ${user.name}, your reservation has been cancelled as requested.</p>

    <table width="100%" cellpadding="0" cellspacing="0">
      ${infoRow('Booking Code', booking.bookingCode)}
      ${infoRow('Room', room?.title || 'N/A')}
      ${infoRow('Check-in', new Date(booking.checkIn).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }))}
      ${infoRow('Check-out', new Date(booking.checkOut).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }))}
    </table>

    <div style="background:rgba(217,108,108,0.08);border:1px solid rgba(217,108,108,0.2);border-radius:8px;padding:20px;margin-top:24px;text-align:center;">
      <p style="margin:0;color:rgba(247,243,238,0.5);font-size:13px;font-family:Arial,sans-serif;">If you did not request this cancellation or need assistance, please contact us immediately.</p>
    </div>

    <div style="text-align:center;margin-top:32px;">
      <a href="${process.env.CLIENT_URL}/rooms" style="background:linear-gradient(135deg,#C8A96A,#A58E6F);color:#0B1320;text-decoration:none;padding:14px 36px;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;border-radius:2px;display:inline-block;">Book Again</a>
    </div>
  `
  await transporter.sendMail({
    from: `"Groks Hotel & Resort" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Booking Cancelled — ${booking.bookingCode} | Groks Hotel`,
    html: baseTemplate(content),
  })
}

// ── 4. Admin New Booking Alert ───────────────────
const sendAdminBookingAlert = async (booking, user, room) => {
  const content = `
    <h2 style="color:#C8A96A;font-size:22px;font-weight:300;letter-spacing:3px;margin:0 0 8px;text-transform:uppercase;font-family:Arial,sans-serif;">New Booking Alert</h2>
    <p style="color:rgba(247,243,238,0.6);font-size:14px;margin:0 0 30px;font-family:Arial,sans-serif;">A new reservation has been made on the Groks Hotel platform.</p>

    <table width="100%" cellpadding="0" cellspacing="0">
      ${infoRow('Booking Code', booking.bookingCode)}
      ${infoRow('Guest Name', user.name)}
      ${infoRow('Guest Email', user.email)}
      ${infoRow('Room', room.title)}
      ${infoRow('Check-in', new Date(booking.checkIn).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }))}
      ${infoRow('Check-out', new Date(booking.checkOut).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }))}
      ${infoRow('Nights', booking.nights)}
      ${infoRow('Total Value', `₦${booking.totalPrice?.toLocaleString()}`)}
      ${infoRow('Payment Status', booking.paymentStatus?.toUpperCase())}
    </table>

    <div style="text-align:center;margin-top:32px;">
      <a href="${process.env.CLIENT_URL}/admin" style="background:linear-gradient(135deg,#C8A96A,#A58E6F);color:#0B1320;text-decoration:none;padding:14px 36px;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;border-radius:2px;display:inline-block;">View Admin Dashboard</a>
    </div>
  `
  await transporter.sendMail({
    from: `"Groks Hotel System" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `New Booking: ${booking.bookingCode} — ₦${booking.totalPrice?.toLocaleString()}`,
    html: baseTemplate(content),
  })
}

module.exports = {
  sendBookingConfirmation,
  sendPaymentSuccess,
  sendCancellationEmail,
  sendAdminBookingAlert,
}