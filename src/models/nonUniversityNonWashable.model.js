const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');
const Washer = require('./index').Washer;

const NonUniversityNonWashable = sequelize.define(
    'NonUniversityNonWashable',
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
        issueDescription:{
            type:DataTypes.TEXT,
            allowNull:false
        }
    },
    {
        tableName:'non_university_nonwashable',
        timestamps:true
    }
);

module.exports = {
    NonUniversityNonWashable
};