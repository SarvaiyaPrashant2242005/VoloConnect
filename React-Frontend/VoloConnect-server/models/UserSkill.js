// models/UserSkill.js
module.exports = (sequelize, DataTypes) => {
    const UserSkill = sequelize.define('UserSkill', {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'user_id'
        }
      },
      skill_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'skills',
          key: 'skill_id'
        }
      }
    }, {
      timestamps: false,
      tableName: 'user_skills'
    });
  
    return UserSkill;
  };