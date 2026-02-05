/**
 * RaYnk Labs - Centralized Configuration
 * All environment variables and app settings in one place
 */

// Database Configuration
export const dbConfig = {
  mongoUri: process.env.MONGODB_URI!,
  dbName: 'raynk-labs',
} as const;

// Authentication Configuration
export const authConfig = {
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiry: '7d',
  cookieName: 'admin_token',
  cookieMaxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  saltRounds: 10,
  // Fallback to env vars for backward compatibility during migration
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
} as const;

// Cloudinary Configuration
export const cloudinaryConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  apiKey: process.env.CLOUDINARY_API_KEY!,
  apiSecret: process.env.CLOUDINARY_API_SECRET!,
  defaultFolder: 'raynk-labs',
} as const;

// App Configuration
export const appConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;

// Validation at startup
export function validateConfig(): void {
  const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Type exports for configuration
export type DbConfig = typeof dbConfig;
export type AuthConfig = typeof authConfig;
export type CloudinaryConfig = typeof cloudinaryConfig;
export type AppConfig = typeof appConfig;
