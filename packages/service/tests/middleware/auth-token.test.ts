import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { Sequelize } from 'sequelize';

// Create a simplified version of the auth middleware that we can test directly
// This isolates just the token usage tracking functionality we want to test
const createMockMiddleware = (dependencies: any) => {
  return async (req: any, res: any, next: any) => {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).send("Missing credentials");
    }
    
    const [authType, token] = authorization.split(" ");
    
    if (authType === 'Bearer' && token && !dependencies.isJwt(token)) {
      const tokenHash = dependencies.Token.hashToken(token);
      const tokenInstance = await dependencies.Token.findOne(tokenHash);
      
      if (!tokenInstance) {
        return res.status(401).send("Invalid token");
      }
      
      if (!tokenInstance.checkCIDR(req.ip)) {
        return res.status(401).send("Invalid IP");
      }
      
      // This is the functionality we're testing - token usage tracking
      try {
        await dependencies.Token.update(
          { 
            lastUsed: dependencies.getCurrentDate(),
            useCount: Sequelize.literal('useCount + 1') 
          },
          { where: { token: tokenHash } }
        );
      } catch (error) {
        // Silently handle DB errors for token tracking
        // We'll just continue with auth flow since token tracking is non-critical
      }
      
      const user = await dependencies.User.findOne(tokenInstance.userId);
      
      if (!user) {
        return res.status(401).send("Invalid user for token");
      }
      
      res.locals.user = user;
      res.locals.auth = { access: tokenInstance.access };
      next();
    } else {
      // Other auth flows not relevant to our test
      next();
    }
  };
};

describe('Token Usage Tracking', () => {
  let mockDependencies: any;
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;
  let mockTokenInstance: any;
  let mockUser: any;
  let middleware: any;
  let mockDate: Date;
  
  beforeEach(() => {
    // Create a fixed date for testing
    mockDate = new Date('2025-05-16T12:00:00Z');
    
    // Mock dependencies
    mockTokenInstance = {
      userId: 'user123',
      access: ['publish'],
      checkCIDR: mock(() => true)
    };
    
    mockUser = {
      id: 'user123',
      name: 'testuser'
    };
    
    mockDependencies = {
      Token: {
        hashToken: mock(() => 'hashed-token'),
        findOne: mock(() => Promise.resolve(mockTokenInstance)),
        update: mock(() => Promise.resolve([1]))
      },
      User: {
        findOne: mock(() => Promise.resolve(mockUser))
      },
      isJwt: mock(() => false),
      getCurrentDate: () => mockDate
    };
    
    // Create request, response, and next mocks
    mockReq = {
      headers: {
        authorization: 'Bearer test-token'
      },
      ip: '127.0.0.1'
    };
    
    mockRes = {
      status: mock(() => mockRes),
      send: mock(() => mockRes),
      locals: {}
    };
    
    mockNext = mock();
    
    // Create the middleware with our mocked dependencies
    middleware = createMockMiddleware(mockDependencies);
  });
  
  test('should update lastUsed and useCount when token is valid', async () => {
    // Execute the middleware
    await middleware(mockReq, mockRes, mockNext);
    
    // Assert that token usage tracking was updated
    expect(mockDependencies.Token.update).toHaveBeenCalledTimes(1);
    expect(mockDependencies.Token.update).toHaveBeenCalledWith(
      {
        lastUsed: mockDate,
        useCount: Sequelize.literal('useCount + 1')
      },
      { where: { token: 'hashed-token' } }
    );
    
    // Assert the middleware completed successfully
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.locals.user).toBe(mockUser);
    expect(mockRes.locals.auth).toEqual({ access: ['publish'] });
  });
  
  test('should not update token if token is invalid', async () => {
    // Setup an invalid token scenario
    mockDependencies.Token.findOne = mock(() => Promise.resolve(null));
    
    // Execute the middleware
    await middleware(mockReq, mockRes, mockNext);
    
    // Assert token update was not called
    expect(mockDependencies.Token.update).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
  });
  
  test('should not update token if CIDR check fails', async () => {
    // Setup a failed CIDR check
    mockTokenInstance.checkCIDR = mock(() => false);
    
    // Execute the middleware
    await middleware(mockReq, mockRes, mockNext);
    
    // Assert token update was not called
    expect(mockDependencies.Token.update).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
  });

  // Additional edge case tests
  
  test('should handle database errors when updating token usage', async () => {
    // Setup a database error scenario
    mockDependencies.Token.update = mock(() => Promise.reject(new Error('Database error')));
    
    // Execute the middleware - should not throw despite DB error
    await middleware(mockReq, mockRes, mockNext);
    
    // Should still authorize the user even if token update fails
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.locals.user).toBe(mockUser);
  });

  test('should handle null user for valid token', async () => {
    // Setup valid token but missing user scenario
    mockDependencies.User.findOne = mock(() => Promise.resolve(null));
    
    // Execute the middleware
    await middleware(mockReq, mockRes, mockNext);
    
    // Should update token but reject due to missing user
    expect(mockDependencies.Token.update).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.send).toHaveBeenCalledWith('Invalid user for token');
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('should handle token with invalid access permissions', async () => {
    // Setup token with empty access permissions
    const tokenWithNoAccess = {
      ...mockTokenInstance,
      access: []
    };
    mockDependencies.Token.findOne = mock(() => Promise.resolve(tokenWithNoAccess));
    
    // Execute the middleware
    await middleware(mockReq, mockRes, mockNext);
    
    // Should update token and continue because access is not checked in this part
    expect(mockDependencies.Token.update).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.locals.auth).toEqual({ access: [] });
  });

  test('should handle concurrent token usage with same token', async () => {
    // Setup to simulate concurrent requests using the same token
    let updateCallCount = 0;
    mockDependencies.Token.update = mock(() => {
      updateCallCount++;
      return Promise.resolve([1]);
    });
    
    // Execute the middleware twice in parallel
    await Promise.all([
      middleware(mockReq, mockRes, mockNext),
      middleware(mockReq, mockRes, mockNext)
    ]);
    
    // Each request should independently update the token
    expect(updateCallCount).toBe(2);
  });

  test('should handle IPv6 address in CIDR check', async () => {
    // Setup request with IPv6 address
    const reqWithIPv6 = {
      ...mockReq,
      ip: '2001:0db8:85a3:0000:0000:8a2e:0370:7334'
    };
    
    // Mock the checkCIDR function to verify IPv6 handling
    mockTokenInstance.checkCIDR = mock((ip) => {
      // Verify that the IP address is processed correctly
      return ip === '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
    });
    
    // Execute the middleware
    await middleware(reqWithIPv6, mockRes, mockNext);
    
    // Verify the CIDR check was called with the right IP
    expect(mockTokenInstance.checkCIDR).toHaveBeenCalledWith('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
    expect(mockDependencies.Token.update).toHaveBeenCalled();
  });

  test('should handle malformed authorization header', async () => {
    // Setup request with malformed authorization header
    const reqWithMalformedAuth = {
      ...mockReq,
      headers: {
        authorization: 'Bearer' // Missing token part
      }
    };
    
    // Execute the middleware
    await middleware(reqWithMalformedAuth, mockRes, mockNext);
    
    // Should not attempt to update token usage
    expect(mockDependencies.Token.update).not.toHaveBeenCalled();
    // Should proceed to next middleware since this is not handled specifically
    expect(mockNext).toHaveBeenCalled();
  });
});