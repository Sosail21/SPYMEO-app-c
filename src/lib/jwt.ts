// Cdw-Spm: JWT Token utilities
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme_in_production';

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
