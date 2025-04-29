// models/Request.js
module.exports = (sequelize, DataTypes) => {
    const Request = sequelize.define('Request', {
      request_id: {
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
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      timestamps: false,
      tableName: 'requests'
    });
  
    Request.associate = models => {
      Request.belongsTo(models.User, { foreignKey: 'student_id' });
      Request.belongsTo(models.Event, { foreignKey: 'event_id' });
    };
  
    return Request;
  };