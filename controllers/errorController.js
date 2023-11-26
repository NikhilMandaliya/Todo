module.exports = (error, req, res, next) => {
    // console.log(error);

    if (error.name === 'SequelizeUniqueConstraintError')
        return res.status(400).json({
            status: 'fail',
            message: `${Object.keys(error.fields)[0]} is already registered`,
        });

    if (error.name === 'SequelizeValidationError') {
        let errors = {};
        Object.keys(error.errors).forEach(key => {
            errors[key] = error.errors[key].message;
        });
        return res.status(400).json({
            status: 'fail',
            code: 400,
            message: Object.values(errors)[0] || 'Validation Error',
            errors,
        });
    }

    if (error.name == 'MulterError') error.status = 413;

    if (
        error.message == 'invalid signature' ||
        error.message == 'jwt malformed'
    )
        return res.status(400).json({
            status: 'fail',
            code: 400,
            message: 'Invalid token',
        });

    res.status(error.status || 500).json({
        status: 'fail',
        code: error.status || 500,
        message: error.message,
    });
};
