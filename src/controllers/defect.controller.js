const defectService = require('../services/defect.service');

const addDefects=async(req,res)=>{
    console.log("reached");
    try{

        const washerId = req.body.washerId;
        const orderId = req.body.orderId;
        const itemName = req.body.itemName;
        const issueDescription = req.body.issueDescription;
        const image = req.file?.filename;

        if(!washerId || !orderId || !itemName || !issueDescription || !image){
            return res.status(201).json({
                message:"Inputs missing",
                status:"false"
            });
        }

        const defect = await defectService.addDefects(washerId,orderId,itemName,issueDescription,image);

        return res.status(200).json({
            message:defect,
            status : "true"
        });

    }catch(error){

        return res.status(201).json({
            message:error.message,
            status:"false"
        });

    }

};

const updateStatus = async(req,res)=>{

    try{

        const {
            orderId,
            defectId,
            type
        } = req.body;

        const decision =
            req.body.decision?.toUpperCase();

        if(
            !orderId ||
            !defectId ||
            !type ||
            !decision
        ){
            return res.status(400).json({
                message:
                    "orderId/defectId/type/decision missing",
                status:"false"
            });
        }

        const update =
            await defectService.updateStatus(
                orderId,
                defectId,
                type.toUpperCase(),
                decision
            );

        return res.status(200).json({
            message:update,
            status:"true"
        });

    }catch(error){

        return res.status(201).json({
            message:error.message,
            status:"false"
        });

    }
}

const fetchApprovals = async(req,res)=>{

    try{

        const studentId = req.body.studentId;

        if(!studentId){
            return res.status(201).json({
                message:"studentId missing",
                status:"false"
            });
        }   

        const protocol=req.protocol;
        const host = req.get('host');

        const defects = await defectService.fetchPreviousApprovals(studentId,protocol,host);

        return res.status(200).json({
            message : "defects fetched successfully",
            status : true,
            data : defects
        })

    }catch(error){

        return res.status(201).json({
            message:error.message,
            status:"false"
        })

    }

}

module.exports={
    addDefects,
    updateStatus,
    fetchApprovals
}