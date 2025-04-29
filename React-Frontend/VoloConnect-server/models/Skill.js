// models/Skill.js
module.exports = (sequelize, DataTypes) => {
    const Skill = sequelize.define('Skill', {
      skill_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      skill_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      }
    }, {
      timestamps: false,
      tableName: 'skills'
    });
  
    Skill.associate = models => {
      Skill.belongsToMany(models.User, {
        through: 'UserSkills',
        foreignKey: 'skill_id',
        otherKey: 'user_id'
      });
    };
  
    return Skill;
  };