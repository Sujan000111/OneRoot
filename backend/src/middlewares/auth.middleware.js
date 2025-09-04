'use strict';

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

console.log('🔐 Middleware - JWT_SECRET loaded:', JWT_SECRET ? 'YES' : 'NO');
console.log('🔐 Middleware - JWT_SECRET length:', JWT_SECRET ? JWT_SECRET.length : 0);
console.log('🔐 Middleware - JWT_SECRET preview:', JWT_SECRET ? JWT_SECRET.substring(0, 20) + '...' : 'NONE');

module.exports.requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  // No demo tokens allowed (for backward compatibility)
  if (token.startsWith('demo-token-')) {
    console.log('❌ Middleware - Demo token rejected:', token.substring(0, 20) + '...');
    return res.status(401).json({ success: false, message: 'Demo tokens are not allowed' });
  }

  try {
    console.log('🔐 Middleware - JWT_SECRET:', JWT_SECRET ? 'Set' : 'Not set');
    console.log('🔐 Middleware - Token to verify:', token.substring(0, 20) + '...');
    console.log('🔐 Middleware - Current time:', new Date().toISOString());
    
    // Decode token without verification to check expiration
    const decoded = jwt.decode(token);
    if (decoded) {
      console.log('🔐 Middleware - Token decoded (without verification):', {
        exp: decoded.exp,
        expDate: new Date(decoded.exp * 1000).toISOString(),
        iat: decoded.iat,
        iatDate: new Date(decoded.iat * 1000).toISOString(),
        sub: decoded.sub,
        phone: decoded.phone
      });
    }
    
    const payload = jwt.verify(token, JWT_SECRET);
    console.log('🔐 Middleware - Token verified successfully, payload:', payload);
    
    // Attach user info (expects sub and phone set at sign)
    req.user = { id: payload.sub, phone: payload.phone };
    console.log('🔐 Middleware - User attached to request:', req.user);
    return next();
  } catch (err) {
    console.error('❌ Middleware - JWT verification failed:', err.message);
    console.error('❌ Middleware - JWT_SECRET available:', !!JWT_SECRET);
    console.error('❌ Middleware - Token length:', token.length);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token', 
      error: err.message,
      secretSet: !!JWT_SECRET 
    });
  }
};
