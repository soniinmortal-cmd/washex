const { QueryTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
//const { Orderstatus } = require("../models/orderstatus.model");
const { Orderstatus } = require("../models/orderStatus.model");

const denyExpiredCODOrders = async () => {
    try {
        const expiredOrders = await sequelize.query(
            `
            SELECT
                o.id AS orderId,
                o.userId
            FROM orders o
            INNER JOIN payments p
                ON p.orderId = o.id
            INNER JOIN (
                SELECT os1.orderId, os1.status
                FROM orderStatus os1
                INNER JOIN (
                    SELECT orderId, MAX(createdAt) AS latestCreatedAt
                    FROM orderStatus
                    GROUP BY orderId
                ) latest
                ON latest.orderId = os1.orderId
                AND latest.latestCreatedAt = os1.createdAt
            ) latestStatus
                ON latestStatus.orderId = o.id
            WHERE
                o.serviceType IN ('drycleaning', 'paidLaundry', 'ironing')
                AND p.paymentMethod = 'COD'
                AND p.status = 'PENDING'
                AND o.createdAt <= DATE_SUB(NOW(), INTERVAL 24 HOUR)
                AND latestStatus.status NOT IN ('DENIED', 'COMPLETED', 'FAILED')
            `,
            {
                type: QueryTypes.SELECT,
            }
        );

        if (!expiredOrders.length) {
            console.log("No expired COD orders found.");
            return;
        }

        await Orderstatus.bulkCreate(
            expiredOrders.map((order) => ({
                orderId: order.orderId,
                userId: order.userId,
                status: "DENIED",
            }))
        );

        console.log(
            `${expiredOrders.length} expired COD orders marked as DENIED.`
        );
    } catch (error) {
        console.error("denyExpiredCODOrders Worker Error:", error);
    }
};

module.exports = {
    denyExpiredCODOrders,
};