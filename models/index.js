const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Use the full PostgreSQL URL from Supabase
const databaseUrl = process.env.check_availability_POSTGRES_PRISMA_URL || process.env.check_availability_POSTGRES_URL;

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

module.exports = sequelize;
