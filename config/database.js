const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    'Todo',
    process.env.DATABASE_USERNAME,
    process.env.DATABASE_PASSWORD,
    {
        host: 'localhost',
        dialect: 'postgres',
        logging: false,
    }
);

module.exports = sequelize;
