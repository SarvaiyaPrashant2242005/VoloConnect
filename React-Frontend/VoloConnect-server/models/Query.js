// models/Query.js
module.exports = (sequelize, DataTypes) => {
    const Query = sequelize.define('Query', {
      query_id: {
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
      query: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      answer: {
        type: DataTypes.TEXT
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      answered_at: {
        type: DataTypes.DATE
      }
    }, {
      timestamps: false,
      tableName: 'queries'
    });
  
    Query.associate = models => {
      Query.belongsTo(models.User, { foreignKey: 'student_id' });
      Query.belongsTo(models.Event, { foreignKey: 'event_id' });
    };
  
    return Query;
  };