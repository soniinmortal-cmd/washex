const {DataTypes} = require('sequelize');
const sequelize = require('../config/sequelize');
const { Organization } = require('./organization.model');

const User = sequelize.define('User',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    organizationId:{
        type:DataTypes.INTEGER,
        references: {
            model: Organization,
            key: 'id'
        }
    },
    organizationType:{
        type:DataTypes.ENUM('UNIVERSITY','HOSPITAL')
    },
    studentId:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    mobileNumber:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    laundryNumber:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    oneTimePassword:{
        type:DataTypes.STRING(6)
    },
    image:{
        type:DataTypes.STRING,
        allowNull:true
    },
    status:{
        type:DataTypes.ENUM('enable','disable'),
        defaultValue:'enable'
    }
},{
    tableName:'users',
    timestamps:true
});

module.exports = {
    User
};