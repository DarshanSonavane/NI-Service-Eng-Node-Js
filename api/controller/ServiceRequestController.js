const { createServicerequestService , saveCustomerFeedbackService } = require("../helper/Servicerequesthelper.js");
const ServiceRequest = require("../model/ServiceRequest.js");
const ComplaintType = require("../model/ComplaintType.js");
const EmployeeServiceRequest = require("../model/EmployeeServiceRequest.js");
const Employee = require("../model/Employee.js");
const { sendMail , sendOneTimeVerificationEmail } = require('../service/Mailer.js');
const CustomerDetails = require("../model/CustomerDetails.js");
const AppVersion = require("../model/AppVersion.js");
const ComplaintHistory = require("../model/ComplaintHistory.js");
/* const CustomerOTP = require("../model/CustomerOTP.js"); */

const createServiceRequest = async (req,res) =>{
    try{
        if(!req.body.machineType || !req.body.complaintType || !req.body.customerId){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }else {
            if(req.body.version){
                const version = await AppVersion.find();
                if(version && version.length > 0){
                    if(req.body.version == version[0].version){
                        await createServicerequestService(req,res,async function (err, status, data){
                            if(status){
                                await ServiceRequest.findOne({_id : data._id}).populate("customerId").populate("complaintType").then(async (res)=>{
                                    if(res){
                                        let machineType = req.body.machineType == '0' ? 'Petrol' : 'Diesel';
                                        sendMail(res['customerId']['customerName'] , res['customerId']['customerCode'] , res['complaintType']['name'] , machineType , null , res['customerId']['city'] , res['customerId']['mobile'] , 'service');
                                    }
                                })
                                return res.status(200).json({ code : "200" , message: "Service Request Created Successfully!!", data: data });
                            }
                        })
                    }else {
                        return res.status(400).json({
                            message: "Please update the app to keep using it. If you don't update, the app might stop working.",
                            status: false,
                        });
                    }
                }else {
                    return res.status(400).json({
                        message: "Please update the latest app version in database.",
                        status: false,
                    });
                }
            }else {
                return res.status(400).json({
                    message: "Please update the app to keep using it. If you don't update, the app might stop working.",
                    status: false,
                });
            }
            
        }
    }catch(err){
        console.log(err);
    }
}

