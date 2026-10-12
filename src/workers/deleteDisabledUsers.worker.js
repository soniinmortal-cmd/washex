const { Op } = require("sequelize");
const { User } = require("../models/user.model");
const TEST_MOBILE="8745807934";
const TEST_MOBILE_2="9865327845";

const deleteDisabledUsers = async () => {
    try {
        console.log("Running Disabled User Cleanup...");

        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const deletedCount = await User.destroy({
            where: {
                status: "disable",
                updatedAt: {
                    [Op.lte]: twelveMonthsAgo
                },
                mobileNumber: {
                    [Op.notIn]: [TEST_MOBILE, TEST_MOBILE_2]
                }
            }
        });

        console.log(`Deleted ${deletedCount} disabled users.`);
    } catch (err) {
        console.error("deleteDisabledUsers:", err);
    }
};

module.exports = {
    deleteDisabledUsers
};