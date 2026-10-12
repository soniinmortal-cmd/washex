const { buildReceiptPayload } = require('../config/buildReceiptPayload');
const generateAndSaveReceipt = require('../config/generateReceipt');
const { Order } = require('../models/order.model');

const Orderstatus = require('../models/index').Orderstatus;

const createOrderStatus=async(orderId,userId, t)=>{

    if(!orderId || !userId){
        throw new Error("orderId and userId required");
    }

    if(typeof orderId !=="number"){
        throw new Error("Incorrect type");
    }

    if(typeof userId !=="number"){
        throw new Error("Incorrect type");
    }

    const orderStatus = await Orderstatus.create({
        orderId,
        userId
    },{transaction: t});

    return "created succesfully";
}


const getOrderStatus=async(userId,orderId)=>{

    if(!userId || !orderId){
        throw new Error("inputs missing");
    }

    if(typeof orderId !=="number"){
        throw new Error("Incorrect type");
    }

    if(typeof userId !=="number"){
        throw new Error("Incorrect type");
    }

    const order = await Orderstatus.findOne({
        where:{
            userId : userId,
            orderId : orderId
        },
        order: [['createdAt','DESC']]
    });

    if(!order){
        throw new Error("Incorrect inputs");
    }

    return order.status;
};

const adminOrderStatus=async(orderId,status,protocol,host)=>{
 
    if(!orderId || !status){
        throw new Error("inputs missing");
    }
 
    if(!['SUBMITTED','DENIED','COMPLETED'].includes(status.trim().toUpperCase())){
        throw new Error("invalid status");
    }
 
    const order = await Order.findByPk(orderId);
 
    if(!order){
        throw new Error("Incorrect order id");
    }
 
    await Orderstatus.create({
        orderId,
        userId : order.userId,
        status : status.trim().toUpperCase()
    });
 
    let receipt_url = null;
 
    if (status === "SUBMITTED") {
        try {
            const t2 = process.hrtime.bigint();
            const payload = await buildReceiptPayload(order);
            console.log("buildReceiptPayload:", Number(process.hrtime.bigint() - t2) / 1e6, "ms");

            const t3 = process.hrtime.bigint();

            await generateAndSaveReceipt(payload);
            console.log("generateAndSaveReceipt:", Number(process.hrtime.bigint() - t3) / 1e6, "ms");

            const t4 = process.hrtime.bigint();

            await order.reload();
            console.log("order.reload:", Number(process.hrtime.bigint() - t4) / 1e6, "ms");
 
            if(order.receipt_url){
                receipt_url = `${protocol}://${host}/uploads/${order.receipt_url}`;
            }
        } catch (err) {
            console.error("Receipt generation failed:", err);
        }
    }
 
    return {
        message: "status updated",
        receipt_url: receipt_url
    };
}
 

module.exports={
    getOrderStatus,
    createOrderStatus,
    adminOrderStatus
}