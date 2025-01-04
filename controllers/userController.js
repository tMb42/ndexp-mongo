const User = require('../models/user');

async function getAllUsers(req, res) {
    try {
        const allUsers = await User.findAll();
        res.json(allUsers);
    } catch (err) {
        console.log(err);
    }
}

async function getUserById(req, res) {
    try {
        const user = await User.findById(req.params.id);
        return res.json(user);
    } catch (err) {
        console.log(err);
    }
}

async function createUser(req, res) {
    try {
        const newUser = await User.create(req.body);
        res.json(newUser);
    } catch (err) {
        console.log(err);
    }
}   

async function updateUser(req, res) {
    try {
        const user = await User.findById(req.params.id);
        user.update(req.body);
        return res.json({
            status: 'success', 
            message: 'User updated successfully'
        });
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser, 
}