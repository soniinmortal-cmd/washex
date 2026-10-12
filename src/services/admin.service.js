const { Order, Defect, Orderstatus,User, sequelize, OrderItem, Catalog, Payment, Organization, Washermapper, Washer, AppImages, PasswordChange, SubAdmin, SubAdminPermissions, SubMenu, Menu, WasherMan, WasherAttendance, LimitPackage, Issue, NonWashable, NonUniversityDefect, NonUniversityMismatch, NonUniversityNonWashable, Admin, ElectricityLogs, GasLogs, UserLimitPackage, ChemicalList} = require('../models');
const { Op } = require('sequelize');
const orderService = require('./order.service');
const washerManService = require('./washerMan.service');
const washerService = require('../services/washer.service');
const defectService = require('../services/defect.service');
const userService = require('./user.service');

const getDashboardMetric = async()=>{

    const data = await orderService.getDashboardMetric();

    return data;
}; 

const getOrders = async(page,limit,search,orderType,serviceType,fromDate,toDate,organizationId,paymentStatus)=>{

    return orderService.getAllOrders({page,limit,search,orderType,serviceType,fromDate,toDate,organizationId,paymentStatus});
}

const getExportOrders = async(search,serviceType,fromDate,toDate)=>{
    return orderService.getAllOrdersExport({search,serviceType,fromDate,toDate});
}

const getSubmittedOrders=async(protocol,host,page,limit,search,orderType,serviceType,fromDate,toDate,organizationId,paymentStatus)=>{
    return orderService.submittedOrders({protocol,host,page,limit,search,orderType,serviceType,fromDate,toDate,organizationId,paymentStatus});
}

const getOrderDetails = async(orderId)=>{
    return orderService.getOrderDetailsAdmin({orderId});
}

const deleteUser = async(userId)=>{

    return await orderService.deleteUser(userId);

}

const hardDeleteUser = async(userId)=>{

    return await orderService.hardDeleteUser(userId);

}

const enableUser = async(userId)=>{

    return await orderService.enableUser(userId);

}

const logout = async () => {

    return "logout successful";

};

const addWasherMen=async({washerId,washers}={})=>{
    console.log(washerId);
    console.log(washers);

    return washerManService.addWasherMenAdmin({washerId,washers});
}

const editWasherMen=async(washerId,data)=>{

    return washerManService.editWasherMen({washerId,data});
}

const deleteWasherMen=async(washerId,washerManId)=>{

    return washerManService.deleteWasherMen({washerId,washerManId});
}

const enableWasherMen=async(washerId,washerManId)=>{

    return washerManService.enableWasherMen({washerId,washerManId});
}

const getWashersList=async(protocol,host)=>{
    return washerService.getAllWasherAdmin(protocol,host);
}

const mapOrgAndWasher=async(washerId,organizationId,organizationType)=>{

    if(!washerId){
        throw new Error('washer id required');
    }

    if(!organizationId){
        throw new Error('org id required');
    }

    if(!organizationType){
        throw new Error('org type required');
    }

    const washerCheck = await Washer.findByPk(washerId);

    if(!washerCheck){
        throw new Error('incorrect washer id');
    }

    const orgCheck = await Organization.findByPk(organizationId);

    if(!orgCheck){
        throw new Error('incorrect org id');
    }

    if(orgCheck.type!==organizationType){
        throw new Error("incorrect type");
    }

    await Washermapper.upsert({
        organizationId:organizationId,
        organizationType:organizationType,
        washerId:washerId
    });

    return "mapped successfully";
}
//TODO:check type reference
const viewMapping = async()=>{

    const mapping = await Washermapper.findAll({
        include:[{
            model : Organization,
            key:'id',
            attributes:['name']
        },{
            model : Washer,
            key:'id',
            attributes:['loginId','name']
        }]
    });

    const formattedMapping = mapping.map(map=>{
        return {
            washerName:map.Washer.name,
            organizationName:map.Organization.name,
            organizationType:map.organizationType
        }
    });

    return formattedMapping;
}


const activeBannerImages=async(protocol,host)=>{

    const images = await AppImages.findAll({
        where : {
            status : 'active'
        },
        order:[['name','ASC']]
    })

    const baseUrl = `${protocol}://${host}/uploads/`;
    
    const formattedImages = images.map(image=>{
        return {
            id:image.id,
            name:image.name,
            image:baseUrl+image.image,
            title:image.title,
            subTitle:image.subTitle,
            status:image.status
        }
    })

    return formattedImages;
}

const inactiveBannerImages=async(protocol,host)=>{

    const images = await AppImages.findAll({
        where : {
            status : 'inactive'
        },
        order:[['name','ASC']]
    })

    const baseUrl = `${protocol}://${host}/uploads/`;
    
    const formattedImages = images.map(image=>{
        return {
            id:image.id,
            name:image.name,
            image:baseUrl+image.image,
            title:image.title,
            subTitle:image.subTitle,
            status:image.status
        }
    })

    return formattedImages;
}

const addBannerImage = async(name,title,subTitle,image)=>{

    if(!name || !image ){
        throw new Error("incomplete inputs");
    }

    if(!['outer_1','outer_2','outer_3','inner_1','inner_2','inner_3'].includes(name)){
        throw new Error('incorrect name');
    }

    const existingBanner = await AppImages.findOne({
        where : {
            name,
            status : 'active'
        }
    })

    if(existingBanner){
        await existingBanner.update({
            status : 'inactive'
        });
    }


    await AppImages.create({
        name,
        title,
        subTitle,
        image,
        status : 'active'
    })

    return "image updated succesfully";
}

const resetPasswordRequests=async(protocol,host)=>{

    const list = await PasswordChange.findAll({
        where:{
            status : 'REQUESTED'
        },
        include:[{
            model : Washer,
            attributes:['id','name','image','loginId','password','organizationId'],
            include:[{
                model : Organization,
                attributes:['name']
            }]
        }]
    })

    const baseUrl = `${protocol}://${host}/uploads/`;

    const formattedList = list.map(item=>{

            const onlyDate = item.createdAt.toLocaleDateString('en-GB',{
                timeZone: 'Asia/Kolkata',
                day : '2-digit',
                month : 'short',
                year : 'numeric'
            });

            const onlyTime = item.createdAt.toLocaleTimeString('en-US',{
                timeZone: 'Asia/Kolkata',
                hour:'2-digit',
                minute:'2-digit',
                hour12:true
            });

        return {

            name : item.Washer.name,
            requestId : item.id,
            washerId : item.Washer.id,
            oldPassword : item.Washer.password,
            organizationName : item.Washer.Organization.name,
            image : baseUrl + item.Washer.image,
            date : onlyDate,
            time : onlyTime 
        }
    })

    return formattedList;
}

const changePassword=async(washerId,oldPassword,newPassword)=>{

    if(!washerId || !oldPassword || !newPassword){
            throw new Error('washer id, old password and new password are required');
        }

    const check = await PasswordChange.findOne({
        where : {
            washerId : washerId,
            status : 'REQUESTED'
        },
        order : [['createdAt','DESC']]
    })

    if(!check){
        throw new Error('no pending request found');
    }

    const washer = await Washer.findByPk(washerId);

    if(washer.password !== oldPassword){
        throw new Error('password is incorrect');
    }

    washer.password = newPassword;
    await washer.save();

    check.status = 'CHANGED';
    await check.save();

    return "password changed successfully";

}

const rejectPasswordRequest=async(washerId)=>{
    if(!washerId){
        throw new Error("washer id required");
    }

    const check = await Washer.findByPk(washerId);

    if(!check){
        throw new Error('washer does not exist');
    }

    const passwordChangeRequest = await PasswordChange.findOne({
        where : {
            washerId : washerId,
            status : 'REQUESTED'
        }
    })

    if(!passwordChangeRequest){
        throw new Error("no request recieved for password change");
    }

    await passwordChangeRequest.update({
        status:'REJECTED'
    });

    return "password change request denied successfully";
}

const defectedItems = async()=>{
    return await defectService.defectedItems();
}

const viewDefectedDetails=async(orderId,protocol,host)=>{
    return await defectService.viewDefectDetails(orderId,protocol,host);
}

const viewSubAdminPermissions=async(subAdminId)=>{

    if (!subAdminId){
        throw new Error("id required");
    }

    const check = await Admin.findByPk(subAdminId);

    if (!check){
        throw new Error("incorrect id");
    }

    const permissions = await SubAdminPermissions.findAll({
        where:{
            subAdminId:subAdminId,
            status:1
        },
        include:[{
            model : Menu,
            attributes:['name','id']
        },{
            model : SubMenu,
            attributes:['menuId','name','id']
        }]
    });

    const formattedPermissions = [];

    const menuMap = {};

    permissions.forEach(permission => {

        const menuId = permission.menuId;

        if(!menuMap[menuId]){

            menuMap[menuId] = {
                id: permission.Menu.id,
                menu: permission.Menu.name
            };

            if(permission.SubMenu){

                menuMap[menuId].subMenus = [];
            }

            formattedPermissions.push(menuMap[menuId]);
        }

        if(permission.SubMenu){

            if(!menuMap[menuId].subMenus){
                menuMap[menuId].subMenus = [];
            }

            menuMap[menuId].subMenus.push({
                id: permission.SubMenu.id,
                menuId:permission.SubMenu.menuId,
                name: permission.SubMenu.name
            });
        }
    });

    return {
        role:check.role,
        permissions:formattedPermissions
    };
}