const getMyComplaints = async(req,res) =>{
    try{
        let custoemrId = req.query.customerId;
        if(custoemrId){
            await ServiceRequest.find({
                customerId : req.query.customerId
            }).populate("customerId").populate("complaintType").populate("ratings").then((data)=>{
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

const getAllComplaints = async (req,res)=>{
    try{
        await ServiceRequest.find().sort({_id : -1}).populate("complaintType").populate("customerId").populate("assignedTo").populate('ratings').then((data)=>{
            if(data){
                return res.status(200).json({ message: "Service Request List!!", data: data });
            }
        })
    }catch(err){
        console.log(err);
    }
}

const saveCustomerFeedback = async(req,res)=>{
    try{
        if(!req.body.serviceRequestId || !req.body.customerId || !req.body.count){
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

const getNatureOfComplaints = async(req,res)=>{
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

const saveNatureOfComplaints = async(req,res)=>{
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

const assignComplaint = async(req,res)=>{
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
                await ComplaintHistory.create({
                    requestId : req.body.complaintId,
                    status : "2"
                });
                await ServiceRequest.where({_id : req.body.complaintId}).updateOne({
                    $set : reqData
                }).then(async (assignedData)=>{
                    await ServiceRequest.findOne({_id : req.body.complaintId}).populate("customerId").populate("complaintType").populate("assignedTo").then(async (res)=>{
                        if(res){
                            let machineType = req.body.machineType == '0' ? 'Petrol' : 'Diesel';
                            console.log(res);
                            sendMail(res['customerId']['customerName'] , res['customerId']['customerCode'] , res['complaintType']['name'] , machineType , res['assignedTo']['email'] , res['customerId']['city'] , res['customerId']['mobile'] , 'service');
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

const getAssignedComplaints = async(req,res)=>{
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

const closeServiceRequest = async(req,res)=>{
    try{
        let reqData = {
            status : "0",
            updatedBy : req.body.employeeId
        };
        await ServiceRequest.where({_id : req.body.complaintId}).updateOne({
            $set : reqData
        }).then(async(assignedData)=>{
            // await EmployeeServiceRequest.deleteOne({serviceRequestId : req.body.complaintId})
            await ComplaintHistory.create({
                requestId : req.body.complaintId,
                status : "0"
            });
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

const getDashboardDetails = async(req,res)=>{
    try{
        if(!req.query.customerId || !req.query.version){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }
        if(req.query.version){
            const version = await AppVersion.find();
                if(version && version.length > 0){
                    if(req.query.version == version[0].version){
                        const complaintsCount = await ServiceRequest.count({customerId : req.query.customerId});
                        const openComplaintsCount = await ServiceRequest.count({customerId : req.query.customerId , status: { $in: ["1", "2"] }  });
                        const closeComplaintsCount = await ServiceRequest.count({customerId : req.query.customerId , status : '0'  });
                        return res.status(200).json({ code : "200" , message: "Dashboard Details!!", totalComplaints: complaintsCount , openComplaints : openComplaintsCount , closeComplaints : closeComplaintsCount });
                    }else {
                        return res.status(400).json({
                            message: "Please update the app to keep using it. If you don't update, the app might stop working.",
                            status: false,
                        });
                    }
                }else {
                    return res.status(400).json({
                        message: "Please update the latest app version in database.",
                        status: false,
                    });
                }
        }else {
            return res.status(400).json({
                message: "Please update the app to keep using it. If you don't update, the app might stop working.",
                status: false,
            });
        }
    }catch(err){
        console.log(err);
    }
}

const getAdminDashboardDetails = async(req,res)=>{
    try{
        const complaintsCount = await ServiceRequest.count();
        const openComplaintsCount = await ServiceRequest.count({ status: { $in: ["1", "2"] }  });
        const closeComplaintsCount = await ServiceRequest.count({ status : '0'  });
        const employeeList = await Employee.find({role : '1'});
        return res.status(200).json({ code : "200" , message: "Dashboard Details!!", totalComplaints: complaintsCount , openComplaints : openComplaintsCount , closeComplaints : closeComplaintsCount , employees :  employeeList});
    }catch(err){
        console.log(err);
    }
}

const updateServiceRequest = async(req,res)=>{
    try{
        let reqData = {
            status : req.body.status,
            updatedBy : req.body.employeeId,
            employeeFeedback : req.body.feedback
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

const updateCustomerPassword = async(req,res) => {
    try{
        if( !req.body.customerCode || !req.body.password){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }
        let reqData = {
            password : req.body.password
        };

        await CustomerDetails.where({
            customerCode : req.body.customerCode
        }).updateOne({
            $set : reqData
        }).then(async(data)=>{
            return res.status(200).json({ code : "200" , message: "Customer Password Updated Successfully!!" });
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

const getCustomerServiceRequestCount = async(req,res)=>{
    try{
        if(!req.body.customerCode){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }
        let customerDetails = await CustomerDetails.findOne({customerCode : req.body.customerCode});
        if(customerDetails){
            const closeComplaintsCount = await ServiceRequest.count({customerId : customerDetails._id , status : '0'  });
            return res.status(200).json({ code : "200" , count : closeComplaintsCount, message: "Customer Visit Count" });
        }else {
            return res.status(400).json({ code : "400" , message: "Invalid Customer Code!" });
        }
    }catch(err){
        console.log(err);
    }
}

const updateAppVersion = async(req,res)=>{
    try{
        if(!req.body.version){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }
        const version = await AppVersion.find();
        if(version.length > 0){
            const _id = version[0]._id;
            let reqData = {
                version : req.body.version
            };
    
            await AppVersion.where({
                _id : _id
            }).updateOne({
                $set : reqData
            }).then(async(data)=>{
                return res.status(200).json({ code : "200" , message: "App Version Updated Successfully!!" });
            }).catch((err)=>{
                console.log(err);
                return res.status(500).json({
                    message: "Internal server error",
                    status: false,
                });
            })
        }else{
            await AppVersion.create({
                version : req.body.version
            }).then(async(data)=>{
                return res.status(200).json({ code : "200" , message: "Version updated successfully!" });
            }).catch((err)=>{
                console.log(err);
            })
        }
    }catch(err){
        console.log(err)
    }
}

const trackComplaint = async(req,res)=>{
    try{
        let obj = {};
        if(!req.body.complaintId){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }
        let data = await ComplaintHistory.find({requestId : req.body.complaintId})
        
        if(data){
            const assignedToData = await ServiceRequest.findOne({_id : req.body.complaintId} , {_id : 1}).populate("assignedTo" , {firstName : 1 , lastName : 1 , phone : 1});
            const complaintTypeData = await ServiceRequest.findOne({_id : req.body.complaintId} , {_id : 1}).populate("complaintType");
            obj['assignedDetails'] = assignedToData;
            obj['complaintHistory'] = data;
            obj['complaint'] = complaintTypeData;
            // const formatedData = await formatData(obj , assignedToData); 
            return res.status(200).json({ code : "200" , message: "Comaplaint Details!" , data : obj });
        }
    }catch(err){
        console.log(err);
    }
}

const reAssignComplaint = async(req,res)=>{
    try{
        if(!req.body.employeeId || !req.body.complaintId){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }

        let reqData = {
            employeeId : req.body.employeeId,
            serviceRequestId : req.body.complaintId
        };

        await EmployeeServiceRequest.where({
            serviceRequestId : req.body.complaintId
        }).updateOne({
            $set : reqData
        }).then(async(data)=>{
            let serviceReqData = {
                status : "2",
                assignedTo : req.body.employeeId,
                updatedBy : req.body.employeeId
            };
            
            await ServiceRequest.where({_id : req.body.complaintId}).updateOne({
                $set : serviceReqData
            }).then(async (assignedData)=>{
                await ServiceRequest.findOne({_id : req.body.complaintId}).populate("customerId").populate("complaintType").populate("assignedTo").then(async (res)=>{
                    if(res){
                        let machineType = req.body.machineType == '0' ? 'Petrol' : 'Diesel';
                        sendMail(res['customerId']['customerName'] , res['customerId']['customerCode'] , res['complaintType']['name'] , machineType , res['assignedTo']['email'] , res['customerId']['city'] , res['customerId']['mobile'] , 'service');
                    }
                })
                return res.status(200).json({ code : "200" , message: "Service Request Assigned To Employee Successfully!!", data: assignedData });
            }).catch((err)=>{
                return res.status(500).json({
                    message: "Internal server error",
                    status: false,
                });
            })
            return res.status(200).json({ code : "200" , message: "Complaint Assigned Successfully!!" });
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

const formatData = async(data , assignedData)=>{
    console.log("Here" , assignedData)
    try{
        for(let i = 0 ; i < data['complaintHistory'].length ; i++){
            let d = data['complaintHistory'][i];
            if(d.status == '2'){
                console.log("Here condition")
                d['assignedTo'] = assignedData;
                console.log("Here condition" , d)
                break;
            }
        }
        return data;
    }catch(err){
        console.log(err);
    }
}

/* const generateAndSendOTP = async(req,res)=>{
    try{
        if(!req.body.customerCode){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }
        const customerOTPDetails = await CustomerOTP.findOne({ customerCode : req.body.customerCode});
        console.log('customerOTPDetails' , customerOTPDetails);
        if(customerOTPDetails && customerOTPDetails.status == '1'){
            reqData = {
                status : '0'
            }

            await CustomerOTP.where({
                customerCode : req.body.customerCode
            }).updateOne({
                $set : reqData
            }).then(async(custUpdatedData)=>{}).catch((err)=>{
                console.log(err);
                return res.status(500).json({
                    message: "Internal server error",
                    status: false,
                });
            })
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpType = 'Complaints';
        const status = '1';
        const data = await CustomerOTP.create({
            customerCode : req.body.customerCode,
            status : status,
            otp : otp,
            otpType : otpType
        }).then(async (data) =>{
            const customerDetails = await CustomerDetails.findOne({ customerCode : req.body.customerCode});
            if(customerDetails && customerDetails.email){
                sendOneTimeVerificationEmail('One Time Verification code' , customerDetails , otp);
                return res.status(200).json({ code : "200" , message: "Verification email sent Successfully!!" });
            }
        })
    }catch(err){
        console.log(err);
    }
}

const verifyOTP = async(req,res)=>{
    try{
        if(!req.body.otp || !req.body.customerCode){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }

        const otpData = await CustomerOTP.findOne({customerCode : req.body.customerCode , otp : req.body.otp , status : "1"});
        if(otpData){
            return res.status(200).json({ code : "200" , message: "OTP verified Successfully!!" });
        }else {
            return res.status(400).json({ code : "400" , message: "Invalid OTP Provided!!" });
        }
    }catch(err){
        console.log(err);
    }
} */

module.exports = {
    createServiceRequest: createServiceRequest,
    getMyComplaints: getMyComplaints,
    getAllComplaints: getAllComplaints,
    saveCustomerFeedback: saveCustomerFeedback,
    getNatureOfComplaints: getNatureOfComplaints,
    saveNatureOfComplaints: saveNatureOfComplaints,
    assignComplaint: assignComplaint,
    getAssignedComplaints: getAssignedComplaints,
    closeServiceRequest: closeServiceRequest,
    getDashboardDetails : getDashboardDetails,
    getAdminDashboardDetails : getAdminDashboardDetails,
    updateServiceRequest : updateServiceRequest,
    updateCustomerPassword : updateCustomerPassword,
    getCustomerServiceRequestCount : getCustomerServiceRequestCount,
    updateAppVersion : updateAppVersion,
    trackComplaint : trackComplaint,
    reAssignComplaint : reAssignComplaint,
    /* generateAndSendOTP : generateAndSendOTP,
    verifyOTP : verifyOTP */
}