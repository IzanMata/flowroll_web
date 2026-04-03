import { describe, it, expect } from 'vitest';
import { ENDPOINTS } from '@/lib/api/endpoints';

describe('ENDPOINTS', () => {
  describe('AUTH — not versioned', () => {
    it('TOKEN points to /api/auth/token/', () => {
      expect(ENDPOINTS.AUTH.TOKEN).toBe('/api/auth/token/');
    });
    it('REFRESH points to /api/auth/token/refresh/', () => {
      expect(ENDPOINTS.AUTH.REFRESH).toBe('/api/auth/token/refresh/');
    });
    it('LOGOUT points to /api/auth/logout/', () => {
      expect(ENDPOINTS.AUTH.LOGOUT).toBe('/api/auth/logout/');
    });
    it('ME points to /api/auth/me/', () => {
      expect(ENDPOINTS.AUTH.ME).toBe('/api/auth/me/');
    });
    it('REGISTER points to /api/auth/register/', () => {
      expect(ENDPOINTS.AUTH.REGISTER).toBe('/api/auth/register/');
    });
    it('VERIFY_EMAIL points to /api/auth/verify-email/', () => {
      expect(ENDPOINTS.AUTH.VERIFY_EMAIL).toBe('/api/auth/verify-email/');
    });
    it('RESEND_VERIFICATION points to /api/auth/resend-verification/', () => {
      expect(ENDPOINTS.AUTH.RESEND_VERIFICATION).toBe('/api/auth/resend-verification/');
    });
    it('CHANGE_PASSWORD points to /api/auth/change-password/', () => {
      expect(ENDPOINTS.AUTH.CHANGE_PASSWORD).toBe('/api/auth/change-password/');
    });
    it('PASSWORD_RESET points to /api/auth/password-reset/', () => {
      expect(ENDPOINTS.AUTH.PASSWORD_RESET).toBe('/api/auth/password-reset/');
    });
    it('PASSWORD_RESET_CONFIRM points to /api/auth/password-reset/confirm/', () => {
      expect(ENDPOINTS.AUTH.PASSWORD_RESET_CONFIRM).toBe('/api/auth/password-reset/confirm/');
    });
  });

  describe('ACADEMIES — /api/v1/', () => {
    it('LIST uses /api/v1/ prefix', () => {
      expect(ENDPOINTS.ACADEMIES.LIST).toBe('/api/v1/academies/');
    });
    it('DETAIL generates correct URL', () => {
      expect(ENDPOINTS.ACADEMIES.DETAIL(42)).toBe('/api/v1/academies/42/');
    });
    it('PUBLIC uses /api/v1/ prefix', () => {
      expect(ENDPOINTS.ACADEMIES.PUBLIC).toBe('/api/v1/academies/public/');
    });
    it('MEMBERS generates correct URL', () => {
      expect(ENDPOINTS.ACADEMIES.MEMBERS(7)).toBe('/api/v1/academies/7/members/');
    });
    it('MEMBER_DETAIL generates correct URL', () => {
      expect(ENDPOINTS.ACADEMIES.MEMBER_DETAIL(7, 99)).toBe('/api/v1/academies/7/members/99/');
    });
  });

  describe('ATHLETES — /api/v1/', () => {
    it('LIST uses /api/v1/ prefix', () => {
      expect(ENDPOINTS.ATHLETES.LIST).toBe('/api/v1/athletes/');
    });
    it('DETAIL generates correct URL', () => {
      expect(ENDPOINTS.ATHLETES.DETAIL(3)).toBe('/api/v1/athletes/3/');
    });
    it('PROMOTE generates correct URL', () => {
      expect(ENDPOINTS.ATHLETES.PROMOTE(3)).toBe('/api/v1/athletes/3/promote/');
    });
  });

  describe('CLASSES — /api/v1/', () => {
    it('LIST uses /api/v1/ prefix', () => {
      expect(ENDPOINTS.CLASSES.LIST).toBe('/api/v1/attendance/classes/');
    });
    it('GENERATE_QR generates correct URL', () => {
      expect(ENDPOINTS.CLASSES.GENERATE_QR(5)).toBe('/api/v1/attendance/classes/5/generate_qr/');
    });
  });

  describe('MATCHES — /api/v1/', () => {
    it('LIST uses /api/v1/ prefix', () => {
      expect(ENDPOINTS.MATCHES.LIST).toBe('/api/v1/matches/');
    });
    it('FINISH generates correct URL', () => {
      expect(ENDPOINTS.MATCHES.FINISH(10)).toBe('/api/v1/matches/10/finish_match/');
    });
  });

  describe('TATAMI — /api/v1/', () => {
    it('PRESETS uses /api/v1/ prefix', () => {
      expect(ENDPOINTS.TATAMI.PRESETS).toBe('/api/v1/tatami/timer-presets/');
    });
  });

  describe('MEMBERSHIP — /api/v1/', () => {
    it('PLANS uses /api/v1/ prefix', () => {
      expect(ENDPOINTS.MEMBERSHIP.PLANS).toBe('/api/v1/membership/plans/');
    });
    it('ENROLL uses /api/v1/ prefix', () => {
      expect(ENDPOINTS.MEMBERSHIP.ENROLL).toBe('/api/v1/membership/enroll/');
    });
    it('LEAVE generates correct URL', () => {
      expect(ENDPOINTS.MEMBERSHIP.LEAVE(5)).toBe('/api/v1/membership/5/leave/');
    });
    it('SUBSCRIPTION_CANCEL generates correct URL', () => {
      expect(ENDPOINTS.MEMBERSHIP.SUBSCRIPTION_CANCEL(12)).toBe(
        '/api/v1/membership/subscriptions/12/cancel/',
      );
    });
    it('SUBSCRIPTIONS uses /api/v1/ prefix', () => {
      expect(ENDPOINTS.MEMBERSHIP.SUBSCRIPTIONS).toBe('/api/v1/membership/subscriptions/');
    });
  });

  describe('TECHNIQUES — /api/v1/', () => {
    it('LIST uses /api/v1/ prefix', () => {
      expect(ENDPOINTS.TECHNIQUES.LIST).toBe('/api/v1/techniques/');
    });
  });

  describe('LEARNING — /api/v1/', () => {
    it('TECHNIQUE_NOTES uses /api/v1/ prefix', () => {
      expect(ENDPOINTS.LEARNING.TECHNIQUE_NOTES).toBe('/api/v1/learning/technique-notes/');
    });
  });

  describe('COMMUNITY — /api/v1/', () => {
    it('ACHIEVEMENTS uses /api/v1/ prefix', () => {
      expect(ENDPOINTS.COMMUNITY.ACHIEVEMENTS).toBe('/api/v1/community/achievements/');
    });
    it('OPEN_MAT_JOIN generates correct URL', () => {
      expect(ENDPOINTS.COMMUNITY.OPEN_MAT_JOIN(8)).toBe('/api/v1/community/open-mat/8/join/');
    });
  });
});
