const { Issue, Order, OrderItem, Washer, User, Orderstatus, Catalog, sequelize } = require("../models");
const notificationService = require('./notification.service');

const addIssue=async(orderId,items,submittedByType,submittedById)=>{

    if(!orderId || !items || !submittedById || !submittedByType){
        throw new Error("inputs not recieved");
    }

    if(typeof orderId !== 'number'){
        throw new Error("incorrect type");
    }

    const existingOrder = await Order.findOne({
        where : {
            id : orderId
        }
    });

    if(!existingOrder){
        throw new Error("no such order exists");
    }

    if(submittedByType==='USER'&&existingOrder.userId !== submittedById){
        throw new Error("This order does not belong to this user");
    }

    if(submittedByType==='WASHER'){
        const washer = await Washer.findByPk(submittedById);

        if (!washer) {
            throw new Error("Washer not found");
        }

        if (
            washer.organizationId !== existingOrder.organizationId ||
            washer.organizationType !== existingOrder.organizationType
        ) {
            throw new Error("Washer not authorized");
        }
    }

    const orderItems = await OrderItem.findAll({
        where: { orderId },
        attributes: ['productId','quantity'],
        include:[{
            model:Catalog,
            attributes:['name']
        }]
    });

    const validProductIds = new Set(orderItems.map(i => i.productId));

    const orderItemQuantityMap = {};

    orderItems.forEach(item => {

        if (!orderItemQuantityMap[item.productId]) {
            orderItemQuantityMap[item.productId] = 0;
        }

        orderItemQuantityMap[item.productId] += item.quantity;

    });

    const orderItemNameMap = {};

    orderItems.forEach(item => {

        orderItemNameMap[item.productId] =
            item.Catalog.name;

    });

    const existingIssues = await Issue.findAll({
        where: { orderId }
    });

    const existingProductIds = new Set(existingIssues.map(i => i.productId));

    const issues = [];

    for (const item of items){
        const {productId,quantity}=item;

        if (existingProductIds.has(productId)) {
            throw new Error(`Issue already exists for product ${orderItemNameMap[productId]}`);
        }

        if (!validProductIds.has(productId)) {
            throw new Error(`${orderItemNameMap[productId] || 'Product'} not part of this order`);
        }

        const submittedQuantity = orderItemQuantityMap[productId];
        console.log("submitted",submittedQuantity);
        console.log("actualQuantity",quantity);

        if (
            quantity === submittedQuantity
        ) {
            throw new Error(
                `Mismatch cannot be reported for ${orderItemNameMap[productId]}. Received quantity matches submitted quantity.`
            );
        }

        issues.push({
            orderId:orderId,
            productId:productId,
            quantity:quantity,
            issueDescription:"MISSING",
            expectedQuantity:submittedQuantity,
            submittedById,
            submittedByType
        })
    }

    await Issue.bulkCreate(issues);

    const latestStatus = await Orderstatus.findOne({
        where: { orderId },
        order: [['createdAt', 'DESC']]
    });

    if (!latestStatus || latestStatus.status !== 'ISSUE') {
        await Orderstatus.create({
            orderId,
            userId: existingOrder.userId, // or order.userId
            status: 'ISSUE'
        });
    }

    try{
            await notificationService.createNotification(
            existingOrder.userId,
            'MISMATCH',
            null,
            'Quantity Mismatch',
            `A quantity mismatch has been reported for your order ${orderId}.Your approval is required.Please refer to transactions page for more details.`
        )

        await notificationService.sendNotificationToUser(
            existingOrder.userId,
            'Quantity Mismatch',
            `A quantity mismatch has been reported for your order ${orderId}.Your approval is required.Please refer to transactions page for more details.`
        )

    }catch(err){
        console.log("error sending notification to washer",err);
    }


    


    return "issue raised successfully";
};

