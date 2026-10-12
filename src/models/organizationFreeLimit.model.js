const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const OrganizationFreeLimit = sequelize.define('OrganizationFreeLimit', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    organizationId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    monthlyFreeLimit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'organization_free_limits',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['organizationId']
        }
    ]
});

module.exports = {
    OrganizationFreeLimit
};