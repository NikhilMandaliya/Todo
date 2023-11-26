const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');

const User = sequelize.define('user', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notNull: { msg: 'Please enter your name' } },
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notNull: { msg: 'Please enter your email' },
            isEmail: { msg: 'Please enter a valid email' },
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Password cannot be empty' },
            len: {
                args: [8, 255],
                msg: 'Password must be at least 8 characters long',
            },
        },
    },
});

// Hash the password before saving it to the database
User.beforeCreate(async user => {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
});

// Add a method to the User model for hashing the password
User.hashPassword = async password => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
};

// Generate auth token method
User.prototype.generateAuthToken = function () {
    const token = jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
        expiresIn: '90d',
    });
    return token;
};

// Verify user password
User.prototype.verifyPassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

// User.sync({ force: true });

module.exports = User;
