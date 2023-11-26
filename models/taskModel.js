const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = require('./userModel');

const Task = sequelize.define('task', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Task title cannot be empty' },
            notNull: { msg: 'Task title cannot be empty' },
        },
    },
    completed: { type: DataTypes.BOOLEAN, defaultValue: false },
    dueDate: { type: DataTypes.DATE },
});

Task.belongsTo(User);

// Task.sync({ force: true });

module.exports = Task;
