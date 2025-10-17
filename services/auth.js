const jwt = require('jsonwebtoken');

function getJwtSecret() {
  const secret = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ADMIN_JWT_SECRET is not configured');
    }
    return 'DEVELOPMENT_INSECURE_SECRET_CHANGE_ME';
  }
  return secret;
}

function signAdminToken(payload = {}) {
  return jwt.sign({ role: 'admin', ...payload }, getJwtSecret(), {
    algorithm: 'HS256',
    expiresIn: '24h',
  });
}

function verifyAdminToken(token) {
  return jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
}

function requireAdminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }
    const token = authHeader.substring(7);
    const decoded = verifyAdminToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return res.status(401).json({ error: 'Invalid admin token' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = {
  signAdminToken,
  verifyAdminToken,
  requireAdminAuth,
};
