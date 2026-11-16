import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeText,
  sanitizePhone,
  formatPhoneNational,
  sanitizeQcuId,
  sanitizeNumeric,
  sanitizePayload,
} from '../src/lib/sanitize.js';

describe('Centralized Sanitization Suite', () => {
  describe('sanitizeText', () => {
    it('strips script, style, and iframe tags with content', () => {
      const input = 'Hello <script>alert("xss")</script><style>body{color:red}</style>World<iframe src="evil.com"></iframe>!';
      assert.strictEqual(sanitizeText(input), 'Hello World!');
    });

    it('strips arbitrary HTML tags and dangerous attributes', () => {
      const input = '<div class="alert"><img src="x" onerror="alert(1)">Click <a href="javascript:void(0)">here</a></div>';
      assert.strictEqual(sanitizeText(input), 'Click here');
    });

    it('strips null bytes and control characters while preserving newline and tab', () => {
      const input = 'Line 1\x00\x08\x1F\nLine 2\t\x7FDone';
      assert.strictEqual(sanitizeText(input), 'Line 1\nLine 2\tDone');
    });

    it('trims whitespace and enforces maxLength', () => {
      const input = '   Super long description that needs capping   ';
      assert.strictEqual(sanitizeText(input, 10), 'Super long');
    });

    it('handles null, undefined, and non-string inputs safely', () => {
      assert.strictEqual(sanitizeText(null), '');
      assert.strictEqual(sanitizeText(undefined), '');
      assert.strictEqual(sanitizeText(12345), '12345');
    });
  });

  describe('sanitizePhone', () => {
    it('normalizes 12-digit international Philippine numbers (639XXXXXXXXX) to 11-digit national format', () => {
      assert.strictEqual(sanitizePhone('+63 917 123 4567'), '09171234567');
      assert.strictEqual(sanitizePhone('639171234567'), '09171234567');
    });

    it('normalizes 10-digit mobile numbers starting with 9 to 11-digit national format', () => {
      assert.strictEqual(sanitizePhone('917-123-4567'), '09171234567');
    });

    it('preserves valid 11-digit national numbers starting with 09', () => {
      assert.strictEqual(sanitizePhone('(0917) 123-4567'), '09171234567');
    });

    it('returns raw digits for non-standard lengths or empty string if empty', () => {
      assert.strictEqual(sanitizePhone(''), '');
      assert.strictEqual(sanitizePhone('12345'), '12345');
    });
  });

  describe('formatPhoneNational', () => {
    it('formats Philippine phone numbers into 9XX XXX XXXX format for display', () => {
      assert.strictEqual(formatPhoneNational('09171234567'), '917 123 4567');
      assert.strictEqual(formatPhoneNational('+639171234567'), '917 123 4567');
      assert.strictEqual(formatPhoneNational('9171234567'), '917 123 4567');
    });
  });

  describe('sanitizeQcuId', () => {
    it('formats numeric student ID into YY-NNNN format', () => {
      assert.strictEqual(sanitizeQcuId('240001'), '24-0001');
      assert.strictEqual(sanitizeQcuId('24-0001'), '24-0001');
    });

    it('caps student ID at 6 digits', () => {
      assert.strictEqual(sanitizeQcuId('2400019999'), '24-0001');
    });

    it('handles short inputs without hyphen', () => {
      assert.strictEqual(sanitizeQcuId('2'), '2');
      assert.strictEqual(sanitizeQcuId('24'), '24');
      assert.strictEqual(sanitizeQcuId(''), '');
    });
  });

  describe('sanitizeNumeric', () => {
    it('clamps numbers within min and max bounds', () => {
      assert.strictEqual(sanitizeNumeric(5, { min: 1, max: 10 }), 5);
      assert.strictEqual(sanitizeNumeric(0, { min: 1, max: 10 }), 1);
      assert.strictEqual(sanitizeNumeric(25, { min: 1, max: 10 }), 10);
    });

    it('handles NaN and non-numbers with defaultVal', () => {
      assert.strictEqual(sanitizeNumeric('not-a-number', { defaultVal: 42 }), 42);
      assert.strictEqual(sanitizeNumeric(undefined, { defaultVal: 10 }), 10);
    });

    it('floors to integer when integer option is true', () => {
      assert.strictEqual(sanitizeNumeric(4.9, { integer: true }), 4);
    });
  });

  describe('sanitizePayload', () => {
    it('recursively sanitizes nested object string properties', () => {
      const payload = {
        name: '  <b>Student</b>  ',
        meta: {
          bio: '<script>evil()</script>Hello',
          tags: ['<i>tag1</i>', 'tag2'],
        },
      };
      const sanitized = sanitizePayload(payload);
      assert.deepStrictEqual(sanitized, {
        name: 'Student',
        meta: {
          bio: 'Hello',
          tags: ['tag1', 'tag2'],
        },
      });
    });

    it('preserves password fields without stripping characters', () => {
      const payload = {
        username: 'student1<alert>',
        password: 'Pass<word>#123!',
        confirmPassword: 'Pass<word>#123!',
      };
      const sanitized = sanitizePayload(payload);
      assert.strictEqual(sanitized.username, 'student1');
      assert.strictEqual(sanitized.password, 'Pass<word>#123!');
      assert.strictEqual(sanitized.confirmPassword, 'Pass<word>#123!');
    });

    it('preserves dates and primitive non-string values', () => {
      const date = new Date();
      const payload = {
        active: true,
        count: 5,
        created: date,
      };
      const sanitized = sanitizePayload(payload);
      assert.strictEqual(sanitized.active, true);
      assert.strictEqual(sanitized.count, 5);
      assert.strictEqual(sanitized.created, date);
    });
  });
});
