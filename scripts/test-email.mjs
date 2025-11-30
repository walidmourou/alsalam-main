import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function testEmail() {
  console.log('Testing email configuration...\n');
  
  console.log('SMTP Settings:');
  console.log('- Host:', process.env.SMTP_HOST);
  console.log('- Port:', process.env.SMTP_PORT);
  console.log('- User:', process.env.SMTP_USER);
  console.log('- From:', process.env.FROM_EMAIL);
  console.log('- Password:', process.env.SMTP_PASS ? '***set***' : 'NOT SET');
  console.log('');

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ Missing SMTP configuration in .env.local');
    console.log('\nRequired variables:');
    console.log('- SMTP_HOST');
    console.log('- SMTP_PORT');
    console.log('- SMTP_USER');
    console.log('- SMTP_PASS');
    console.log('- FROM_EMAIL');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  console.log('Testing SMTP connection...');
  try {
    await transporter.verify();
    console.log('✓ SMTP connection successful!\n');
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }

  // Send test email
  const testEmail = process.argv[2] || process.env.SMTP_USER;
  console.log(`Sending test email to: ${testEmail}`);

  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: testEmail,
      subject: 'Test Email - AL-SALAM E.V.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #262262;">Test Email</h2>
          <p>This is a test email from the AL-SALAM E.V. membership system.</p>
          <p>If you receive this email, the email configuration is working correctly.</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    console.log('\n✓ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    console.log('\nCheck your inbox (and spam folder).');
  } catch (error) {
    console.error('\n❌ Failed to send test email:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testEmail();
