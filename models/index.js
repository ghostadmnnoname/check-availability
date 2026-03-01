const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.check_availability_POSTGRES_DATABASE,
  process.env.check_availability_POSTGRES_USER,
  process.env.check_availability_POSTGRES_PASSWORD,
  {
    host: process.env.check_availability_POSTGRES_HOST,
    port: 5432,
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = sequelize;
