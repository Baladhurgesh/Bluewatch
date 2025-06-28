const express = require('express');
const cors = require('cors');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { email, phone, waterSystem, county } = req.body;

    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address' 
      });
    }

    // Create email content
    const msg = {
      to: email,
      from: process.env.FROM_EMAIL || 'noreply@water-safety-dashboard.com', // Replace with your verified sender
      subject: `Water Quality Alert Signup - ${waterSystem || 'Water System'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af;">Water Quality Alert Confirmation</h2>
          <p>Thank you for signing up for water quality alerts!</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Alert Preferences</h3>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            <p><strong>Water System:</strong> ${waterSystem || 'Not specified'}</p>
            <p><strong>County:</strong> ${county || 'Not specified'}</p>
          </div>
          
          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">What You'll Receive</h3>
            <ul style="margin: 10px 0;">
              <li>Violation notifications</li>
              <li>Boil water advisories</li>
              <li>Resolution updates</li>
              <li>Water quality reports</li>
              <li>Emergency notifications</li>
            </ul>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            You can unsubscribe at any time by replying to this email with "UNSUBSCRIBE" in the subject line.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            Georgia Water Safety Dashboard<br>
            Protecting your drinking water quality
          </p>
        </div>
      `,
      text: `
        Water Quality Alert Confirmation

        Thank you for signing up for water quality alerts!

        Your Alert Preferences:
        Email: ${email}
        ${phone ? `Phone: ${phone}` : ''}
        Water System: ${waterSystem || 'Not specified'}
        County: ${county || 'Not specified'}

        What You'll Receive:
        - Violation notifications
        - Boil water advisories
        - Resolution updates
        - Water quality reports
        - Emergency notifications

        You can unsubscribe at any time by replying to this email with "UNSUBSCRIBE" in the subject line.

        Georgia Water Safety Dashboard
        Protecting your drinking water quality
      `
    };

    // Send email using SendGrid
    await sgMail.send(msg);

    res.json({ 
      success: true, 
      message: 'Email sent successfully! Check your inbox for confirmation.' 
    });

  } catch (error) {
    console.error('Email sending error:', error);
    
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email. Please try again.' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Email server is running' });
});

app.listen(PORT, () => {
  console.log(`Email server running on port ${PORT}`);
  console.log(`SendGrid API Key configured: ${process.env.SENDGRID_API_KEY ? 'Yes' : 'No'}`);
}); 