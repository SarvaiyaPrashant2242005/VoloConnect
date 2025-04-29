// models/AssignedVolunteer.js
module.exports = (sequelize, DataTypes) => {
    const AssignedVolunteer = sequelize.define('AssignedVolunteer', {
      assignment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        }
      },
      event_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'events',
          key: 'event_id'
        }
      },
      faculty_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        }
      },
      role: {
        type: DataTypes.STRING
      },
      assigned_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      timestamps: false,
      tableName: 'assigned_volunteers'
    });
  
    AssignedVolunteer.associate = models => {
      AssignedVolunteer.belongsTo(models.User, { foreignKey: 'student_id' });
      AssignedVolunteer.belongsTo(models.Event, { foreignKey: 'event_id' });
      AssignedVolunteer.belongsTo(models.User, { foreignKey: 'faculty_id' });
    };
  
    return AssignedVolunteer;
  };