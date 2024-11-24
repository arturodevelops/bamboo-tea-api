const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Assuming bearer token
    
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
  
      req.user = user;
      next();
    });
};

module.exports = authenticateToken