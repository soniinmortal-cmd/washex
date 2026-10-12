const userService = require('../services/user.service');
const adminService = require('../services/admin.service');
const universityService = require('../services/university.service');
const dailyEntryService = require('../services/dailyEntryService');
const chemicalService = require('../services/chemical.service');
const catalogService = require('../services/catalog.service');
const AppImageService = require('../services/appImages.service');
const washerService = require('../services/washer.service');
const orderStatusService = require('../services/orderStatus.service');
const { Order, AdminMisConfig, sequelize, Payment, User, Washer } = require('../models');
const { buildReceiptPayload } = require('../config/buildReceiptPayload');
const generateAndSaveReceipt = require('../config/generateReceipt');

const markCodPaymentSuccess = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId || isNaN(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Valid orderId is required"
            });
        }

        const order = await Order.findByPk(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const payment = await Payment.findOne({
            where: {
                orderId
            }
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment record not found"
            });
        }

        if (payment.paymentMethod !== "COD") {
            return res.status(400).json({
                success: false,
                message: "This order is not a COD order"
            });
        }

        if (payment.status === "SUCCESS") {
            return res.status(400).json({
                success: false,
                message: "COD payment is already marked as successful"
            });
        }

        payment.status = "SUCCESS";
        await payment.save();

        return res.status(200).json({
            success: true,
            message: "COD payment marked as SUCCESS"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};


const getAllUsers = async(req,res)=>{
    try{

        const protocol=req.protocol;
        const host = req.get('host');
        const organizationId = req.query.organizationId;
        const data = await userService.getAllUsers({protocol,host,organizationId});

        return res.status(200).json({
            message:"Users fetched successfully",
            status : "true",
            data : data.users
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });
        
    }
};

const dashboardMetrics = async(req,res)=>{
    try{
        const metrics = await adminService.getDashboardMetric();

        return res.status(200).json({
            message : "Dashboard metrics fetched successfully",
            status : "true",
            data : metrics
        });

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        });
    }
};

const getOrders = async(req,res)=>{
    try{

        const {
            page = 1,
            limit = 10,
            search,
            orderType,
            serviceType,
            fromDate,
            toDate,
            organizationId,
            paymentStatus
        } = req.query;
        console.log("service",serviceType);

        const orders = await adminService.getOrders(Number(page),Number(limit),search,orderType,serviceType,fromDate,toDate,organizationId,paymentStatus);

        return res.status(200).json({
            message : "Orders fetched successfully",
            status : "true",
            data : orders
        });

    }catch(error){
        return res.status(201).json({
            error : error.message,
            status : "false"
        })
    }
}

const getExportOrders = async(req,res)=>{
    try{

        const {
            search,
            serviceType,
            fromDate,
            toDate
        } = req.query;

        const orders = await adminService.getExportOrders(search,serviceType,fromDate,toDate);

        return res.status(200).json({
            message : "Orders fetched successfully",
            status : "true",
            data : orders
        });

    }catch(error){
        return res.status(201).json({
            error : error.message,
            status : "false"
        })
    }
}

const getSubmittedOrders = async(req,res)=>{
    try{

        const protocol = req.protocol;
        const host = req.get('host');
        const {
            page = 1,
            limit = 10,
            search,
            orderType,
            serviceType,
            fromDate,
            toDate,
            organizationId,
            paymentStatus
        } = req.query;

        const orders = await adminService.getSubmittedOrders(protocol,host,Number(page),Number(limit),search,orderType,serviceType,fromDate,toDate,organizationId,paymentStatus);

        return res.status(200).json({
            message : "Orders fetched successfully",
            status : "true",
            data : orders
        });

    }catch(error){
        return res.status(201).json({
            error : error.message,
            status : "false"
        })
    }
}

const getOrderDetails = async(req,res)=>{
    try{

        const orderId = req.body.orderId;

        if(!orderId){
            return res.status(201).json({
                message : "orderId required",
                status : "false"
            })
        }

        const data = await adminService.getOrderDetails(orderId);

        return res.status(200).json({
            message : "order details fetched successfully",
            status : "true",
            data : data
        });

    }catch(error){
        return res.status(201).json({
            error : error.message,
            status : "false"
        });
    }
}

const deleteUser = async(req,res)=>{

    try{

        const userId = req.body.userId;

        if(!userId){
            return res.status(201).json({
                message : "UserId required",
                status : "false"
            });
        }

        const message = await adminService.deleteUser(userId);

        return res.status(200).json({
            message : message,
            status : "true"
        })

    }catch(error){
        
        return res.status(201).json({
            message : error.message,
            status : "false"
        })

    }

}

