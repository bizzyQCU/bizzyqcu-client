import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateQcuId,
  validateEmail,
  validatePhone,
  validatePassword,
  validateFullName,
  validateQuantity,
  validatePrice,
} from '../src/lib/validation.js';

describe('Centralized Validation Suite', () => {
  describe('validateQcuId', () => {
    it('accepts valid QCU ID in YY-NNNN format', () => {
      assert.deepStrictEqual(validateQcuId('24-0001'), { valid: true });
      assert.deepStrictEqual(validateQcuId('21-9876'), { valid: true });
    });

    it('rejects invalid or malformed QCU ID formats', () => {
      assert.strictEqual(validateQcuId('').valid, false);
      assert.strictEqual(validateQcuId('240001').valid, false);
      assert.strictEqual(validateQcuId('24-123').valid, false);
      assert.strictEqual(validateQcuId('abc-def').valid, false);
    });
  });

  describe('validateEmail', () => {
    it('accepts valid email addresses', () => {
      assert.deepStrictEqual(validateEmail('student@qcu.edu.ph'), { valid: true });
      assert.deepStrictEqual(validateEmail('user.name+tag@example.com'), { valid: true });
    });

    it('rejects invalid email formats', () => {
      assert.strictEqual(validateEmail('').valid, false);
      assert.strictEqual(validateEmail('invalid-email').valid, false);
      assert.strictEqual(validateEmail('@no-user.com').valid, false);
      assert.strictEqual(validateEmail('user@domain').valid, false);
    });
  });

  describe('validatePhone', () => {
    it('accepts valid 10-digit mobile numbers starting with 9', () => {
      assert.deepStrictEqual(validatePhone('9171234567'), { valid: true });
      assert.deepStrictEqual(validatePhone('917 123 4567'), { valid: true });
    });

    it('accepts valid 11-digit mobile numbers starting with 09', () => {
      assert.deepStrictEqual(validatePhone('09171234567'), { valid: true });
      assert.deepStrictEqual(validatePhone('(0917) 123-4567'), { valid: true });
    });

    it('accepts valid 12-digit international mobile numbers starting with 639', () => {
      assert.deepStrictEqual(validatePhone('+639171234567'), { valid: true });
      assert.deepStrictEqual(validatePhone('639171234567'), { valid: true });
    });

    it('rejects invalid phone numbers', () => {
      assert.strictEqual(validatePhone('').valid, false);
      assert.strictEqual(validatePhone('12345').valid, false);
      assert.strictEqual(validatePhone('08123456789').valid, false); // invalid prefix
      assert.strictEqual(validatePhone('0917123456').valid, false); // too short
    });
  });

  describe('validatePassword', () => {
    it('accepts passwords of 8 characters or more', () => {
      assert.deepStrictEqual(validatePassword('StrongPass123'), { valid: true });
      assert.deepStrictEqual(validatePassword('12345678'), { valid: true });
    });

    it('rejects passwords shorter than minLength or empty', () => {
      assert.strictEqual(validatePassword('').valid, false);
      assert.strictEqual(validatePassword('short').valid, false);
      assert.strictEqual(validatePassword(null).valid, false);
    });
  });

  describe('validateFullName', () => {
    it('accepts names with at least 2 characters', () => {
      assert.deepStrictEqual(validateFullName('Juan Cruz'), { valid: true });
      assert.deepStrictEqual(validateFullName('Ed'), { valid: true });
    });

    it('rejects empty names or single-character names', () => {
      assert.strictEqual(validateFullName('').valid, false);
      assert.strictEqual(validateFullName('A').valid, false);
      assert.strictEqual(validateFullName('   ').valid, false);
    });
  });

  describe('validateQuantity', () => {
    it('accepts valid integers within stock bounds', () => {
      assert.deepStrictEqual(validateQuantity(3, { min: 1, max: 10, stock: 5 }), { valid: true });
      assert.deepStrictEqual(validateQuantity('2', { min: 1, stock: 5 }), { valid: true });
    });

    it('rejects non-integers, below-min, or above-stock quantities', () => {
      assert.strictEqual(validateQuantity(0, { min: 1 }).valid, false);
      assert.strictEqual(validateQuantity(2.5).valid, false);
      assert.strictEqual(validateQuantity(10, { stock: 5 }).valid, false);
      assert.strictEqual(validateQuantity('abc').valid, false);
    });
  });

  describe('validatePrice', () => {
    it('accepts valid positive numbers', () => {
      assert.deepStrictEqual(validatePrice(99.5), { valid: true });
      assert.deepStrictEqual(validatePrice('150.00'), { valid: true });
      assert.deepStrictEqual(validatePrice(0, { min: 0 }), { valid: true });
    });

    it('rejects invalid or negative prices', () => {
      assert.strictEqual(validatePrice(-5, { min: 0 }).valid, false);
      assert.strictEqual(validatePrice('invalid').valid, false);
      assert.strictEqual(validatePrice(NaN).valid, false);
    });
  });
});
