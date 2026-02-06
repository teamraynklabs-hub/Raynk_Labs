/**
 * RaYnk Labs - Email Module
 * Centralized email utilities export
 */

export { sendOtpEmail, type SendOtpEmailParams, type SendOtpEmailResult } from './sendOtpEmail';
export { getSmtpConfig, validateSmtpConfig, verifySmtpConnection } from './config';
