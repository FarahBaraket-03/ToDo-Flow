import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Project from './Project.js';

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Task title is required' },
      len: {
        args: [1, 500],
        msg: 'Task title must be between 1 and 500 characters'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('todo', 'in_progress', 'completed'),
    defaultValue: 'todo'
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reminder: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  recurringPattern: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
    allowNull: true
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  attachments: {
    type: DataTypes.ARRAY(DataTypes.JSON),
    defaultValue: []
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Project',
      key: 'id'
    }
  },
  parentTaskId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Task',
      key: 'id'
    }
  },
  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true,
  hooks: {
    beforeUpdate: async (task) => {
      if (task.changed('status') && task.status === 'completed' && !task.completedAt) {
        task.completedAt = new Date();
      }
      if (task.changed('status') && task.status !== 'completed' && task.completedAt) {
        task.completedAt = null;
      }
    }
  }
});

// Associations
Task.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Task, { foreignKey: 'userId', as: 'tasks' });

Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });

// Self-referential for subtasks
Task.belongsTo(Task, { foreignKey: 'parentTaskId', as: 'parentTask' });
Task.hasMany(Task, { foreignKey: 'parentTaskId', as: 'subtasks' });

export default Task;
