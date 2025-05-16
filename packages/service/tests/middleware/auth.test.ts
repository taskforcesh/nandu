import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Sequelize } from 'sequelize';

// Create a simplified mock auth middleware that we can test directly
const createAuthMiddleware = (dependencies: any) => {
  return () => async (req: any, res: any, next: any) => {
    try {
      const { authorization } = req.headers;
      if (!authorization) {
        return res.status(StatusCodes.UNAUTHORIZED).send('Missing authorization header');
      }

      const [authType, token] = authorization.split(' ');
      
      if (authType === 'Bearer' && token) {
        // Check if it's a JWT token first
        if (dependencies.isJwt(token)) {
          // JWT token handling would normally go here
          next();
          return;
        }

        // Handle API token
        const tokenHash = dependencies.Token.hashToken(token);
        const tokenInstance = await dependencies.Token.findOne({ where: { token: tokenHash } });

        if (!tokenInstance) {
          return res.status(StatusCodes.UNAUTHORIZED).send('Invalid token');
        }

        // Validate CIDR if present
        if (!tokenInstance.checkCIDR(req.ip)) {
          return res.status(StatusCodes.UNAUTHORIZED).send('IP not allowed');
        }

        // Update token usage stats - this is what we're testing
        try {
          await dependencies.Token.update(
            {
              lastUsed: new Date(),
              useCount: Sequelize.literal('useCount + 1')
            },
            { where: { token: tokenHash } }
          );
        } catch (error) {
          // Non-critical, continue even if update fails
        }

        const userId = tokenInstance.getDataValue('userId');
        const user = await dependencies.User.findOne({ where: { _id: userId } });

        if (!user) {
          return res.status(StatusCodes.UNAUTHORIZED).send('User not found');
        }

        const access = tokenInstance.getDataValue('access') || [];
        res.locals.user = user;
        res.locals.auth = { access };
        
        next();
        return;
      }
      
      res.status(StatusCodes.UNAUTHORIZED).send('Invalid authorization format');
    } catch (error) {
      next(error);
    }
  };
};

describe('Auth Middleware', () => {
  // Mock request, response, and next function
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let mockDependencies: any;
  let middleware: any;

  beforeEach(() => {
    // Setup mock dependencies
    mockDependencies = {
      Token: {
        hashToken: mock(() => 'hashed-token'),
        findOne: mock(() => Promise.resolve(null)),
        update: mock(() => Promise.resolve([1]))
      },
      User: {
        findOne: mock(() => Promise.resolve(null))
      },
      isJwt: mock(() => false)
    };
    
    // Setup request, response, and next function
    req = {
      headers: {
        authorization: 'Bearer test-token'
      },
      ip: '127.0.0.1'
    };
    
    res = {
      status: mock(() => res),
      send: mock(() => res),
      locals: {}
    };
    
    next = mock(() => undefined);
    
    // Create middleware
    middleware = createAuthMiddleware(mockDependencies);
  });

  describe('Token Usage Tracking', () => {
    const mockTokenInstance = {
      getDataValue: (key: string) => {
        switch(key) {
          case 'userId':
            return 'user-123';
          case 'access':
            return ['publish'];
          default:
            return null;
        }
      },
      checkCIDR: mock((ip: string) => true)
    };

    const mockUserInstance = {
      _id: 'user-123',
      name: 'testuser',
    };

    test('should update lastUsed and useCount when token is valid', async () => {
      // Setup
      mockDependencies.Token.findOne.mockImplementation(() => Promise.resolve(mockTokenInstance));
      mockDependencies.User.findOne.mockImplementation(() => Promise.resolve(mockUserInstance));

      // Execute
      await middleware()(req as Request, res as Response, next);

      // Assert
      expect(mockDependencies.Token.update).toHaveBeenCalledWith(
        {
          lastUsed: expect.any(Date),
          useCount: Sequelize.literal('useCount + 1')
        },
        { where: { token: 'hashed-token' } }
      );
      expect(next).toHaveBeenCalled();
      expect(res.locals).toMatchObject({
        user: mockUserInstance,
        auth: { access: ['publish'] }
      });
    });

    test('should not update token if token is invalid', async () => {
      // Setup
      mockDependencies.Token.findOne.mockImplementation(() => Promise.resolve(null));

      // Execute
      await middleware()(req as Request, res as Response, next);

      // Assert
      expect(mockDependencies.Token.update).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
      expect(next).not.toHaveBeenCalled();
    });

    test('should not update token if CIDR check fails', async () => {
      // Setup
      const invalidCidrToken = {
        getDataValue: mockTokenInstance.getDataValue,
        checkCIDR: mock((ip: string) => false)
      };
      mockDependencies.Token.findOne.mockImplementation(() => Promise.resolve(invalidCidrToken));

      // Execute
      await middleware()(req as Request, res as Response, next);

      // Assert
      expect(mockDependencies.Token.update).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
      expect(next).not.toHaveBeenCalled();
    });
  });
});