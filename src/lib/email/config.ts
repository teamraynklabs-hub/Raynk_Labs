/**
 * RaYnk Labs - Email Configuration
 * SMTP configuration for email delivery
 */

import nodemailer from 'nodemailer';

// ============================================
// TYPES
// ============================================

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validates that all required SMTP environment variables are set
 * @throws Error if any required variable is missing
 */
export function validateSmtpConfig(): void {
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required SMTP environment variables: ${missing.join(', ')}`
    );
  }
}

// ============================================
// CONFIG
// ============================================

/**
 * Get SMTP configuration from environment variables
 */
export function getSmtpConfig(): SmtpConfig {
  validateSmtpConfig();

  return {
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT!, 10),
    secure: false, // false for port 587 (STARTTLS)
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  };
}

// ============================================
// TRANSPORTER
// ============================================

let transporter: nodemailer.Transporter | null = null;

/**
 * Get or create nodemailer transporter
 * Reuses existing transporter for better performance
 */
export function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    const config = getSmtpConfig();

    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
      // Enable STARTTLS for secure connection on port 587
      requireTLS: true,
      tls: {
        // Do not fail on invalid certs (useful for dev)
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      },
    });
  }

  return transporter;
}

/**
 * Verify SMTP connection
 * Use this to test if email configuration is correct
 */
export async function verifySmtpConnection(): Promise<boolean> {
  try {
    const transport = getTransporter();
    await transport.verify();
    return true;
  } catch (error) {
    console.error('[Email] SMTP connection verification failed:', error);
    return false;
  }
}
