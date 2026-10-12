const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const universityController = require("../controllers/university.controller");
const upload = require('../config/multer');
const multer = require('multer');

router.post(
    "/orders",
    adminController.createOrder
);

router.post("/payment/cod/success", adminController.markCodPaymentSuccess);

router.post("/users-bulk-import", adminController.bulkImportUsers);
router.post("/users-bulk-disable", adminController.bulkDisableUsers);
router.post("/mis-bulk-import", adminController.bulkImportMIS);

router.post('/login',adminController.login);
router.post('/logout', adminController.logout);
router.get('/metrics',adminController.dashboardMetrics);
router.get('/dashboardOrders',adminController.getSubmittedOrders);
router.post('/updateOrderStatus',adminController.updateOrderStatus);

router.get('/orders',adminController.getOrders);
router.get('/export-orders',adminController.getExportOrders);
router.post('/orderDetails',adminController.getOrderDetails);

router.get('/users',adminController.getAllUsers);
router.post('/deleteUser',adminController.deleteUser);
// router.post('/hardDeleteUser',adminController.hardDeleteUser);
router.post('/enableUser',adminController.enableUser);
router.post('/registerUser',adminController.register);
router.post('/updateUser',adminController.updateUserDetails);

router.get('/washersList',adminController.getWashersList);
router.post('/viewWasherMen',adminController.viewWasherMen);
router.post(
    '/addWasherMen',
    upload.fields([
        { name:'images'},
        { name:'idProofs'}
    ]),
    adminController.addWasherMen
);
router.post('/editWasherMen',upload.fields([
    { name:'image', maxCount:1 },
    { name:'idProof', maxCount:1 }
]),adminController.editWasherMen);
router.post('/deleteWasherMen',adminController.deleteWasherMen);
router.post('/enableWasherMen',adminController.enableWasherMen);

router.get('/defectedItems',adminController.defectedItems);
router.post('/defectDetails',adminController.viewDefectedDetail);

router.get(
    "/mismatchItems",
    adminController.mismatchItems
);

router.post(
    "/mismatchDetails",
    adminController.viewMismatchDetails
);

router.get(
    "/nonWashableItems",
    adminController.nonWashableItems
);

router.post(
    "/nonWashableDetails",
    adminController.viewNonWashableDetails
);

router.post('/showMis',adminController.showMis);
router.post('/showChemical',adminController.showChemical);

router.post('/mapping',adminController.mapOrgAndWasher);
router.get('/viewMapping',adminController.viewMapping);

router.post('/catalog',adminController.getCatalogAdmin);
router.post('/updateCatalog',upload.single('image'),adminController.updateCatalog);
router.post('/addCatalog',upload.array('images'),adminController.addProducts);
router.post('/update_status',adminController.updateStatus);

router.post('/editImage',upload.single('image'),adminController.editImages);
router.get('/active_bannerImages',adminController.activeBannerImages);
router.get('/inactive_bannerImages',adminController.inactiveBannerImages);
router.post('/add_bannerImage',upload.single('image'),adminController.addBannerImage);
router.post('/activate_banner',adminController.makeBannerActive);

router.get('/reset_password_requests',adminController.resetPasswordRequest);
router.post('/change_password',adminController.changePassword);
router.post('/reject_password_request',adminController.rejectPasswordChange);

router.post('/create_subadmin',adminController.createSubAdmin);
router.get('/subadmins',adminController.listSubAdmins);
router.post('/delete_subadmin',adminController.deleteSubAdmin);
router.post('/remove_permissions',adminController.removePermissions);
router.post('/permissions',adminController.viewSubAdminPermissions);
router.get('/list_permissions',adminController.listOfPermissions);
router.post('/add_permissions',adminController.addPermissions);
router.post(
    "/disableUniversity",
    adminController.disableUniversity
);
router.post(
    "/enableUniversity",
    adminController.enableUniversity
);
router.get('/universities',universityController.getAllUniversities);
router.post('/addUniversity',adminController.addOrganization);
router.post(
    "/organization",
    adminController.updateOrganization
);
router.post('/create_washer',adminController.createWasher);
router.post('/washer/status', adminController.updateWasherStatus);

router.post('/updateMisConfig',adminController.updateMisConfig);
router.get('/getMisConfig',adminController.getMisConfig);

router.post(
  "/viewAttendance",
  adminController.viewAttendanceController
);

router.post(
  "/updateAttendance",
  adminController.updateAttendanceController
);

router.post(
    '/view-packages',
    adminController.viewPackages
);

router.post(
    '/add-package',
    adminController.addPackage
);

router.post(
    '/edit-package',
    adminController.editPackage
);

router.delete(
    '/delete-package',
    adminController.deletePackage
);

router.get(
    '/nonUniversityDefectedItems',
    adminController.getNonUniversityDefectedItems
);

router.get(
    '/nonUniversityMismatchItems',
    adminController.getNonUniversityMismatchItems
);

router.get(
    '/nonUniversityNonWashableItems',
    adminController.getNonUniversityNonWashableItems
);

router.post(
    '/nonUniversityDefectDetails',
    adminController.viewNonUniversityDefectDetails
);

router.post(
    '/nonUniversityMismatchDetails',
    adminController.viewNonUniversityMismatchDetails
);

router.post(
    '/nonUniversityNonWashableDetails',
    adminController.viewNonUniversityNonWashableDetails
);


router.post(
    "/manpower-kg",
    adminController.getMonthlyManpowerKgReport
);

router.get("/receipt/:orderId",adminController.getReceiptDetails);

router.get("/organization/user/:userId", adminController.getOrganizationByUserId);

router.get(
  "/organization/laundry/:laundryNumber",
  adminController.getOrganizationByLaundryNumber
);

router.post(
    "/activate-package",
    adminController.activatePackageForUser
);

router.post('/addChemical', adminController.addChemical);

router.get('/chemicalList', adminController.getAllChemicals);

router.get('/lpg/receipts', adminController.getLpgReceipts);

module.exports = router;