import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Project name is required' },
      len: {
        args: [1, 100],
        msg: 'Project name must be between 1 and 100 characters'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#3b82f6',
    validate: {
      is: {
        args: /^#[0-9A-F]{6}$/i,
        msg: 'Color must be a valid hex color'
      }
    }
  },
  icon: {
    type: DataTypes.STRING,
    defaultValue: '📁'
  },
  isFavorite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true
});

// Associations
Project.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Project, { foreignKey: 'userId', as: 'projects' });

export default Project;
