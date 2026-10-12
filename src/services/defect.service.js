const Defect = require('../models/index').Defect;
const { Catalog } = require('../models/catalog.model');
const { Issue } = require('../models/issue.model');
const { NonWashable } = require('../models/nonWashable.model');
const { Order } = require('../models/order.model');
const { Organization } = require('../models/organization.model');
const { User } = require('../models/user.model');
const { Washer } = require('../models/washer.model');
const catalogService = require('../services/catalog.service');
const Orderstatus = require('../models/index').Orderstatus;
const notificationService = require('./notification.service');
const washerNotificationService = require('../services/washerNotification.service');
const { buildReceiptPayload } = require('../config/buildReceiptPayload');
const generateAndSaveReceipt = require('../config/generateReceipt');
const { recalculateOrderAmount } = require('./order.service');
const sequelize = require('../config/sequelize');
const { OrderItem } = require('../models/orderItem.model');

const addDefects=async(washerId,orderId,itemName,issueDescription,image)=>{
console.log("reached");
    if(!washerId || !orderId || !itemName || !issueDescription || !image){
        throw new Error("information missing");
    }

    

    const order = await Order.findOne({
        where : {
            id : orderId
        }
    });

    if(!order){
        throw new Error("Invalid orderId");
    }

    const washer = await Washer.findByPk(washerId);

    if(!washer){
        throw new Error("washer not found");
    }

    if(washer.organizationId!==order.organizationId){
        throw new Error("washer not authorized");
    }

    const catalogId = await catalogService.getCatalogIdByName(itemName,order.organizationId);

    if(!catalogId){
        throw new Error("invalid item name");
    };

    const defect = await Defect.create({
        washerId,
        orderId,
        itemId : catalogId,
        issueDescription,
        image
    });

    await Orderstatus.create({
        orderId,
        userId:order.userId,
        status:'ISSUE'
    });

    await notificationService.createNotification(
        order.userId,
        'DEFECT',
        defect.id,
        'Defect Reported',
        `A defect has been reported for your order ${orderId}.Your approval is required.Please refer to transactions page for more details.`
    )

    await notificationService.sendNotificationToUser(
        order.userId,
        'Defect Reported',
        `A defect has been reported for your order ${orderId}.Your approval is required.Please refer to transactions page for more details.`
    )

    return "defect added and order status updated to issue";
};

const updateStatus = async (
    orderId,
    defectId,
    type,
    decision
) => {

    const transaction = await sequelize.transaction();

    try {

        let Model;
        let statusField;

        switch (type) {

            case "DEFECT":
                Model = Defect;
                statusField = "decision";
                break;

            case "MISMATCH":
                Model = Issue;
                statusField = "status";
                break;

            case "NONWASHABLE":
                Model = NonWashable;
                statusField = "status";
                break;

            default:
                throw new Error("Invalid type");
        }

        const record = await Model.findOne({
            where: {
                id: defectId,
                orderId
            },
            transaction
        });
        console.log("Issue Record:", record.toJSON());

        if (!record) {
            throw new Error("incorrect inputs");
        }

        await Model.update({
            [statusField]: decision
        }, {
            where: {
                id: defectId,
                orderId
            },
            transaction
        });

        // ===========================
        // Handle approved mismatch
        // ===========================
        let regenerateReceipt = false;

        if (
            type === "MISMATCH" &&
            decision.toUpperCase() === "APPROVED"
        ) {

            const approvedQuantity = record.quantity;

            const orderItems = await OrderItem.findAll({
                where: {
                    orderId,
                    productId: record.productId
                },
                order: [
                    ["quantity", "DESC"],
                    ["id", "ASC"]
                ],
                transaction
            });

            console.log("Approved Quantity:", approvedQuantity);

            console.log(
                orderItems.map(item => ({
                    id: item.id,
                    quantity: item.quantity,
                    categoryId: item.categoryId
                }))
            );

            const currentTotal = orderItems.reduce(
                (sum, item) => sum + item.quantity,
                0
            );

            if (approvedQuantity < currentTotal) {

                // Reduce quantity
                let remaining = approvedQuantity;

                for (const item of orderItems) {

                    if (remaining === 0) {
                        await item.destroy({ transaction });
                        continue;
                    }

                    if (item.quantity <= remaining) {
                        remaining -= item.quantity;
                        continue;
                    }

                    await item.update(
                        {
                            quantity: remaining
                        },
                        { transaction }
                    );

                    remaining = 0;
                }

            } else if (approvedQuantity > currentTotal) {

                // Increase quantity
                const difference = approvedQuantity - currentTotal;

                const largestItem = orderItems[0];

                await largestItem.update(
                    {
                        quantity: largestItem.quantity + difference
                    },
                    { transaction }
                );

            }

            // If approvedQuantity === currentTotal,
            // nothing needs to be done.
            const updatedItems = await OrderItem.findAll({
                where: {
                    orderId,
                    productId: record.productId
                },
                transaction
            });

            console.log(
                "After update:",
                updatedItems.map(item => ({
                    id: item.id,
                    quantity: item.quantity,
                    categoryId: item.categoryId
                }))
            );
            await recalculateOrderAmount(orderId, transaction);
            regenerateReceipt = true;

        }

        const order = await Order.findByPk(orderId, {
            transaction
        });

        let itemName = "item";

        if (type === "MISMATCH") {
            const catalogItem = await Catalog.findByPk(
                record.productId,
                { transaction }
            );
            itemName = catalogItem?.name || "item";
        } else {
            const catalogItem = await Catalog.findByPk(
                record.itemId,
                { transaction }
            );
            itemName = catalogItem?.name || "item";
        }



        await transaction.commit();

        if (regenerateReceipt) {

            const receiptPayload =
                await buildReceiptPayload(order);

            await generateAndSaveReceipt(receiptPayload);

        }

        if (order && order.washerId) {

            const title = `${type} ${decision}`;
            const message =
                `Customer has ${decision.toLowerCase()} the ${type.toLowerCase()} for Order #${orderId} (${itemName}).`;

            

            try {

                await washerNotificationService.createWasherNotification(
                    order.washerId,
                    type,
                    orderId,
                    title,
                    message
                );

                await washerNotificationService.sendNotificationToWasher(
                    order.washerId,
                    title,
                    message
                );
            } catch (error) {
                console.log(
                    "Error sending notification to washer:",
                    error
                );
            }

        }

        return "status updated";

    } catch (error) {
        console.log(error,"errr");

        await transaction.rollback();
        throw error;

    }

};

