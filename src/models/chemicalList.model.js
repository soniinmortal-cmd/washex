const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { Washer } = require("./washer.model");


const ChemicalList = sequelize.define('ChemicalList', {
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    washerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Washer,
            key: 'id'
        }
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    price:{
        type:DataTypes.DECIMAL(10,3),
        allowNull:false
    }
},{
    tableName : 'chemicallist',
    timestamps : true,
    indexes: [
        {
            unique: true,
            fields: ['washerId', 'name']
        }
    ]
});

module.exports={
    ChemicalList
}