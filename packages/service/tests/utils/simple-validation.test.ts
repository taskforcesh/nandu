import { describe, test, expect } from 'bun:test';
import { isValidPackageName } from '../../src/utils/index';

describe('Package Name Validation - URL Encoding Issue', () => {
  test('should reject URL-encoded package name', () => {
    // This is the specific case from your error
    const urlEncodedName = '@taskforcesh%2fconnector-pro';
    const result = isValidPackageName(urlEncodedName);
    expect(result).toBe(false);
  });

  test('should accept properly decoded package name', () => {
    // This should work
    const decodedName = '@taskforcesh/connector-pro';
    const result = isValidPackageName(decodedName);
    expect(result).toBe(true);
  });

  test('should validate specific URL encoding scenarios', () => {
    const packageNameRegex = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
    
    const testCases = [
      { name: '@taskforcesh/connector-pro', expected: true },
      { name: '@taskforcesh%2fconnector-pro', expected: false },
      { name: 'connector-pro', expected: true },
      { name: 'connector%2dpro', expected: false }
    ];

    testCases.forEach(({ name, expected }) => {
      const result = packageNameRegex.test(name);
      expect(result).toBe(expected);
    });
  });

  test('URL decoding handles encoded _id in request body', () => {
    const encodedName = '@taskforcesh%2fbullmq-pro';
    const decodedName = '@taskforcesh/bullmq-pro';
    
    // Test that decodeURIComponent works for _id field
    expect(decodeURIComponent(encodedName)).toBe(decodedName);
    
    // Test the pattern that would be in request body
    const mockRequestBody = {
      _id: encodedName,
      name: encodedName
    };
    
    expect(decodeURIComponent(mockRequestBody._id)).toBe(decodedName);
    expect(decodeURIComponent(mockRequestBody.name)).toBe(decodedName);
  });
});
