const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const feedbackController = require('../controllers/feedback.controller');
const defectController = require('../controllers/defect.controller');
const notificationController = require('../controllers/notification.controller');
const upload = require('../config/multer');
const logInMiddleware = require('../config/loginMiddleware').loginMiddleware;
const razorPayService = require('../services/razorPay.service');

router.post(
    "/payment/webhook",
    express.raw({
        type: "application/json"
    }),
    razorPayService.razorpayWebhook
);

router.post('/register',userController.register);
router.post('/send-otp',userController.sendOtp);
router.get('/deleteAccount',userController.deleteAccount);
router.get('/deleteAccountTwo',userController.deleteAccountTwo);
router.post('/resend-otp',userController.resendOtp);
router.post('/loginAndVerify-otp',userController.verifyOtp);

router.post('/update',upload.single('image'),logInMiddleware,userController.updateUserDetails);
// router.post('/feedback',logInMiddleware,feedbackController.addFeedback);
router.post('/status',logInMiddleware,defectController.updateStatus);
router.post('/getOrderStatus',logInMiddleware,userController.getOrderStatus);
router.post('/info',logInMiddleware,userController.getUserInfo);
router.post('/defectedHistory',logInMiddleware,userController.getDefectedHistory);

router.post("/payment/callback", userController.paymentCallback);
router.post("/package/payment/callback", userController.packagePaymentCallback);

router.post('/nonWashable',logInMiddleware,userController.getNonWashable);

router.post('/addIssue',logInMiddleware,userController.addIssue);
router.post('/logout',logInMiddleware,userController.logoutUI);
// router.post('/issueHistory',logInMiddleware,userController.issueHistory); TODO : modfiy later
router.post('/confirmation',logInMiddleware,userController.orderConfirmation);
router.get('/images',userController.fetchAllImages);
router.get('/packages',userController.getPackages);
router.post('/packages',userController.getPackages);
router.post('/purchase-packages',logInMiddleware,userController.purchasePackage);
router.post('/list_items',logInMiddleware,userController.getItemsInOrder);

router.post('/issueHistory',userController.issueHistory);
router.post('/issueDetails',logInMiddleware,userController.issueDetails);

router.post('/save-fcm-token',logInMiddleware,notificationController.saveFcmToken);

router.post('/notifications',logInMiddleware,notificationController.getNotifications);

router.post('/notifications_read',logInMiddleware,notificationController.markNotificationRead);

module.exports = router;