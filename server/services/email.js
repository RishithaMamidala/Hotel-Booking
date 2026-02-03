const nodemailer = require('nodemailer');
const { formatDate } = require('../utils/helpers');

// Create transporter using SMTP configuration
// Compatible with Twilio SendGrid SMTP, Amazon SES, or any SMTP provider
let transporter = null;

const initializeTransporter = () => {
  if (transporter) return transporter;

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log('SMTP not fully configured. Email delivery disabled.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort),
    secure: parseInt(smtpPort) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  return transporter;
};

const sendEmail = async (to, subject, html) => {
  const transport = initializeTransporter();

  if (!transport) {
    console.log('Email service not configured. Email would be sent to:', to);
    console.log('Subject:', subject);
    return { success: true, message: 'Email simulated (SMTP not configured)' };
  }

  try {
    await transport.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@hotelbook.com',
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

const sendBookingConfirmation = async (booking, user, hotel, room) => {
  const subject = `Booking Confirmed - ${booking.bookingId}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .details h3 { margin-top: 0; color: #2563eb; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .price { font-size: 24px; color: #2563eb; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Confirmed!</h1>
          <p>Booking ID: ${booking.bookingId}</p>
        </div>
        <div class="content">
          <p>Dear ${user.name},</p>
          <p>Thank you for your booking. Here are your reservation details:</p>

          <div class="details">
            <h3>Hotel Information</h3>
            <p><strong>${hotel.name}</strong></p>
            <p>${hotel.address.street}, ${hotel.address.city}</p>
            <p>${hotel.address.state}, ${hotel.address.country} ${hotel.address.zipCode}</p>
          </div>

          <div class="details">
            <h3>Reservation Details</h3>
            <p><strong>Room:</strong> ${room.name} (${room.type})</p>
            <p><strong>Check-in:</strong> ${formatDate(booking.checkIn)} at ${hotel.policies.checkInTime}</p>
            <p><strong>Check-out:</strong> ${formatDate(booking.checkOut)} at ${hotel.policies.checkOutTime}</p>
            <p><strong>Guests:</strong> ${booking.guests.adults} Adults${booking.guests.children > 0 ? `, ${booking.guests.children} Children` : ''}</p>
          </div>

          <div class="details">
            <h3>Payment Summary</h3>
            <p>Room Total: $${booking.pricing.roomTotal.toFixed(2)}</p>
            ${booking.pricing.extrasTotal > 0 ? `<p>Extras: $${booking.pricing.extrasTotal.toFixed(2)}</p>` : ''}
            <p>Taxes: $${booking.pricing.taxes.toFixed(2)}</p>
            <p class="price">Total: $${booking.pricing.grandTotal.toFixed(2)}</p>
          </div>

          <p>If you have any questions, please don't hesitate to contact us.</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply directly to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(user.email, subject, html);
};

const sendCancellationConfirmation = async (booking, user, hotel, refundAmount) => {
  const subject = `Booking Cancelled - ${booking.bookingId}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .refund { font-size: 20px; color: #16a34a; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Cancelled</h1>
          <p>Booking ID: ${booking.bookingId}</p>
        </div>
        <div class="content">
          <p>Dear ${user.name},</p>
          <p>Your booking at ${hotel.name} has been cancelled.</p>

          <div class="details">
            <h3>Cancellation Details</h3>
            <p><strong>Original Check-in:</strong> ${formatDate(booking.checkIn)}</p>
            <p><strong>Original Check-out:</strong> ${formatDate(booking.checkOut)}</p>
            ${refundAmount > 0 ? `<p class="refund">Refund Amount: $${refundAmount.toFixed(2)}</p>` : '<p>No refund applicable based on cancellation policy.</p>'}
          </div>

          <p>We hope to see you again soon!</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply directly to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(user.email, subject, html);
};

const sendBookingReminder = async (booking, user, hotel) => {
  const subject = `Reminder: Your stay at ${hotel.name} is tomorrow!`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Get Ready for Your Stay!</h1>
        </div>
        <div class="content">
          <p>Dear ${user.name},</p>
          <p>This is a friendly reminder that your stay at ${hotel.name} begins tomorrow!</p>

          <div class="details">
            <h3>Check-in Information</h3>
            <p><strong>Date:</strong> ${formatDate(booking.checkIn)}</p>
            <p><strong>Time:</strong> ${hotel.policies.checkInTime}</p>
            <p><strong>Address:</strong> ${hotel.address.street}, ${hotel.address.city}</p>
            <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
          </div>

          <p>We look forward to welcoming you!</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply directly to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(user.email, subject, html);
};

module.exports = {
  sendEmail,
  sendBookingConfirmation,
  sendCancellationConfirmation,
  sendBookingReminder,
};
