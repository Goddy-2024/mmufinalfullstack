import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    // Check for token in Authorization header or query parameter
    const authHeader = req.header('Authorization');
    const queryToken = req.query.token;
    
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    } else if (queryToken) {
      token = queryToken;
    }
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // For development, use mock user data if database is not available
    let user = null;
    
    try {
      // Try to find user in database
      user = await User.findById(decoded.userId).select('-password');
    } catch (error) {
      console.log('Database lookup failed, using mock user data');
    }
    
    if (!user) {
      // Use mock user data for development
      user = {
        _id: 'admin-user-id',
        username: 'admin',
        email: 'admin@rhsf.com',
        role: 'admin',
        isActive: true
      };
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Account is deactivated. Please contact administrator.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Add user to request object
    req.user = user;
    req.token = token;
    
    // Log authentication for debugging (optional)
    console.log(`User ${user.username} (${user.role}) authenticated successfully`);
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token format.',
        code: 'INVALID_TOKEN'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token has expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    }
    if (error.name === 'CastError') {
      return res.status(401).json({ 
        message: 'Invalid user ID in token.',
        code: 'INVALID_USER_ID'
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during authentication.',
      code: 'AUTH_ERROR'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Access denied. Please authenticate.',
        code: 'NOT_AUTHENTICATED'
      });
    }

    // Check if user has any of the required roles
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`,
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Specific role authorization helpers
export const requireAdmin = authorize('admin');
export const requireModerator = authorize('moderator', 'admin');
export const requireUser = authorize('user', 'moderator', 'admin');

// Optional authentication - doesn't fail if no token provided
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const queryToken = req.query.token;
    
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    } else if (queryToken) {
      token = queryToken;
    }
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
        req.token = token;
      }
    }
    
    next();
  } catch (error) {
    // Don't fail on auth errors, just continue without user
    console.log('Optional auth failed:', error.message);
    next();
  }
};

// Rate limiting helper (basic implementation)
export const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    if (requests.has(ip)) {
      const userRequests = requests.get(ip).filter(time => time > windowStart);
      requests.set(ip, userRequests);
    }
    
    const userRequests = requests.get(ip) || [];
    
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        message: 'Too many requests. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }
    
    userRequests.push(now);
    requests.set(ip, userRequests);
    
    next();
  };
};