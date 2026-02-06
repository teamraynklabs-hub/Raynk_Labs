/**
 * RaYnk Labs - OTP Email Sender
 * Sends OTP codes via Gmail SMTP
 */

import { getTransporter, validateSmtpConfig } from './config';

// ============================================
// TYPES
// ============================================

export interface SendOtpEmailParams {
  to: string;
  otp: string;
  expiryMinutes?: number;
}

export interface SendOtpEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ============================================
// EMAIL TEMPLATE
// ============================================

/**
 * Generate OTP email HTML template
 */
function getOtpEmailHtml(otp: string, expiryMinutes: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your OTP Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="min-width: 100%; background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">RaYnk Labs</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 600; text-align: center;">
                Your Verification Code
              </h2>

              <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6; text-align: center;">
                Use the following OTP to complete your password change request:
              </p>

              <!-- OTP Box -->
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px 40px; border-radius: 8px;">
                  <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #ffffff;">${otp}</span>
                </div>
              </div>

              <p style="margin: 30px 0 0; color: #999999; font-size: 14px; text-align: center;">
                This code is valid for <strong>${expiryMinutes} minutes</strong>.
              </p>

              <p style="margin: 20px 0 0; color: #999999; font-size: 14px; text-align: center;">
                If you didn't request this code, please ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                &copy; ${new Date().getFullYear()} RaYnk Labs. All rights reserved.
              </p>
              <p style="margin: 10px 0 0; color: #999999; font-size: 12px;">
                This is an automated message. Please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version of OTP email
 */
function getOtpEmailText(otp: string, expiryMinutes: number): string {
  return `
RaYnk Labs - Your Verification Code

Your OTP is: ${otp}

This code is valid for ${expiryMinutes} minutes.

If you didn't request this code, please ignore this email.

---
This is an automated message. Please do not reply.
© ${new Date().getFullYear()} RaYnk Labs. All rights reserved.
  `.trim();
}

// ============================================
// SEND OTP EMAIL
// ============================================

/**
 * Send OTP email to the specified address
 *
 * @param params - Email parameters (to, otp, expiryMinutes)
 * @returns Promise with success status and messageId or error
 *
 * @example
 * const result = await sendOtpEmail({
 *   to: 'user@example.com',
 *   otp: '123456',
 *   expiryMinutes: 10
 * });
 */
export async function sendOtpEmail(
  params: SendOtpEmailParams
): Promise<SendOtpEmailResult> {
  const { to, otp, expiryMinutes = 10 } = params;

  try {
    // Validate SMTP configuration before attempting to send
    validateSmtpConfig();

    const transporter = getTransporter();
    const fromEmail = process.env.SMTP_USER;

    const mailOptions = {
      from: `"RaYnk Labs" <${fromEmail}>`,
      to,
      subject: 'Your OTP Code – RaYnk Labs',
      text: getOtpEmailText(otp, expiryMinutes),
      html: getOtpEmailHtml(otp, expiryMinutes),
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`[Email] OTP sent successfully to ${to}, messageId: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown email error';

    console.error(`[Email] Failed to send OTP to ${to}:`, errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}
