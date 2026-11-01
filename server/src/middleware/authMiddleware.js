import jwt from 'jsonwebtoken';
import { readDB } from '../db/database.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'spendwise_jwt_secret_production_key_2026';

export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No bearer token provided.',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const db = readDB();
    const user = db.users.find((u) => u.id === decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token: User account not found.',
      });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      currency: user.currency || 'INR',
      currencySymbol: user.currencySymbol || '₹',
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please sign in again.',
    });
  }
};

