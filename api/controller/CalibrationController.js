const CalibrationRequest =  require('../model/CalibrationRequest.js');
const CustomerDetails =  require("../model/CustomerDetails.js");
const Employee =  require('../model/Employee.js');
const { sendMail } = require('../service/Mailer.js');

const generateCalibrationRequest = async(req,res)=>{
    try{
        if(!req.body.customerId || !req.body.machineType || !req.body.employeeId){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }

        await CalibrationRequest.create({
            customerId : req.body.customerId,
            machineType : req.body.machineType,
            employeeId : req.body.employeeId,
            status : "2"
        }).then( async (data) => {
            let type = "";
            if(req.body.machineType == "0"){
                type = "Petrol"
            }else if(req.body.machineType == "1"){
                type = "Diesel";
            }else if(req.body.machineType == "2"){
                type = "Combo";
            }
            let customerDetails = await CustomerDetails.findOne({_id : req.body.customerId});
            let employeeDetails = await Employee.findOne({_id : req.body.employeeId})
            sendMail(customerDetails.customerName , customerDetails.customerCode , "Calibration" , type , employeeDetails.email , customerDetails.city , customerDetails.mobile , 'calibration')
            return res.status(200).json({ message: "Calibration Request Raised Successfully!", data: data });
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

const getCalibrationEmployeeList = async (req,res) =>{
    try{
        let data =  await Employee.find({isActive : "1"}).select({_id : 1 , firstName : 1 , lastName : 1});
        return res.status(200).json({ message: "Employee List!!", data: data });
    }catch(err){
        console.log(err);
    }
}

const getAllCalibrationList = async(req,res)=>{
    try{
        let data = await CalibrationRequest.find().populate('customerId').populate('employeeId');
        return res.status(200).json({ message: "Calibration Request List!!", data: data });
    }catch(err){
        console.log(err);
    }
}

const getMyCalibrationRequestList = async(req,res)=>{
    try{
        if(!req.body.employeeId){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }
        let data = await CalibrationRequest.find({employeeId : req.body.employeeId}).populate('customerId');
        return res.status(200).json({ message: "Calibration Request List!!", data: data });
    }catch(err){
        console.log(err);
    }
}


module.exports = {
    generateCalibrationRequest : generateCalibrationRequest,
    getCalibrationEmployeeList : getCalibrationEmployeeList,
    getAllCalibrationList : getAllCalibrationList,
    getMyCalibrationRequestList : getMyCalibrationRequestList
}