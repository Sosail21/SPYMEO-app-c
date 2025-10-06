import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSessionUser, setSessionUser, clearSessionUser, COOKIE_NAME } from '@/lib/auth/session';
import type { Session } from '@/lib/auth/session';

/**
 * Unit tests for Session Management
 *
 * Testing approach:
 * 1. Mock Next.js cookies() function
 * 2. Test reading session from cookie
 * 3. Test writing session to cookie
 * 4. Test clearing session
 * 5. Test role normalization (COMMERÇANT -> COMMERCANT)
 * 6. Test error handling
 */

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('Session Management', () => {
  let mockCookieStore: any;

  beforeEach(async () => {
    // Reset mock before each test
    mockCookieStore = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    };

    const nextHeaders = await import('next/headers');
    vi.mocked(nextHeaders.cookies).mockReturnValue(mockCookieStore);
  });

  describe('getSessionUser', () => {
    it('should return user session when cookie exists', async () => {
      const mockSession: Session = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'PRACTITIONER',
      };

      mockCookieStore.get.mockReturnValue({
        value: JSON.stringify(mockSession),
      });

      const session = await getSessionUser();

      expect(mockCookieStore.get).toHaveBeenCalledWith(COOKIE_NAME);
      expect(session).toEqual(mockSession);
    });

    it('should return null when cookie does not exist', async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const session = await getSessionUser();

      expect(session).toBeNull();
    });

    it('should return null when cookie value is invalid JSON', async () => {
      mockCookieStore.get.mockReturnValue({
        value: 'invalid-json-{',
      });

      const session = await getSessionUser();

      expect(session).toBeNull();
    });

    it('should normalize role with cedille (COMMERÇANT -> COMMERCANT)', async () => {
      const mockSession = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'COMMERÇANT',
      };

      mockCookieStore.get.mockReturnValue({
        value: JSON.stringify(mockSession),
      });

      const session = await getSessionUser();

      expect(session?.role).toBe('COMMERCANT');
    });

    it('should handle lowercase roles and normalize them', async () => {
      const mockSession = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'practitioner',
      };

      mockCookieStore.get.mockReturnValue({
        value: JSON.stringify(mockSession),
      });

      const session = await getSessionUser();

      expect(session?.role).toBe('PRACTITIONER');
    });

    it('should include optional avatar field when present', async () => {
      const mockSession: Session = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'PRACTITIONER',
        avatar: 'https://example.com/avatar.jpg',
      };

      mockCookieStore.get.mockReturnValue({
        value: JSON.stringify(mockSession),
      });

      const session = await getSessionUser();

      expect(session?.avatar).toBe('https://example.com/avatar.jpg');
    });

    it('should handle session without avatar field', async () => {
      const mockSession = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'PRACTITIONER',
      };

      mockCookieStore.get.mockReturnValue({
        value: JSON.stringify(mockSession),
      });

      const session = await getSessionUser();

      expect(session?.avatar).toBeUndefined();
    });
  });

  describe('setSessionUser', () => {
    it('should set session cookie with correct parameters', async () => {
      const mockSession: Session = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'PRACTITIONER',
      };

      await setSessionUser(mockSession);

      expect(mockCookieStore.set).toHaveBeenCalledWith({
        name: COOKIE_NAME,
        value: JSON.stringify(mockSession),
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    });

    it('should normalize role when setting session', async () => {
      const mockSession = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'COMMERÇANT' as Session['role'],
      };

      await setSessionUser(mockSession);

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        expect.objectContaining({
          value: expect.stringContaining('COMMERCANT'),
        })
      );
    });

    it('should include avatar in cookie when provided', async () => {
      const mockSession: Session = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'PRACTITIONER',
        avatar: 'https://example.com/avatar.jpg',
      };

      await setSessionUser(mockSession);

      const setCall = mockCookieStore.set.mock.calls[0][0];
      const cookieValue = JSON.parse(setCall.value);

      expect(cookieValue.avatar).toBe('https://example.com/avatar.jpg');
    });

    it('should set cookie with 7 days expiration', async () => {
      const mockSession: Session = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'PRACTITIONER',
      };

      await setSessionUser(mockSession);

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        expect.objectContaining({
          maxAge: 604800, // 7 days in seconds
        })
      );
    });

    it('should set HTTPOnly and SameSite for security', async () => {
      const mockSession: Session = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'PRACTITIONER',
      };

      await setSessionUser(mockSession);

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
        })
      );
    });
  });

  describe('clearSessionUser', () => {
    it('should clear session cookie by setting maxAge to 0', async () => {
      await clearSessionUser();

      expect(mockCookieStore.set).toHaveBeenCalledWith({
        name: COOKIE_NAME,
        value: '',
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });
    });

    it('should maintain security flags when clearing', async () => {
      await clearSessionUser();

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
        })
      );
    });
  });

  describe('Session Flow - Integration', () => {
    it('should support full session lifecycle (set -> get -> clear)', async () => {
      const mockSession: Session = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'PRACTITIONER',
      };

      // Set session
      await setSessionUser(mockSession);
      expect(mockCookieStore.set).toHaveBeenCalled();

      // Mock get to return what was just set
      const setCall = mockCookieStore.set.mock.calls[0][0];
      mockCookieStore.get.mockReturnValue({
        value: setCall.value,
      });

      // Get session
      const retrievedSession = await getSessionUser();
      expect(retrievedSession).toEqual(mockSession);

      // Clear session
      await clearSessionUser();
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        expect.objectContaining({
          maxAge: 0,
        })
      );
    });
  });

  describe('Role Types', () => {
    const roles: Session['role'][] = [
      'FREE_USER',
      'PASS_USER',
      'PRACTITIONER',
      'ARTISAN',
      'COMMERCANT',
      'CENTER',
      'ADMIN',
    ];

    roles.forEach(role => {
      it(`should handle ${role} role correctly`, async () => {
        const mockSession: Session = {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          role,
        };

        mockCookieStore.get.mockReturnValue({
          value: JSON.stringify(mockSession),
        });

        const session = await getSessionUser();

        expect(session?.role).toBe(role);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle errors when cookie store throws', async () => {
      mockCookieStore.get.mockImplementation(() => {
        throw new Error('Cookie store error');
      });

      const session = await getSessionUser();

      expect(session).toBeNull();
    });

    it('should handle malformed session data gracefully', async () => {
      mockCookieStore.get.mockReturnValue({
        value: JSON.stringify({ incomplete: 'data' }),
      });

      const session = await getSessionUser();

      // Should still parse but may have undefined fields
      expect(session).toBeDefined();
    });
  });
});
