const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { Washer } = require("./washer.model");

const WasherDevice = sequelize.define(
    "WasherDevice",
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

        fcmToken: {
            type: DataTypes.STRING(512),
            allowNull: true,
            unique: true
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
        tableName: "washer_devices",
        timestamps: true
    }
);

module.exports = {
    WasherDevice
};