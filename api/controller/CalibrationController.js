const CalibrationRequest =  require('../model/CalibrationRequest.js');
const CustomerDetails =  require("../model/CustomerDetails.js");
const Employee =  require('../model/Employee.js');
const { sendMail , sendMailWithAttachment } = require('../service/Mailer.js');
const CylinderDetails = require('../model/CylinderDetails.js');
const ejs = require('ejs');
const path = require("path");
const puppeteer = require('puppeteer');
const fs = require('fs');
const constants = require("../utility/constant.js");
const pdf = require('html-pdf');

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
            return res.status(200).json({ code : "200" , message: "Calibration Request Raised Successfully!", data: data });
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
        return res.status(200).json({ code : "200" , message: "Employee List!!", data: data });
    }catch(err){
        console.log(err);
    }
}

const getAllCalibrationList = async(req,res)=>{
    try{
        let data = await CalibrationRequest.find().populate('customerId').populate('employeeId');
        return res.status(200).json({ code : "200" , message: "Calibration Request List!!", data: data });
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
        return res.status(200).json({ code : "200" , message: "Calibration Request List!!", data: data });
    }catch(err){
        console.log(err);
    }
}

const getCustomerCalibrationList = async(req,res)=>{
    try{
        if(!req.body.customerId){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }
        let data = await CalibrationRequest.find({customerId : req.body.customerId}).populate('customerId').populate('employeeId');
        return res.status(200).json({ code : "200" , message: "Calibration Request List!!", data: data });
    }catch(err){
        console.log(err);
    }
}

const validateCalibration = async(req,res)=>{
    try{
        if(!req.body.customerId || !req.body.machineType){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }
        const data = await CalibrationRequest.find({customerId : req.body.customerId , machineType : req.body.machineType}).sort({_id : -1}).limit(1);
        console.log(data)
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
            return res.status(200).json({ code : "200" , message: "Calibration Request List!!", differenceDays: diffDays , isNewrecord : false });
        } else {
            return res.status(200).json({ code : "200" , message: "Calibration Request List!!", differenceDays: 0 , isNewrecord : true });
        }
    }catch(err){
        console.log(err);
    }   
}

const updateCylinderDetails = async(req,res)=>{
    try{
        if(!req.body.CO || !req.body.CO2 || !req.body.HC || !req.body.O2 || !req.body.cylinderNumber || !req.body.cylinderMake || !req.body.validityDate || !req.body.createdBy){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            }); 
        }
        const cylinderDetailsData = await CylinderDetails.find();
        if(cylinderDetailsData.length > 0){
            await CylinderDetails.deleteMany();
        }
        await CylinderDetails.create({
            CO : req.body.CO,
            CO2 : req.body.CO2,
            HC : req.body.HC,
            O2 : req.body.O2,
            cylinderNumber : req.body.cylinderNumber,
            cylinderMake : req.body.cylinderMake,
            validityDate : req.body.validityDate,
            createdBy : req.body.createdBy
        }).then(data => {
            return res.status(200).json({ code : "200" , message: "Cylinder Details Updated Successfully!", data: data });
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

const generateAndSendCalibration = async(req,res)=>{
    try{
        if(!req.body.calibrationId){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }
        const calibrationrequestData = await CalibrationRequest.findOne({_id : req.body.calibrationId}).populate('customerId').populate('employeeId');
        const cylinderDetails = await CylinderDetails.find();
        const serialNumber = Math.floor(1000 + Math.random() * 9000);
        const currentDate = new Date();
        const nextCalibrationDate = generateDate();
        

        let fileName = '';
        if(calibrationrequestData && calibrationrequestData['machineType'] == '0'){
            fileName = '../templates/Petrol.ejs';
        }
        console.log('FileName:', fileName);
        ejs.renderFile(
            path.join(__dirname, fileName),{
                serialNumber : serialNumber,
                issueDate : currentDate.getDate() + "/" + ( currentDate.getMonth() + 1 ) + "/" + currentDate.getFullYear(),
                modelNumber : "NPM MGA-1",
                machineNumber : calibrationrequestData['customerId']['petrolMachineNumber'],
                centerName : calibrationrequestData['customerId']['customerName'],
                city : calibrationrequestData['customerId']['city'],
                coValue : cylinderDetails[0]['CO'],
                hcValue : cylinderDetails[0]['HC'],
                co2Value : cylinderDetails[0]['CO2'],
                cylinderNumber : cylinderDetails[0]['cylinderNumber'] ,
                cylinderMake : cylinderDetails[0]['cylinderMake'] ,
                validityDate : cylinderDetails[0]['validityDate'] ,
                nextCalibrationDate : nextCalibrationDate,
                logoPath : `${constants.SERVER_FILE_PATH}logo.jpg`,
                checked : `${constants.SERVER_FILE_PATH}checkmark.svg`,
                unChecked : `${constants.SERVER_FILE_PATH}close.svg`,
                sign : `${constants.SERVER_FILE_PATH}sign.png`,
                stamp : `${constants.SERVER_FILE_PATH}nistamplogo.png`,
                swacha : `${constants.SERVER_FILE_PATH}swach.jpg`,
            },async (err, newHtml) => {
                if(err){
                    console.log(err);
                }
                
                const outputPath = `./assets/uploads/${calibrationrequestData['customerId']['customerName']}.pdf`;
                // const options = { type: "A4" };
                const options = {
                    type: 'Legal',
                    format: 'Legal',  // or 'A4', etc.
                    border: {
                        top: '0.5in',
                        right: '0.5in',
                        bottom: '0.5in',
                        left: '0.5in'
                    }
                };

                try {
                    // Generate the PDF
                    pdf.create(newHtml, options).toFile(outputPath, async function(err, res) {
                        if (err) return console.log(err);
                        console.log(`PDF saved to ${res.filename}`);
                        const htmlEmailContents = `<p>Your calibration request is been handled successfully!. Please find attachment for same</p>`;
                        const subject = `Calibration certificate`;
                        const receiverEmail = 'darshansonavane24@gmail.com'; //calibrationrequestData['customerId']['email'];//
                        console.log('Receiver Email' , receiverEmail);
                        await sendMailWithAttachment(htmlEmailContents, receiverEmail, subject , outputPath);
                    });
                    
                } catch (error) {
                    console.error('Error generating PDF:', error);
                }
            })
        


        return res.status(200).json({ code : "200" , message: "Calibration certificate generated and sent on registered email!"});
    }catch(err){
        console.log(err);
    }

    function generateDate(){
        var d = new Date();
        console.log(d.toLocaleDateString());
        d.setMonth(d.getMonth() + 3);
        // console.log(d.toLocaleDateString())
        return d.toLocaleDateString();
    }
}


module.exports = {
    generateCalibrationRequest : generateCalibrationRequest,
    getCalibrationEmployeeList : getCalibrationEmployeeList,
    getAllCalibrationList : getAllCalibrationList,
    getMyCalibrationRequestList : getMyCalibrationRequestList,
    getCustomerCalibrationList : getCustomerCalibrationList,
    validateCalibration : validateCalibration,
    updateCylinderDetails : updateCylinderDetails,
    generateAndSendCalibration : generateAndSendCalibration
}