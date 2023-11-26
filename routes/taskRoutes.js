const router = require('express').Router();

const { checkUser } = require('../controllers/authController');
const taskController = require('../controllers/taskController');

router
    .route('/')
    .get(checkUser, taskController.getTasks)
    .post(checkUser, taskController.createTask);

router
    .route('/:id')
    .get(checkUser, taskController.getTaskById)
    .patch(checkUser, taskController.updateTask)
    .delete(checkUser, taskController.deleteTask);

module.exports = router;
