const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    // unique: true,
    validate: {
      isEmail: true
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('engineer', 'manager'),
    allowNull: false
  },
  skills: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  seniority: {
    type: DataTypes.ENUM('junior', 'mid', 'senior'),
    defaultValue: 'junior'
  },
  maxCapacity: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  department: {
    type: DataTypes.STRING,
    defaultValue: 'Engineering'
  }
}, {
  timestamps: true,
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

User.prototype.comparePassword = async function(candidatePassword) {
  // const encyptedPass = bcrypt.hashSync(candidatePassword, 10);
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
