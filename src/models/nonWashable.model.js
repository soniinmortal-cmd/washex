const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Order = require('./index').Order;
const Washer = require('./index').Washer;
const Catalog = require('./index').Catalog;

const NonWashable = sequelize.define('NonWashable',{
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
    orderId:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:Order,
            key:'id'
        },
        onDelete:'CASCADE'
    },
    itemId:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:Catalog,
            key:'id'
        }
    },
    issueDescription:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    status:{
        type:DataTypes.ENUM('PENDING','APPROVED','DENIED'),
        allowNull:false,
        defaultValue:'PENDING'
    }
},{
    tableName:'nonwashable',
    timestamps:true
});

module.exports={
    NonWashable
}