import jwt from 'jsonwebtoken';

export function authenticateAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const secret = process.env.JWT_SECRET || 'mrt-international-fallback-secret-2026';
    const decoded = jwt.verify(token, secret);
    if (decoded.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden' });
    }
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
