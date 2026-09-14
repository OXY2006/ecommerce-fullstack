import jwt from 'jsonwebtoken';

/**
 * Authentication Middleware:
 * Verifies the JWT sent in the Authorization header (Bearer <token>).
 * Attaches the decoded user payload to req.user if valid.
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  
  // Format should be: "Bearer <token>"
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return res.status(401).json({
      message: 'Access token required. Please log in.'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret_key';
    const decoded = jwt.verify(token, secret);
    
    // Attach user payload (id, email, role) to the request object
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired authentication token.'
    });
  }
}

/**
 * Admin Authorization Middleware:
 * Ensures the authenticated user has the 'admin' role.
 * Returns 403 Forbidden if the user is authenticated but lacks admin privileges.
 */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Forbidden: Admin access required.'
    });
  }
  next();
}
