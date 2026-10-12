const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');
const Washer = require('./index').Washer;

const NonUniversityDefect = sequelize.define(
    'NonUniversityDefect',
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
        },
        image:{
            type:DataTypes.STRING(255),
            allowNull:false
        }
    },
    {
        tableName:'non_university_defects',
        timestamps:true
    }
);

module.exports = {
    NonUniversityDefect
};