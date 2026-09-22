import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * protect — Express middleware that validates a JWT Bearer token.
 *
 * Reads:  Authorization: Bearer <token>
 * Sets:   req.user  (User document without password)
 * Throws: 401 if token is missing, malformed, expired, or the user no longer exists
 */
export const protect = async (req, res, next) => {
  try {
    // ── 1. Extract token ──────────────────────────────────────────────────────
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Not authorised — no token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    // ── 2. Verify signature + expiry ──────────────────────────────────────────
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message =
        err.name === 'TokenExpiredError'
          ? 'Session expired — please log in again.'
          : 'Invalid token — please log in again.';
      return res.status(401).json({ success: false, error: message });
    }

    // ── 3. Confirm user still exists in DB ────────────────────────────────────
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'The account belonging to this token no longer exists.',
      });
    }

    // ── 4. Attach user to request and continue ────────────────────────────────
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Server error during authentication.',
    });
  }
};
