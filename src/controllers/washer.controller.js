const washerService = require('../services/washer.service');
const orderstatusService = require('../services/orderStatus.service');
const { sequelize, Washer } = require('../models');
const issueService = require('../services/issue.service');
const dailyEntryService = require('../services/dailyEntryService');
const chemicalService = require('../services/chemical.service');
const washerNotificationService =
    require("../services/washerNotification.service");

const TEST_WASHER_LOGIN = "testerwasher";

const deleteAccount = async (req, res) => {
        return res.status(200).json({
            status: true,
            message: "Account deleted successfully."
        });
};

const deletePlayStoreWasher = async (req, res) => {
    try {
        const washer = await Washer.findOne({
            where: {
                loginId: TEST_WASHER_LOGIN
            }
        });

        if (!washer) {
            return res.status(404).json({
                status: false,
                message: "Play Store tester not found"
            });
        }

        await washer.destroy();

        return res.status(200).json({
            status: true,
            message: "Play Store tester deleted successfully."
        });

    } catch (err) {
        return res.status(500).json({
            status: false,
            message: err.message
        });
    }
};

const loginWasher=async(req,res)=>{

    try{
        const loginId = (req.body.loginId).trim();

        const password = (req.body.password).trim();


        if(!loginId || !password){
            return res.status(400).json({
                message:"id and password required"
            });
        }

        const data = await washerService.loginWasher(loginId,password);

        return res.status(200).json({
            message:"logged in successfully",
            status:"true",
            data : data
        });

    }catch(error){
        return res.status(201).json({
            message:error.message,
            status:"false"
        });
    }

};

const updateOrderstatus=async(req,res)=>{
    try{

        const orderId = req.body.orderId;
        const status = req.body.status.toUpperCase();

        if(!orderId || !status){
            return res.status(400).json({
                message:"inputs missing"
            })
        }

        const update = await orderstatusService.updateOrderstatus(orderId,status);

        return res.status(200).json({
            message : update,
            status : "true"
        });

    }catch(error){
        return res.status(201).json({
            message:error.message,
            status:"false"
        });
    }
}

const getOrderHistory = async(req,res)=>{
    try{

        const washerId = req.body.washerId;

        const filter = req.body.filter;

        const data = await washerService.getOrders(washerId,filter);

        return res.status(200).json({
            message : "orders fetched succesfully",
            status : "true",
            data : data
        })

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        })
    }
}

const getOrderDetails = async (req,res)=>{
    try{
        const washerId = req.body.washerId;

        const orderId = req.body.orderId;

        const protocol = req.protocol;

        const host = req.get('host');

        const data = await washerService.getOrderDetails(washerId,orderId,protocol,host);

        return res.status(200).json({
            message : "order details fetched successfully",
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

const addNonWashable=async(req,res)=>{

    try{

        const washerId = req.body.washerId;
        const orderId = req.body.orderId;
        const itemName = req.body.itemName;
        const issueDescription = req.body.issueDescription;

        if(!washerId || !orderId || !itemName || !issueDescription){
            return res.status(201).json({
                message:"Inputs missing",
                status:"false"
            });
        }

        const nonWashable = await washerService.addNonWashable(washerId,orderId,itemName,issueDescription);

        return res.status(200).json({
            message:nonWashable,
            status : "true"
        });

    }catch(error){

        return res.status(201).json({
            message:error.message,
            status:"false"
        });

    }

};

const addIssue=async(req,res)=>{
    try{
        const {orderId,items,washerId} =req.body;
        const submittedByType = 'WASHER';

        await issueService.addIssue(orderId,items,submittedByType,washerId);
        

        return res.status(200).json({
            message : "issue raised successfully",
            status : "true"
        })

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        })
    }
};

const addEntry = async(req,res)=>{
    const t = await sequelize.transaction();

    try{
        await dailyEntryService.addEntry(req.body,t);
        await t.commit();
        return res.status(200).json({
            message:"entry added",
            status:"true"
        })
    }catch(error){
        await t.rollback();

        return res.status(201).json({
            message : error.message,
            status : false
        })
    }
};

const lastDaysOpening = async(req,res)=>{

    try{

        const washerId = req.body.washerId;

        const date = req.body.date;

        const data = await dailyEntryService.lastDaysOpening(washerId,date);

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


const addChemicals = async(req,res)=>{

    try{

        await chemicalService.addChemicals(req.body);

        return res.status(200).json({
            message : "list updated successfully",
            status : "true"
        });

    }catch(error){

        console.error("Error in addChemicals:", error);

        return res.status(201).json({
            message : error.message,
            status : "false"
        })

    }

}

const issueHistory=async(req,res)=>{

    try{

        const id = req.body.washerId;

        const data = await issueService.issueHistory(id,"WASHER");

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data
        })

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        })
    }
}

const issueDetails=async(req,res)=>{

    try{

        const orderId = req.body.orderId;

        const washerId = req.body.washerId;

        const protocol = req.protocol;

        const host = req.get('host');

        const data = await issueService.issueDetailsWasher(orderId,washerId,protocol,host);

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }
}

const getWashers=async(req,res)=>{

    try{

        const washerId = req.body.washerId;
        const Date = req.body.Date

        const result = await washerService.getWashers(washerId,Date);

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            //data : data
			total_present: result.total_present,
			total_absent: result.total_absent,
			data: result.data 
        });

    }catch(error){

        return res.status(201).json({
            message : error.message,
            status : "false"
        });

    }

}

const setAttendance=async(req,res)=>{

    try{

        const washerId = req.body.washerId;
        const washers = req.body.washers;
        const date = req.body.date;

        const message = await washerService.setAttendance(washerId,date,washers);

        return res.status(200).json({
            message : message,
            status : "true"
        });

    }catch(error){

        return res.status(201).json({
            message:error.message,
            status:"false"
        });

    }

}

