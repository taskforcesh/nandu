import { describe, test, expect } from 'bun:test';
import { isValidPackageName } from '../../src/utils/index';

describe('Package Name Validation - URL Encoding Issue', () => {
  test('should reject URL-encoded package name', () => {
    // This is the specific case from your error
    const urlEncodedName = '@taskforcesh%2fconnector-pro';
    const result = isValidPackageName(urlEncodedName);
    console.log(`Testing: ${urlEncodedName}`);
    console.log(`Result: ${result}`);
    expect(result).toBe(false);
  });

  test('should accept properly decoded package name', () => {
    // This should work
    const decodedName = '@taskforcesh/connector-pro';
    const result = isValidPackageName(decodedName);
    console.log(`Testing: ${decodedName}`);
    console.log(`Result: ${result}`);
    expect(result).toBe(true);
  });

  test('should test the regex directly', () => {
    const packageName = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
    
    const tests = [
      '@taskforcesh/connector-pro',
      '@taskforcesh%2fconnector-pro',
      'connector-pro',
      'connector%2dpro'
    ];

    tests.forEach(name => {
      const result = packageName.test(name);
      console.log(`${name} -> ${result}`);
    });
  });
});
