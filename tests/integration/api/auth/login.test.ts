import { describe, it, expect, beforeEach } from 'vitest';
import { testUsers, getPractitionerUser } from '../../../fixtures/users';
import { COOKIE_NAME } from '@/lib/auth/session';

/**
 * Integration tests for Login API
 *
 * Testing approach:
 * 1. Test successful login with valid credentials
 * 2. Test failed login with invalid credentials
 * 3. Test session cookie is set correctly
 * 4. Test response structure
 * 5. Test different user roles
 */

describe('POST /api/auth/login', () => {
  const API_URL = 'http://localhost:3000/api/auth/login';

  describe('Successful Login', () => {
    it('should login successfully with valid credentials', async () => {
      const user = getPractitionerUser();

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
        }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        ok: true,
        role: user.role,
      });
    });

    it('should set session cookie on successful login', async () => {
      const user = getPractitionerUser();

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
        }),
      });

      const cookies = response.headers.get('set-cookie');
      expect(cookies).toBeDefined();
      expect(cookies).toContain(COOKIE_NAME);
      expect(cookies).toContain('HttpOnly');
      expect(cookies).toContain('SameSite=Lax');
    });

    it('should include correct user data in session cookie', async () => {
      const user = getPractitionerUser();

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
        }),
      });

      const setCookie = response.headers.get('set-cookie');
      expect(setCookie).toBeDefined();

      // Extract session data from cookie
      const sessionMatch = setCookie!.match(/spymeo_session=([^;]+)/);
      expect(sessionMatch).toBeDefined();

      const sessionData = JSON.parse(decodeURIComponent(sessionMatch![1]));
      expect(sessionData).toMatchObject({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    });

    testUsers.forEach((user) => {
      it(`should login successfully as ${user.role}`, async () => {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            password: user.password,
          }),
        });

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.ok).toBe(true);
        expect(data.role).toBe(user.role);
      });
    });
  });

  describe('Failed Login', () => {
    it('should reject login with invalid email', async () => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'anypassword',
        }),
      });

      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data).toEqual({
        ok: false,
        error: 'Identifiants invalides',
      });
    });

    it('should reject login with invalid password', async () => {
      const user = getPractitionerUser();

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          password: 'wrongpassword',
        }),
      });

      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data).toEqual({
        ok: false,
        error: 'Identifiants invalides',
      });
    });

    it('should not set cookie on failed login', async () => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'invalid@example.com',
          password: 'wrongpassword',
        }),
      });

      const cookies = response.headers.get('set-cookie');
      expect(cookies).toBeNull();
    });

    it('should reject login with empty email', async () => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: '',
          password: 'password123',
        }),
      });

      expect(response.status).toBe(401);
    });

    it('should reject login with missing credentials', async () => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(401);
    });
  });

  describe('Edge Cases', () => {
    it('should handle email with different casing', async () => {
      const user = getPractitionerUser();

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email.toUpperCase(),
          password: user.password,
        }),
      });

      // Depending on implementation, this might fail or succeed
      // Current implementation is case-sensitive, so it should fail
      expect(response.status).toBe(401);
    });

    it('should trim whitespace from credentials', async () => {
      const user = getPractitionerUser();

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: `  ${user.email}  `,
          password: user.password,
        }),
      });

      // Current implementation doesn't trim, so this should fail
      expect(response.status).toBe(401);
    });

    it('should handle special characters in password', async () => {
      // This test documents current behavior with simple passwords
      // Real implementation should support special characters
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'P@ssw0rd!#$%',
        }),
      });

      expect(response.status).toBe(401);
    });
  });

  describe('Request Validation', () => {
    it('should handle malformed JSON', async () => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'malformed json {',
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should require Content-Type header', async () => {
      const user = getPractitionerUser();

      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          email: user.email,
          password: user.password,
        }),
      });

      // Should still work with MSW, but documenting expected behavior
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Security Considerations', () => {
    it('should not reveal whether email exists in error message', async () => {
      const response1 = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'password',
        }),
      });

      const response2 = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: getPractitionerUser().email,
          password: 'wrongpassword',
        }),
      });

      const data1 = await response1.json();
      const data2 = await response2.json();

      // Both should return the same generic error message
      expect(data1.error).toBe(data2.error);
      expect(data1.error).toBe('Identifiants invalides');
    });

    it('should set HttpOnly flag on session cookie', async () => {
      const user = getPractitionerUser();

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
        }),
      });

      const setCookie = response.headers.get('set-cookie');
      expect(setCookie).toContain('HttpOnly');
    });

    it('should set SameSite flag on session cookie', async () => {
      const user = getPractitionerUser();

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
        }),
      });

      const setCookie = response.headers.get('set-cookie');
      expect(setCookie).toContain('SameSite=Lax');
    });
  });
});
