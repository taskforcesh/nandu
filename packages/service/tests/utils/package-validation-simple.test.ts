import { describe, test, expect } from 'bun:test';
import { isValidPackageName } from '../../src/utils/index';

describe('Package Name Validation - Express.js Handling', () => {
  test('should accept valid scoped package names', () => {
    expect(isValidPackageName('@taskforcesh/bullmq-pro')).toBe(true);
    expect(isValidPackageName('@taskforcesh/connector-pro')).toBe(true);
  });

  test('should reject invalid package names', () => {
    expect(isValidPackageName('')).toBe(false);
    expect(isValidPackageName('invalid name with spaces')).toBe(false);
  });

  test('validation works on proper package names (not URL-encoded)', () => {
    // Express.js should handle URL decoding of path parameters
    // JSON parsing should handle request body
    // So our validation should only see proper package names
    expect(isValidPackageName('@taskforcesh/bullmq-pro')).toBe(true);
    expect(isValidPackageName('@npmcli/example')).toBe(true);
    expect(isValidPackageName('simple-package')).toBe(true);
  });
});
