const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');
const Washer = require('./index').Washer;

const NonUniversityMismatch = sequelize.define(
    'NonUniversityMismatch',
    {
        id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        washerId:{
            type:DataTypes.INTEGER,
            allowNull:false,
            references:{
                model:Washer,
                key:'id'
            },
            onDelete:'CASCADE'
        },
        roomNumber:{
            type:DataTypes.STRING(255),
            allowNull:false
        },
        itemName:{
            type:DataTypes.STRING(255),
            allowNull:false
        },
        submittedQuantity:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        receivedQuantity:{
            type:DataTypes.INTEGER,
            allowNull:false
        }
    },
    {
        tableName:'non_university_mismatches',
        timestamps:true
    }
);

module.exports = {
    NonUniversityMismatch
};