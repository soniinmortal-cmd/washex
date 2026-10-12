const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const logoPath = path.join(__dirname, "washexlogo.png");
const Order = require("../models/index").Order;


async function generateAndSaveReceipt(receiptData) {

    return new Promise((resolve, reject) => {

        try {

            const itemCount = receiptData.items.length;

            const estimatedHeight =
                350 + (itemCount * 45);

            const doc = new PDFDocument({
                size: [226, estimatedHeight], // 80mm thermal width
                margin: 10
            });

            const printRow = (label, value) => {
                const LABEL_WIDTH = 12;
                const VALUE_WIDTH = 8; // adjust if needed

                doc
                    .font("SemiBold")
                    .fontSize(13)
                    .text(
                        `${label.padEnd(LABEL_WIDTH, " ")}: ${String(value).padStart(VALUE_WIDTH, " ")}`
                    );
            };

            doc.registerFont(
                "Regular",
                path.join(__dirname, "fonts", "RobotoMono-Regular.ttf")
            );

            doc.registerFont(
                "SemiBold",
                path.join(__dirname, "fonts", "RobotoMono-SemiBold.ttf")
            );

            doc.registerFont(
                "Bold",
                path.join(__dirname, "fonts", "RobotoMono-Bold.ttf")
            );

            const fileName =
                `${Date.now()}-receipt_${receiptData.orderId}.pdf`;

            const uploadDir = path.join(
                __dirname,
                "..",
                "..",
                "uploads"
            );

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, {
                    recursive: true
                });
            }

            const filePath = path.join(
                uploadDir,
                fileName
            );

            const stream =
                fs.createWriteStream(filePath);

            doc.pipe(stream);

            const divider = () => {
                doc
                    .font("SemiBold")
                    .fontSize(12)
                    .text("-------------------------");
            };

            // ==========================================
            // HEADER
            // ==========================================

            const logoWidth = 110;
            const logoHeight = 45;

            const x = (226 - logoWidth) / 2;
            const y = doc.y;

            doc.image(logoPath, x, y, {
                width: logoWidth
            });

            // Move the cursor below the logo
            doc.y = y + logoHeight + 2;

            doc.moveDown(2);

            doc
                .font("SemiBold")
                .fontSize(12)
                .text(
                    `Generated: ${new Date().toLocaleString()}`,
                    {
                        align: "center"
                    }
                );

            doc.moveDown(0.5);

            divider();

            // ==========================================
            // ORDER DETAILS
            // ==========================================

            doc
                .font("Bold")
                .fontSize(14)
                .text("ORDER DETAILS");

            doc.moveDown(0.3);

            doc
                .font("SemiBold")
                .fontSize(13);


            doc.text(
                `Customer : ${receiptData.user.name}`
            );

            doc.text(
                `Mobile   : ${receiptData.user.mobile}`
            );

            doc.text(
                `Bag Number  : ${receiptData.user.laundryNumber}`
            );

            doc.text(
                `Order ID : ${receiptData.orderId}`
            );

            doc.text(
                `Service  : ${receiptData.type}`
            );

            doc.moveDown(0.5);

            divider();

            // ==========================================
            // ITEMS
            // ==========================================

            doc
                .font("Bold")
                .fontSize(14)
                .text("ITEMS");

            doc.moveDown(0.3);

            receiptData.items.forEach((item) => {

                doc
                    .font("Bold")
                    .fontSize(13)
                    .text(item.name);

                printRow("Quantity", item.qty);

                if (item.price !== "N/A") {
                    printRow("Price", `₹${item.price}`);
                    printRow("Total", `₹${item.total}`);
                }

                doc.moveDown(0.4);
            });

            divider();

            // ==========================================
            // SUMMARY
            // ==========================================

            doc
                .font("Bold")
                .fontSize(14)
                .text("SUMMARY");

            doc.moveDown(0.3);

            printRow("Total Qty", receiptData.summary.totalQty);

            if (receiptData.summary.amount !== "N/A") {
                printRow("Amount", `₹${receiptData.summary.amount}`);
                printRow("GST (18%)", `₹${receiptData.summary.gstAmount}`);
                printRow("Total", `₹${receiptData.summary.totalAmount}`);
            }

            const paymentMethod =
                String(receiptData.summary.paymentMethod).toUpperCase() === "COD"
                    ? "Counter"
                    : receiptData.summary.paymentMethod;

            doc
                .font("SemiBold")
                .fontSize(13)
                .text(`Payment`.padEnd(12, " ") + `: ${paymentMethod}`);

            doc
                .font("SemiBold")
                .fontSize(13)
                .text(`Status`.padEnd(12, " ") + `: ${receiptData.summary.paymentStatus}`);

            doc.moveDown(0.5);

            divider();

            // ==========================================
            // PAID / UNPAID
            // ==========================================

            const isPaid =
                String(
                    receiptData.summary.paymentStatus
                ).toUpperCase() === "SUCCESS";

            doc
                .font("Bold")
                .fontSize(14)
                .text(
                    isPaid
                        ? "PAID"
                        : "UNPAID",
                    {
                        align: "center"
                    }
                );

            doc.moveDown(0.5);

            divider();

            doc.end();

            stream.on("error", reject);

            stream.on("finish", async () => {

                try {

                    const order =
                        await Order.findByPk(
                            receiptData.orderId
                        );

                    if (!order) {
                        return reject(
                            new Error(
                                "Order not found"
                            )
                        );
                    }

                  

                        await Order.update(
                            {
                                receipt_url:
                                    fileName
                            },
                            {
                                where: {
                                    id: receiptData.orderId
                                }
                            }
                        );
                    

                    resolve({
                        fileName,
                        filePath
                    });

                } catch (err) {
                    reject(err);
                }
            });

        } catch (error) {
            reject(error);
        }
    });
}

module.exports = generateAndSaveReceipt;