const { User, OrderItem, Catalog, Payment } = require("../models");

const buildReceiptPayload = async (order) => {

    if (!order) {
        throw new Error("Order required");
    }

    const user = await User.findByPk(order.userId);

    if (!user) {
        throw new Error("User not found");
    }

    const items = await OrderItem.findAll({
        where: {
            orderId: order.id
        },
        include: [{
            model: Catalog,
            attributes: ["name"]
        }],
        order: [
            ["createdAt", "ASC"],
            ["id", "ASC"]
        ]
    });

    if (!items.length) {
        throw new Error("No items found");
    }

    const payment = await Payment.findOne({
        where: {
            orderId: order.id
        }
    });

    const paidServices = [
        "drycleaning",
        "paidLaundry",
        "ironing"
    ];

    const isPaidService =
        paidServices.includes(order.serviceType);

    const groupedItems = new Map();

    for (const item of items) {

        const productId = item.productId;
        const qty = Number(item.quantity || 0);
        const price = isPaidService
            ? Number(item.priceAtTime || 0)
            : "N/A";

        if (!groupedItems.has(productId)) {
            groupedItems.set(productId, {
                productId,
                name: item.Catalog?.name || "Unknown Item",
                qty: 0,
                male: 0,
                female: 0,
                price,
                total: 0
            });
        }

        const grouped = groupedItems.get(productId);

        grouped.qty += qty;

        if (item.categoryId === 1) {
            grouped.male += qty;
        } else if (item.categoryId === 2) {
            grouped.female += qty;
        }

        if (isPaidService) {
            grouped.total += qty * Number(item.priceAtTime || 0);
        }
    }

    const formattedItems = Array.from(groupedItems.values()).map((item, index) => ({
        srNo: index + 1,
        name: item.name,
        qty: item.qty,
        male: item.male,
        female: item.female,
        price: item.price,
        total: isPaidService ? item.total : "N/A"
    }));

    const amount = isPaidService
        ? Number(
            (
                Number(order.totalAmount || 0) -
                Number(order.gstAmount || 0)
            ).toFixed(2)
        )
        : "N/A";

    const gstAmount = isPaidService
        ? Number(order.gstAmount || 0)
        : "N/A";

    return {
        orderId: order.id,

        type: (order.serviceType || "N/A")
            .toUpperCase(),

        createdAt: order.createdAt,

        user: {
            name: user.name || "N/A",
            mobile: user.mobileNumber || "N/A",
            laundryNumber: user.laundryNumber || "N/A"
        },

        items: formattedItems,

        summary: {
            totalQty: formattedItems.reduce(
                (sum, item) => sum + item.qty,
                0
            ),

            amount,

            gstAmount,

            totalAmount: isPaidService
                ? Number(order.totalAmount || 0)
                : "N/A",

            paymentMethod:
                payment?.paymentMethod || "N/A",

            paymentStatus:
                payment?.status || "N/A"
        }

    };
};

module.exports = {
    buildReceiptPayload
};