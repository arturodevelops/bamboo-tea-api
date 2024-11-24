const checkUserPermissions = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Extract bearer token
    
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
  
      const { user_id, profile_id } = decoded; // Extract user_id and profile_id from the decoded token
  
      const userIdFromParams = parseInt(req.params.id); // Get the userId from URL params, e.g., /users/:id
  
      // Check if the requested userId matches the user_id or profile_id in the token
      if (userIdFromParams !== user_id && profile_id !== user_id) {
        return res.status(403).json({ error: 'You do not have permission to perform this action' });
      }
  
      next(); // If validation passes, move to the next handler
    });
  };