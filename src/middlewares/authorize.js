exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {

    // 🔥 TEMPORARY ROLE CHECK DISABLE
    if (process.env.DISABLE_AUTH === 'true') {
      return next();
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
};
