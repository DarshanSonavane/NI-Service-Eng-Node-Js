const ServiceRequest = require("../model/ServiceRequest.js");
const Ratings = require("../model/Ratings.js");

const createServicerequestService = async (req,res,callback) => {
    try{
        await ServiceRequest.create({
            customerId : req.body.customerId,
            machineType : "1",
            complaintType : req.body.complaintType,
            status : "1",
            assignedTo : req.body.assignedTo ? req.body.assignedTo : null
        }).then((data)=>{
            callback(null, true, data);
        }).catch((err)=>{
            return res.status(500).json({
                message: "Internal server error",
                status: false,
            });
        })
    }catch(err){
        console.log(err)
    }
}

const saveCustomerFeedbackService = async(req,res,callback)=>{
    try{
        await Ratings.create({
            employeeCode : req.body.employeeCode,
            customerCode : req.body.customerCode,
            feedback : req.body.feedback
        }).then((data)=>{
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