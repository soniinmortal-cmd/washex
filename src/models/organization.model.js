const {DataTypes} = require('sequelize');
const sequelize = require('../config/sequelize');

const Organization = sequelize.define('Organization',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    type:{
        type:DataTypes.ENUM('UNIVERSITY','HOSPITAL'),
        allowNull:false,
        defaultValue:'UNIVERSITY'
    },
    isActive:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:true
    }
},{
    tableName:'organization',
    timestamps:true,
    indexes:[
        {
            unique : true,
            fields : ['name','type']
        }
    ]
});

module.exports = {
    Organization
};
