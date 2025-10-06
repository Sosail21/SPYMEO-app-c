// tests/integration/api/auth/nextauth.test.ts
// Integration tests for NextAuth authentication flow

import { describe, it, expect, beforeAll } from "vitest";
import { findUserByEmail } from "@/lib/auth/users";

describe("NextAuth Integration", () => {
  describe("User Database", () => {
    it("should find existing users by email", () => {
      const user = findUserByEmail("admin@spymeo.test");
      expect(user).toBeDefined();
      expect(user?.email).toBe("admin@spymeo.test");
      expect(user?.role).toBe("ADMIN");
    });

    it("should return undefined for non-existent users", () => {
      const user = findUserByEmail("nonexistent@spymeo.test");
      expect(user).toBeUndefined();
    });

    it("should be case-insensitive for email search", () => {
      const user1 = findUserByEmail("admin@spymeo.test");
      const user2 = findUserByEmail("ADMIN@SPYMEO.TEST");
      expect(user1).toEqual(user2);
    });
  });

  describe("User Roles", () => {
    it("should have all expected roles represented", () => {
      const roles = ["FREE_USER", "PASS_USER", "PRACTITIONER", "ARTISAN", "COMMERÇANT", "CENTER", "ADMIN"];

      roles.forEach(role => {
        const user = findUserByEmail(
          role === "FREE_USER" ? "alice.free@spymeo.test" :
          role === "PASS_USER" ? "paul.pass@spymeo.test" :
          role === "PRACTITIONER" ? "leo.pro@spymeo.test" :
          role === "ARTISAN" ? "emma.artisan@spymeo.test" :
          role === "COMMERÇANT" ? "marc.commercant@spymeo.test" :
          role === "CENTER" ? "clara.centre@spymeo.test" :
          "admin@spymeo.test"
        );

        expect(user).toBeDefined();
      });
    });
  });
});