const listOfPermissions=async()=>{

    const permissions = await Menu.findAll({
        include:[{
            model : SubMenu
        }]
    });

    const formattedPermissions = [];

    const menuMap = {};

    permissions.forEach(permission => {

        const menuId = permission.id;

        if(!menuMap[menuId]){

            menuMap[menuId] = {
                
                id: permission.id,
                menu: permission.name
            };

            if(permission.SubMenus.length>0){

                menuMap[menuId].subMenus = [];
            }

            formattedPermissions.push(menuMap[menuId]);
        }

        if(permission.SubMenus.length>0){

            if(!menuMap[menuId].subMenus){
                menuMap[menuId].subMenus = [];
            }

            for ( const submenu of permission.SubMenus){
                menuMap[menuId].subMenus.push({
                    id: submenu.id,
                    menuId:submenu.menuId,
                    name: submenu.name
                });
            }


        }
    });

    return formattedPermissions;

}

const addPermissions=async(subAdminId,permissions)=>{

    if(!subAdminId){
        throw new Error('id required');
    }

    const check = await Admin.findByPk(subAdminId);

    if(!check){
        throw new Error('incorrect id');
    }

    const BulkCreate=[];
    for(const permission of permissions){

        if(permission.subMenuIds && permission.subMenuIds.length > 0){
            const check = await Menu.findByPk(permission.menuId);
            if(!check){
                throw new Error("incorrect id");
            }

            const subMenus = await SubMenu.findAll({
                where:{
                    menuId:permission.menuId
                },
                attributes:['id']
            });

            const totalSubMenus = subMenus.length;

            for(const submenuid of permission.subMenuIds){

                const check = subMenus.find(
                    submenu => submenu.id === submenuid
                );

                if(!check){
                    throw new Error("incorrect id");
                }
            }

            if(permission.subMenuIds.length === totalSubMenus){

                BulkCreate.push({
                    subAdminId,
                    menuId:permission.menuId,
                    subMenuId:null,
                    status:1
                });

            }else{

                for(const submenuid of permission.subMenuIds){

                    BulkCreate.push({
                        subAdminId,
                        menuId:permission.menuId,
                        subMenuId:submenuid,
                        status:1
                    });

                }

            }
        }else{

            const check = await Menu.findByPk(permission.menuId);
            if(!check){
                throw new Error("incorrect id");
            }

            const existing = await SubAdminPermissions.findOne({
                where : {
                    subAdminId:subAdminId,
                    menuId:permission.menuId,
                    subMenuId:null
                }
            })

            if(existing){
                existing.status=1;
                await existing.save();
            }else {
                BulkCreate.push({
                    subAdminId:subAdminId,
                    menuId:permission.menuId,
                    status :1
                })
            }

        }

    }

    await SubAdminPermissions.bulkCreate(BulkCreate,{
        updateOnDuplicate:[
            'status',
            'updatedAt'
        ]
    });

    return "permissions added successfully";
}

const viewWasherMen=async(washerId,protocol,host)=>{

        if(!washerId){
            throw new Error("id required");
        }

        const check = await Washer.findByPk(washerId);
        if(!check){
            throw new Error('invalid id');
        }

        const list = await WasherMan.findAll({
            where : {
                washerId
            }
        });

        const baseUrl = `${protocol}://${host}/uploads/`

        const formattedList = list.map(data=>{
            return{
                id:data.id,
                washerId:data.washerId,
                name:data.name,
                image: data.image ? baseUrl+data.image : null,
                idProof: data.idProof ? baseUrl+data.idProof : null,
                status:data.status
            }
        })

        return formattedList;

}

const viewAttendance = async (
    washerId,
    date
) => {

    const washermen =
        await WasherMan.findAll({
            where: {
                washerId
            }
        });

    const washerManIds =
        washermen.map(
            man => man.id
        );

    const attendanceList =
        await WasherAttendance.findAll({
            where: {
                washerManId: {
                    [Op.in]: washerManIds
                },
                attendanceDate: date
            }
        });

    const attendanceMap =
        new Map(
            attendanceList.map(item => [
                item.washerManId,
                item.attendance
            ])
        );

    return washermen.map(man => ({
        washerManId: man.id,
        name: man.name,
        status:
            attendanceMap.get(man.id)
            || "N/A"
    }));
};

const updateAttendance = async (
    washerId,
    washerManId,
    date,
    status
) => {

    const washerMan =
        await WasherMan.findOne({
            where: {
                id: washerManId,
                washerId
            }
        });

    if (!washerMan) {
        throw new Error(
            "incorrect details"
        );
    }

    await WasherAttendance.upsert({
        washerManId,
        attendance: status,
        attendanceDate: date
    });

    return "updated successfully";
};

const viewPackages = async (organizationId) => {
    const packages = await LimitPackage.findAll({
        where: {
            organizationId
        },
        order: [['createdAt', 'DESC']],
        include: [{
            model: Organization,
            attributes: ['name']
        }]
    });

    return packages.map(pkg => {
        const {
            Organization,
            ...packageData
        } = pkg.toJSON();

        return {
            ...packageData,
            organizationName: Organization?.name || null
        };
    });
};

const addPackage = async(organizationId,name,extraLimit,price,validityDays,distributionType)=>{

    if(!organizationId || !name || !extraLimit || !price || !validityDays){
        throw new Error('all fields are required');
    }

    const nameCheck = await LimitPackage.findOne({
        where : {
            name : name,
            organizationId
        }
    });

    if(nameCheck){
        throw new Error('package with same name already exists');
    }

    await LimitPackage.create({
        organizationId,
        name,
        price,
        extraLimit,
        validityDays,
        distributionType
    });

    return "package added successfully";
}

const editPackage = async(packageId,name,extraLimit,price,validityDays,distributionType)=>{
    console.log(distributionType);
    if(!packageId){
        throw new Error('id is required');
    }

    if(!name && !extraLimit && !price && !validityDays && !distributionType){
        throw new Error('one field is required');
    }

    if (!["FULL", "MONTHLY"].includes(distributionType.toUpperCase())) {
        throw new Error("invalid distribution type");
    }

    const package = await LimitPackage.findByPk(packageId);

    if(!package){
        throw new Error('incorrect id');
    }

    let updateData = {};

    if(name){
        const nameCheck = await LimitPackage.findOne({
            where : {
                name,
                organizationId:package.organizationId
            }
        })

        if(nameCheck && nameCheck.id !==packageId){
            throw new Error('paclage with this name already exists');
        }
        updateData.name=name
    }

    if(extraLimit){
        updateData.extraLimit=extraLimit
    }

    if(price){
        updateData.price=price
    }

    if(validityDays){
        updateData.validityDays=validityDays
    }

    if(distributionType){
        updateData.distributionType=distributionType.toUpperCase()
    }

    await package.update(updateData);

    return "updated successfully";
}

const deletePackage = async(packageId)=>{

    if(!packageId){
        throw new Error('id is required');
    }

    const package = await LimitPackage.findByPk(packageId);

    if(!package){
        throw new Error('incorrect id');
    }

    await package.destroy();

    return "deleted successfully";
}

const mismatchItems = async ({ organizationId, organizationType } = {}) => {

    let whereClause = {};

    if (organizationId && organizationType) {
        whereClause = {
            organizationId,
            organizationType
        };
    }

    const list = await Issue.findAll({
        include: [{
            model: Order,
            attributes: ['userId'],
            where: whereClause,
            include:[{
                model:Organization,
                attributes:['name','id']
            },{
                model:User,
                attributes:['name']
            }]
        }],
        order:[['createdAt','DESC']]
    });

    const washerIds = [
        ...new Set(
            list
                .map(item => item.submittedById)
                .filter(Boolean)
        )
    ];

    const washers = await Washer.findAll({
        where: {
            id: washerIds
        },
        attributes: ['id', 'name']
    });

    const washerMap = {};

    washers.forEach(washer => {
        washerMap[washer.id] = washer.name;
    });

    const groupedMismatch = new Map();

    list.forEach(mismatch => {

        const orderId = mismatch.orderId;

        if (!groupedMismatch.has(orderId)) {

            groupedMismatch.set(orderId, {
                mismatchId: mismatch.id,
                washerId: mismatch.submittedById,
                washerName: washerMap[mismatch.submittedById] || "N/A",
                orderId: mismatch.orderId,
                userId: mismatch.Order.userId,
                organizationId: mismatch.Order.Organization?.id,
                organizationName: mismatch.Order.Organization?.name,
                totalMismatchQuantity: 0,
                userName: mismatch.Order.User?.name
            });

        }

        groupedMismatch.get(orderId).totalMismatchQuantity += 1;

    });

    return Array.from(groupedMismatch.values());

};

