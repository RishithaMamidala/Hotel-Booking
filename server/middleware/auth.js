// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ success: false, message: 'Authentication required' });
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ success: false, message: 'Admin access required' });
};

// Optional authentication - attaches user if logged in but doesn't require it
const optionalAuth = (req, res, next) => {
  // User is already attached by passport if logged in
  next();
};

module.exports = {
  isAuthenticated,
  isAdmin,
  optionalAuth,
};