const hardDeleteUser = async(req,res)=>{

    try{

        const userId = req.body.userId;

        if(!userId){
            return res.status(201).json({
                message : "UserId required",
                status : "false"
            });
        }

        const message = await adminService.hardDeleteUser(userId);

        return res.status(200).json({
            message : message,
            status : "true"
        })

    }catch(error){
        
        return res.status(201).json({
            message : error.message,
            status : "false"
        })

    }

}

const enableUser = async(req,res)=>{

    try{

        const userId = req.body.userId;

        if(!userId){
            return res.status(201).json({
                message : "UserId required",
                status : "false"
            });
        }

        const message = await adminService.enableUser(userId);

        return res.status(200).json({
            message : message,
            status : "true"
        })

    }catch(error){
        
        return res.status(201).json({
            message : error.message,
            status : "false"
        })

    }

}


const register=async(req,res)=>{
    try{
        const universityId = await universityService.getUniversityIdByName(req.body.universityName);

        const newUser=await userService.RegisterUser(
            universityId,
            req.body.studentId,
            req.body.name,
            req.body.mobileNumber,
            req.body.laundryNumber
        );

        return res.status(201).json({
            message:'User registered successfully',
            status:"true",
            data:newUser
        });

    }catch(error){

        return res.status(500).json({
            message:error.message,
            status:"false"
        });

    }
};

const updateUserDetails=async(req,res)=>{

    try{
        if(!req.body.userId){
            return res.status(400).json({
                message:'userId missing'
            })
        }

        if(!req.body.name && !req.body.studentId && !req.body.universityName && !req.body.mobileNumber && !req.body.laundryNumber){
            return res.status(400).json({
                message:"no input recieved"
            })
        }

        const updatedUser = await userService.updateUserDetails(req.body);
        return res.status(200).json({
            message:updatedUser,
            status:"true"
        })

    }catch(error){
        return res.status(201).json({
            message:error.message,
            status:"false"
        });
    }

}

const showMis = async(req,res)=>{

    try{

        const month = req.body.month;
        const year = req.body.year;
        const washerId = req.body.washerId;

        const data = await dailyEntryService.show(month,year,washerId);

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data : data
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        })

    }
}

const showChemical = async(req,res)=>{

    try{

        const month = req.body.month;
        const year = req.body.year;

        const data = await chemicalService.showChemical(month,year);

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data : data
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        })

    }
}

const addWasherMen = async(req,res)=>{

    try{

        let imageIndex = 0;
        let proofIndex = 0;

        const washers =
            JSON.parse(req.body.washers);

        const washerId = req.body.washerId;

        if(!washerId){
            throw new Error(
                "washer id required"
            );
        }

        if(!washers || !washers.length){
            throw new Error(
                "washer data required"
            );
        }

        const images =
            req.files.images || [];

        const idProofs =
            req.files.idProofs || [];

        const expectedImages =
            washers.filter(
                w => w.hasImage
            ).length;

        const expectedProofs =
            washers.filter(
                w => w.hasIdProof
            ).length;

        if(images.length !== expectedImages){
            throw new Error(
                'Mismatch in profile images'
            );
        }

        if(idProofs.length !== expectedProofs){
            throw new Error(
                'Mismatch in id proofs'
            );
        }

        for(const washer of washers){

            if(washer.hasImage){

                washer.image =
                    images[imageIndex].filename;

                imageIndex++;

            }else{

                washer.image = null;
            }

            if(washer.hasIdProof){

                washer.idProof =
                    idProofs[proofIndex].filename;

                proofIndex++;

            }else{

                washer.idProof = null;
            }
        }

        const message =
            await adminService.addWasherMen({
                washerId,
                washers
            });

        return res.status(200).json({
            message,
            status:"true"
        });

    }catch(error){

        return res.status(201).json({
            message:error.message,
            status:"false"
        });
    }
}
const editWasherMen = async(req,res)=>{

    try{

        const washerId = req.body.washerId;

        const data =
            JSON.parse(req.body.data);

        if(
            req.files &&
            req.files.image &&
            req.files.image[0]
        ){
            data.image =
                req.files.image[0].filename;
        }

        if(
            req.files &&
            req.files.idProof &&
            req.files.idProof[0]
        ){
            data.idProof =
                req.files.idProof[0].filename;
        }

        const message =
            await adminService
            .editWasherMen(washerId,data);

        return res.status(200).json({
            message,
            status:"true"
        });

    }catch(error){

        return res.status(201).json({
            message:error.message,
            status:"false"
        });
    }
}

