const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { User } = require("./user.model");

const Notification = sequelize.define(
    "Notification",
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

        type: {
            type: DataTypes.STRING,
            allowNull: false
        },

        referenceId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        title: {
            type: DataTypes.STRING,
            allowNull: false
        },

        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    {
        tableName: "notifications",
        timestamps: true
    }
);

module.exports = {
    Notification
};