const issueHistory = async (id, type) => {

    if (!id) {
        throw new Error('id required');
    }

    if (!type) {
        throw new Error('user type required');
    }

    if (type !== 'USER' && type !== 'WASHER') {
        throw new Error('incorrect type');
    }

    let orders;

    if (type == 'USER') {

        orders = await Order.findAll({
            where: {
                userId: id
            },
            include: [{
                model: Issue,
                attributes: ['orderId', 'issueDescription', 'submittedByType', 'productId', 'createdAt','status']
            }, {
                model: User,
                attributes: ['studentId','laundryNumber']
            }],
            order:[['createdAt','DESC']]
        });

    } else {

        const washer = await Washer.findOne({
            where: {
                id: id
            }
        });

        if (!washer) {
            throw new Error("no such washer exists");
        }

        orders = await Order.findAll({
            where: {
                organizationId: washer.organizationId,
            },
            include: [{
                model: Issue,
                attributes: ['orderId', 'issueDescription', 'submittedByType', 'productId', 'createdAt','status']
            }, {
                model: User,
                attributes: ['studentId','laundryNumber']
            }],
            order:[['createdAt','DESC']]
        });
    }

    if (!orders) {
        throw new Error('no issue found');
    }

    const result = [];

    orders.forEach(order => {

        // skip if no issues
        if (!order.Issues || !order.Issues.length) return;

        // latest issue of that order
        const latestIssue = order.Issues.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0];

        const onlyDate = latestIssue.createdAt.toLocaleDateString('en-GB', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        const onlyTime = latestIssue.createdAt.toLocaleTimeString('en-US', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        result.push({
            orderId: latestIssue.orderId,
            status:latestIssue.status,
            studentId: order.User.studentId?order.User.studentId:"NA",
            laundryNumber:order.User.laundryNumber,
            date: onlyDate,
            time: onlyTime,
            submittedByType: latestIssue.submittedByType,
            createdAt:latestIssue.createdAt
        });

    });

    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return result;
}


const issueDetailsWasher=async(orderId,washerId,protocol,host)=>{

    if(!orderId){
        throw new Error("order id required");
    }

    if(!washerId){
        throw new Error("washer id required");
    }

    const washer = await Washer.findByPk(washerId);

    if(!washer){
        throw new Error("no washer");
    }

    const check = await Order.findOne({
        where : {
            id : orderId,
            organizationId : washer.organizationId,
            organizationType : washer.organizationType
        }
    })

    if(!check){
        throw new Error("order does not belong to this org");
    }

    const issue = await Issue.findAll({
        where : {
            orderId : orderId
        },
        attributes : ['id','orderId','productId','quantity','status','expectedQuantity'],
        include : [{
            model : Catalog,
            attributes : ['name','image']
        },{
            model : Order,
            attributes : ['serviceType'],
            include : [{
                model : OrderItem,
                attributes : [],
                where : {
                    productId : sequelize.col('Issue.productId'),
                    orderId : sequelize.col('Issue.orderId')
                },
                required : false
            }]
        }],
        group: ['Issue.id', 'Catalog.id']
    })

    if(!issue){
        throw new Error("incorrect issue id");
    }

    let totalexpected=0;
    let totalReceived=0;
    const baseUrl = `${protocol}://${host}/uploads/`;

    const formattedItems = issue.map(issue => {

        const expected = Number(issue.expectedQuantity) || 0;

        const received = issue?.quantity || 0;

        totalexpected+=expected,
        totalReceived+=received

        return {
            name: issue?.Catalog?.name,
            image : baseUrl + issue?.Catalog?.image,
            expected,
            received:received,
            missing: Number(expected - received),
            status:issue.status
        };

    });


    console.log("reached 1");
    const orderStatuses = await Orderstatus.findAll({
        where : {
            orderId : orderId
        }
    });

    let completedAt;
    let pickedAt;

    for(const s of orderStatuses){

        if(s.status==='PICKED'){
            pickedAt=new Date(s.createdAt);
        }

        if(s.status==='COMPLETED'){
            completedAt=new Date(s.createdAt);
        }

    }

    const pickedOnlyDate = pickedAt?pickedAt.toLocaleDateString('en-GB',{
        timeZone: 'Asia/Kolkata',
        day:'2-digit',
        month:'short',
        year:'numeric'
    }):"NA";

    const pickedOnlyTime = pickedAt?pickedAt.toLocaleTimeString('en-US',{
        timeZone: 'Asia/Kolkata',
        hour:'2-digit',
        minute:'2-digit',
        hour12:true
    }):"NA";

    const completedOnlyDate = completedAt?completedAt.toLocaleDateString('en-GB',{
        timeZone: 'Asia/Kolkata',
        day:'2-digit',
        month:'short',
        year:'numeric'
    }):"NA";

    const completedOnlyTime = completedAt?completedAt.toLocaleTimeString('en-US',{
        timeZone: 'Asia/Kolkata',
        hour:'2-digit',
        minute:'2-digit',
        hour12:true
    }):"NA";
    console.log("reached 2");
    return {
        orderId : issue.orderId,
        statusTimeline:{
            pickedUpDate : pickedOnlyDate,
            pickedUpTime : pickedOnlyTime,
            completedDate : completedOnlyDate,
            completedTime : completedOnlyTime
        },
        itemBreakdown: formattedItems,
        total:{
            totalExpected : totalexpected,
            totalReceived : totalReceived,
            totalMissing : Number(totalexpected-totalReceived)
        }
    }
}

const issueDetailsUser=async(orderId,userId,protocol,host)=>{

    if(!orderId){
        throw new Error("order id required");
    }

    if(!userId){
        throw new Error("user id required");
    }

    const user = await User.findByPk(userId);

    if(!user){
        throw new Error("no user");
    }

    const check = await Order.findOne({
        where : {
            id : orderId,
            userId : userId
        }
    })

    if(!check){
        throw new Error("incorrect order details");
    }

    const issue = await Issue.findAll({
        where : {
            orderId : orderId
        },
        attributes : ['id','orderId','productId','quantity','status','expectedQuantity'],
        include : [{
            model : Catalog,
            attributes : ['name','image']
        },{
            model : Order,
            attributes : ['serviceType'],
            include : [{
                model : OrderItem,
                attributes : [],
                where : {
                    productId : sequelize.col('Issue.productId'),
                    orderId : sequelize.col('Issue.orderId')
                },
                required : false
            }]
        }],
        group: ['Issue.id', 'Catalog.id']
    })

    if(!issue){
        throw new Error("incorrect issue id");
    }

    let totalexpected=0;
    let totalReceived=0;
    const baseUrl = `${protocol}://${host}/uploads/`;

    const formattedItems = issue.map(issue => {

        const expected = Number(issue.expectedQuantity) || 0;

        const received = issue?.quantity || 0;

        totalexpected+=expected,
        totalReceived+=received

        return {
            name: issue?.Catalog?.name,
            image : baseUrl + issue?.Catalog?.image,
            expected,
            received:received,
            missing: Number(expected - received),
            status:issue.status
        };

    });


    console.log("reached 1");
    const orderStatuses = await Orderstatus.findAll({
        where : {
            orderId : orderId
        }
    });

    let completedAt;
    let pickedAt;

    for(const s of orderStatuses){

        if(s.status==='PICKED'){
            pickedAt=new Date(s.createdAt);
        }

        if(s.status==='COMPLETED'){
            completedAt=new Date(s.createdAt);
        }

    }

    const pickedOnlyDate = pickedAt?pickedAt.toLocaleDateString('en-GB',{
        timeZone: 'Asia/Kolkata',
        day:'2-digit',
        month:'short',
        year:'numeric'
    }):"NA";

    const pickedOnlyTime = pickedAt?pickedAt.toLocaleTimeString('en-US',{
        timeZone: 'Asia/Kolkata',
        hour:'2-digit',
        minute:'2-digit',
        hour12:true
    }):"NA";

    const completedOnlyDate = completedAt?completedAt.toLocaleDateString('en-GB',{
        timeZone: 'Asia/Kolkata',
        day:'2-digit',
        month:'short',
        year:'numeric'
    }):"NA";

    const completedOnlyTime = completedAt?completedAt.toLocaleTimeString('en-US',{
        timeZone: 'Asia/Kolkata',
        hour:'2-digit',
        minute:'2-digit',
        hour12:true
    }):"NA";
    console.log("reached 2");
    return {
        orderId : issue.orderId,
        statusTimeline:{
            pickedUpDate : pickedOnlyDate,
            pickedUpTime : pickedOnlyTime,
            completedDate : completedOnlyDate,
            completedTime : completedOnlyTime
        },
        itemBreakdown: formattedItems,
        total:{
            totalExpected : totalexpected,
            totalReceived : totalReceived,
            totalMissing : Number(totalexpected-totalReceived)
        }
    }
}

module.exports={
    addIssue,
    issueHistory,
    issueDetailsWasher,
    issueDetailsUser
}