const viewMismatchDetails = async (
    orderId,
    protocol,
    host
) => {

    if (!orderId) {
        throw new Error("order id required");
    }

    const list = await Issue.findAll({
        where: {
            orderId
        },
        include: [{
            model: Catalog,
            attributes: ['name']
        }, {
            model: Order,
            attributes: ['userId']
        }]
    });

    const orderItems = await OrderItem.findAll({
        where: {
            orderId
        }
    });

    const orderItemMap = {};

    orderItems.forEach(item => {
        orderItemMap[item.catalogId] = item.quantity;
    });

    const washerIds = [
        ...new Set(
            list
                .map(item => item.submittedById)
                .filter(Boolean)
        )
    ];

    const washers = await Washer.findAll({
        where: {
            id: washerIds
        },
        attributes: ['id', 'name']
    });

    const washerMap = {};

    washers.forEach(washer => {
        washerMap[washer.id] = washer.name;
    });

    return list.map(mismatch => {

        const submittedQuantity =
            mismatch.expectedQuantity;

        const receivedQuantity =
            mismatch.quantity || 0;

        const missingQuantity =
            submittedQuantity - receivedQuantity;

        const onlyDate =
            mismatch.createdAt.toLocaleDateString(
                'en-GB',
                {
                    timeZone: 'Asia/Kolkata',
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                }
            );

        const onlyTime =
            mismatch.createdAt.toLocaleTimeString(
                'en-US',
                {
                    timeZone: 'Asia/Kolkata',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }
            );

        return {
            washerName:
                washerMap[mismatch.submittedById] || "N/A",

            washerId:
                mismatch.submittedById,

            userId:
                mismatch.Order.userId,

            itemName:
                mismatch.Catalog.name,

            receivedQuantity,

            submittedQuantity,

            missingQuantity,

            date: onlyDate,

            time: onlyTime
        };

    });

};

const nonWashableItems = async (
    { organizationId, organizationType } = {}
) => {

    let whereClause = {};

    if (organizationId && organizationType) {
        whereClause = {
            organizationId,
            organizationType
        };
    }

    const list = await NonWashable.findAll({
        include: [{
            model: Order,
            attributes: ['userId','organizationId'],
            where: whereClause,
            include:[{
                model:Organization,
                attributes:['name','id']
            },{
                model:User,
                attributes:['name']
            }]
        }, {
            model: Washer,
            attributes: ['name']
        }],
        order:[['createdAt','DESC']]
    });
    
    const groupedItems = new Map();

    list.forEach(item => {

        const orderId = item.orderId;

        if (!groupedItems.has(orderId)) {

            groupedItems.set(orderId, {
                nonWashableId: item.id,
                washerId: item.washerId,
                washerName: item.Washer?.name,
                orderId: item.orderId,
                userId: item.Order.userId,
                organizationId: item.Order.Organization?.id,
                organizationName: item.Order.Organization?.name,
                totalNonWashableQuantity: 0,
                userName: item.Order.User?.name
            });

        }

        groupedItems.get(orderId).totalNonWashableQuantity += 1;

    });

    return Array.from(groupedItems.values());

};

const viewNonWashableDetails = async (
    orderId,
    protocol,
    host
) => {

    if (!orderId) {
        throw new Error("order id required");
    }

    const list = await NonWashable.findAll({
        where: {
            orderId
        },
        include: [{
            model: Catalog,
            attributes: ['name']
        }, {
            model: Washer,
            attributes: ['name']
        }, {
            model: Order,
            attributes: ['userId']
        }]
    });

    return list.map(item => {

        const onlyDate =
            item.createdAt.toLocaleDateString(
                'en-GB',
                {
                    timeZone: 'Asia/Kolkata',
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                }
            );

        const onlyTime =
            item.createdAt.toLocaleTimeString(
                'en-US',
                {
                    timeZone: 'Asia/Kolkata',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }
            );

        return {
            washerName: item.Washer?.name,
            washerId: item.washerId,
            userId: item.Order.userId,
            itemName: item.Catalog.name,
            status: item.status,
            issueDescription: item.issueDescription,
            date: onlyDate,
            time: onlyTime
        };

    });

};

const getNonUniversityDefectedItems =
async () => {

    return await NonUniversityDefect.findAll({
        attributes: [
            'id',
            'roomNumber'
        ],
        include: [{
            model: Washer,
            attributes: [
                'id',
                'name'
            ]
        }],
        order: [
            ['createdAt', 'DESC']
        ]
    });

};

const getNonUniversityMismatchItems =
async () => {

    return await NonUniversityMismatch.findAll({
        attributes: [
            'id',
            'roomNumber'
        ],
        include: [{
            model: Washer,
            attributes: [
                'id',
                'name'
            ]
        }],
        order: [
            ['createdAt', 'DESC']
        ]
    });

};

const getNonUniversityNonWashableItems =
async () => {

    return await NonUniversityNonWashable.findAll({
        attributes: [
            'id',
            'roomNumber'
        ],
        include: [{
            model: Washer,
            attributes: [
                'id',
                'name'
            ]
        }],
        order: [
            ['createdAt', 'DESC']
        ]
    });

};

const viewNonUniversityDefectDetails =
async (defectId, protocol, host) => {

    if (!defectId) {
        throw new Error(
            "defect id required"
        );
    }

    const defect =
    await NonUniversityDefect.findOne({
        where: {
            id: defectId
        }
    });

    if (!defect) {
        throw new Error(
            "defect not found"
        );
    }

    return {
        id: defect.id,
        roomNumber: defect.roomNumber,
        itemName: defect.itemName,
        issueDescription:
            defect.issueDescription,
        image:
            defect.image
            ? `${protocol}://${host}/uploads/${defect.image}`
            : null,
        date:
            defect.createdAt
            ?.toLocaleDateString(),
        time:
            defect.createdAt
            ?.toLocaleTimeString()
    };

};

const viewNonUniversityMismatchDetails =
async (mismatchId) => {

    if (!mismatchId) {
        throw new Error(
            "mismatch id required"
        );
    }

    const mismatch =
    await NonUniversityMismatch.findOne({
        where: {
            id: mismatchId
        }
    });

    if (!mismatch) {
        throw new Error(
            "mismatch not found"
        );
    }

    return {
        id: mismatch.id,
        roomNumber: mismatch.roomNumber,
        itemName: mismatch.itemName,
        submittedQuantity:
            mismatch.submittedQuantity,
        receivedQuantity:
            mismatch.receivedQuantity,
        missingQuantity:
            mismatch.submittedQuantity -
            mismatch.receivedQuantity,
        date:
            mismatch.createdAt
            ?.toLocaleDateString(),
        time:
            mismatch.createdAt
            ?.toLocaleTimeString()
    };

};

const viewNonUniversityNonWashableDetails =
async (nonWashableId) => {

    if (!nonWashableId) {
        throw new Error(
            "non washable id required"
        );
    }

    const item =
    await NonUniversityNonWashable.findOne({
        where: {
            id: nonWashableId
        }
    });

    if (!item) {
        throw new Error(
            "non washable item not found"
        );
    }

    return {
        id: item.id,
        roomNumber: item.roomNumber,
        itemName: item.itemName,
        issueDescription:
            item.issueDescription,
        date:
            item.createdAt
            ?.toLocaleDateString(),
        time:
            item.createdAt
            ?.toLocaleTimeString()
    };

};

const login=async(loginId,password)=>{

    if(!loginId || !password){
        throw new Error('credentials required');
    }

    const admin = await Admin.findOne({
        where : {
            loginId:loginId
        }
    });

    if(!admin){
        throw new Error('invalid credentials');
    }

    if(password!==admin.password){
        throw new Error('invalid credentials');
    }

    if(admin.role==='ADMIN'){
        return {
            id:admin.id,
            role:admin.role
        }
    }else{

        const permissions = await SubAdminPermissions.findAll({
            where:{
                subAdminId:admin.id,
                status:1
            },
            include:[
                {
                    model:Menu,
                    attributes:['id','name']
                },
                {
                    model:SubMenu,
                    attributes:['id','menuId','name']
                }
            ]
        });

        const formattedPermissions = [];
        const menuMap = {};

        permissions.forEach(permission => {

            const menuId = permission.menuId;

            if(!menuMap[menuId]){

                menuMap[menuId] = {
                    id: permission.Menu.id,
                    menu: permission.Menu.name
                };

                if(permission.subMenuId === null){
                    menuMap[menuId].fullAccess = true;
                }

                if(permission.SubMenu){
                    menuMap[menuId].subMenus = [];
                }

                formattedPermissions.push(menuMap[menuId]);
            }

            if(permission.SubMenu){

                if(!menuMap[menuId].subMenus){
                    menuMap[menuId].subMenus = [];
                }

                menuMap[menuId].subMenus.push({
                    id: permission.SubMenu.id,
                    menuId: permission.SubMenu.menuId,
                    name: permission.SubMenu.name
                });
            }

        });

        return{
            id:admin.id,
            role:admin.role,
            organizationId:admin.organizationId,
            permissions:formattedPermissions
        }
    }
}

