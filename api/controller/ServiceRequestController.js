const { createServicerequestService , saveCustomerFeedbackService } = require("../helper/Servicerequesthelper.js");
const ServiceRequest = require("../model/ServiceRequest.js");
const ComplaintType = require("../model/ComplaintType.js");
const EmployeeServiceRequest = require("../model/EmployeeServiceRequest.js");
const Employee = require("../model/Employee.js");
const { sendMail , sendOneTimeVerificationEmail , sendMailWithAttachment } = require('../service/Mailer.js');
const CustomerDetails = require("../model/CustomerDetails.js");
const AppVersion = require("../model/AppVersion.js");
const ComplaintHistory = require("../model/ComplaintHistory.js");
const CustomerOTP = require("../model/CustomerOTP.js");
const AMCRequest = require("../model/AMCRequest.js");
const MachineModel = require("../model/MachineModel.js");
const qr = require('qr-image');
const pdf = require('html-pdf');
const ejs = require('ejs');
const path = require("path");
const fs = require('fs');
const constants = require("../utility/constant.js");
const GST = require("../model/GST.js");
const AMCAmount = require("../model/AMCAmount.js");

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

const generateAndSendOTP = async(req,res)=>{
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
        const otp = Math.floor(1000 + Math.random() * 9000);;
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
}

const getAllOpenComplaints = async (req,res)=>{
    try{
        await ServiceRequest.find({status: { $in: [1, 2] }}).sort({_id : -1}).populate("complaintType").populate("customerId").populate("assignedTo").populate('ratings').then((data)=>{
            if(data){
                return res.status(200).json({ message: "Service Request List!!", data: data , status:"Open" });
            }
        })
    }catch(err){
        console.log(err);
    }
}

const getAllCloseComplaints = async (req,res)=>{
    try{
        await ServiceRequest.find({ status: 0 }).sort({_id : -1}).populate("complaintType").populate("customerId").populate("assignedTo").populate('ratings').then((data)=>{
            if(data){
                const filtderData = data.filter(res=>res.customerId?.customerName);
                return res.status(200).json({ message: "Service Request List!!", data: filtderData , status:"Close" });
            }
        })
    }catch(err){
        console.log(err);
    }
}

const deleteCustomerById = async(req,res)=>{
    try{
        if(!req.body.customerId){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }
        
        await CustomerDetails.deleteOne({_id : req.body.customerId}).then((data)=>{
            if(data){
                return res.status(200).json({ message: "Customer deleted successfully!!" });
            }
        })
    }catch(err){
        console.log(err);
    }
}

const raiseAMCRequest = async(req,res)=>{
    try{
        if(!req.body.customerId || !req.body.amcType){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }
        const custAMCRequestCount = await AMCRequest.count({customerId : req.body.customerId , status : '1' , amcType : req.body.amcType});
        console.log('custAMCRequestCount',custAMCRequestCount)
        const isValidRequest = await validateAmcOnBackend(req.body.customerId , req.body.amcType);
        if(custAMCRequestCount == 0){
            if(isValidRequest){
                await AMCRequest.create({
                    customerId : req.body.customerId,
                    status : '1',
                    amcType : req.body.amcType
                }).then((data)=>{
                    return res.status(200).json({ code : 200 , message: "Your AMC Request has been raised successfully!!" });
                })
            }else {
                return res.status(400).json({code : 400 ,  message: "You are already under AMC! You can raise next AMC request before 10 days of you AMC Due Date!!" });    
            }
        }else {
            return res.status(400).json({code : 400 ,  message: "You have already raised an AMC Request!! Please connect with admin" });
        }

    }catch(err){
        console.log(err);
    }
}

const validateAmcOnBackend = async(customerId,amcType)=>{
    try{
        if(!customerId || !amcType){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }
        const data = await AMCRequest.find({customerId : customerId , amcType : amcType}).sort({_id : -1}).limit(1);
        if(data && data.length > 0){
            const createdDate = new Date(data[0]['createdAt']).toLocaleString(undefined, {timeZone: 'Asia/Kolkata'}).split(',')[0];

            const createdDateArray = createdDate.split('/');
            const createdDay = createdDateArray[1];
            const createdMonth = createdDateArray[0];
            const createdYear =  createdDateArray[2];
            const newCreatedDate = `${createdYear}/${createdMonth}/${createdDay}`

            const currentDate = new Date().toLocaleString(undefined, {timeZone: 'Asia/Kolkata'}).split(',')[0];
            const currentDateArray = currentDate.split('/');
            const currentDay = currentDateArray[1];
            const currentMonth = currentDateArray[0];
            const currentYear =  currentDateArray[2];
            const newCurrentDate = `${currentYear}/${currentMonth}/${currentDay}`;
            
            const diffTime = Math.abs(new Date(newCurrentDate) - new Date(newCreatedDate));
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            console.log("Calibration Request validateCalibrationOnBackend======== newCreatedDate : " , newCreatedDate , 'newCreatedDate' , newCurrentDate , 'difference' , diffTime ,"======" ,  diffDays)
            
            return diffDays < 10 ?  true : false; 
        } else {
            return true;
        }
    }catch(err){
        console.log(err);
    }   
}

