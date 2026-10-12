const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { Washer } = require('./washer.model');

const LpgReceipts = sequelize.define('LpgReceipts', {

    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    washerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Washer,
            key: 'id'
        }
    },

    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    quantity: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false
    }

}, {
    tableName: 'lpgreceipts',
    timestamps: true,

    indexes: [
        {
            fields: ['washerId', 'date']
        }
    ]
});

module.exports = {
    LpgReceipts
};