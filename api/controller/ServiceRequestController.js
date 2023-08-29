import { createServicerequestService , saveCustomerFeedbackService } from "../helper/Servicerequesthelper.js";
import ServiceRequest from "../model/ServiceRequest.js";
import ComplaintType from "../model/ComplaintType.js";
import EmployeeServiceRequest from "../model/EmployeeServiceRequest.js";
import { sendMail } from '../service/Mailer.js'

export const createServiceRequest = async (req,res) =>{
    try{
        if(!req.body.machineType || !req.body.complaintType || !req.body.customerId){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }else {
            await createServicerequestService(req,res,async function (err, status, data){
                if(status){
                    await ServiceRequest.findOne({_id : data._id}).populate("customerId").populate("complaintType").then(async (res)=>{
                        if(res){
                            let machineType = req.body.machineType == '0' ? 'Petrol' : 'Disel';
                            sendMail(res['customerId']['customerName'] , res['customerId']['customerCode'] , res['complaintType']['name'] , machineType , null);
                        }
                    })
                    return res.status(200).json({ code : "200" , message: "Service Request Created Successfully!!", data: data });
                }
            })
        }
    }catch(err){
        console.log(err);
    }
}

export const getMyComplaints = async(req,res) =>{
    try{
        let custoemrId = req.query.customerId;
        if(custoemrId){
            await ServiceRequest.find({
                customerId : req.query.customerId
            }).populate("customerId").populate("complaintType").then((data)=>{
                return res.status(200).json({ code : "200" , message: "Service Request List!!", data: data });
            }).catch((err)=>{
                console.log(err)
                return res.status(500).json({
                    message: "Internal server error",
                    status: false,
                });
            })
        }else {
            return res.status(400).json({
                message: "Required Parameters are missing!!",
                status: false,
            });
        }

    }catch(err){
        console.log(err);
    }
}

export const getAllComplaints = async (req,res)=>{
    try{
        await ServiceRequest.find().sort({_id : -1}).populate("complaintType").populate("customerId").populate("assignedTo").then((data)=>{
            if(data){
                return res.status(200).json({ message: "Service Request List!!", data: data });
            }
        })
    }catch(err){
        console.log(err);
    }
}

export const saveCustomerFeedback = async(req,res)=>{
    try{
        if(!req.body.employeeCode || !req.body.customerCode){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }else {
            await saveCustomerFeedbackService(req,res , function(err, status, data){
                if(status){
                    return res.status(200).json({ message: "Feedback saved Successfully!!", data: data });
                }   
            })
        }
    }catch(err){
        console.log(err);
    }
}

export const getNatureOfComplaints = async(req,res)=>{
    try{
        await ComplaintType.find().then((data)=>{
            if(data){
                return res.status(200).json({ code : "200" , message: "Complaint Type List!!", data: data });
            }
        })
    }catch(err){
        console.log(err);
    }
}

export const saveNatureOfComplaints = async(req,res)=>{
    try{
        let data = req.body;
        await ComplaintType.create({
            name : data[0].name
        }).then((data)=>{
            return res.status(200).json({ message: "Complaint Type Created Successfully!!", data: data });
        }).catch((err)=>{
            console.log(err);
        })
    }catch(err){
        console.log(err);
    }
}

export const assignComplaint = async(req,res)=>{
    try{
        if(!req.body.employeeId || !req.body.complaintId){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }else {
            console.log("req.body.complaintId",req.body.complaintId);
            await EmployeeServiceRequest.create({
                employeeId : req.body.employeeId,
                serviceRequestId : req.body.complaintId
            }).then(async(data)=>{
                let reqData = {
                    status : "2",
                    assignedTo : req.body.employeeId,
                    updatedBy : req.body.employeeId
                };
                await ServiceRequest.where({_id : req.body.complaintId}).updateOne({
                    $set : reqData
                }).then(async (assignedData)=>{
                    await ServiceRequest.findOne({_id : req.body.complaintId}).populate("customerId").populate("complaintType").populate("assignedTo").then(async (res)=>{
                        if(res){
                            let machineType = req.body.machineType == '0' ? 'Petrol' : 'Disel';
                            console.log(res);
                            sendMail(res['customerId']['customerName'] , res['customerId']['customerCode'] , res['complaintType']['name'] , machineType , 'darshansonavane24@gmail.com');
                        }
                    })
                    return res.status(200).json({ code : "200" , message: "Service Request Assigned To Employee Successfully!!", data: assignedData });
                }).catch((err)=>{
                    return res.status(500).json({
                        message: "Internal server error",
                        status: false,
                    });
                })
            }).catch(err=>{
                console.log(err);
            })
        }
    }catch(err){
        console.log(err);
    }
}

export const getAssignedComplaints = async(req,res)=>{
    try{
        let employeeId = req.query.employeeId;
        console.log("employeeId",employeeId);
        await EmployeeServiceRequest.find({employeeId : employeeId}).populate({path : "serviceRequestId" , populate : {path : "complaintType"}}).populate({path : "serviceRequestId" , populate : {path : "customerId"}}).then(data=>{
            return res.status(200).json({ code : "200" , message: "My Assigned Complaints!!", data: data });
        }).catch(err=>{
            console.log(err);
        });
    }catch(err){
        console.log(err);
    }
}

export const closeServiceRequest = async(req,res)=>{
    try{
        let reqData = {
            status : "0",
            updatedBy : req.body.employeeId
        };
        await ServiceRequest.where({_id : req.body.complaintId}).updateOne({
            $set : reqData
        }).then(async(assignedData)=>{
            // await EmployeeServiceRequest.deleteOne({serviceRequestId : req.body.complaintId})
            return res.status(200).json({ code : "200" , message: "Service Request Closed Successfully!!", data: assignedData });
        }).catch((err)=>{
            console.log(err);
            return res.status(500).json({
                message: "Internal server error",
                status: false,
            });
        })
    }catch(err){
        console.log(err);
    }
}