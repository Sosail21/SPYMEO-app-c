import { describe, it, expect } from 'vitest';
import { canAccess, getRouteMeta } from '@/lib/rbac';
import type { Role } from '@/lib/routes';

/**
 * Unit tests for RBAC (Role-Based Access Control)
 *
 * Testing approach:
 * 1. Test public routes (accessible to everyone)
 * 2. Test protected routes (require specific roles)
 * 3. Test admin routes (admin only)
 * 4. Test dynamic routes with parameters
 * 5. Test edge cases (undefined routes, invalid roles)
 */

describe('RBAC - Role-Based Access Control', () => {
  describe('canAccess - Public Routes', () => {
    it('should allow access to home page without role', () => {
      expect(canAccess('/')).toBe(true);
    });

    it('should allow access to blog without role', () => {
      expect(canAccess('/blog')).toBe(true);
    });

    it('should allow access to search page without role', () => {
      expect(canAccess('/recherche')).toBe(true);
    });

    it('should allow access to public practitioner listing', () => {
      expect(canAccess('/praticiens')).toBe(true);
      expect(canAccess('/praticiens', 'FREE_USER')).toBe(true);
      expect(canAccess('/praticiens', 'PRACTITIONER')).toBe(true);
    });

    it('should allow access to public practitioner detail page with slug', () => {
      expect(canAccess('/praticien/marie-dubois')).toBe(true);
      expect(canAccess('/praticien/dr-pierre-martin')).toBe(true);
    });

    it('should allow access to auth pages', () => {
      expect(canAccess('/auth/login')).toBe(true);
      expect(canAccess('/auth/signup')).toBe(true);
      expect(canAccess('/auth/reset')).toBe(true);
    });

    it('should handle trailing slashes correctly', () => {
      expect(canAccess('/praticiens/')).toBe(true);
      expect(canAccess('/blog/')).toBe(true);
    });

    it('should handle query parameters correctly', () => {
      expect(canAccess('/recherche?q=test')).toBe(true);
      expect(canAccess('/praticiens?page=2')).toBe(true);
    });
  });

  describe('canAccess - Protected Routes', () => {
    it('should deny access to pro dashboard without role', () => {
      expect(canAccess('/pro/dashboard')).toBe(false);
    });

    it('should allow practitioner access to practitioner routes', () => {
      expect(canAccess('/pro/praticien/agenda', 'PRACTITIONER')).toBe(true);
      expect(canAccess('/pro/praticien/fiches-clients', 'PRACTITIONER')).toBe(true);
      expect(canAccess('/pro/praticien/statistiques', 'PRACTITIONER')).toBe(true);
    });

    it('should deny practitioner access to artisan routes', () => {
      expect(canAccess('/pro/artisan/catalogue/services', 'PRACTITIONER')).toBe(false);
      expect(canAccess('/pro/artisan/clients', 'PRACTITIONER')).toBe(false);
    });

    it('should allow artisan access to artisan routes', () => {
      expect(canAccess('/pro/artisan/catalogue/services', 'ARTISAN')).toBe(true);
      expect(canAccess('/pro/artisan/clients', 'ARTISAN')).toBe(true);
    });

    it('should allow commercant access to commercant routes', () => {
      expect(canAccess('/pro/commercant/produits', 'COMMERCANT')).toBe(true);
      expect(canAccess('/pro/commercant/commandes', 'COMMERCANT')).toBe(true);
    });

    it('should allow center access to center routes', () => {
      expect(canAccess('/pro/centre/formations', 'CENTER')).toBe(true);
      expect(canAccess('/pro/centre/apprenants', 'CENTER')).toBe(true);
    });

    it('should allow all pro roles access to common routes', () => {
      const proRoles: Role[] = ['PRACTITIONER', 'ARTISAN', 'COMMERCANT', 'CENTER'];

      proRoles.forEach(role => {
        expect(canAccess('/pro/commun/fiche', role)).toBe(true);
        expect(canAccess('/pro/commun/spymcom', role)).toBe(true);
        expect(canAccess('/pro/commun/messages', role)).toBe(true);
      });
    });

    it('should allow user access to user routes', () => {
      expect(canAccess('/user/tableau-de-bord', 'FREE_USER')).toBe(true);
      expect(canAccess('/user/tableau-de-bord', 'PASS_USER')).toBe(true);
      expect(canAccess('/user/rendez-vous/a-venir', 'FREE_USER')).toBe(true);
    });

    it('should deny free user access to pass-only routes', () => {
      expect(canAccess('/pass/tableau-de-bord', 'FREE_USER')).toBe(false);
    });

    it('should allow pass user access to pass routes', () => {
      expect(canAccess('/pass/tableau-de-bord', 'PASS_USER')).toBe(true);
    });
  });

  describe('canAccess - Admin Routes', () => {
    it('should deny access to admin routes without admin role', () => {
      expect(canAccess('/admin')).toBe(false);
      expect(canAccess('/admin/utilisateurs')).toBe(false);
      expect(canAccess('/admin', 'PRACTITIONER')).toBe(false);
      expect(canAccess('/admin', 'FREE_USER')).toBe(false);
    });

    it('should allow admin access to admin routes', () => {
      expect(canAccess('/admin', 'ADMIN')).toBe(true);
      expect(canAccess('/admin/utilisateurs', 'ADMIN')).toBe(true);
      expect(canAccess('/admin/centres', 'ADMIN')).toBe(true);
      expect(canAccess('/admin/pros', 'ADMIN')).toBe(true);
    });

    it('should cover all admin sub-routes under /admin container', () => {
      expect(canAccess('/admin/any-sub-route', 'ADMIN')).toBe(true);
      expect(canAccess('/admin/deep/nested/route', 'ADMIN')).toBe(true);
      expect(canAccess('/admin/any-sub-route', 'PRACTITIONER')).toBe(false);
    });
  });

  describe('canAccess - Dynamic Routes', () => {
    it('should handle dynamic segments in practitioner routes', () => {
      expect(canAccess('/pro/praticien/fiches-clients/client-123', 'PRACTITIONER')).toBe(true);
      expect(canAccess('/pro/praticien/cabinet-partage/annonce-456', 'PRACTITIONER')).toBe(true);
    });

    it('should handle dynamic segments in center routes', () => {
      expect(canAccess('/pro/centre/formations/formation-yoga', 'CENTER')).toBe(true);
      expect(canAccess('/pro/centre/formations/sessions/session-123', 'CENTER')).toBe(true);
      expect(canAccess('/pro/centre/apprenants/learner-456', 'CENTER')).toBe(true);
    });

    it('should handle dynamic segments in public routes', () => {
      expect(canAccess('/praticien/dr-smith')).toBe(true);
      expect(canAccess('/artisan/menuisier-pro')).toBe(true);
      expect(canAccess('/commercant/bio-shop')).toBe(true);
      expect(canAccess('/centre-de-formation/yoga-paris')).toBe(true);
    });
  });

  describe('canAccess - Edge Cases', () => {
    it('should allow access to undefined routes (no rule)', () => {
      expect(canAccess('/non-existent-route')).toBe(true);
      expect(canAccess('/random/path/here')).toBe(true);
    });

    it('should handle empty pathname', () => {
      expect(canAccess('')).toBe(true);
    });

    it('should normalize pathnames correctly', () => {
      expect(canAccess('/blog#section')).toBe(true);
      expect(canAccess('/recherche?q=test&page=2')).toBe(true);
      expect(canAccess('/praticiens///')).toBe(true); // multiple slashes
    });

    it('should handle case sensitivity', () => {
      // Routes should be case-sensitive
      expect(canAccess('/Blog')).toBe(true); // no matching rule, allowed by default
      expect(canAccess('/PRATICIENS')).toBe(true); // no matching rule, allowed by default
    });
  });

  describe('getRouteMeta', () => {
    it('should return route metadata for known routes', () => {
      const meta = getRouteMeta('/pro/praticien/agenda');
      expect(meta).toBeDefined();
      expect(meta?.titleKey).toBe('pro.pract.agenda');
      expect(meta?.roles).toContain('PRACTITIONER');
    });

    it('should return route metadata for public routes', () => {
      const meta = getRouteMeta('/praticiens');
      expect(meta).toBeDefined();
      expect(meta?.public).toBe(true);
      expect(meta?.titleKey).toBe('public.praticiens.list');
    });

    it('should return undefined for unknown routes', () => {
      const meta = getRouteMeta('/non-existent-route');
      expect(meta).toBeUndefined();
    });

    it('should handle dynamic routes', () => {
      const meta = getRouteMeta('/praticien/marie-dubois');
      expect(meta).toBeDefined();
      expect(meta?.titleKey).toBe('public.praticien.detail');
    });

    it('should return breadcrumb information when available', () => {
      const meta = getRouteMeta('/praticien/test-slug');
      expect(meta).toBeDefined();
      expect(meta?.breadcrumb).toBeDefined();
      expect(meta?.breadcrumb).toContain('home');
      expect(meta?.breadcrumb).toContain('public.praticiens.list');
    });

    it('should return feature tags when available', () => {
      const meta = getRouteMeta('/praticiens');
      expect(meta).toBeDefined();
      expect(meta?.feature).toBe('directory');
    });
  });

  describe('RBAC - Route Specificity', () => {
    it('should prioritize more specific routes over general ones', () => {
      // Test that /pro/praticien/agenda is matched instead of /pro/*
      const agendaMeta = getRouteMeta('/pro/praticien/agenda');
      expect(agendaMeta?.titleKey).toBe('pro.pract.agenda');
    });

    it('should handle overlapping route patterns correctly', () => {
      // Both routes exist, should match the most specific
      const newFormationMeta = getRouteMeta('/pro/centre/formations/nouvelle');
      expect(newFormationMeta?.titleKey).toBe('pro.center.trainings.new');

      const formationDetailMeta = getRouteMeta('/pro/centre/formations/yoga-formation');
      expect(formationDetailMeta?.titleKey).toBe('pro.center.training.detail');
    });
  });

  describe('RBAC - Multi-role Access', () => {
    it('should allow access when user has one of multiple required roles', () => {
      // User dashboard accessible to both FREE_USER and PASS_USER
      expect(canAccess('/user/tableau-de-bord', 'FREE_USER')).toBe(true);
      expect(canAccess('/user/tableau-de-bord', 'PASS_USER')).toBe(true);
    });

    it('should allow pro dashboard access to any pro role', () => {
      expect(canAccess('/pro/dashboard', 'PRACTITIONER')).toBe(true);
      expect(canAccess('/pro/dashboard', 'ARTISAN')).toBe(true);
      expect(canAccess('/pro/dashboard', 'COMMERCANT')).toBe(true);
      expect(canAccess('/pro/dashboard', 'CENTER')).toBe(true);
    });
  });
});