const fetchPreviousApprovals = async(studentId,protocol,host)=>{

    if(!studentId){
        throw new Error("studentId required");
    }

    if(typeof studentId !== "number"){
        throw new Error("incorrect type");
    }

    const defects = await Defect.findAll({
        where:{
            decision : 'APPROVED'
        },
        include:[{
            model : Order
        },{
            model:Catalog,
            attributes:['name']
        },{
            model : User,
            where:{
                studentId:studentId
            }
        }],
        order: [['createdAt','DESC']]
    });

    if(!defects){
        throw new Error("no defects found");
    }

    if(!protocol || !host){
        throw new Error("protocol or host missing");
    }

    const baseUrl = `${protocol}://${host}/uploads/`;

    const defectsMapped = defects.map(defect=>{
        return {
            defectId : defect.id,
            washerId : defect.washerId,
            orderId : defect.orderId,
            itemId : defect.itemId,
            itemName : defect.Catalog.name,
            userId : defect.Order.userId,
            studentId : defect.User.studentId,
            issueDescription : defect.issueDescription,
            image : baseUrl + defect.image
        }
    })

    return defectsMapped;
}

const defectedItems = async({organizationId,organizationType}={})=>{

    let whereClause = {};

    if(organizationId && organizationType){
        whereClause={
            organizationId,
            organizationType
        }
    }

    const list = await Defect.findAll({
        include:[{
            model : Order,
            attributes:['userId','organizationId'],
            where:whereClause,
            include:[{
                model:Organization,
                attributes:['name','id']
            },{
                model:User,
                attributes:['name']
            }]
        },{
            model : Washer,
            attributes:['name']
        }],
        order:[['createdAt','DESC']]
    })

    console.log(
        list.map(d => ({
            id: d.id,
            orderId: d.orderId,
            createdAt: d.createdAt
        }))
    );

    const groupedDefects = new Map();

    list.forEach(defect => {
        const orderId = defect.orderId;

        if (!groupedDefects.has(orderId)) {
            groupedDefects.set(orderId, {
                defectId: defect.id,
                washerId: defect.washerId,
                washerName: defect.Washer?.name,
                orderId: defect.orderId,
                userId: defect.Order.userId,
                organizationId: defect.Order.Organization?.id,
                organizationName: defect.Order.Organization?.name,
                totalDefectedQuantity: 0,
                userName: defect.Order.User?.name
            });
        }

        groupedDefects.get(orderId).totalDefectedQuantity++;
    });

    return Array.from(groupedDefects.values());
}

const viewDefectDetails=async(orderId,protocol,host)=>{

    if(!orderId){  
        throw new Error("order id required");
    }

    const list = await Defect.findAll({
        where : {
            orderId : orderId
        },
        include:[{
            model : Catalog,
            attributes:['name']
        },{
            model : Washer,
            attributes:['name']
        },{
            model : Order,
            attributes:['userId']
        }]
    });

    const baseUrl = `${protocol}://${host}/uploads/`;

    const formattedList = list.map(defect=>{
        const onlyDate = defect.createdAt.toLocaleDateString('en-GB',{
                timeZone: 'Asia/Kolkata',
                day : '2-digit',
                month : 'short',
                year : 'numeric'
            });

            const onlyTime = defect.createdAt.toLocaleTimeString('en-US',{
                timeZone: 'Asia/Kolkata',
                hour:'2-digit',
                minute:'2-digit',
                hour12:true
            });
        return {
            washerName : defect.Washer.name,
            washerId : defect.washerId,
            userId : defect.Order.userId,
            itemName : defect.Catalog.name,
            status : defect.decision,
            issueDescription : defect.issueDescription,
            image : baseUrl + defect.image,
            date : onlyDate,
            time : onlyTime
        }
    })

    return formattedList;
}

module.exports={
    addDefects,
    updateStatus,
    fetchPreviousApprovals,
    defectedItems,
    viewDefectDetails
}