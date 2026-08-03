import jwt from 'jsonwebtoken';
export const verifyToken = (req, res, next) => {
  let token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: "No token provided!" });
  }

  try {
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length); 
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized!" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: "Forbidden: Admin access only" });
  }
};