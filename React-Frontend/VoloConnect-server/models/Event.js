// models/Event.js
module.exports = (sequelize, DataTypes) => {
    const Event = sequelize.define('Event', {
      event_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      faculty_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        }
      },
      event_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT
      },
      event_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      event_start_time: {
        type: DataTypes.TIME,
        allowNull: false
      },
      event_end_time: {
        type: DataTypes.TIME,
        allowNull: false
      },
      event_category: {
        type: DataTypes.STRING
      },
      required_volunteers: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      assigned_volunteers: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      event_location: {
        type: DataTypes.STRING
      },
      event_roles: {
        type: DataTypes.STRING
      },
      event_poster_url: {
        type: DataTypes.STRING
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      timestamps: false,
      tableName: 'events'
    });
  
    Event.associate = models => {
      Event.belongsTo(models.User, { foreignKey: 'faculty_id' });
      Event.hasMany(models.Request, { foreignKey: 'event_id' });
      Event.hasMany(models.AssignedVolunteer, { foreignKey: 'event_id' });
      Event.hasMany(models.Query, { foreignKey: 'event_id' });
    };
  
    return Event;
  };