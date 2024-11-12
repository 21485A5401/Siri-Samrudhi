
const jwt = require('jsonwebtoken');

const isLogin = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract the token

    if (!token) {
        return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired. Please log in again.' });
            }
            return res.status(401).json({ message: 'Invalid token.' });
        }

        req.userid = decoded; // Store decoded information in the request
        next();
    });
};

module.exports = isLogin;
