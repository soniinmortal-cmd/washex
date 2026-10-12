const Razorpay = require("razorpay");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createPaymentOrder = async ({
    orderId,
    amount
}) => {

    const options = {
        amount: Math.round(amount * 100), // paisa
        currency: "INR",
        receipt: `QW_${orderId}`
    };

    const order = await razorpay.orders.create(options);

    return {
        razorpayOrderId: order.id,
        amount: order.amount,
        currency: order.currency
    };
};

const crypto = require("crypto");

const razorpayWebhook = async (req, res) => {

    try {

        const webhookSignature =
            req.headers["x-razorpay-signature"];

        const expectedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_WEBHOOK_SECRET
            )
            .update(req.body)
            .digest("hex");

        if (expectedSignature !== webhookSignature) {
            return res.status(400).send("Invalid Signature");
        }

        const payload = JSON.parse(req.body.toString());

        console.log("WEBHOOK");
        console.log(payload);

        const event = payload.event;

        const razorpayOrderId =
            payload.payload.payment.entity.order_id;

        /*
        ----------------------------------------
        FIRST TRY NORMAL LAUNDRY PAYMENT
        ----------------------------------------
        */

        let payment = await Payment.findOne({
            where: {
                transactionToken: razorpayOrderId
            }
        });

        if (payment) {

            /*
            -----------------------
            PAYMENT CAPTURED
            -----------------------
            */

            if (event === "payment.captured") {

                if (payment.status === "SUCCESS") {
                    return res.sendStatus(200);
                }

                await payment.update({
                    paymentMethod: "ONLINE",
                    status: "SUCCESS"
                });

                await orderService.updatePaymentStatusAndGenerateReceipt(
                    payment.orderId,
                    "ONLINE",
                    "SUCCESS"
                );

                const order = await Order.findByPk(
                    payment.orderId
                );

                const receiptPayload =
                    await buildReceiptPayload(order);

                generateAndSaveReceipt(receiptPayload)
                    .catch(err =>
                        console.error(
                            "Receipt error:",
                            err
                        )
                    );

                await orderService.clearCart(
                    order.userId,
                    order.serviceType
                );

                return res.sendStatus(200);
            }

            /*
            -----------------------
            PAYMENT FAILED
            -----------------------
            */

            if (event === "payment.failed") {

                if (
                    payment.status === "FAILED" ||
                    payment.status === "SUCCESS"
                ) {
                    return res.sendStatus(200);
                }

                await payment.update({
                    status: "FAILED"
                });

                const order = await Order.findByPk(
                    payment.orderId
                );

                await Orderstatus.create({
                    orderId: payment.orderId,
                    userId: order.userId,
                    status: "FAILED"
                });

                return res.sendStatus(200);
            }

            return res.sendStatus(200);
        }

        /*
        ----------------------------------------
        TRY PACKAGE PURCHASE
        ----------------------------------------
        */

        const selectedPackage =
            await UserLimitPackage.findOne({
                where: {
                    transactionToken: razorpayOrderId
                }
            });

        if (!selectedPackage) {
            return res.sendStatus(200);
        }

        /*
        -----------------------
        PACKAGE SUCCESS
        -----------------------
        */

        if (event === "payment.captured") {

            if (selectedPackage.paymentStatus === "SUCCESS") {
                return res.sendStatus(200);
            }

            const packageDetails =
                await LimitPackage.findByPk(
                    selectedPackage.packageId
                );

            const expiry = new Date();

            expiry.setDate(
                expiry.getDate() +
                packageDetails.validityDays
            );

            await selectedPackage.update({
                paymentStatus: "SUCCESS",
                paymentMode: "ONLINE",
                expiresAt: expiry
            });

            return res.sendStatus(200);
        }

        /*
        -----------------------
        PACKAGE FAILED
        -----------------------
        */

        if (event === "payment.failed") {

            if (
                selectedPackage.paymentStatus === "FAILED" ||
                selectedPackage.paymentStatus === "SUCCESS"
            ) {
                return res.sendStatus(200);
            }

            await selectedPackage.update({
                paymentStatus: "FAILED"
            });

            return res.sendStatus(200);
        }

        return res.sendStatus(200);

    } catch (error) {

        console.error(error);

        return res.sendStatus(500);
    }

};

module.exports = {
    razorpayWebhook,
    createPaymentOrder
};