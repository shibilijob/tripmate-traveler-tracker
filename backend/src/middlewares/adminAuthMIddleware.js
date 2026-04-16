import User from "../models/User.js";

const isAdmin = async (req, res, next) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Unauthorized. No user found in request.' });
        }

        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found in database' });
        }

        if (user.role === 'admin') {
            next();
        } else {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export default isAdmin;