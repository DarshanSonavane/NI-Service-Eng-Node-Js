const ServiceRequest = require("../model/ServiceRequest.js");
const Ratings = require("../model/Ratings.js");
const ComplaintHistory = require("../model/ComplaintHistory.js");

const createServicerequestService = async (req,res,callback) => {
    try{
        await ServiceRequest.create({
            customerId : req.body.customerId,
            machineType : req.body.machineType,
            complaintType : req.body.complaintType,
            status : "1",
            assignedTo : req.body.assignedTo ? req.body.assignedTo : null,
            additionalReq : req.body.additionalReq
        }).then(async(data)=>{
            console.log("requ data",data)
            await ComplaintHistory.create({
                requestId : data._id,
                status : "1"
            }).then((res)=>{
                callback(null, true, data);
            }).catch((err)=>{
                return res.status(500).json({
                    message: "Internal server error",
                    status: false,
                    err:err
                });    
            });
            
        }).catch((err)=>{
            return res.status(500).json({
                message: "Internal server error",
                status: false,
                err:err
            });
        })
    }catch(err){
        console.log(err)
    }
}

const saveCustomerFeedbackService = async(req,res,callback)=>{
    try{
        await Ratings.create({
            serviceRequestId : req.body.serviceRequestId,
            customerId : req.body.customerId,
            feedback : req.body.feedback,
            count : req.body.count
        }).then(async(data)=>{
            await ServiceRequest.where({_id : req.body.serviceRequestId}).updateOne({
                ratings : data._id
            })
            callback(null, true, data);
        }).catch((err)=>{
            return res.status(500).json({
                message: "Internal server error",
                status: false,
            });
        })
    }catch(err){

    }
}

module.exports = {
    createServicerequestService: createServicerequestService,
    saveCustomerFeedbackService: saveCustomerFeedbackService
}