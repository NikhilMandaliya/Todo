const express = require('express');
const createError = require('http-errors');

const globalErrorHandler = require('./controllers/errorController');

// App
const app = express();

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routes
app.use('/api', require('./routes/authRoutes'));
app.use('/api', require('./routes/profilRoutes'));
app.use('/api/todo', require('./routes/taskRoutes'));

// 404
app.use('*', (req, res, next) => {
    next(
        createError.NotFound(
            `Can not ${req.method} ${req.originalUrl} on this server!`
        )
    );
});

// ERROR HANDLING
app.use(globalErrorHandler);

module.exports = app;
