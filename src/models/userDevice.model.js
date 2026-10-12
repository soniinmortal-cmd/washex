const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { User } = require("./user.model");

const UserDevice = sequelize.define(
    "UserDevice",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: "id"
            }
        },

        fcmToken: {
            type: DataTypes.TEXT,
            allowNull: true,
            unique:true
        },

        deviceType: {
            type: DataTypes.STRING,
            allowNull: false
        },

        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    },
    {
        tableName: "user_devices",
        timestamps: true
    }
);

module.exports = {
    UserDevice
};