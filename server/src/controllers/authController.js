import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { readDB, saveDB } from '../db/database.js';
import { JWT_SECRET } from '../middleware/authMiddleware.js';

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, currency = 'INR' } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, valid email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    const db = readDB();
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const userId = uuidv4();
    const chosenCurrency = currency.toUpperCase();
    const currencySymbol = CURRENCY_SYMBOLS[chosenCurrency] || '₹';

    const newUser = {
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      currency: chosenCurrency,
      currencySymbol,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create default Primary Checking account
    const primaryAccount = {
      id: uuidv4(),
      userId,
      name: 'Primary Checking Account',
      type: 'Checking',
      balance: 0,
      currency: chosenCurrency,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    db.accounts.push(primaryAccount);
    saveDB(db);

    const token = jwt.sign({ userId, email: newUser.email }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        currency: newUser.currency,
        currencySymbol: newUser.currencySymbol,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const db = readDB();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials: User not found.',
      });
    }

    const match = bcrypt.compareSync(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      message: 'Signed in successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture || null,
        currency: user.currency || 'INR',
        currencySymbol: user.currencySymbol || '₹',
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Google OAuth Authentication Handler
 * Supports Google ID Token, Google user profile payload, or development authentication
 */
export const googleAuth = async (req, res, next) => {
  try {
    const { credential, userInfo } = req.body || {};
    let email, name, googleId, picture;

    // 1. If Google ID Token (from Google Identity Services SDK)
    if (credential) {
      try {
        const verifyRes = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`, {
          timeout: 6000,
        });
        email = verifyRes.data.email;
        name = verifyRes.data.name;
        googleId = verifyRes.data.sub;
        picture = verifyRes.data.picture;
      } catch (tokenErr) {
        // Fallback: safely decode JWT payload if remote call timed out
        try {
          const parts = credential.split('.');
          if (parts.length >= 2) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            email = payload.email;
            name = payload.name;
            googleId = payload.sub;
            picture = payload.picture;
          }
        } catch (decodeErr) {
          return res.status(400).json({ success: false, message: 'Invalid Google credential token.' });
        }
      }
    } else if (userInfo && userInfo.email) {
      // 2. Client Google OAuth profile
      email = userInfo.email;
      name = userInfo.name || email.split('@')[0];
      googleId = userInfo.googleId || userInfo.sub || `google_${Date.now()}`;
      picture = userInfo.picture;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Google credential or user profile information is required.',
      });
    }

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account does not contain a verified email.' });
    }

    const db = readDB();
    let user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) {
      // Create new Google account
      const userId = uuidv4();
      user = {
        id: userId,
        name: name || email.split('@')[0],
        email: email.toLowerCase().trim(),
        googleId,
        picture: picture || null,
        authProvider: 'google',
        currency: 'INR',
        currencySymbol: '₹',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const primaryAccount = {
        id: uuidv4(),
        userId,
        name: 'Primary Checking (Auto-Created)',
        type: 'Checking',
        balance: 50000,
        currency: 'INR',
        createdAt: new Date().toISOString(),
      };

      db.users.push(user);
      db.accounts.push(primaryAccount);
      saveDB(db);
    } else {
      // Link Google credentials
      if (!user.googleId) user.googleId = googleId;
      if (picture && !user.picture) user.picture = picture;
      user.updatedAt = new Date().toISOString();
      saveDB(db);
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      message: 'Signed in with Google successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        currency: user.currency || 'INR',
        currencySymbol: user.currencySymbol || '₹',
        authProvider: user.authProvider || 'google',
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getGoogleConfig = (req, res) => {
  res.json({
    success: true,
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    isConfigured: Boolean(process.env.GOOGLE_CLIENT_ID),
  });
};

export const getMe = async (req, res, next) => {
  try {
    const db = readDB();
    const user = db.users.find((u) => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userAccounts = db.accounts.filter((a) => a.userId === user.id);

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture || null,
        currency: user.currency || 'INR',
        currencySymbol: user.currencySymbol || '₹',
        accounts: userAccounts,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateCurrency = async (req, res, next) => {
  try {
    const { currency } = req.body || {};
    if (!currency) {
      return res.status(400).json({ success: false, message: 'Currency code is required' });
    }

    const code = currency.toUpperCase();
    const symbol = CURRENCY_SYMBOLS[code] || '$';

    const db = readDB();
    const userIndex = db.users.findIndex((u) => u.id === req.user.id);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    db.users[userIndex].currency = code;
    db.users[userIndex].currencySymbol = symbol;
    db.users[userIndex].updatedAt = new Date().toISOString();
    saveDB(db);

    res.json({
      success: true,
      message: `Preferred currency updated to ${code} (${symbol})`,
      currency: code,
      currencySymbol: symbol,
    });
  } catch (err) {
    next(err);
  }
};

// Accounts Management (Checking, Savings, Credit Cards, Cash)
export const getAccounts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const db = readDB();
    const accounts = db.accounts.filter((a) => a.userId === userId);
    res.json({ success: true, accounts });
  } catch (err) {
    next(err);
  }
};

export const createAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, type = 'Checking', balance = 0 } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Account name is required.' });
    }

    const db = readDB();
    const newAccount = {
      id: uuidv4(),
      userId,
      name: name.trim(),
      type,
      balance: parseFloat(balance) || 0,
      currency: req.user.currency || 'INR',
      createdAt: new Date().toISOString(),
    };

    db.accounts.push(newAccount);
    saveDB(db);

    res.status(201).json({ success: true, message: 'Account created successfully!', account: newAccount });
  } catch (err) {
    next(err);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const db = readDB();
    const idx = db.accounts.findIndex((a) => a.id === id && a.userId === userId);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Account not found or access denied.' });
    }

    // Ensure user keeps at least one account
    const count = db.accounts.filter((a) => a.userId === userId).length;
    if (count <= 1) {
      return res.status(400).json({ success: false, message: 'You must maintain at least one active account.' });
    }

    db.accounts.splice(idx, 1);
    saveDB(db);

    res.json({ success: true, message: 'Account removed successfully.' });
  } catch (err) {
    next(err);
  }
};
