const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const generateCode = require('../utils/generateCode');

const User = require('../models/userModel');
const OTP = require('../models/otpModel');

exports.checkUser = async (req, res, next) => {
    try {
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token)
            throw createError.Unauthorized(
                'Please provide authentication token'
            );

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.id);

        if (!user) throw createError.Unauthorized('Please login first');

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

exports.register = async (req, res, next) => {
    try {
        const userExist = await User.findOne({
            where: { email: req.body.email },
        });
        if (userExist) throw createError.Conflict('Email is already registerd');

        const user = await User.create(req.body);

        const token = await user.generateAuthToken();

        // Hide fields
        user.password = undefined;

        res.status(201).json({
            status: 'success',
            code: 201,
            message: 'Successfully registered',
            token,
            user,
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            throw createError.BadRequest('Please provide credentials');

        const user = await User.findOne({ where: { email } });

        if (!user || !(await user.verifyPassword(password, user.password)))
            throw createError.BadRequest('Invalid credentials');

        const token = await user.generateAuthToken();

        // Hide fields
        user.password = undefined;

        res.json({
            status: 'success',
            code: 200,
            message: 'Login successful',
            token,
            user,
        });
    } catch (error) {
        next(error);
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { email: req.body.email } });
        if (!user)
            throw createError.BadRequest('Please provided registered email');

        const otp = generateCode(6);
        await OTP.upsert({
            email: user.email,
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000,
        });

        // send OTP in mail
        // sendOTP(user.email, otp);

        res.json({
            status: 'success',
            code: 200,
            message: 'OTP sent to your email',
            otp,
        });
    } catch (error) {
        next(error);
    }
};

exports.verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        // Check OTP and expiration
        const otpRecord = await OTP.findOne({
            where: {
                email,
                otp: String(otp),
                expiresAt: { [Op.gte]: new Date() },
            },
        });

        if (!otpRecord) throw createError.BadRequest('Invalid or expired OTP');

        // Generate the reset token
        const verifyToken = jwt.sign({ email }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        // Delete the OTP record
        await otpRecord.destroy();

        res.json({
            status: 'success',
            code: 200,
            message: 'OTP verified successfully',
            verifyToken,
        });
    } catch (error) {
        next(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        // Verify the reset token
        const decoded = jwt.verify(
            req.body.verifyToken,
            process.env.JWT_SECRET
        );
        if (!decoded.email) throw createError.BadRequest('Invalid token.');

        // Find user
        const user = await User.findOne({ where: { email: decoded.email } });
        if (!user) throw createError.BadRequest('Invalid token.');

        // Validate password
        if (!req.body.password)
            throw createError.BadRequest('Please provide password');

        // Update password
        user.password = await User.hashPassword(req.body.password);
        await user.save();

        return res.json({
            status: 'success',
            code: 200,
            message: 'Password updated successfully',
        });
    } catch (error) {
        next(error);
    }
};
