import { describe, test, expect } from 'bun:test';
import { isValidPackageName } from '../../src/utils/index';

describe('Package Name Validation', () => {
  describe('Valid package names', () => {
    test('should accept simple package names', () => {
      expect(isValidPackageName('express')).toBe(true);
      expect(isValidPackageName('lodash')).toBe(true);
      expect(isValidPackageName('react')).toBe(true);
    });

    test('should accept package names with hyphens', () => {
      expect(isValidPackageName('create-react-app')).toBe(true);
      expect(isValidPackageName('babel-core')).toBe(true);
      expect(isValidPackageName('webpack-dev-server')).toBe(true);
    });

    test('should accept package names with dots', () => {
      expect(isValidPackageName('jquery.cookie')).toBe(true);
      expect(isValidPackageName('backbone.localstorage')).toBe(true);
    });

    test('should accept package names with underscores', () => {
      expect(isValidPackageName('some_package')).toBe(true);
      expect(isValidPackageName('my_awesome_lib')).toBe(true);
    });

    test('should accept scoped package names', () => {
      expect(isValidPackageName('@babel/core')).toBe(true);
      expect(isValidPackageName('@angular/common')).toBe(true);
      expect(isValidPackageName('@types/node')).toBe(true);
      expect(isValidPackageName('@taskforcesh/connector-pro')).toBe(true);
    });

    test('should accept scoped package names with complex names', () => {
      expect(isValidPackageName('@scope/package-name')).toBe(true);
      expect(isValidPackageName('@my-org/my-package')).toBe(true);
      expect(isValidPackageName('@company/utils.helper')).toBe(true);
    });
  });

  describe('Invalid package names', () => {
    test('should reject package names starting with dots', () => {
      expect(isValidPackageName('.hidden')).toBe(false);
      expect(isValidPackageName('.package')).toBe(false);
    });

    test('should reject package names starting with underscores', () => {
      expect(isValidPackageName('_private')).toBe(false);
      expect(isValidPackageName('_package')).toBe(false);
    });

    test('should reject package names with uppercase letters', () => {
      expect(isValidPackageName('MyPackage')).toBe(false);
      expect(isValidPackageName('PACKAGE')).toBe(false);
      expect(isValidPackageName('Package-Name')).toBe(false);
    });

    test('should reject empty or invalid scope names', () => {
      expect(isValidPackageName('@/package')).toBe(false);
      expect(isValidPackageName('@.scope/package')).toBe(false);
      expect(isValidPackageName('@_scope/package')).toBe(false);
    });

    test('should reject malformed scoped packages', () => {
      expect(isValidPackageName('@scope/')).toBe(false);
      expect(isValidPackageName('@scope/.')).toBe(false);
      expect(isValidPackageName('@scope/_package')).toBe(false);
    });

    test('should reject empty strings', () => {
      expect(isValidPackageName('')).toBe(false);
    });

    test('should reject package names with spaces', () => {
      expect(isValidPackageName('my package')).toBe(false);
      expect(isValidPackageName('package name')).toBe(false);
    });
  });

  describe('URL encoding scenarios', () => {
    test('should reject URL-encoded package names', () => {
      // This is the key test based on the error you saw
      expect(isValidPackageName('@taskforcesh%2fconnector-pro')).toBe(false);
      expect(isValidPackageName('@scope%2fpackage')).toBe(false);
      expect(isValidPackageName('package%20name')).toBe(false);
    });

    test('should accept properly decoded package names', () => {
      // The decoded version should be valid
      expect(isValidPackageName('@taskforcesh/connector-pro')).toBe(true);
      expect(isValidPackageName('@scope/package')).toBe(true);
    });

    test('should reject other URL-encoded characters', () => {
      expect(isValidPackageName('package%40name')).toBe(false); // %40 = @
      expect(isValidPackageName('package%3Aname')).toBe(false); // %3A = :
      expect(isValidPackageName('package%21name')).toBe(false); // %21 = !
    });
  });

  describe('Edge cases', () => {
    test('should handle very long package names', () => {
      const longName = 'a'.repeat(214); // npm has a 214 character limit
      expect(isValidPackageName(longName)).toBe(true);
    });

    test('should reject package names with special characters', () => {
      expect(isValidPackageName('package@name')).toBe(false);
      expect(isValidPackageName('package:name')).toBe(false);
      expect(isValidPackageName('package;name')).toBe(false);
      expect(isValidPackageName('package!name')).toBe(false);
    });

    test('should handle numbers correctly', () => {
      expect(isValidPackageName('package2')).toBe(true);
      expect(isValidPackageName('2package')).toBe(true);
      expect(isValidPackageName('123')).toBe(true);
      expect(isValidPackageName('@scope/package2')).toBe(true);
      expect(isValidPackageName('@scope2/package')).toBe(true);
    });
  });

  describe('Real-world package names', () => {
    test('should validate common npm packages', () => {
      const commonPackages = [
        'express',
        'react',
        'vue',
        'angular',
        'lodash',
        'moment',
        'axios',
        'webpack',
        'babel-core',
        'eslint-config-airbnb',
        '@babel/core',
        '@angular/core',
        '@types/node',
        '@typescript-eslint/parser',
        '@vue/cli-service',
        'create-react-app',
        'webpack-dev-server',
        'jest-environment-jsdom'
      ];

      commonPackages.forEach(pkg => {
        expect(isValidPackageName(pkg)).toBe(true);
      });
    });

    test('should reject invalid variations', () => {
      const invalidPackages = [
        'Express', // uppercase
        'React.js', // uppercase + invalid chars for simple names
        '_private', // starts with underscore
        '.hidden', // starts with dot
        '@/package', // empty scope
        '@scope/', // empty package
        'package name', // space
        'package@latest', // @ in package name
        'package:1.0.0' // : in package name
      ];

      invalidPackages.forEach(pkg => {
        expect(isValidPackageName(pkg)).toBe(false);
      });
    });
  });
});
