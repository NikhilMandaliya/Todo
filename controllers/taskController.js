const createError = require('http-errors');
const { Op } = require('sequelize');

const Task = require('../models/taskModel');

exports.getTasks = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { sort, page = 1, pageSize = 10, search } = req.query;
        let order = [['id', 'DESC']];

        if (sort) {
            switch (sort) {
                case 'createdAsc':
                    order = [['id', 'ASC']];
                    break;
                case 'createdDesc':
                    order = [['id', 'DESC']];
                    break;
                case 'dueDateAsc':
                    order = [['dueDate', 'ASC']];
                    break;
                case 'dueDateDesc':
                    order = [['dueDate', 'DESC']];
                    break;
                default:
                    break;
            }
        }

        const offset = (page - 1) * pageSize;
        const limit = parseInt(pageSize, 10);

        // Build the search condition
        const searchCondition = search
            ? {
                  [Op.or]: [
                      { title: { [Op.iLike]: `%${search}%` } },
                      // Add more fields for search if needed
                  ],
              }
            : {};

        const { count, rows: tasks } = await Task.findAndCountAll({
            where: { userId, ...searchCondition },
            attributes: { exclude: ['userId'] },
            order,
            offset,
            limit,
        });

        res.json({
            status: 'success',
            code: 200,
            message: 'success',
            data: {
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page, 10),
                tasks,
            },
        });
    } catch (error) {
        next(error);
    }
};

exports.createTask = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const task = await Task.create({ ...req.body, userId });

        task.userId = undefined;

        res.status(201).json({
            status: 'success',
            code: 201,
            message: 'Task created successfully',
            task,
        });
    } catch (error) {
        next(error);
    }
};

exports.getTaskById = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const task = await Task.findOne({
            where: { id: req.params.id, userId },
            attributes: { exclude: ['userId'] },
        });

        if (!task) throw createError.NotFound('Task not found!');

        res.json({ status: 'success', code: 200, message: 'success', task });
    } catch (error) {
        next(error);
    }
};

exports.updateTask = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const task = await Task.findOne({
            where: { id: req.params.id, userId },
            attributes: { exclude: ['userId'] },
        });

        if (!task) throw createError.NotFound('Task not found!');

        await task.update(req.body);

        res.json({
            status: 'success',
            code: 200,
            message: 'Task updated successfully',
            task,
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteTask = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const task = await Task.findOne({
            where: { id: req.params.id, userId },
        });

        if (!task) throw createError.NotFound('Task not found!');

        await task.destroy();

        res.json({
            status: 'success',
            code: 200,
            message: 'Task deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
