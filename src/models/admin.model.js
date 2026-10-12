const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { Organization } = require("./organization.model");


const Admin = sequelize.define('Admin',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    loginId:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false
    },
    role:{
        type:DataTypes.ENUM('ADMIN','SUBADMIN'),
        allowNull:false,
        defaultValue:'ADMIN'
    },
    organizationId: {
            type: DataTypes.INTEGER,
            allowNull: true, // ADMIN can have null, SUBADMIN must have one
            references: {
                model: Organization,
                key: "id",
            }
    }
},{
    tableName:'admin',
    timestamps:true
});

module.exports={
    Admin
}