const deleteWasherMen=async(req,res)=>{

    try{

        const washerId = req.body.washerId;
        const washerManId = req.body.washerManId;

        const message = await adminService.deleteWasherMen(washerId,washerManId);

        return res.status(200).json({
            message : message,
            status : "true"
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const enableWasherMen=async(req,res)=>{

    try{

        const washerId = req.body.washerId;
        const washerManId = req.body.washerManId;

        const message = await adminService.enableWasherMen(washerId,washerManId);

        return res.status(200).json({
            message : message,
            status : "true"
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const getWashersList=async(req,res)=>{

    try{

        const protocol=req.protocol;
        const host=req.get('host');
        const data = await adminService.getWashersList(protocol,host);

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data : data
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const mapOrgAndWasher=async(req,res)=>{

    try{

        const washerId = req.body.washerId;
        const organizationId = req.body.organizationId;
        const organizationType = req.body.organizationType || 'UNIVERSITY';

        const message = await adminService.mapOrgAndWasher(washerId,organizationId,organizationType);

        return res.status(200).json({
            message : message,
            status : "true"
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const viewMapping=async(req,res)=>{

    try{

        const data = await adminService.viewMapping();

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data : data
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const getCatalogAdmin=async(req,res)=>{

    try{

        const protocol = req.protocol;
        const host = req.get('host');
        const serviceType = req.body.serviceType;
        const organizationId = req.body.organizationId ?? 4;

        const list = await catalogService.getCatalogAdmin(protocol,host,serviceType,organizationId);

        return res.status(200).json({
            message : "catalog fetched successfully",
            status : "true",
            data : list
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }

}

const updateCatalog=async(req,res)=>{

    try{

        const catalogId = req.body.catalogId;
        const serviceType = req.body.serviceType;

        if(req.file){
            req.body.image=req.file.filename;
        }

        const message = await catalogService.updateCatalogAdmin(req.body);

        return res.status(200).json({
            message : message,
            status : "true"
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}


const updateStatus=async(req,res)=>{

    try{

        const catalogId = req.body.catalogId;
        const newStatus = req.body.newStatus;


        const message = await catalogService.updatestatus(catalogId,newStatus);

        return res.status(200).json({
            message : message,
            status : "true"
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}


const addProducts=async(req,res)=>{

    try{ 
        const products = JSON.parse(req.body.products);
        const expectedFiles = products.filter(p=>p.hasImage).length;

        if(!products || !products.length){
                throw new Error("product data required");
            }

        if((req.files|| []).length !== expectedFiles){
            throw new Error('mismatch between product and images');
        }

        let index = 0;

        for(const product of products){

            if(product.hasImage){

                if(!req.files[index]){
                    throw new Error('image not found for product');
                }

                product.image = req.files[index].filename;
                index++;
            }else{
                product.image=null;
            }
        }

        const message = await catalogService.addCatalogAdmin(products);

        return res.status(200).json({
            message : message,
            status : "true"
        });
    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const editImages=async(req,res)=>{

    try{
        const imageId = req.body.imageId;
        const title = req.body.title;
        const subTitle = req.body.subTitle;
        const imageUrl = req.file?.filename || null;

        const response = await AppImageService.editImages({imageId,title,subTitle,imageUrl});

        return res.status(200).json({
            message : response,
            status : "true"
        });

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        });
    }
}

const addBannerImage=async(req,res)=>{

    try{
        const name = req.body.name;
        const title = req.body.title;
        const subTitle = req.body.subTitle;
        const imageUrl = req.file.filename;

        const response = await adminService.addBannerImage(name,title,subTitle,imageUrl);

        return res.status(200).json({
            message : response,
            status : "true"
        });

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        });
    }
}

const makeBannerActive=async(req,res)=>{

    try{
        const id = req.body.id;
        const name = req.body.name;

        const response = await AppImageService.makeBannerActive(id,name);

        return res.status(200).json({
            message : response,
            status : "true"
        });

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        });
    }
}

const activeBannerImages=async(req,res)=>{

    try{
        const protocol = req.protocol;
        const host = req.get('host');
        
        const images = await adminService.activeBannerImages(protocol,host);

        return res.status(200).json({
            message : "images fetched successfully",
            status : "true",
            data : images
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const inactiveBannerImages=async(req,res)=>{

    try{
        const protocol = req.protocol;
        const host = req.get('host');
        
        const images = await adminService.inactiveBannerImages(protocol,host);

        return res.status(200).json({
            message : "images fetched successfully",
            status : "true",
            data : images
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const updateOrderStatus=async(req,res)=>{

    try{
        const orderId = req.body.orderId;
        const status = req.body.status;

        const protocol=req.protocol;
        const host = req.get('host');

        const message = await orderStatusService.adminOrderStatus(orderId, status,protocol,host);

        return res.status(200).json({
            message : message,
            status : "true"
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}


const resetPasswordRequest=async(req,res)=>{

    try{

        const protocol = req.protocol;
        const host = req.get('host');

        const list = await adminService.resetPasswordRequests(protocol,host);

        return res.status(200).json({
            message : "reset password requests fetched successfully",
            status : "true",
            data : list
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }

}

const changePassword=async(req,res)=>{

    try{

        const washerId = req.body.washerId;
        const oldPassword = req.body.oldPassword;
        const newPassword = req.body.newPassword;

        const message = await adminService.changePassword(washerId,oldPassword,newPassword);

        return res.status(200).json({
            message : message,
            status : "true"
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const rejectPasswordChange=async(req,res)=>{

    try{

        const washerId = req.body.washerId;

        const response = await adminService.rejectPasswordRequest(washerId);

        return res.status(200).json({
            message : response,
            status : "true"
        });
    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        })
    }
}

const viewWasherMen = async(req,res)=>{

    try{

        const washerId = req.body.washerId;
        const protocol = req.protocol;
        const host = req.get('host');

        const data = await adminService.viewWasherMen(washerId,protocol,host);

        return res.status(200).json({
            message : "washer men fetched successfully",
            status : "true",
            data : data
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const defectedItems = async(req,res)=>{

    try{

        const data = await adminService.defectedItems();

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data : data
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status:"false"
        });

    }
}

const viewDefectedDetail = async(req,res)=>{

    try{

        const orderId = req.body.orderId;
        if(!orderId){
            return res.status(201).json({
                message:"id required",
                status : "false"
            })
        }

        const check = await Order.findByPk(orderId);
        if(!check){
            return res.status(201).json({
                message:"incorrect id",
                status : "false"
            })
        }
        const protocol=req.protocol;
        const host = req.get('host');

        const data = await adminService.viewDefectedDetails(orderId,protocol,host);

        return res.status(200).json({
            message : "fetched successfully",
            status : "true",
            data : data
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const viewSubAdminPermissions=async(req,res)=>{

    try{

        const subAdminId = req.body.subAdminId;
        const data = await adminService.viewSubAdminPermissions(subAdminId);
        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data : data
         });


    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        });
    }
}

const listOfPermissions=async(req,res)=>{

    try{

        const data = await adminService.listOfPermissions();

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data : data
        })

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        });
    }
}

const addPermissions = async(req,res)=>{

    try{

        const subAdminId = req.body.subAdminId;
        if(!subAdminId){
            throw new Error("id required");
        }
        const permissions = req.body.permissions;
        if(!permissions || permissions.length==0){
            throw new Error("permissions required");
        }

        const message = await adminService.addPermissions(subAdminId,permissions);
        return res.status(200).json({
            message : message,
            status : "true"
        });
    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        });
    }
}


const createWasher = async(req,res)=>{

    try{
        const name = req.body.name;
        const loginId = req.body.loginId;
        const password = req.body.password;
        const organizationId = req.body.organizationId;
        const organizationType = "UNIVERSITY";

        const response = await washerService.createWasher(name,loginId,password,organizationId,organizationType);

        return res.status(200).json({
            message : response,
            status : "true"
        });

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status:"false"
        })
    }
}

const updateMisConfig = async(req,res)=>{

    const t = await sequelize.transaction();

    try{

        const { washerId, configs } = req.body;

        if(!washerId){
            throw new Error("washer id required");
        }

        if(!configs || !Array.isArray(configs) || !configs.length){
            throw new Error("configs required");
        }

        const validTypes = [
            'ELECTRICITY_PRICE',
            'ELECTRICITY_MF',
            'GAS_PRICE',
            'GAS_MF',
            'LPG_PRICE',
            'LPG_MF'
        ];

        for(const config of configs){

            if(
                !config.type ||
                config.value == null
            ){
                throw new Error("invalid config");
            }

            if(!validTypes.includes(config.type)){
                throw new Error("invalid config type");
            }

            if(Number(config.value) <= 0){
                throw new Error("invalid config value");
            }

            await AdminMisConfig.upsert({
                washerId,
                type:config.type,
                value:Number(config.value)
            },{ transaction:t });
        }

        await t.commit();

        return res.status(200).json({
            status:"true",
            message:"mis config updated"
        });

    }catch(err){

        await t.rollback();

        return res.status(500).json({
            status:"false",
            message:err.message
        });
    }
}

const getMisConfig = async(req,res)=>{

    try{

        const configs = await AdminMisConfig.findAll({
            attributes:[
                'washerId',
                'type',
                'value'
            ],
            order:[
                ['washerId','ASC'],
                ['type','ASC']
            ]
        });

        const groupedConfigs = configs.reduce((acc,item)=>{

            if(!acc[item.washerId]){
                acc[item.washerId]=[];
            }

            acc[item.washerId].push({
                type:item.type,
                value:Number(item.value)
            });

            return acc;

        },{});

        return res.status(200).json({
            status:"true",
            data:groupedConfigs
        });

    }catch(err){

        return res.status(500).json({
            status:"false",
            message:err.message
        });
    }
}

const viewAttendanceController =
  async (req,res) => {

    try{

      const {
        washerId,
        date
      } = req.body;

      if(!washerId || !date){

        return res.status(400).json({
          status:false,
          message:
            "washerId and date are required"
        });

      }

      const data =
        await adminService.viewAttendance(
          washerId,
          date
        );

      return res.status(200).json({
        status:true,
        message:
          "attendance fetched successfully",
        data
      });

    }catch(error){

      console.log(
        "view attendance error",
        error
      );

      return res.status(500).json({
        status:false,
        message:error.message
      });

    }
  };

const updateAttendanceController =
  async (req,res) => {

    try{

      const {
        washerId,
        washerManId,
        date,
        status
      } = req.body;

      if(
        !washerId ||
        !washerManId ||
        !date ||
        !status
      ){

        return res.status(400).json({
          status:false,
          message:
            "washerId, washerManId, date and status are required"
        });

      }

      if(
        !["PRESENT","ABSENT"]
          .includes(status)
      ){

        return res.status(400).json({
          status:false,
          message:
            "invalid attendance status"
        });

      }

      const message =
        await adminService.updateAttendance(
          washerId,
          washerManId,
          date,
          status
        );

      return res.status(200).json({
        status:true,
        message
      });

    }catch(error){

      console.log(
        "update attendance error",
        error
      );

      return res.status(500).json({
        status:false,
        message:error.message
      });

    }
  };

const viewPackages = async(req,res)=>{

    try{
        const organizationId = req.body.organizationId;
        const data = await adminService.viewPackages(organizationId);

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data
        })

    }catch(error){
        return res.status(201).json({
            message:error.message,
            status :"false"
        })
    }
}

const addPackage = async(req,res)=>{

    try{

        const {
            organizationId,
            name,
            extraLimit,
            price,
            validityDays,
            distributionType
        } = req.body;

        const data = await adminService.addPackage(
            organizationId,
            name,
            extraLimit,
            price,
            validityDays,
            distributionType
        );

        return res.status(200).json({
            message : data,
            status : "true"
        });

    }catch(error){

        return res.status(500).json({
            message : error.message,
            status : "false"
        });

    }

};

const editPackage = async(req,res)=>{

    try{

        const {
            packageId,
            name,
            extraLimit,
            price,
            validityDays,
            distributionType
        } = req.body;
        console.log(distributionType);

        const data = await adminService.editPackage(
            packageId,
            name,
            extraLimit,
            price,
            validityDays,
            distributionType
        );

        return res.status(200).json({
            message : data,
            status : "true"
        });

    }catch(error){

        return res.status(500).json({
            message : error.message,
            status : "false"
        });

    }

};

const deletePackage = async(req,res)=>{

    try{

        const { packageId } = req.body;

        const data = await adminService.deletePackage(
            packageId
        );

        return res.status(200).json({
            message : data,
            status : "true"
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }

};

const mismatchItems = async(req,res)=>{
    try{

        const response =
        await adminService.mismatchItems();

        return res.status(200).json({
            message:"mismatch items fetched successfully",
            status:"true",
            data:response
        });

    }catch(error){

        return res.status(400).json({
            message:error.message,
            status:"false"
        });

    }
}

const viewMismatchDetails = async(req,res)=>{
    try{

        const { orderId } = req.body;

        const response =
        await adminService.viewMismatchDetails(
            orderId,
            req.protocol,
            req.get("host")
        );

        return res.status(200).json({
            message:"mismatch details fetched successfully",
            status:"true",
            data:response
        });

    }catch(error){

        return res.status(400).json({
            message:error.message,
            status:"false"
        });

    }
}

const nonWashableItems = async(req,res)=>{
    try{

        const response =
        await adminService.nonWashableItems();

        return res.status(200).json({
            message:"non washable items fetched successfully",
            status:"true",
            data:response
        });

    }catch(error){

        return res.status(400).json({
            message:error.message,
            status:"false"
        });

    }
}

const viewNonWashableDetails = async(req,res)=>{
    try{

        const { orderId } = req.body;

        const response =
        await adminService.viewNonWashableDetails(
            orderId,
            req.protocol,
            req.get("host")
        );

        return res.status(200).json({
            message:"non washable details fetched successfully",
            status:"true",
            data:response
        });

    }catch(error){

        return res.status(400).json({
            message:error.message,
            status:"false"
        });

    }
}

const getNonUniversityDefectedItems =
async (req, res) => {

    try {

        const data =
        await adminService
            .getNonUniversityDefectedItems();

        return res.status(200).json({
            status: true,
            data
        });

    } catch (error) {

        console.log(
            "error fetching non university defects",
            error
        );

        return res.status(500).json({
            status: false,
            message: error.message
        });

    }

};

const getNonUniversityMismatchItems =
async (req, res) => {

    try {

        const data =
        await adminService
            .getNonUniversityMismatchItems();

        return res.status(200).json({
            status: true,
            data
        });

    } catch (error) {

        console.log(
            "error fetching non university mismatches",
            error
        );

        return res.status(500).json({
            status: false,
            message: error.message
        });

    }

};

const getNonUniversityNonWashableItems =
async (req, res) => {

    try {

        const data =
        await adminService
            .getNonUniversityNonWashableItems();

        return res.status(200).json({
            status: true,
            data
        });

    } catch (error) {

        console.log(
            "error fetching non university non washable items",
            error
        );

        return res.status(500).json({
            status: false,
            message: error.message
        });

    }

};

const viewNonUniversityDefectDetails =
async (req, res) => {

    try {

        const {
            defectId
        } = req.body;

        const data =
        await adminService
            .viewNonUniversityDefectDetails(
                defectId,
                req.protocol,
                req.get("host")
            );

        return res.status(200).json({
            status: true,
            data
        });

    } catch (error) {

        console.log(
            "error fetching non university defect details",
            error
        );

        return res.status(500).json({
            status: false,
            message: error.message
        });

    }

};

const viewNonUniversityMismatchDetails =
async (req, res) => {

    try {

        const {
            mismatchId
        } = req.body;

        const data =
        await adminService
            .viewNonUniversityMismatchDetails(
                mismatchId
            );

        return res.status(200).json({
            status: true,
            data
        });

    } catch (error) {

        console.log(
            "error fetching non university mismatch details",
            error
        );

        return res.status(500).json({
            status: false,
            message: error.message
        });

    }

};

const viewNonUniversityNonWashableDetails =
async (req, res) => {

    try {

        const {
            nonWashableId
        } = req.body;

        const data =
        await adminService
            .viewNonUniversityNonWashableDetails(
                nonWashableId
            );

        return res.status(200).json({
            status: true,
            data
        });

    } catch (error) {

        console.log(
            "error fetching non university non washable details",
            error
        );

        return res.status(500).json({
            status: false,
            message: error.message
        });

    }

};

const login = async(req,res)=>{

    try{

        const {
            loginId,
            password
        } = req.body;

        const data =
            await adminService.login(
                loginId,
                password
            );

        return res.status(200).json({
            status:true,
            message:'login successful',
            ...data
        });

    }catch(error){

        return res.status(201).json({
            status:false,
            message:error.message
        });
    }
}

const createSubAdmin = async(req,res)=>{

    try{

        const {
            loginId,
            password,
            organizationId
        } = req.body;

        const message =
            await adminService.createSubAdmin(
                loginId,
                password,
                organizationId
            );

        return res.status(200).json({
            status:true,
            message
        });

    }catch(error){

        return res.status(201).json({
            status:false,
            message:error.message
        });

    }

};



const listSubAdmins = async(req,res)=>{

    try{

        const data =
            await adminService.listSubAdmins();

        return res.status(200).json({
            status:true,
            message:'data fetched successfully',
            data
        });

    }catch(error){

        return res.status(201).json({
            status:false,
            message:error.message
        });

    }

};



const deleteSubAdmin = async(req,res)=>{

    try{

        const {
            subAdminId
        } = req.body;

        const message =
            await adminService.deleteSubAdmin(
                subAdminId
            );

        return res.status(200).json({
            status:true,
            message
        });

    }catch(error){

        return res.status(201).json({
            status:false,
            message:error.message
        });

    }

};



const removePermissions = async(req,res)=>{

    try{

        const {
            subAdminId,
            permissions
        } = req.body;

        const message =
            await adminService.removePermissions(
                subAdminId,
                permissions
            );

        return res.status(200).json({
            status:true,
            message
        });

    }catch(error){

        return res.status(201).json({
            status:false,
            message:error.message
        });

    }

};

const addOrganization = async (req, res, next) => {
    try {
        const { name, type, monthlyFreeLimit } = req.body;

        const organization = await adminService.addOrganization({
            name,
            type:'UNIVERSITY',
            monthlyFreeLimit
        });

        return res.status(201).json({
            success: true,
            message: "Organization added successfully",
            data: organization
        });
    } catch (err) {
        next(err);
    }
};

const updateOrganization = async (req, res, next) => {
    try {
        const { organizationId, name, monthlyFreeLimit } = req.body;

        await adminService.updateOrganization({
            organizationId,
            name,
            monthlyFreeLimit
        });

        return res.status(200).json({
            success: true,
            message: "Organization updated successfully."
        });
    } catch (err) {
        next(err);
    }
};

const getMonthlyManpowerKgReport = async (req, res) => {
    try {
        const { month,washerId } = req.body;
        
        const data = await adminService.getMonthlyManpowerKgReport(month,washerId);

        return res.status(200).json({
            success: true,
            message: "Report fetched successfully.",
            data
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const logout = async (req, res) => {

    try {

        const message = await adminService.logout();

        return res.status(200).json({
            status: true,
            message
        });

    } catch (error) {

        return res.status(500).json({
            status: false,
            message: error.message
        });

    }

};

const bulkImportUsers = async (req, res) => {
    try {
        const { users } = req.body;

        if (!users || !Array.isArray(users)) {
            return res.status(400).json({
                success: false,
                message: "users array is required"
            });
        }

        const result = await adminService.bulkImportUsers(users);

        return res.status(200).json({
            success: true,
            message: "Bulk import completed",
            data: result
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

const bulkDisableUsers = async (req, res) => {
    try {
        const { users } = req.body;

        if (!users || !Array.isArray(users)) {
            return res.status(400).json({
                success: false,
                message: "users array is required"
            });
        }

        const result = await adminService.bulkDisableUsers(users);

        return res.status(200).json({
            success: true,
            message: "Bulk disable completed",
            data: result
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

const disableUniversity = async (req, res, next) => {
    try {
        const { organizationId } = req.body;

        await adminService.disableUniversity(organizationId);

        return res.status(200).json({
            success: true,
            message: "University disabled successfully."
        });

    } catch (err) {
        next(err);
    }
};

const bulkImportMIS = async (req, res) => {

    try {

        const { entries } = req.body;

        if (!entries || !Array.isArray(entries)) {
            return res.status(400).json({
                success: false,
                message: "entries array is required"
            });
        }

        const result = await adminService.bulkImportMIS(entries);

        return res.status(200).json({
            success: true,
            message: "MIS data imported successfully.",
            data: result
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });

    }

};

const createOrder = async (req, res) => {

    const {
        userId,
        serviceType,
        paymentMethod,
        items
    } = req.body;

    if (!userId || !serviceType || !items) {
        return res.status(400).json({
            status: false,
            message:
                "userId, serviceType and items are required"
        });
    }

    const t = await sequelize.transaction();

    let data;
    let orderId;

    try {

        data =
            await adminService.createAdminOrder(
                userId,
                serviceType,
                paymentMethod,
                items,
                t
            );

        orderId = data.orderId;

        await orderStatusService.createOrderStatus(
            orderId,
            userId,
            t
        );

        await t.commit();

    } catch (error) {

        await t.rollback();

        return res.status(400).json({
            status: false,
            message: error.message
        });

    }

    return res.status(200).json({
        status: true,
        message: "Order created successfully",
        data
    });

};

const enableUniversity = async (req, res, next) => {
    try {
        const { organizationId } = req.body;

        await adminService.enableUniversity(organizationId);

        return res.status(200).json({
            success: true,
            message: "University enabled successfully."
        });

    } catch (err) {
        next(err);
    }
};

const getReceiptDetails = async (req, res) => {
    const totalStart = process.hrtime.bigint();
    try {
        const { orderId } = req.params;

        if (!orderId || isNaN(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid orderId"
            });
        }

        const order = await Order.findByPk(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const receiptStart = process.hrtime.bigint();

        const receiptPayload = await buildReceiptPayload(order);

        const receiptEnd = process.hrtime.bigint();
        console.log(
            `buildReceiptPayload took ${(
                Number(receiptEnd - receiptStart) / 1_000_000
            ).toFixed(2)} ms`
        );

        return res.status(200).json({
            success: true,
            message: "Receipt details fetched successfully",
            data: receiptPayload
        });

    } catch (error) {
        console.error("Get Receipt Details Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }finally {
        const totalEnd = process.hrtime.bigint();
        console.log(
            `getReceiptDetails total execution: ${(
                Number(totalEnd - totalStart) / 1_000_000
            ).toFixed(2)} ms`
        );
    }
};

// Get organizationId by userId
const getOrganizationByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({
      where: { id: userId },
      attributes: ["organizationId"],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      organizationId: user.organizationId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get organizationId by laundryNumber
const getOrganizationByLaundryNumber = async (req, res) => {
  try {
    const { laundryNumber } = req.params;

    const user = await User.findOne({
      where: { laundryNumber },
      attributes: ["organizationId"],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Laundry number not found",
      });
    }

    return res.status(200).json({
      success: true,
      organizationId: user.organizationId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const activatePackageForUser = async (req, res, next) => {
    try {
        const { laundryNumber, packageId, startDate } = req.body;

        const data = await adminService.activatePackageByAdmin(
            laundryNumber,
            packageId,
            startDate
        );

        return res.status(200).json({
            success: true,
            data:data,
            message:"Package activated successfully"
        });

    } catch (error) {
        return next(error);
    }
};

const addChemical = async (req, res) => {
    try {

        const data = await adminService.addChemical(req.body);

        return res.status(200).json({
            status: "true",
            message: data
        });

    } catch (error) {

        return res.status(500).json({
            status: "false",
            message: error.message
        });

    }
};


const getAllChemicals = async (req, res) => {
    try {

        const data = await adminService.getAllChemicals();

        return res.status(200).json({
            status: "true",
            message: "chemicals fetched successfully",
            data: data
        });

    } catch (error) {

        return res.status(500).json({
            status: "false",
            message: error.message
        });

    }
};

const getLpgReceipts = async (req, res) => {

    try {

        const {
            month,
            year
        } = req.query;

        const data = await adminService.getLpgReceipts(
            Number(month),
            Number(year)
        );

        return res.status(200).json({
            status: "true",
            message: "LPG receipts fetched successfully",
            data
        });

    } catch (error) {

        return res.status(500).json({
            status: "false",
            message: error.message
        });

    }
};

const updateWasherStatus = async (req, res, next) => {
    try {
        const { washerId, isActive } = req.body;

        const washer = await Washer.findByPk(washerId);

        if (!washer) {
            return res.status(404).json({
                message: "Washer not found"
            });
        }

        washer.isActive = isActive;
        await washer.save();

        return res.status(200).json({
            message: "Washer status updated successfully",
            washer
        });

    } catch (error) {
        next(error);
    }
};



module.exports={
    updateWasherStatus,
    getLpgReceipts,
    addChemical,
    getAllChemicals,
    activatePackageForUser,
    getOrganizationByUserId,
    getOrganizationByLaundryNumber,
    markCodPaymentSuccess,
    getReceiptDetails,
    hardDeleteUser,
    enableUniversity,
    createOrder,
    bulkImportMIS,
    bulkImportUsers,
    disableUniversity,
    logout,
    getMonthlyManpowerKgReport,
    updateOrganization,
    getAllUsers,
    dashboardMetrics,
    getOrders,
    getExportOrders,
    getOrderDetails,
    deleteUser,
    register,
    updateUserDetails,
    showMis,
    showChemical,
    addWasherMen,
    editWasherMen,
    deleteWasherMen,
    getWashersList,
    mapOrgAndWasher,
    viewMapping,
    getCatalogAdmin,
    updateCatalog,
    addProducts,
    editImages,
    getSubmittedOrders,
    activeBannerImages,
    inactiveBannerImages,
    updateOrderStatus,
    resetPasswordRequest,
    changePassword,
    viewWasherMen,
    defectedItems,
    viewDefectedDetail,
    viewSubAdminPermissions,
    listOfPermissions,
    addPermissions,
    enableUser,
    rejectPasswordChange,
    enableWasherMen,
    updateStatus,
    addBannerImage,
    makeBannerActive,
    createWasher,
    updateMisConfig,
    getMisConfig,
    viewAttendanceController,
    updateAttendanceController,
    viewPackages,
    editPackage,
    addPackage,
    deletePackage,
    mismatchItems,
    viewMismatchDetails,
    nonWashableItems,
    viewNonWashableDetails,
    getNonUniversityDefectedItems,
    getNonUniversityMismatchItems,
    getNonUniversityNonWashableItems,
    viewNonUniversityDefectDetails,
    viewNonUniversityMismatchDetails,
    viewNonUniversityNonWashableDetails,
    login,
    createSubAdmin,
    listSubAdmins,
    deleteSubAdmin,
    removePermissions,
    addOrganization,
    bulkDisableUsers
}