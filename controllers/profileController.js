const createError = require('http-errors');

const User = require('../models/userModel');

exports.getProfile = (req, res, next) => {
    const user = req.user;

    user.password = undefined;

    res.json({ status: 'success', code: 200, message: 'success', user });
};

exports.editProfile = async (req, res, next) => {
    try {
        // Not allowed to change
        delete req.body.email;
        delete req.body.password;

        await req.user.update(req.body);

        req.user.password = undefined;

        res.json({
            status: 'success',
            code: 200,
            message: 'success',
            user: req.user,
        });
    } catch (error) {
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        // Validate password
        if (!req.body.password)
            throw createError.BadRequest('Please provide password');

        // Update password
        req.user.password = await User.hashPassword(req.body.password);
        await req.user.save();

        return res.json({
            status: 'success',
            code: 200,
            message: 'Password updated successfully',
        });
    } catch (error) {
        next(error);
    }
};
