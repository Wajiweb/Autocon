const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
    console.error(' FATAL: JWT_SECRET must be set in .env and be at least 32 characters.');
    process.exit(1);
}

/**
 * Authentication middleware  
 * Extracts JWT from Authorization header, verifies it,
 * and attaches req.user = { walletAddress } to the request.
 */
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'Access denied. No token provided.'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { walletAddress: decoded.walletAddress.toLowerCase() };
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expired. Please sign in again.'
            });
        }
        return res.status(401).json({
            success: false,
            error: 'Invalid token.'
        });
    }
}

module.exports = { authMiddleware, JWT_SECRET };
