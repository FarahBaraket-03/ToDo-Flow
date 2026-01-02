import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
);

// Test database connection
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully');
    return true;
  } catch (error) {
    console.error('✗ Unable to connect to database:', error.message);
    return false;
  }
};

// Sync database models
export const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log(`✓ Database synchronized ${force ? '(force mode)' : ''}`);
  } catch (error) {
    console.error('✗ Database sync failed:', error.message);
    throw error;
  }
};

export default sequelize;