const createSubAdmin = async (
    loginId,
    password,
    organizationId
) => {

    if(!loginId || !password || !organizationId){
        throw new Error('credentials required');
    }

    const existing = await Admin.findOne({
        where:{
            loginId
        }
    });

    if(existing){
        throw new Error('login id already exists');
    }

    const organization = await Organization.findByPk(organizationId);

    if(!organization){
        throw new Error("Incorrect organization");
    }

    await Admin.create({
        loginId,
        password,
        role:'SUBADMIN',
        organizationId
    });

    return 'subadmin created successfully';
};



const listSubAdmins = async () => {

    const subAdmins = await Admin.findAll({
        where:{
            role:'SUBADMIN'
        },
        attributes:[
            'id',
            'loginId',
            'password',
            'createdAt',
            'organizationId'
        ],
        order:[
            ['createdAt','DESC']
        ]
    });

    const formattedList = [];

    for(const subAdmin of subAdmins){

        const permissionCount =
            await SubAdminPermissions.count({
                where:{
                    subAdminId:subAdmin.id,
                    status:1
                }
            });

        formattedList.push({
            id:subAdmin.id,
            loginId:subAdmin.loginId,
            password:subAdmin.password,
            permissions:permissionCount,
            createdAt:subAdmin.createdAt,
            organizationId:subAdmin.organizationId
        });
    }

    return formattedList;
};



const deleteSubAdmin = async (
    subAdminId
) => {

    if(!subAdminId){
        throw new Error('id required');
    }

    const subAdmin =
        await Admin.findByPk(subAdminId);

    if(!subAdmin){
        throw new Error('incorrect id');
    }

    if(subAdmin.role !== 'SUBADMIN'){
        throw new Error('cannot delete admin');
    }

    await SubAdminPermissions.destroy({
        where:{
            subAdminId
        }
    });

    await subAdmin.destroy();

    return 'subadmin deleted successfully';
};



const removePermissions = async (
    subAdminId,
    permissions
) => {

    if(!subAdminId){
        throw new Error('id required');
    }

    if(!permissions || permissions.length === 0){
        throw new Error('permissions required');
    }

    const subAdmin =
        await Admin.findByPk(subAdminId);

    if(!subAdmin){
        throw new Error('incorrect id');
    }

    for(const permission of permissions){

        if(
            permission.subMenuIds &&
            permission.subMenuIds.length > 0
        ){

            for(const subMenuId of permission.subMenuIds){

                await SubAdminPermissions.destroy(
                    {
                        where:{
                            subAdminId,
                            menuId:permission.menuId,
                            subMenuId:subMenuId
                        }
                    }
                );
            }

        }else{

            await SubAdminPermissions.destroy(
                {
                    where:{
                        subAdminId,
                        menuId:permission.menuId
                    }
                }
            );

        }

    }

    return 'permissions removed successfully';
};

const { OrganizationFreeLimit } = require("../models/organizationFreeLimit.model");

