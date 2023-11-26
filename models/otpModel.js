const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OTP = sequelize.define('OTP', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    otp: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    expiresAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

// OTP.sync({ force: true });

module.exports = OTP;
