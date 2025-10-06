// tests/unit/lib/auth/auth-helpers.test.ts
// Unit tests for authentication helper functions

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  hashPassword,
  verifyPassword,
  normalizeRole,
} from "@/lib/auth/auth-helpers";

describe("auth-helpers", () => {
  describe("hashPassword", () => {
    it("should hash a password", async () => {
      const password = "mySecurePassword123";
      const hashed = await hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.startsWith("$2")).toBe(true); // bcrypt hash format
    });

    it("should generate different hashes for same password", async () => {
      const password = "mySecurePassword123";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Different salts
    });
  });

  describe("verifyPassword", () => {
    it("should verify a correct password", async () => {
      const password = "mySecurePassword123";
      const hashed = await hashPassword(password);
      const isValid = await verifyPassword(password, hashed);

      expect(isValid).toBe(true);
    });

    it("should reject an incorrect password", async () => {
      const password = "mySecurePassword123";
      const hashed = await hashPassword(password);
      const isValid = await verifyPassword("wrongPassword", hashed);

      expect(isValid).toBe(false);
    });

    it("should handle plain text passwords (development)", async () => {
      const password = "azerty123";
      const isValid = await verifyPassword(password, password);

      expect(isValid).toBe(true);
    });

    it("should reject incorrect plain text passwords", async () => {
      const password = "azerty123";
      const isValid = await verifyPassword("wrongPassword", password);

      expect(isValid).toBe(false);
    });
  });

  describe("normalizeRole", () => {
    it("should normalize COMMERÇANT to COMMERCANT", () => {
      expect(normalizeRole("COMMERÇANT")).toBe("COMMERCANT");
    });

    it("should normalize lowercase to uppercase", () => {
      expect(normalizeRole("practitioner")).toBe("PRACTITIONER");
    });

    it("should handle mixed case and accents", () => {
      expect(normalizeRole("Commerçant")).toBe("COMMERCANT");
    });

    it("should return uppercase for already normalized roles", () => {
      expect(normalizeRole("ADMIN")).toBe("ADMIN");
      expect(normalizeRole("CENTER")).toBe("CENTER");
    });
  });
});
