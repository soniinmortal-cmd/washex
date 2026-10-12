const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { Organization } = require('./organization.model');

const LimitPackage = sequelize.define('LimitPackage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    extraLimit: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    validityDays: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    },

    organizationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Organization,
            key: 'id'
        }
    },
    
        distributionType: {
        type: DataTypes.ENUM("FULL", "MONTHLY"),
        defaultValue: "FULL"
    }

}, {
    tableName: 'limit_packages',
    timestamps: true
});

module.exports = {
    LimitPackage
};