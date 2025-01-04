const jwt = require('jsonwebtoken');
const { PersonalAccessToken } = require('../models/personalAccessToken');
const { User } = require('../models/user');

module.exports =  async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ 
            success: 0,
            message: "Access Denied! Unauthorized User"
        });
    }
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(verified.id);    
        if (!user) {
            return res.status(401).json({
                success: 0,
                message: "Access Denied! No user found!" 
            });
        }
        
        // Verify the personal access token in the database
        const personalAccessToken = await PersonalAccessToken.findOne({
            where: {
                tokenable_type: 'User',
                tokenable_id: user.dataValues.id
            }
        });
        if (!personalAccessToken) {
            return res.status(401).json({
                success: 0,
                message: "Invalid User!"
            });
        }
        if (new Date() > personalAccessToken.expires_at) {
            await personalAccessToken.destroy(); // Automatically delete the expired token
            return res.status(402).json({
                success: 0,
                message: "Expired Access Period!"
            });
        }

        // Update the last_used_at field
        await personalAccessToken.update({ last_used_at: new Date() });
        
        req.user = verified;
        req.paToken = personalAccessToken;
        next();

    } catch (err) {
        res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
}