const getCustomerDetails = async(req,res)=>{
    try{
        if(!req.body.customerId){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }
        const data = await CustomerDetails.findOne({ _id : req.body.customerId}).select({ _id : 1 , customerCode : 1 , customerName : 1 , city : 1 , mobile : 1 , email : 1 , stateCode : 1 , amcDue : 1});
        if(data){
            return res.status(200).json({ code : 200 , message: "Customer Details" , data : data });
        }else {
            return res.status(400).json({ code : 400 , message: "Customer Details not found for provided customer id" });
        }
    }catch(err){
        console.log(err);
    }
}

const getAllOpenAMCRequest = async(req,res)=>{
    try{
        await AMCRequest.find({status : '1'}).populate("customerId",{customerCode : 1 , customerName : 1 , city : 1 , stateCode : 1  }).then(data=>{
            if(data){
                return res.status(200).json({ code : 200 , message: "All Open AMC Requests" , data : data , status : 'Open' });
            }
        })
    }catch(err){
        console.log(err);
    }
}

const getAllCloseAMCRequest = async(req,res)=>{
    try{
        await AMCRequest.find({status : '0'}).populate("customerId",{customerCode : 1 , customerName : 1 , city : 1 , stateCode : 1  }).then(data=>{
            if(data){
                return res.status(200).json({ code : 200 , message: "All Close AMC Requests" , data : data , status : 'Close' });
            }
        })
    }catch(err){
        console.log(err);
    }
}

function getCurrentDate() {
    const now = new Date();
    return now.toLocaleDateString(); // Converts to local date string
}

// Function to add months to a given date
function addMonths(date, months) {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
}

function generateDate(state) {
    // Get the current date
    const currentDate = new Date();
    console.log('Current Date:', getCurrentDate());

    let adjustedDate = addMonths(currentDate, 12);

    // Print the adjusted date
    console.log('Date after adding months:', adjustedDate.toLocaleDateString());

    // Subtract one day from the adjusted date
    const finalDate = subtractOneDay(adjustedDate);
    
    // Print the final date
    console.log('Final Date:', finalDate.toLocaleDateString());
    return formatDate(finalDate);
}

// Function to subtract one day from a given date
function subtractOneDay(date) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 1);
    return newDate;
}

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

const generateBarcodeForAMCRequest =  async(amcId , customerName)=>{
    try{
        console.log("Here" , amcId);
        const URL = `http://16.170.250.91:3000/uploads/amc/${customerName}_${amcId}.pdf`;
        const qrSvg = qr.imageSync(URL, { type: 'png' });
        const filePath = `./assets/QR-Codes/amc/qr-code_${amcId}.png`
        // Save the image to a file
        fs.writeFileSync(filePath, qrSvg);
        console.log("QR Generated and saved successfully!" , filePath);
    }catch(err){
        console.log(err);
    }
}

function getFileName(){
    return  '../templates/AMC.ejs';
}

const genetrateAndSendAMCToCustomer = async(req,res)=>{
    try{
        if(!req.body.customerId || !req.body.amcId || !req.body.amcType){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }
        const customerDetails = await CustomerDetails.findOne({ _id : req.body.customerId}).select({ _id : 1 , customerCode : 1 , customerName : 1 , city : 1 , stateCode : 1 , email : 1});
        console.log("=====" , customerDetails);
        if(customerDetails){
            console.log("Inside" , customerDetails);
            let receivedSerialNumber;
            await getMachineData(customerDetails.customerCode, req.body.amcType).then((data)=>{
                if(data){
                    receivedSerialNumber = data;
                    console.log("const receivedSerialNumber = ", data);
                }
            });
            // console.log("receivedSerialNumber" , receivedSerialNumber)
            const customerName = customerDetails.customerName;
            await generateBarcodeForAMCRequest(req.body.amcId , customerName);
            const amcData = await AMCAmount.findOne({type : req.body.amcType});
            console.log("amcData" , amcData);
            const currentDate = formatDate(new Date());
            const amcDueDate = generateDate();
            const companyName = 'NI SERVICES ENGINEERING PVT.LTD.';
            
            const customerEmail = customerDetails.email;
            const customerCode = customerDetails.customerCode;
            const address = `${customerDetails.city} , ${customerDetails.state}`;
            const serialNumber = receivedSerialNumber;
            const fileName = getFileName();
            if(customerEmail){
                ejs.renderFile(
                    path.join(__dirname, fileName),{    
                        companyName : companyName,
                        customerCode : customerCode,
                        customerName : customerName,
                        fromDate : currentDate,
                        toDate : amcDueDate, 
                        address : address,
                        model : amcData.modelType,
                        serialNumber : serialNumber,
                        amcAmount : amcData.amount,
                        gstAmount : amcData.gstAmount,
                        totalAmount : amcData.totalAmount,
                        logoPath : `${constants.SERVER_FILE_PATH}NI-SERVICE-LOGO.jpg`,
                        sign : `${constants.SERVER_FILE_PATH}sign.png`,
                        stamp : `${constants.SERVER_FILE_PATH}nistamplogo.png`,
                        qrURL : `${constants.SERVER_FILE_PATH}QR-Codes/amc/qr-code_${req.body.amcId}.png`
                    },async (err, newHtml) => {
                        if(err){
                            console.log(err);
                        }
                            
                        const outputPath = `./assets/uploads/amc/${customerDetails['customerName']}_${req.body.amcId}.pdf`;
                        // const options = { type: "A4" };
                        // const options = { type: 'A4'};
                        var options = {
                            format: 'A4',
                            border: '0.5cm',
                            zoomFactor: '0.5',
                            // other options
                        };
            
                        try {
                            // Generate the PDF
                            pdf.create(newHtml, options).toFile(outputPath, async function(err, res) {
                                if (err) return console.log(err);
                                    console.log(`PDF saved to ${res.filename}`);
                                    const htmlEmailContents = `<p>Your AMC request is been handled successfully!. Please find attachment for same</p>`;
                                    const subject = `Annual Maintainance Contract`;
                                    const receiverEmail = customerDetails['email'];
                                    const reqData = {
                                        status : '0'
                                    }
                                    await AMCRequest.where({_id : req.body.amcId}).updateOne({
                                        $set : reqData
                                    }).then(async(data)=>{});
                                    await sendMailWithAttachment(htmlEmailContents, receiverEmail, subject , outputPath);
                            });
                            return res.status(200).json({ code : "200" , message: "AMC certificate generated and sent on registered email!"});
                        } catch (error) {
                                console.error('Error generating PDF:', error);
                        }
                    })
                }
        }else {
            console.log("Inside else");
        }
    }catch(err){
        console.log(err);
    }
}

