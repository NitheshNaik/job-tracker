import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ok   = (res, data, status = 200) => res.status(status).json({ success: true,  data });
const fail = (res, error, status = 400) => res.status(status).json({ success: false, error });

/**
 * Sign a JWT for a given user ID.
 * Reads JWT_SECRET and JWT_EXPIRES_IN from env.
 */
function signToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * Build the safe user object to return to the client
 * (never expose the hashed password).
 */
function safeUser(user) {
  return {
    _id:   user._id,
    name:  user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name = '', email, password } = req.body;

    // Basic presence checks (Mongoose also validates, but nice to give clear msgs)
    if (!email || !password) {
      return fail(res, 'Email and password are required.', 400);
    }

    // Check for duplicate email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return fail(res, 'An account with this email already exists.', 409);
    }

    // Create user — password hashing happens in the pre-save hook on User model
    const user = await User.create({ name: name.trim(), email, password });

    const token = signToken(user._id);
    return ok(res, { token, user: safeUser(user) }, 201);
  } catch (err) {
    if (err.name === 'ValidationError') {
      // Extract the first validation message for a clean UX error
      const msg = Object.values(err.errors)[0]?.message ?? err.message;
      return fail(res, msg, 400);
    }
    if (err.code === 11000) {
      return fail(res, 'An account with this email already exists.', 409);
    }
    console.error('[authController.register]', err);
    return fail(res, 'Server error during registration.', 500);
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return fail(res, 'Email and password are required.', 400);
    }

    // Explicitly select password (it's set to select: false on the schema)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      // Use a generic message — don't reveal whether the email exists
      return fail(res, 'Incorrect email or password.', 401);
    }

    const passwordMatch = await user.matchPassword(password);
    if (!passwordMatch) {
      return fail(res, 'Incorrect email or password.', 401);
    }

    const token = signToken(user._id);
    return ok(res, { token, user: safeUser(user) });
  } catch (err) {
    console.error('[authController.login]', err);
    return fail(res, 'Server error during login.', 500);
  }
};

// ─── GET /api/auth/me  (protected) ───────────────────────────────────────────
// Called on app load to revalidate a stored token and re-hydrate user state.
export const getMe = async (req, res) => {
  // req.user is already populated by the protect middleware
  return ok(res, { user: safeUser(req.user) });
};
