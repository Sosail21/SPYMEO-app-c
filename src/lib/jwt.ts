// Cdw-Spm: JWT Token utilities
import jwt from 'jsonwebtoken';

// JWT_SECRET must be defined in environment variables
// During build, use dummy value. Real validation happens at runtime.
const JWT_SECRET = process.env.JWT_SECRET || 'build-time-dummy-do-not-use-in-production';

// Only validate JWT_SECRET at runtime, not during build
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  // Skip validation during Next.js build (when collecting page data)
  const isBuilding = process.env.NEXT_PHASE === 'phase-production-build';
  
  if (!isBuilding && (!JWT_SECRET || JWT_SECRET === 'changeme_in_production' || JWT_SECRET === 'build-time-dummy-do-not-use-in-production')) {
    console.error(
      '❌ JWT_SECRET environment variable is required and must be set to a secure value. ' +
      'Generate one with: openssl rand -base64 32'
    );
    // In production runtime (not build), this is critical
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET not configured properly');
    }
  }
}

export function generateValidationToken(userId: string): string {
  return jwt.sign(
    { userId, type: 'validation' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyValidationToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type !== 'validation') return null;
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}

export function generatePaymentToken(userId: string): string {
  return jwt.sign(
    { userId, type: 'payment' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyPaymentToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type !== 'payment') return null;
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}