const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ Auth failed: No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('❌ Auth failed: User not found for token');
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ Auth success: ${user.email} (${user.role})`);
    }
    
    next();
  } catch (error) {
    console.log('❌ Auth failed:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    console.log(`🔐 Role check: User has "${req.user.role}", required: [${roles.join(', ')}]`);
    
    if (!roles.includes(req.user.role)) {
      console.log(`❌ Access denied: User role "${req.user.role}" not in [${roles.join(', ')}]`);
      return res.status(403).json({ 
        message: 'Access denied',
        details: `This action requires one of the following roles: ${roles.join(', ')}. Your role: ${req.user.role}`,
        userRole: req.user.role,
        requiredRoles: roles
      });
    }
    
    console.log(`✅ Role check passed: ${req.user.role}`);
    next();
  };
};

module.exports = { auth, requireRole };