async function getMachineData(customerCode , amcType){
    try{
        let serialNumber;
        await MachineModel.find({ CUSTOMER_CODE : customerCode}).then((data) => {
            if(data && data.length > 0){
                for(let i = 0 ; i < data.length ; i++ ){
                    const d = data[i];
                    if(amcType == "0" && ( d.MODEL == "NPM MGA1" || d.MODEL == "NPM MGA2" || d.MODEL == "MGA2" || d.MODEL == "MGA1"  )){
                        serialNumber = d.MODEL + " #" + d.MACHINE_NO;
                        break;
                    }else if(amcType == "1" && ( d.MODEL == "NPM SMIIIB" || d.MODEL == "DSM" )){
                        serialNumber = d.MODEL + " #" + d.MACHINE_NO; 
                        break;
                    }else if(amcType == "2" && (d.MODEL == "NUVO 10" || d.MODEL == "NUVO 20")){
                        serialNumber = d.MODEL + " #" + d.MACHINE_NO;
                        break;
                    }
                }
            }
        })
        console.log("Serial Number ====" , serialNumber);
        return serialNumber;
    }catch(err){
        console.log(err);
    }
}

const createUpdateGST = async(req,res)=>{
    try{
        if(!req.body.gstPercent){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }
        const rowCount = await GST.find();
        if(rowCount.length > 0){
            await GST.deleteMany();
        }

        await GST.create({
            gstPercent : req.body.gstPercent
        }).then((res)=>{
            return res.status(200).json({ code : "200" , message: "GST Details updated successfully!"});
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

const createUpdateAMCAmount = async(req,res)=>{
    try{
        const amcData = [
            {
                "type": "0",
                "amount": "9000",
                "gstAmount": "1620",
                "totalAmount": "10620",
                "modelType": "Multi Gas Analyser"
            },
            {
                "type": "1",
                "amount": "7500",
                "gstAmount": "1350",
                "totalAmount": "8850",
                "modelType": "Smoke Meter"
            },
            {
                "type": "2",
                "amount": "15000",
                "gstAmount": "2700",
                "totalAmount": "17700",
                "modelType": "Combined Gas Analyser"
            }
        ]
        const data = await AMCAmount.find();
        if(data.length > 0){
            await AMCAmount.deleteMany();
        }
        await AMCAmount.insertMany(amcData).then(data=>{
            return res.status(200).json({ code : "200" , message: "Amc Data created Successfully!!", data: data });
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
    generateAndSendOTP : generateAndSendOTP,
    verifyOTP : verifyOTP,
    getAllOpenComplaints : getAllOpenComplaints,
    getAllCloseComplaints : getAllCloseComplaints,
    deleteCustomerById : deleteCustomerById,
    raiseAMCRequest : raiseAMCRequest,
    getCustomerDetails : getCustomerDetails,
    genetrateAndSendAMCToCustomer : genetrateAndSendAMCToCustomer,
    createUpdateGST : createUpdateGST,
    createUpdateAMCAmount : createUpdateAMCAmount,
    getAllOpenAMCRequest : getAllOpenAMCRequest,
    getAllCloseAMCRequest : getAllCloseAMCRequest
}