const getListOfUniversities=async(req,res)=>{

    try{

        const type = req.body.type;

        const data = await washerService.getListOfUniversities(type);

        return res.status(200).json({
            message : "data fetched successfully",
            status : "true",
            data : data
        });

    }catch(error){

        return res.status(201).json({
            message:error.message,
            status:"false"
        });

    }
}

const washerInfo=async(req,res)=>{

    try{

        const washerId = req.body.washerId;
		const protocol=req.protocol;
        const host = req.get('host');

        const data = await washerService.getWasherInfo(washerId, protocol, host);

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

const getItemsInOrder=async(req,res)=>{

    try{

        const orderId = req.body.orderId;

        const data = await washerService.getItemsInOrder(orderId);

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

const lastChemicalOpening=async(req,res)=>{

    try{

        const washerId = req.body.washerId;
        const month = req.body.month;
        const year = req.body.year;

        const data = await washerService.lastChemicalOpening(washerId,month,year);

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


const logoutUIWasher=async(req,res)=>{

    try{
        const washerId = req.body.washerId;
        const message = await washerService.logoutUIWasher(washerId);
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

const getDefectedWasherHistory=async(req,res)=>{
    try{
        const washerId = req.body.washerId;
        const status = req.body.status;
        const protocol=req.protocol;
        const host = req.get('host');
        const normalizedstatus = status.trim().toLowerCase();

        const data = await washerService.getDefectedWasherHistory(washerId,normalizedstatus,protocol,host);
        return res.status(200).json({
            message : "data fetched succesfully",
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



const updateWasherProfile=async(req,res)=>{

    try{
        if(!req.body.washerId){
            return res.status(201).json({
                message:'washerId missing'
            })
        }

        if(!req.body.name){
            return res.status(201).json({
                message:'name missing'
            })
        }

        if(req.file){
            const image = req.file.filename;
            req.body.image = image;
        }

        const updatedWasher = await washerService.updateWasherProfile(req.body);
        return res.status(200).json({
            message:updatedWasher,
            status:"true"
        })

    }catch(error){
        return res.status(201).json({
            message:error.message,
            status:"false"
        });
    }

}

const resetPassword=async(req,res)=>{

    try{

        const washerId = req.body.washerId;

        const message = await washerService.resetPassword(washerId);

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

const chemicalDropdown=async(req,res)=>{

    try{

        const { washerId } = req.body;

        if (!washerId) {
            return res.status(400).json({
                message: "washer id required",
                status: "false"
            });
        }

        const data = await chemicalService.chemicalDropdown(washerId);

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

const getOrdersList=async(req,res)=>{

    try{

        const laundryBagNumber = req.body.laundryBagNumber;

        const data = await washerService.getOrdersList(laundryBagNumber);

        return res.status(200).json({
            message : "list fetched succesfully",
            status:"true",
            data:data
        });

    }catch(error){
        return res.status(201).json({
            message : error.message,
            status : "false"
        })
    }
}

const getNonWashable=async(req,res)=>{
    try{
        console.log(req.body);
        const washerId = req.body.washerId;
       

        const data = await washerService.getNonWashable(washerId);
        return res.status(200).json({
            message : "data fetched succesfully",
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

const addNonUniversityIssue =
async (req,res) => {

    try {

        const washerId = req.user.id;

        const {
            type,
            referenceNumber,
            itemName,
            issueDescription,
            items
        } = req.body;
        let image;

        if(type==='DEFECT'){

            if(!req.file){
                throw new Error("image required");
            }
            
            image = req.file.filename;
        }

        const result =
            await washerService.addNonUniversityIssue(
                    washerId,
                    type,
                    referenceNumber,
                    itemName,
                    issueDescription,
                    image,
                    items
                );

        return res.status(200).json({
            status:true,
            message:result
        });

    }
    catch(error){

        return res.status(400).json({
            status:false,
            message:error.message
        });

    }
};

const getNotifications = async (req, res) => {

    try {

        const { washerId } = req.body;

        const notifications =
            await washerNotificationService.getWasherNotifications(
                washerId
            );

        return res.status(200).json({
            success: true,
            data: notifications
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const getUnreadNotificationCount = async (req, res) => {

    try {

        const { washerId } = req.body;

        const count =
            await washerNotificationService.getUnreadWasherNotificationCount(
                washerId
            );

        return res.status(200).json({
            success: true,
            count
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const markNotificationRead = async (req, res) => {

    try {

        const { washerId } = req.body;

        await washerNotificationService.markWasherNotificationRead(
            washerId
        );

        return res.status(200).json({
            success: true,
            message: "Notifications marked as read."
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const addLpgReceipt = async (req, res) => {

    try {

        const data = await washerService.addLpgReceipt(req.body);

        return res.status(200).json({
            status: "true",
            message: "LPG received successfully",
            data
        });

    } catch (error) {

        return res.status(500).json({
            status: "false",
            message: error.message
        });

    }
};




module.exports={
    addLpgReceipt,
    deletePlayStoreWasher,
    getNotifications,
    getUnreadNotificationCount,
    markNotificationRead,
    loginWasher,
    updateOrderstatus,
    getOrderHistory,
    getOrderDetails,
    addIssue,
    addEntry,
    addChemicals,
    issueHistory,
    issueDetails,
    getWashers,
    setAttendance,
    lastDaysOpening,
    getListOfUniversities,
    washerInfo,
    getItemsInOrder,
    lastChemicalOpening,
	logoutUIWasher,
	getDefectedWasherHistory,
	updateWasherProfile,
    resetPassword,
    chemicalDropdown,
    getOrdersList,
    addNonWashable,
    getNonWashable,
    addNonUniversityIssue,
    deleteAccount
}