const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { Washer } = require("./washer.model");

const WasherNotification = sequelize.define(
    "WasherNotification",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        washerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Washer,
                key: "id"
            }
        },

        type: {
            type: DataTypes.ENUM(
                "ORDER",
                "DEFECT",
                "ISSUE",
                "CHEMICAL",
                "GENERAL",
                "MISMATCH"
            ),
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
        tableName: "washer_notifications",
        timestamps: true
    }
);

module.exports = {
    WasherNotification
};