const express = require('express');
const router = express.Router();
const washerController = require('../controllers/washer.controller');
const defectController = require('../controllers/defect.controller');
const upload = require('../config/multer');
const washerNotificationService = require('../services/washerNotification.service');

router.get('/deleteAccount',washerController.deleteAccount);
router.post('/login',washerController.loginWasher);
router.get('/delete',washerController.deletePlayStoreWasher);
router.post('/defect',upload.single('image'),defectController.addDefects);
router.post('/nonWashable',washerController.addNonWashable);
router.post('/updateOrderstatus',washerController.updateOrderstatus);
router.post('/fetch',defectController.fetchApprovals);
router.post('/history',washerController.getOrderHistory);
router.post('/details',washerController.getOrderDetails);
router.post('/addIssue',washerController.addIssue);
router.post('/addEntry',washerController.addEntry);
router.post('/addChemical',washerController.addChemicals);
router.post('/issueHistory',washerController.issueHistory);
router.post('/issueDetails',washerController.issueDetails);
router.post('/getwashers',washerController.getWashers);
router.post('/setAttendance',washerController.setAttendance);
router.post('/lastDay',washerController.lastDaysOpening);
router.post('/universities',washerController.getListOfUniversities);
router.post('/Info',washerController.washerInfo);
router.post('/items',washerController.getItemsInOrder);
router.post('/lastChemicalOpening',washerController.lastChemicalOpening);
router.post('/washer_logout',washerController.logoutUIWasher);
router.post('/defect_washer_history',washerController.getDefectedWasherHistory);
router.post('/reset_password',washerController.resetPassword);
router.post('/chemical_dropdown',washerController.chemicalDropdown);
router.post('/list_orderid',washerController.getOrdersList);
router.post('/notifications', washerController.getNotifications);

router.post('/notification_count', washerController.getUnreadNotificationCount);

router.post('/mark_notifications_read', washerController.markNotificationRead);


router.post('/update_washer_profile',upload.single('image'),washerController.updateWasherProfile);
router.post('/nonWashableHistory',washerController.getNonWashable);


router.post('/non-university-issue',upload.single('image'),washerController.addNonUniversityIssue);
router.post('/save-fcm-token', async (req, res, next) => {
    try {
        const message = await washerNotificationService.saveWasherFcmToken(req.body);

        res.status(200).json({
            success: true,
            message
        });
    } catch (err) {
        next(err);
    }
});

router.post('/lpg/receive', washerController.addLpgReceipt);
module.exports=router;