const addOrganization = async ({
    name,
    type,
    monthlyFreeLimit
}) => {

    if (!name || !type) {
        throw new Error("Name and type are required.");
    }

    if (
        monthlyFreeLimit == null ||
        monthlyFreeLimit < 0
    ) {
        throw new Error("Valid monthly free limit is required.");
    }

    const find = await Organization.findOne({
        where:{
            name,
            type:"UNIVERSITY"
        }
    });

    if(find){
        throw new Error("Organization with the same name and type already exists.");
    }

    const transaction = await sequelize.transaction();

    try {

        const organization = await Organization.create(
            {
                name,
                type:"UNIVERSITY"
            },
            { transaction }
        );

        await OrganizationFreeLimit.create(
            {
                organizationId: organization.id,
                monthlyFreeLimit
            },
            { transaction }
        );

        await transaction.commit();

        return organization;

    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};

const updateOrganization = async ({
    organizationId,
    name,
    monthlyFreeLimit
}) => {

    if (!organizationId) {
        throw new Error("Organization id is required.");
    }

    const organization = await Organization.findByPk(organizationId);

    if (!organization) {
        throw new Error("Organization not found.");
    }

    if (name) {
        organization.name = name;
    }

    await organization.save();

    if (monthlyFreeLimit != null) {

        if (monthlyFreeLimit < 0) {
            throw new Error("Invalid monthly free limit.");
        }

        await OrganizationFreeLimit.upsert({
            organizationId,
            monthlyFreeLimit
        });
    }

    return true;
};

const {fn, col } = require("sequelize");
const {
    DailyEntry
} = require("../models");
const { LpgReceipts } = require('../models/lpgReceipts.model');

const getMonthlyManpowerKgReport = async (month,washerId) => {

    if (!month) {
        throw new Error("Month is required. Format: YYYY-MM");
    }

    const regex = /^\d{4}-\d{2}$/;

    if (!regex.test(month)) {
        throw new Error("Month must be in YYYY-MM format.");
    }

    const [year, monthNum] = month.split("-").map(Number);

    const startDate = `${year}-${String(monthNum).padStart(2, "0")}-01`;

    const lastDay = new Date(year, monthNum, 0).getDate();

    const endDate = `${year}-${String(monthNum).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    if (washerId !== undefined && washerId !== null) {

        if (typeof washerId !== "number") {
            throw new Error("Washer ID must be a number.");
        }

        const washer = await Washer.findOne({
            where: {
                id: washerId
            }
        });

        if (!washer) {
            throw new Error("Washer not found.");
        }
    }

    const dateWhere = {
        date: {
            [Op.between]: [startDate, endDate]
        }
    };

    const attendanceWhere = {
        attendanceDate: {
            [Op.between]: [startDate, endDate]
        }
    };

    if (washerId !== undefined && washerId !== null) {
        dateWhere.washerId = washerId;
        attendanceWhere["$WasherMan.washerId$"] = washerId;
    }

    // ------------------------
    // Daily Load
    // ------------------------

    const loadData = await DailyEntry.findAll({
        attributes: [
            "date",
            "washerId",
            [col("Washer.name"), "washerName"],
            [fn("SUM", col("totalLoadKg")), "totalLoadKg"]
        ],

        include: [
            {
                model: Washer,
                attributes: []
            }
        ],

        where: dateWhere,

        group: [
            "date",
            "washerId",
            "Washer.id"
        ],

        order: [
            ["date", "ASC"],
            ["washerId", "ASC"]
        ],

        raw: true
    });

    // ------------------------
    // Attendance
    // ------------------------

    const attendanceData = await WasherAttendance.findAll({

        attributes: [
            "attendanceDate",
            "attendance",
            [col("WasherMan.washerId"), "washerId"],
            [col("WasherMan->Washer.name"), "washerName"],
            [
                fn("COUNT", col("WasherAttendance.id")),
                "count"
            ]
        ],

        include: [
            {
                model: WasherMan,
                attributes: [],
                include: [
                    {
                        model: Washer,
                        attributes: []
                    }
                ]
            }
        ],

        where:attendanceWhere,

        group: [
            "attendanceDate",
            "attendance",
            "WasherMan.washerId",
            "WasherMan->Washer.id"
        ],

        raw: true
    });
    console.log(attendanceData);

    // ------------------------
    // Build Attendance Map
    // ------------------------

    const attendanceMap = {};
    const washerAttendanceMap = {};

    attendanceData.forEach(item => {

        const date = item.attendanceDate;
        const washerId = item.washerId;

        if (!attendanceMap[date]) {
            attendanceMap[date] = {
                present: 0,
                absent: 0
            };
        }

        if (!washerAttendanceMap[date]) {
            washerAttendanceMap[date] = {};
        }

        if (!washerAttendanceMap[date][washerId]) {
            washerAttendanceMap[date][washerId] = {
                washerName: item.washerName,
                present: 0,
                absent: 0
            };
        }

        const value = Number(item.count);

        if (item.attendance.toLowerCase() === "present") {

            attendanceMap[date].present += value;
            washerAttendanceMap[date][washerId].present = value;

        } else {

            attendanceMap[date].absent += value;
            washerAttendanceMap[date][washerId].absent = value;

        }

    });
    // ------------------------
    // Final Report
    // ------------------------

    const reportMap = {};

    loadData.forEach(item => {

        const date = item.date;

        if (!reportMap[date]) {

            const attendance = attendanceMap[date] || {
                present: 0,
                absent: 0
            };

            reportMap[date] = {

                date,

                totalLoadKg: 0,

                presentManpower: attendance.present,

                absentManpower: attendance.absent,

                distribution: []

            };
        }

        const washerAttendance =
            washerAttendanceMap[date]?.[item.washerId] || {
                washerName: item.washerName,
                present: 0,
                absent: 0
            };

        const load = Number(item.totalLoadKg);

        reportMap[date].totalLoadKg += load;

        reportMap[date].distribution.push({

            washerId: item.washerId,

            washerName: item.washerName,

            totalLoadKg: load,

            presentManpower: washerAttendance.present,

            absentManpower: washerAttendance.absent,

            kgPerManpower:
                washerAttendance.present > 0
                    ? Number((load / washerAttendance.present).toFixed(2))
                    : 0,

            manpowerPerKg:
                load > 0
                    ? Number((washerAttendance.present / load).toFixed(4))
                    : 0

        });

    });

    const report = Object.values(reportMap).map(day => ({

        ...day,

        kgPerManpower:
            day.presentManpower > 0
                ? Number((day.totalLoadKg / day.presentManpower).toFixed(2))
                : 0,

        manpowerPerKg:
            day.totalLoadKg > 0
                ? Number((day.presentManpower / day.totalLoadKg).toFixed(4))
                : 0

    }));

    return report;
};

const disableUniversity = async (organizationId) => {

    if (!organizationId) {
        throw new Error("Organization id is required.");
    }

    const organization = await Organization.findOne({
        where: {
            id: organizationId,
            type: "UNIVERSITY"
        }
    });

    if (!organization) {
        throw new Error("University not found.");
    }

    organization.isActive = false;
    await organization.save();

    return true;
};

const enableUniversity = async (organizationId) => {

    if (!organizationId) {
        throw new Error("Organization id is required.");
    }

    const organization = await Organization.findOne({
        where: {
            id: organizationId,
            type: "UNIVERSITY"
        }
    });

    if (!organization) {
        throw new Error("University not found.");
    }

    organization.isActive = true;
    await organization.save();

    return true;
};

const parseStartDate = (dateStr) => {
    if (!dateStr) return null;

    const parts = dateStr.trim().split("/");

    if (parts.length !== 3) return null;

    const [day, month, year] = parts.map(Number);

    if (
        !day ||
        !month ||
        !year ||
        day < 1 ||
        day > 31 ||
        month < 1 ||
        month > 12
    ) {
        return null;
    }

    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return date;
};

const bulkImportUsers = async (users) => {

    const errors = [];
    const validUsers = [];

    // Fetch all organizations
    const organizations = await Organization.findAll({
        attributes: ["id", "name", "type"]
    });

    const organizationMap = new Map();

    organizations.forEach(org => {
        organizationMap.set(
            `${org.name.trim().toLowerCase()}_${org.type}`,
            org
        );
    });

    const packages = await LimitPackage.findAll({
        where: {
            status: "active"
        },
        attributes: [
            "id",
            "name",
            "organizationId",
            "extraLimit",
            "distributionType",
            "validityDays"
        ]
    });

    const packageMap = new Map();

    packages.forEach(pkg => {
        packageMap.set(
            `${pkg.organizationId}_${pkg.name.trim().toLowerCase()}`,
            pkg
        );
    });

    const studentIdSet = new Set();
    const mobileNumberSet = new Set();
    const laundryNumberSet = new Set();

    const studentIds = [];
    const mobileNumbers = [];
    const laundryNumbers = [];

    for (const [index, record] of users.entries()) {

        const row = index + 1;

        const studentId = record.studentId?.trim();
        const name = record.name?.trim();
        const mobileNumber = record.mobileNumber?.trim();
        const laundryNumber = record.laundryNumber?.trim();
        const organizationName = record.organizationName?.trim();
        const organizationType = record.organizationType?.trim().toUpperCase();
        const activatedPackage = record.activatedPackage?.trim();
        const startDate = record.startDate?.trim();

        const missingFields = [];

        if (!studentId) missingFields.push("studentId");
        if (!name) missingFields.push("name");
        if (!mobileNumber) missingFields.push("mobileNumber");
        if (!laundryNumber) missingFields.push("laundryNumber");
        if (!organizationName) missingFields.push("organizationName");
        if (!organizationType) missingFields.push("organizationType");

        if (missingFields.length) {
            errors.push({
                row,
                reason: `Missing fields: ${missingFields.join(", ")}`
            });
            continue;
        }

        if (!["UNIVERSITY", "HOSPITAL"].includes(organizationType)) {
            errors.push({
                row,
                reason: `Invalid organization type '${organizationType}'`
            });
            continue;
        }

        if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
            errors.push({
                row,
                reason: `Invalid mobile number '${mobileNumber}'`
            });
            continue;
        }

        const organization = organizationMap.get(
            `${organizationName.toLowerCase()}_${organizationType}`
        );

        if (!organization) {
            errors.push({
                row,
                reason: `Organization '${organizationName}' (${organizationType}) not found`
            });
            continue;
        }

        if (studentIdSet.has(studentId)) {
            errors.push({
                row,
                reason: `Duplicate Student ID '${studentId}' in uploaded file`
            });
            continue;
        }

        studentIdSet.add(studentId);

        if (mobileNumberSet.has(mobileNumber)) {
            errors.push({
                row,
                reason: `Duplicate Mobile Number '${mobileNumber}' in uploaded file`
            });
            continue;
        }

        mobileNumberSet.add(mobileNumber);

        if (laundryNumberSet.has(laundryNumber)) {
            errors.push({
                row,
                reason: `Duplicate Laundry Number '${laundryNumber}' in uploaded file`
            });
            continue;
        }

        let packageDetails = null;
        let parsedStartDate = null;

        if (activatedPackage) {

            packageDetails = packageMap.get(
                `${organization.id}_${activatedPackage.toLowerCase()}`
            );

            if (!packageDetails) {
                errors.push({
                    row,
                    reason: `Package '${activatedPackage}' not found for '${organizationName}'`
                });
                continue;
            }

            if (!startDate) {
                errors.push({
                    row,
                    reason: "startDate is required when activatedPackage is provided"
                });
                continue;
            }

            parsedStartDate = parseStartDate(startDate);

            if (!parsedStartDate) {
                errors.push({
                    row,
                    reason: `Invalid startDate '${startDate}'. Expected DD/MM/YYYY`
                });
                continue;
            }
        }

        laundryNumberSet.add(laundryNumber);

        studentIds.push(studentId);
        mobileNumbers.push(mobileNumber);
        laundryNumbers.push(laundryNumber);

        validUsers.push({
            row,
            organizationId: organization.id,
            organizationType,
            studentId,
            name,
            mobileNumber,
            laundryNumber,
            packageDetails,
            startDate: parsedStartDate
        });
    }

    if (!validUsers.length) {
        return {
            totalRows: users.length,
            insertedCount: 0,
            failedCount: errors.length,
            errors
        };
    }

    const existingUsers = await User.findAll({
        attributes: [
            "studentId",
            "mobileNumber",
            "laundryNumber"
        ],
        where: {
            [Op.or]: [
                {
                    studentId: {
                        [Op.in]: studentIds
                    }
                },
                {
                    mobileNumber: {
                        [Op.in]: mobileNumbers
                    }
                },
                {
                    laundryNumber: {
                        [Op.in]: laundryNumbers
                    }
                }
            ]
        }
    });

    const existingStudentIds = new Set(existingUsers.map(u => u.studentId));
    const existingMobileNumbers = new Set(existingUsers.map(u => u.mobileNumber));
    const existingLaundryNumbers = new Set(existingUsers.map(u => u.laundryNumber));

    const usersToInsert = [];

    for (const user of validUsers) {

        if (existingStudentIds.has(user.studentId)) {
            errors.push({
                row: user.row,
                reason: `Student ID '${user.studentId}' already exists`
            });
            continue;
        }

        if (existingMobileNumbers.has(user.mobileNumber)) {
            errors.push({
                row: user.row,
                reason: `Mobile Number '${user.mobileNumber}' already exists`
            });
            continue;
        }

        if (existingLaundryNumbers.has(user.laundryNumber)) {
            errors.push({
                row: user.row,
                reason: `Laundry Number '${user.laundryNumber}' already exists`
            });
            continue;
        }

        usersToInsert.push({
            organizationId: user.organizationId,
            organizationType: user.organizationType,
            studentId: user.studentId,
            name: user.name,
            mobileNumber: user.mobileNumber,
            laundryNumber: user.laundryNumber,
            packageDetails: user.packageDetails,
            startDate: user.startDate
        });
    }

    if (!usersToInsert.length) {
        return {
            totalRows: users.length,
            insertedCount: 0,
            failedCount: errors.length,
            errors
        };
    }

    await sequelize.transaction(async (transaction) => {

        const createdUsers = await User.bulkCreate(
            usersToInsert.map(u => ({
                organizationId: u.organizationId,
                organizationType: u.organizationType,
                studentId: u.studentId,
                name: u.name,
                mobileNumber: u.mobileNumber,
                laundryNumber: u.laundryNumber
            })),
            {
                validate: true,
                transaction
            }
        );

        const currentReleaseMonth =
            (new Date().getFullYear() * 100) +
            (new Date().getMonth() + 1);

        const packageAssignments = [];

        for (let i = 0; i < createdUsers.length; i++) {

            const createdUser = createdUsers[i];
            const importedUser = usersToInsert[i];

            if (!importedUser.packageDetails) {
                continue;
            }

            const pkg = importedUser.packageDetails;
            const purchaseDate = importedUser.startDate;

            let remainingLimit = pkg.extraLimit;

            if (pkg.distributionType === "MONTHLY") {

                let totalMonths = 1;

                if (pkg.validityDays >= 365) {
                    totalMonths = 12;
                } else if (pkg.validityDays >= 180) {
                    totalMonths = 6;
                } else if (pkg.validityDays >= 90) {
                    totalMonths = 3;
                }

                remainingLimit = Math.floor(
                    pkg.extraLimit / totalMonths
                );
            }

            const expiresAt = new Date(purchaseDate);
            expiresAt.setDate(expiresAt.getDate() + pkg.validityDays);

            packageAssignments.push({
                userId: createdUser.id,
                packageId: pkg.id,
                extraLimit: pkg.extraLimit,
                remainingLimit,
                currentReleaseMonth,
                expiresAt,
                paymentStatus: "SUCCESS",
                paymentMode: "ADMIN_IMPORT",
                createdAt: purchaseDate,
                updatedAt: purchaseDate
            });
        }

        if (packageAssignments.length) {
            await UserLimitPackage.bulkCreate(packageAssignments, {
                transaction
            });
        }

    });

    return {
        totalRows: users.length,
        insertedCount: usersToInsert.length,
        failedCount: errors.length,
        errors
    };
};

const bulkDisableUsers = async (users) => {

    const errors = [];
    const validRows = [];

    const laundryNumberSet = new Set();
    const laundryNumbers = [];

    for (const [index, record] of users.entries()) {

        const row = index + 1;
        const laundryNumber = record.laundryNumber?.trim();

        if (!laundryNumber) {
            errors.push({
                row,
                reason: "Missing field: laundryNumber"
            });
            continue;
        }

        if (laundryNumberSet.has(laundryNumber)) {
            errors.push({
                row,
                reason: `Duplicate Laundry Number '${laundryNumber}' in uploaded file`
            });
            continue;
        }

        laundryNumberSet.add(laundryNumber);
        laundryNumbers.push(laundryNumber);

        validRows.push({
            row,
            laundryNumber
        });
    }

    if (!validRows.length) {
        return {
            totalRows: users.length,
            updatedCount: 0,
            failedCount: errors.length,
            errors
        };
    }

    const existingUsers = await User.findAll({
        where: {
            laundryNumber: {
                [Op.in]: laundryNumbers
            }
        },
        attributes: [
            "id",
            "laundryNumber",
            "status"
        ]
    });

    const userMap = new Map();

    existingUsers.forEach(user => {
        userMap.set(user.laundryNumber, user);
    });

    const idsToDisable = [];

    for (const row of validRows) {

        const user = userMap.get(row.laundryNumber);

        if (!user) {
            errors.push({
                row: row.row,
                reason: `Laundry Number '${row.laundryNumber}' not found`
            });
            continue;
        }

        if (user.status === "disable") {
            errors.push({
                row: row.row,
                reason: `Laundry Number '${row.laundryNumber}' is already disabled`
            });
            continue;
        }

        idsToDisable.push(user.id);
    }

    if (!idsToDisable.length) {
        return {
            totalRows: users.length,
            updatedCount: 0,
            failedCount: errors.length,
            errors
        };
    }

    await sequelize.transaction(async (transaction) => {

        await User.update(
            {
                status: "disable"
            },
            {
                where: {
                    id: {
                        [Op.in]: idsToDisable
                    }
                },
                transaction
            }
        );

    });

    return {
        totalRows: users.length,
        updatedCount: idsToDisable.length,
        failedCount: errors.length,
        errors
    };
};

const bulkImportMIS = async (entries) => {

    const errors = [];
    const validEntries = [];

    // Fetch all washers once
    const washers = await Washer.findAll({
        attributes: ["id", "loginId"]
    });

    const washerMap = new Map();

    washers.forEach(washer => {
        washerMap.set(
            washer.loginId.trim().toLowerCase(),
            washer
        );
    });

    // Used for duplicate detection inside uploaded excel
    const dailyEntrySet = new Set();

    // Used for DB duplicate lookup later
    const dailyEntryKeys = [];

    for (const [index, record] of entries.entries()) {

        const row = index + 1;

        const washerLoginId = record.washerLoginId?.trim();
        const date = record.date;
        const totalLoadKg = Number(record.totalLoadKg);

        // Electricity
        const electricityOpening = record.electricityOpening;
        const electricityClosing = record.electricityClosing;
        const electricityConsumedUnits = record.electricityConsumedUnits;
        const electricityPricePerUnit = record.electricityPricePerUnitAtTime;
        const electricityCost = record.electricityCost;

        // Gas
        const gasOpening = record.gasOpening;
        const gasClosing = record.gasClosing;
        const gasConsumedUnits = record.gasConsumedUnits;
        const gasConsumedUnitsInKg = record.gasConsumedUnitsInKg;
        const mfUsed = record.mfUsed;
        const gasPricePerKg = record.gasPricePerKgAtTime;
        const gasCost = record.gasCost;

        const missingFields = [];

        if (!washerLoginId) missingFields.push("washerLoginId");
        if (!date) {
            missingFields.push("date");
        } else if (isNaN(new Date(date).getTime())) {
            errors.push({
                row,
                reason: "Invalid date format"
            });
            continue;
        }
        if (
            record.totalLoadKg === undefined ||
            record.totalLoadKg === null ||
            record.totalLoadKg === ""
        ) {
            missingFields.push("totalLoadKg");
        }

        if (missingFields.length) {
            errors.push({
                row,
                reason: `Missing fields: ${missingFields.join(", ")}`
            });
            continue;
        }

        if (isNaN(totalLoadKg) || totalLoadKg <= 0) {
            errors.push({
                row,
                reason: `Invalid Total Load Kg '${record.totalLoadKg}'`
            });
            continue;
        }

        const washer = washerMap.get(
            washerLoginId.toLowerCase()
        );

        if (!washer) {
            errors.push({
                row,
                reason: `Washer '${washerLoginId}' not found`
            });
            continue;
        }

        // Duplicate DailyEntry inside uploaded file
        const duplicateKey = `${washer.id}_${date}`;

        if (dailyEntrySet.has(duplicateKey)) {
            errors.push({
                row,
                reason: `Duplicate entry for washer '${washerLoginId}' on ${date}`
            });
            continue;
        }

        dailyEntrySet.add(duplicateKey);

        dailyEntryKeys.push({
            washerId: washer.id,
            date
        });

        // ------------------------
        // Electricity Validation
        // ------------------------

        const hasElectricity =
            electricityOpening != null ||
            electricityClosing != null ||
            electricityConsumedUnits != null ||
            electricityPricePerUnit != null ||
            electricityCost != null;

        if (hasElectricity) {

            if (
                electricityOpening == null ||
                electricityClosing == null ||
                electricityConsumedUnits == null ||
                electricityPricePerUnit == null ||
                electricityCost == null
            ) {
                errors.push({
                    row,
                    reason: "Incomplete electricity data"
                });
                continue;
            }

            if (
                isNaN(Number(electricityOpening)) ||
                isNaN(Number(electricityClosing)) ||
                isNaN(Number(electricityConsumedUnits)) ||
                isNaN(Number(electricityPricePerUnit)) ||
                isNaN(Number(electricityCost))
            ) {
                errors.push({
                    row,
                    reason: "Electricity values must be numeric"
                });
                continue;
            }

            if (Number(electricityOpening) < 0) {
                errors.push({
                    row,
                    reason: "Electricity opening cannot be negative"
                });
                continue;
            }

            if (Number(electricityClosing) < Number(electricityOpening)) {
                errors.push({
                    row,
                    reason: "Electricity closing reading cannot be less than opening reading"
                });
                continue;
            }

            if (Number(electricityConsumedUnits) < 0) {
                errors.push({
                    row,
                    reason: "Electricity consumed units cannot be negative"
                });
                continue;
            }

            if (Number(electricityPricePerUnit) < 0) {
                errors.push({
                    row,
                    reason: "Electricity price cannot be negative"
                });
                continue;
            }

            if (Number(electricityCost) < 0) {
                errors.push({
                    row,
                    reason: "Electricity cost cannot be negative"
                });
                continue;
            }

       const calculatedElectricityUnits =
            Number(electricityClosing) - Number(electricityOpening);

        if (
            Math.abs(
                calculatedElectricityUnits -
                Number(electricityConsumedUnits)
            ) > 0.001
        )   {
                errors.push({
                    row,
                    reason: "Electricity consumed units mismatch"
                });
                continue;
            }

        }

        // ------------------------
        // Gas Validation
        // ------------------------

        const hasGas =
            gasOpening != null ||
            gasClosing != null ||
            gasConsumedUnits != null ||
            gasConsumedUnitsInKg != null ||
            mfUsed != null ||
            gasPricePerKg != null ||
            gasCost != null;

        if (hasGas) {

            if (
                gasOpening == null ||
                gasClosing == null ||
                gasConsumedUnits == null ||
                gasConsumedUnitsInKg == null ||
                mfUsed == null ||
                gasPricePerKg == null ||
                gasCost == null
            ) {
                errors.push({
                    row,
                    reason: "Incomplete gas data"
                });
                continue;
            }

            if (
                isNaN(Number(gasOpening)) ||
                isNaN(Number(gasClosing)) ||
                isNaN(Number(gasConsumedUnits)) ||
                isNaN(Number(gasConsumedUnitsInKg)) ||
                isNaN(Number(mfUsed)) ||
                isNaN(Number(gasPricePerKg)) ||
                isNaN(Number(gasCost))
            ) {
                errors.push({
                    row,
                    reason: "Gas values must be numeric"
                });
                continue;
            }

            if (Number(gasOpening) < 0) {
                errors.push({
                    row,
                    reason: "Gas opening cannot be negative"
                });
                continue;
            }

            if (Number(gasClosing) < Number(gasOpening)) {
                errors.push({
                    row,
                    reason: "Gas closing reading cannot be less than opening reading"
                });
                continue;
            }

            if (Number(gasConsumedUnits) < 0) {
                errors.push({
                    row,
                    reason: "Gas consumed units cannot be negative"
                });
                continue;
            }

            if (Number(gasConsumedUnitsInKg) < 0) {
                errors.push({
                    row,
                    reason: "Gas consumed Kg cannot be negative"
                });
                continue;
            }

            if (Number(mfUsed) < 0) {
                errors.push({
                    row,
                    reason: "MF Used cannot be negative"
                });
                continue;
            }

            if (Number(gasPricePerKg) < 0) {
                errors.push({
                    row,
                    reason: "Gas price cannot be negative"
                });
                continue;
            }

            if (Number(gasCost) < 0) {
                errors.push({
                    row,
                    reason: "Gas cost cannot be negative"
                });
                continue;
            }

            const calculatedGasUnits =
                Number(gasClosing) - Number(gasOpening);

            if (
                Math.abs(
                    calculatedGasUnits -
                    Number(gasConsumedUnits)
                ) > 0.001
            ){
                errors.push({
                    row,
                    reason: "Gas consumed units mismatch"
                });
                continue;
            }

        }

        if (!hasElectricity && !hasGas) {
            errors.push({
                row,
                reason: "Either electricity or gas data must be provided"
            });
            continue;
        }

        validEntries.push({

            row,

            washerId: washer.id,
            washerLoginId,

            date,
            totalLoadKg,

            hasElectricity,
            hasGas,

            electricity: {
                opening: electricityOpening,
                closing: electricityClosing,
                consumedUnits: electricityConsumedUnits,
                pricePerUnitAtTime: electricityPricePerUnit,
                cost: electricityCost
            },

            gas: {
                opening: gasOpening,
                closing: gasClosing,
                consumedUnits: gasConsumedUnits,
                consumedUnitsInKg: gasConsumedUnitsInKg,
                mfUsed,
                pricePerKgAtTime: gasPricePerKg,
                cost: gasCost
            }

        });

    }

    // Continue in Part 2...
    if (validEntries.length === 0) {
        return {
            totalRows: entries.length,
            insertedCount: 0,
            failedCount: errors.length,
            errors
        };
    }

    // -----------------------------------------
    // Fetch existing Daily Entries
    // -----------------------------------------

    const uniqueDailyEntryKeys = [
        ...new Map(
            dailyEntryKeys.map(item => [
                `${item.washerId}_${item.date}`,
                item
            ])
        ).values()
    ];

    const existingDailyEntries = await DailyEntry.findAll({
        attributes: ["washerId", "date"],
        where: {
            [Op.or]: uniqueDailyEntryKeys
        }
    });

    const existingEntrySet = new Set();

    existingDailyEntries.forEach(entry => {
        existingEntrySet.add(
            `${entry.washerId}_${entry.date}`
        );
    });

    const entriesToInsert = [];

    for (const entry of validEntries) {

        const key = `${entry.washerId}_${entry.date}`;

        if (existingEntrySet.has(key)) {

            errors.push({
                row: entry.row,
                reason: `Daily entry already exists for washer '${entry.washerLoginId}' on ${entry.date}`
            });

            continue;
        }

        entriesToInsert.push(entry);

    }

    if (entriesToInsert.length === 0) {

        return {
            totalRows: entries.length,
            insertedCount: 0,
            failedCount: errors.length,
            errors
        };

    }

    // -----------------------------------------
    // Transaction
    // -----------------------------------------

    await sequelize.transaction(async (transaction) => {

        for (const entry of entriesToInsert) {

            const dailyEntry = await DailyEntry.create({

                washerId: entry.washerId,
                date: entry.date,
                totalLoadKg: entry.totalLoadKg

            }, {
                transaction
            });

            // ----------------------------
            // Electricity
            // ----------------------------

            if (entry.hasElectricity) {

                await ElectricityLogs.create({

                    entryId: dailyEntry.id,

                    opening: Number(entry.electricity.opening),
                    closing: Number(entry.electricity.closing),
                    consumedUnits: Number(entry.electricity.consumedUnits),
                    pricePerUnitAtTime: Number(entry.electricity.pricePerUnitAtTime),
                    cost: Number(entry.electricity.cost)

                }, {
                    transaction
                });

            }

            // ----------------------------
            // Gas
            // ----------------------------

            if (entry.hasGas) {

                await GasLogs.create({

                    entryId: dailyEntry.id,

                    opening: Number(entry.gas.opening),
                    closing: Number(entry.gas.closing),
                    consumedUnits: Number(entry.gas.consumedUnits),
                    consumedUnitsinKg: Number(entry.gas.consumedUnitsInKg),
                    mfUsed: Number(entry.gas.mfUsed),
                    pricePerKgAtTime: Number(entry.gas.pricePerKgAtTime),
                    cost: Number(entry.gas.cost)

                }, {
                    transaction
                });

            }

        }

    });

    return {

        totalRows: entries.length,
        insertedCount: entriesToInsert.length,
        failedCount: errors.length,
        errors

    };
};

const createAdminOrder = async (
    userId,
    serviceType,
    paymentMethod,
    items,
    t
) => {

    // -------------------------
    // Validate User
    // -------------------------

    const user = await User.findByPk(userId, {
        transaction: t
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (
        !user.organizationId ||
        user.organizationType !== "UNIVERSITY"
    ) {
        throw new Error(
            "User not linked to any university"
        );
    }

    // -------------------------
    // Validate Service Type
    // -------------------------

    if (
        ![
            "laundry",
            "paidLaundry",
            "drycleaning",
            "ironing"
        ].includes(serviceType)
    ) {
        throw new Error("Invalid service type");
    }

    if (
        serviceType !== "laundry" &&
        !["ONLINE", "COD"].includes(paymentMethod)
    ) {
        throw new Error(
            "incorrect payment method"
        );
    }

    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {
        throw new Error("Items are required");
    }

    // -------------------------
    // Washer
    // -------------------------

    const washer = await Washermapper.findOne({
        where: {
            organizationId: user.organizationId,
            organizationType: user.organizationType
        },
        transaction: t
    });

    if (!washer) {
        throw new Error("no washer found");
    }

    // -------------------------
    // Fetch Products
    // -------------------------

    const productIds = [...new Set(items.map(item => item.productId))];

    const products = await Catalog.findAll({
        where: {
            id: productIds
        },
        transaction: t
    });

    if (products.length !== productIds.length) {
        throw new Error(
            "One or more products not found"
        );
    }

    // -------------------------
    // Laundry Limit
    // -------------------------

    if (serviceType === "laundry") {

        let totalLaundry = 0;

        items.forEach(item => {
            totalLaundry += item.quantity;
        });

        const remainingLimit =
            await userService.getRemainingLimit(
                userId
            );

        if (
            remainingLimit < totalLaundry
        ) {
            throw new Error(
                "laundry limit exceeded"
            );
        }
    }

    // -------------------------
    // Amount Calculation
    // -------------------------

    let amount = 0;
    let gstAmount = 0;
    let totalAmount = 0;

    const orderItems = [];

    for (const item of items) {

        const product = products.find(
            p => p.id === item.productId
        );

        if (!product) {
            throw new Error(
                `Product ${item.productId} not found`
            );
        }

        // Validate category against product type
        if (serviceType === "laundry"|| serviceType==="paidLaundry") {

            if (
                product.productType === "MEN" &&
                item.categoryId !== 1
            ) {
                throw new Error(
                    `${product.name} is only available for MEN`
                );
            }

            if (
                product.productType === "WOMEN" &&
                item.categoryId !== 2
            ) {
                throw new Error(
                    `${product.name} is only available for WOMEN`
                );
            }

            if (
                ![1, 2].includes(item.categoryId)
            ) {
                throw new Error(
                    `Invalid category selected for ${product.name}`
                );
            }

        }

        const price =
            serviceType === "laundry"
                ? 0
                : product.price || 0;

        const itemTotal =
            price * item.quantity;

        amount += itemTotal;

        orderItems.push({
            productId: product.id,
            categoryId: item.categoryId,
            quantity: item.quantity,
            priceAtTime: price,
            productName: product.name
        });

    }

    if (
        serviceType !== "laundry"
    ) {

        gstAmount = Number(
            (amount * 18 / 100).toFixed(2)
        );

    }

    totalAmount = Number(
        (amount + gstAmount).toFixed(2)
    );

    // -------------------------
    // Create Order
    // -------------------------

    const order = await Order.create(
        {
            userId,
            serviceType,
            washerId: washer.washerId,
            organizationId:
                user.organizationId,
            organizationType:
                user.organizationType,
            totalAmount,
            gstAmount
        },
        {
            transaction: t
        }
    );

    // -------------------------
    // Create Order Items
    // -------------------------

    for (const item of orderItems) {

        await OrderItem.create(
            {
                orderId: order.id,
                productId: item.productId,
                categoryId: item.categoryId,
                quantity: item.quantity,
                priceAtTime: item.priceAtTime
            },
            {
                transaction: t
            }
        );

    }

    // -------------------------
    // Payment
    // -------------------------

    if (
        serviceType === "laundry"
    ) {

        await Payment.create(
            {
                orderId: order.id,
                paymentMethod: "N/A",
                status: "SUCCESS"
            },
            {
                transaction: t
            }
        );

    } else {

        await Payment.create(
            {
                orderId: order.id,
                paymentMethod,
                status:
                    paymentMethod === "COD"
                        ? "PENDING"
                        : "PENDING"
            },
            {
                transaction: t
            }
        );

    }

    return {
        orderId: order.id,
        amount,
        gstAmount,
        totalAmount,
        items: orderItems
    };

};

const activatePackageByAdmin = async (laundryNumber, packageId, startDate) => {
    if (!laundryNumber || !packageId) {
        throw new Error("Incorrect input");
    }

    const user = await User.findOne({
        where: {
            laundryNumber,
            status: "enable"
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    const selectedPackage = await LimitPackage.findOne({
        where: {
            id: packageId,
            status: "active"
        }
    });

    if (!selectedPackage) {
        throw new Error("Package not found");
    }

    // User and package must belong to same organization
    if (user.organizationId !== selectedPackage.organizationId) {
        throw new Error("User and package belong to different organizations");
    }

    let purchaseDate = new Date();

    if (startDate) {
        purchaseDate = parseStartDate(startDate);

        if (!purchaseDate) {
            throw new Error("Invalid startDate. Expected DD/MM/YYYY");
        }
    }

    const currentReleaseMonth =
        purchaseDate.getFullYear() * 100 +
        (purchaseDate.getMonth() + 1);

    let remainingLimit = selectedPackage.extraLimit;

    if (selectedPackage.distributionType === "MONTHLY") {

        let totalMonths = 1;

        if (selectedPackage.validityDays >= 365) {
            totalMonths = 12;
        } else if (selectedPackage.validityDays >= 180) {
            totalMonths = 6;
        } else if (selectedPackage.validityDays >= 90) {
            totalMonths = 3;
        }

        remainingLimit = Math.floor(
            selectedPackage.extraLimit / totalMonths
        );
    }

    const expiresAt = new Date(purchaseDate);
    expiresAt.setDate(
        expiresAt.getDate() + selectedPackage.validityDays
    );

    const order = await UserLimitPackage.create({
        userId: user.id,
        packageId,
        extraLimit: selectedPackage.extraLimit,
        remainingLimit,
        currentReleaseMonth,
        expiresAt,
        paymentStatus: "SUCCESS",
        paymentMode: "ADMIN",
        createdAt: purchaseDate,
        updatedAt: purchaseDate
    });

    return order;
};

const addChemical = async (data) => {

    const { washerId, name, price } = data;

    if (!washerId) {
        throw new Error("washer id required");
    }

    if (!name || !name.trim()) {
        throw new Error("chemical name required");
    }

    if (price == null) {
        throw new Error("chemical price required");
    }

    if (Number(price) <= 0) {
        throw new Error("invalid chemical price");
    }

    const washerCheck = await Washer.findByPk(washerId);

    if (!washerCheck) {
        throw new Error("Washer does not exist");
    }

    const existingChemical = await ChemicalList.findOne({
        where: {
            washerId,
            name: name.trim()
        }
    });

    if (existingChemical) {
        throw new Error(
            `Chemical ${name} already exists for this washer`
        );
    }

    await ChemicalList.create({
        washerId,
        name: name.trim(),
        price: Number(price)
    });

    return "chemical added successfully";
};


const getAllChemicals = async () => {

    const chemicals = await ChemicalList.findAll({
        attributes: [
            'id',
            'washerId',
            'name',
            'price'
        ],

        order: [
            ['washerId', 'ASC'],
            ['name', 'ASC']
        ]
    });

    return chemicals.map(chemical => ({
        id: chemical.id,
        washerId: chemical.washerId,
        name: chemical.name,
        price: Number(chemical.price)
    }));
};

const getLpgReceipts = async (month, year) => {

    if (!month) {
        throw new Error("month required");
    }

    if (!year) {
        throw new Error("year required");
    }

    const formattedMonth = String(month).padStart(2, '0');

    const startDate = `${year}-${formattedMonth}-01`;

    const endDate = new Date(year, month, 0)
        .toISOString()
        .split('T')[0];

    const receipts = await LpgReceipts.findAll({
        where: {
            date: {
                [Op.between]: [startDate, endDate]
            }
        },

        attributes: [
            'id',
            'washerId',
            'date',
            'quantity',
            'createdAt'
        ],

        order: [
            ['date', 'DESC'],
            ['washerId', 'ASC']
        ]
    });

    return receipts.map(receipt => ({
        id: receipt.id,
        washerId: receipt.washerId,
        date: receipt.date,
        quantity: Number(receipt.quantity),
        createdAt: receipt.createdAt
    }));
};


module.exports = {
    getLpgReceipts,
    addChemical,
    getAllChemicals,
    activatePackageByAdmin,
    enableUniversity,
    createAdminOrder,
    bulkImportMIS,
    bulkImportUsers,
    disableUniversity,
    logout,
    getMonthlyManpowerKgReport,
    updateOrganization,
    getDashboardMetric,
    getOrders,
    getExportOrders,
    getOrderDetails,
    deleteUser,
    addWasherMen,
    editWasherMen,
    deleteWasherMen,
    getWashersList,
    mapOrgAndWasher,
    viewMapping,
    getSubmittedOrders,
    resetPasswordRequests,
    changePassword,
    defectedItems,
    viewDefectedDetails,
    viewSubAdminPermissions,
    listOfPermissions,
    addPermissions,
    viewWasherMen,
    enableUser,
    rejectPasswordRequest,
    enableWasherMen,
    activeBannerImages,
    inactiveBannerImages,
    addBannerImage,
    viewAttendance,
    updateAttendance,
    viewPackages,
    editPackage,
    deletePackage,
    addPackage,
    mismatchItems,
    viewMismatchDetails,
    nonWashableItems,
    viewNonWashableDetails,
    getNonUniversityDefectedItems,
    getNonUniversityMismatchItems,
    getNonUniversityNonWashableItems,
    viewNonUniversityDefectDetails,
    viewNonUniversityMismatchDetails,
    viewNonUniversityNonWashableDetails,
    login,
    createSubAdmin,
    listSubAdmins,
    deleteSubAdmin,
    removePermissions,
    addOrganization,
    hardDeleteUser,
    bulkDisableUsers
}
