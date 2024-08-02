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
const MachineModel = require('../model/MachineModel.js');
const CalibrationHistory = require('../model/CalibrationHistory.js');

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
            let employeeDetails = await Employee.findOne({_id : req.body.employeeId});
            await CalibrationHistory.create({ request : data._id, status : '2'});
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
        let data = await CalibrationRequest.find({employeeId : req.body.employeeId}).populate('customerId').populate('employeeId');
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
        const customerState = calibrationrequestData['customerId']['stateCode'];
        const customerEmail = calibrationrequestData['customerId']['email'];
        const nextCalibrationDate = generateDate(customerState); 
        console.log('nextCalibrationDate', nextCalibrationDate);
        let fileName = '';
        let machineModelDetails = '';
        let machineNumber = '';
        if(calibrationrequestData && calibrationrequestData['machineType'] == '0'){
            fileName = await getFileName('Petrol' , customerState);
            machineModelDetails = await MachineModel.findOne({MACHINE_NO : calibrationrequestData['customerId']['petrolMachineNumber']});
            machineNumber = calibrationrequestData['customerId']['petrolMachineNumber'];
        }else if(calibrationrequestData && calibrationrequestData['machineType'] == '1'){
            fileName = await getFileName('Diesel' , customerState);
            machineModelDetails = await MachineModel.findOne({MACHINE_NO : calibrationrequestData['customerId']['dieselMachineNumber']});
            machineNumber = calibrationrequestData['customerId']['dieselMachineNumber'];
        }else if(calibrationrequestData && calibrationrequestData['machineType'] == '2'){
            fileName = await getFileName('Combo' , customerState);
            machineModelDetails = await MachineModel.findOne({MACHINE_NO : calibrationrequestData['customerId']['comboMachineNumber']});
            machineNumber = calibrationrequestData['customerId']['comboMachineNumber'];
        } 
        let state = '';
        if(customerState == 'GA'){
            state = 'GOA';
        }else if(customerState == 'GJ'){
            state = 'GUJRAT';
        }else if(customerState == 'MH'){
            state = 'MAHARASHTRA'
        }
        console.log('machineModelDetails====' , machineModelDetails);
        if(machineModelDetails && machineModelDetails.MODEL && customerEmail){
            ejs.renderFile(
                path.join(__dirname, fileName),{
                    serialNumber : serialNumber,
                    issueDate : currentDate.getDate() + "/" + ( currentDate.getMonth() + 1 ) + "/" + currentDate.getFullYear(),
                    modelNumber : machineModelDetails.MODEL,
                    machineNumber : machineNumber,
                    centerName : calibrationrequestData['customerId']['customerName'],
                    city : calibrationrequestData['customerId']['city'],
                    state : state,
                    coValue : cylinderDetails[0]['CO'],
                    hcValue : cylinderDetails[0]['HC'] + " PPM",
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
                            const htmlEmailContents = `<p>Your calibration request is been handled successfully!. Please find attachment for same</p>`;
                            const subject = `Calibration Certificate`;
                            const receiverEmail = calibrationrequestData['customerId']['email'];
                            const reqData = {
                                status : '0'
                            }
                            await CalibrationRequest.where({_id : req.body.calibrationId}).updateOne({
                                $set : reqData
                            }).then(async(data)=>{});
                            await CalibrationHistory.create({ request : req.body.calibrationId, status : '0'})
                            await sendMailWithAttachment(htmlEmailContents, receiverEmail, subject , outputPath);
                        });
                        return res.status(200).json({ code : "200" , message: "Calibration certificate generated and sent on registered email!"});
                    } catch (error) {
                        console.error('Error generating PDF:', error);
                    }
                })
        }else {
            return res.status(400).json({ code : "400" , message: "Machine Details OR Customer Email Not Found!"});
        }
    }catch(err){
        console.log(err);
    }
}

/* function generateDate(stateCode){
    var d = new Date();
    let month = '';
    if(stateCode == 'GA'){ // GOA
        month = d.getMonth() + 5;
    }else if(stateCode == 'GJ'){ // GUJRAT
        month = d.getMonth() + 3;
    }else { // Maharashtra
        month = d.getMonth() + 4;
    }
     // Months start at 0!
    let day = d.getDate();
    console.log('Day', day , d.getDate());
    if (day < 10) day = '0' + day;
    if (month < 10) month = '0' + month;

    const formattedToday = day + '/' + month + '/' + d.getFullYear();
    return formattedToday
}
 */
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

// Function to subtract one day from a given date
function subtractOneDay(date , state) {
    const newDate = new Date(date);
    state.toLowerCase() == 'gj' ? newDate.setDate(newDate.getDate() - 2) : newDate.setDate(newDate.getDate() - 1);
    return newDate;
}

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Main function to handle the logic based on state
function generateDate(state) {
    // Get the current date
    const currentDate = new Date();
    console.log('Current Date:', getCurrentDate());

    let adjustedDate;
    // Determine how many months to add based on the state
    switch (state.toLowerCase()) {
        case 'mh':
            adjustedDate = addMonths(currentDate, 3);
            break;
        case 'ga':
            adjustedDate = addMonths(currentDate, 4);
            break;
        case 'gj':
            adjustedDate = addMonths(currentDate, 2);
            break;
        default:
            console.log('Unknown state');
            return;
    }

    // Print the adjusted date
    console.log('Date after adding months:', adjustedDate.toLocaleDateString());

    // Subtract one day from the adjusted date
    const finalDate = subtractOneDay(adjustedDate , state);
    
    // Print the final date
    console.log('Final Date:', finalDate.toLocaleDateString());
    return formatDate(finalDate);
}

function getFileName(type , state){
    if(type == 'Petrol'){
        return  state == 'GA' ?  '../templates/Petrol_GA.ejs' : '../templates/Petrol.ejs';
    }else if(type == 'Diesel'){
        return  state == 'GA' ?  '../templates/Diesel_GA.ejs' : '../templates/Diesel.ejs';
    }else if(type == 'Combo'){
        return  state == 'GA' ?  '../templates/Combo_GA.ejs' : '../templates/Combo.ejs';
    }
}

const insertMachineModel = async(req,res)=>{
    try{
        const dbData = [
            {
                "MODEL": "NUVO 10",
                "MACHINE_NO": 73
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2059
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 261
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1377
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2396
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1279
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 817
            },
            {
                "MODEL": "MGA 1",
                "MACHINE_NO": 1155
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2001
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2120
            },
            {
                "MODEL": "MGA 2",
                "MACHINE_NO": 1067
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1167
            },
            {
                "MODEL": "MGA 2",
                "MACHINE_NO": 806
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 683
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1209
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1395
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2598
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 956
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 341
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 374
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 319
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1085
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 770
            },
            {
                "MODEL": "MGA",
                "MACHINE_NO": 468
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1050
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 497
            },
            {
                "MODEL": "MGA",
                "MACHINE_NO": 442
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 260
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1230
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1550
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1090
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2149
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2300
            },
            {
                "MODEL": "MGA",
                "MACHINE_NO": 1250
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1376
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2397
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 3021
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1673
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1871
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2262
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1210
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1004
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1600
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2345
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1144
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1196
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2045
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 613
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 786
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 565
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1066
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2033
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1186
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 426
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2261
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1532
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2727
            },
            {
                "MODEL": "NUVO 10",
                "MACHINE_NO": 71
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1149
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1998
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 949
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 707
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1525
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2720
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 977
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1006
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2060
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 872
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1751
            },
            {
                "MODEL": "NUVO 20",
                "MACHINE_NO": 22
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 892
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1770
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 453
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 603
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1386
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1040
            },
            {
                "MODEL": "MGA",
                "MACHINE_NO": 778
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1271
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2320
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1635
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 771
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 294
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 918
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1089
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1516
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2711
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1273
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1299
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2335
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 892
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1770
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1111
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1255
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2306
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1881
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1033
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2289
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1331
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2365
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 999
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 882
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1336
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2060
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1006
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2388
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1363
            },
            {
                "MODEL": "MGA",
                "MACHINE_NO": 1276
            },
            {
                "MODEL": "NUVO 10",
                "MACHINE_NO": 10
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 841
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 196
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2186
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1104
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 876
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1756
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2927
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1555
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1243
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2466
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2338
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1304
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2233
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2203
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 149
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1324
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 727
            },
            {
                "MODEL": "NUVO10",
                "MACHINE_NO": 76
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 195
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2556
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 901
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 227
            },
            {
                "MODEL": "MGA",
                "MACHINE_NO": 143
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2231
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1079
            },
            {
                "MODEL": "NUVO10",
                "MACHINE_NO": 84
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1568
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2754
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 462
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1013
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1195
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 730
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1538
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 530
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 670
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 856
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2025
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1330
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1311
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2346
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1508
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 161
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 708
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 703
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2665
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2922
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1339
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 393
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1300
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2734
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1544
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1392
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1391
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2411
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2402
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1379
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1159
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1792
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2732
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1542
            },
            {
                "MODEL": "MGA",
                "MACHINE_NO": 628
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1284
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1667
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 806
            },
            {
                "MODEL": "MGA",
                "MACHINE_NO": 271
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 560
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 36
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1303
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2337
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1511
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 722
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1367
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2391
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1035
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1098
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1388
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2409
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1447
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 715
            },
            {
                "MODEL": "NUVO10",
                "MACHINE_NO": 80
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1007
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2061
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1755
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 494
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1782
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2612
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1474
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2392
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1368
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2434
            },
            {
                "MODEL": "NUVO10",
                "MACHINE_NO": 14
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1251
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 858
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1237
            },
            {
                "MODEL": "MGA",
                "MACHINE_NO": 859
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1378
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2401
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 158
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 687
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1465
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1147
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1218
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2440
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2752
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1563
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1275
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1274
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1537
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 18
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1381
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2404
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 795
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2375
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1341
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 638
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1124
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2158
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 876
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 438
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 991
            },
            {
                "MODEL": "NUVO10",
                "MACHINE_NO": 87
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1579
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2768
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1174
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 40
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1242
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2465
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1913
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1318
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2532
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 408
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 963
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2587
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1385
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 136
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 788
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 776
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 123
            },
            {
                "MODEL": "NUVO10",
                "MACHINE_NO": 17
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2308
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2289
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 224
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 702
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1239
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2462
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2435
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1088
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 526
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 710
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1285
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 570
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1535
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2910
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 689
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 3037
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1687
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1202
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1217
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2439
            },
            {
                "MODEL": "NUVO10",
                "MACHINE_NO": 98
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 907
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2161
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1369
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 462
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1680
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 3029
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2567
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1367
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 224
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1228
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2449
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2373
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1340
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1077
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 962
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1340
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 885
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1396
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1333
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2642
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1448
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 718
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 717
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1903
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1902
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2461
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1238
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 629
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1762
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 427
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 229
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1395
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 734
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1229
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2450
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2175
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1114
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2198
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2235
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1167
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 889
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 525
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 253
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2715
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1371
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 756
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1064
            },
            {
                "MODEL": "NUVO10",
                "MACHINE_NO": 88
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 193
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 748
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1569
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 2
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 249
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1335
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 775
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2512
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1297
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1276
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2491
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1293
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 830
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 965
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2552
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1338
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 571
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 816
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1277
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 960
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 3
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1054
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1910
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2477
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1262
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1443
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2833
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1477
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 697
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1581
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 178
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1227
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 761
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 677
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 570
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2780
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1590
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2472
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2358
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 523
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 683
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1301
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2336
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2457
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1234
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1137
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1988
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1746
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1039
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1011
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 477
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1020
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1220
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1251
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2417
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1315
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2529
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 861
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 428
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 503
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2792
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 681
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 645
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1126
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 514
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 271
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 297
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 678
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 253
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2442
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 910
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 663
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1595
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2785
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2785
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1595
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 644
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 251
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2719
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1524
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 844
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1731
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 799
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 387
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1304
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2517
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 653
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 870
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1749
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 673
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1310
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2524
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1993
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 747
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 704
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1493
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1671
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 793
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1309
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1316
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1331
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2539
            },
            {
                "MODEL": "NUVO10",
                "MACHINE_NO": 72
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2369
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1332
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1299
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2509
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2339
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1305
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 957
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1875
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2148
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1087
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1613
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2965
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1951
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 686
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 169
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 822
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2647
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1248
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1080
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2139
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 131
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1320
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 540
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 886
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 409
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1274
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2787
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1597
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2161
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1588
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1329
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2370
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2526
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1311
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1543
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2733
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1341
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 538
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 564
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1354
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 310
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2571
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1369
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1748
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2840
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1428
            },
            {
                "MODEL": "NUVO10",
                "MACHINE_NO": 50
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2513
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1298
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 585
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1260
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 141
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 961
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 871
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1328
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1246
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 576
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 607
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1088
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1928
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1070
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1337
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2551
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1017
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1387
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2408
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2092
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2959
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1611
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1201
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2423
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1027
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 772
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1046
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1389
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2410
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2082
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 818
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2344
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1363
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1323
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 909
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1363
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 837
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1235
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2458
            },
            {
                "MODEL": "NUVO10",
                "MACHINE_NO": 23
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2819
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1427
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1001
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2054
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2469
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1250
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1434
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1292
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 979
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1040
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 830
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1714
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2533
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1319
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 2463
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1232
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2636
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1442
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1078
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1933
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1758
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 878
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 587
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 715
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 198
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 794
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1367
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 3045
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1695
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 469
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1333
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2223
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1166
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1057
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1912
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 360
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 287
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 883
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1337
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2603
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1408
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 268
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 898
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 523
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 84
            },
            {
                "MODEL": "NUVO10",
                "MACHINE_NO": 12
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1312
            },
            {
                "MODEL": "NUVO10",
                "MACHINE_NO": 18
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1290
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 215
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2463
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2825
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1433
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1015
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2088
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2766
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1015
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 562
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1952
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1333
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1601
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 985
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1458
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2973
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1622
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1225
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2447
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1700
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1439
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1394
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2596
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2405
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1382
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 975
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1593
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 748
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 938
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1815
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 895
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 562
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1743
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2545
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 940
            },
            {
                "MODEL": "NUVO10",
                "MACHINE_NO": 94
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1296
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2511
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1687
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 459
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 883
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2710
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 3039
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1689
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1357
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2536
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2386
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1358
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1219
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2441
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2723
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1528
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 559
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1160
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2658
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1506
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 511
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1060
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1038
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2441
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1219
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1406
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2608
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2717
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1456
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1453
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2843
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 453
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 420
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 643
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1428
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1311
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 853
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1236
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 729
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 836
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2302
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1111
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 770
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1644
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2238
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 763
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 933
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1807
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 688
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 19
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 747
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 384
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 228
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1626
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2981
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2743
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1555
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 772
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2167
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 733
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 228
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 835
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1205
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 762
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1148
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1375
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2716
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2725
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1530
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1529
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2724
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1361
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 906
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1191
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2040
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2731
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1541
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1544
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2730
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2058
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1016
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1523
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2718
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1087
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1527
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1330
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2538
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 842
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1728
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1624
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1000
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1068
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1925
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2623
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1418
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1058
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2108
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1713
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 829
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 808
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 581
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 412
            },
            {
                "MODEL": "NUV010",
                "MACHINE_NO": 44
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 295
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 480
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1042
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2083
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1044
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1310
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1082
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1095
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1348
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 270
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 476
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1572
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2943
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1070
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2977
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1625
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1137
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 563
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1953
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1090
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1105
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2028
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 826
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 175
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 795
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1593
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2794
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 23
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 184
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1349
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2555
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2845
            },
            {
                "MODEL": "MGA",
                "MACHINE_NO": 1454
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2862
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1566
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2749
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 551
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 558
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 694
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2147
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2570
            },
            {
                "MODEL": "MGA",
                "MACHINE_NO": 1525
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 2
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2454
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 0
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 0
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1328
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 687
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2654
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1460
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1287
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1393
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2595
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2852
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1462
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 561
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 561
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1329
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2537
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1087
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1701
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 648
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1132
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2537
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1329
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1352
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2560
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2543
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 953
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 894
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1771
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2991
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 724
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 684
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1463
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 173
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1221
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 855
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1752
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2783
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1592
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1335
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2548
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1552
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 747
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1712
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 3058
            },
            {
                "MODEL": "MGA",
                "MACHINE_NO": 1252
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1362
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1075
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 927
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2421
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1134
            },
            {
                "MODEL": "NUVO10",
                "MACHINE_NO": 109
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1461
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2655
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 695
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1391
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2593
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 470
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 632
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2142
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2580
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1376
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1495
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 864
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1320
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 524
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1154
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 803
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1269
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1805
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 927
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1649
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2996
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 973
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 418
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1298
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2885
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1504
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 694
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1472
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1214
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2436
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 142
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1076
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 980
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1857
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2144
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1078
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2390
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1365
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1366
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2393
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2528
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1314
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 705
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1486
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1791
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1307
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 510
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 312
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2395
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1370
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1490
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2873
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1151
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1115
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1969
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1981
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1135
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1086
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2150
            },
            {
                "MODEL": "NUVO10",
                "MACHINE_NO": 83
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2703
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1509
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 639
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1419
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2611
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1982
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 492
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 509
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 774
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 842
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 199
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1298
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2334
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1397
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 613
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 612
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1396
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 940
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 369
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 614
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1398
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 843
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 816
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2460
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1236
            },
            {
                "MODEL": "NUVO10",
                "MACHINE_NO": 36
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 6
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 964
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 936
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1364
            },
            {
                "MODEL": "NUVO10",
                "MACHINE_NO": 56
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1471
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2663
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2031
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1185
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1162
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 474
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 450
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 342
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2154
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1120
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 631
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 552
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 269
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1329
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2129
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1074
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1102
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 183
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1042
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 85
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 179
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1465
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 12
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 691
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1117
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1971
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 133
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1081
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2415
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 728
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 911
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1370
            },
            {
                "MODEL": "NUVO10",
                "MACHINE_NO": 74
            },
            {
                "MODEL": "NUVO10",
                "MACHINE_NO": 34
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1651
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 765
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1148
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1065
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1995
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 523
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2201
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1128
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1103
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1959
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1568
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 760
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 146
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 390
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2902
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1484
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 680
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 714
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2128
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1780
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 184
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 784
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 606
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2016
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1068
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1096
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1538
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2483
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1265
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1099
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2901
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 900
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 8
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 17
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1881
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1033
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1145
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1871
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 774
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1645
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1702
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1165
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1632
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 652
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2143
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1161
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 915
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1473
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1505
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2700
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 463
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1014
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2612
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1365
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 582
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2123
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1300
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1272
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 666
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2151
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1092
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2152
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1091
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1583
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 969
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 790
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1761
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1105
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2178
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 660
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1093
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1406
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 625
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 768
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2153
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2209
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1136
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1308
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2342
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2343
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1309
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 986
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1604
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 286
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 252
            },
            {
                "MODEL": "NUVO20",
                "MACHINE_NO": 3
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1114
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1964
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1001
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 6
            },
            {
                "MODEL": "MGAA2",
                "MACHINE_NO": 560
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 156
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 374
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 888
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1222
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 626
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1407
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2003
            },
            {
                "MODEL": "NUVO10",
                "MACHINE_NO": 101
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 963
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1786
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 670
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 112
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 340
            },
            {
                "MODEL": "NUVO10",
                "MACHINE_NO": 65
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 487
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2189
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1736
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 884
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1034
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 489
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1759
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 873
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 865
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 341
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 364
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 428
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2903
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1526
            },
            {
                "MODEL": "NUVO10",
                "MACHINE_NO": 115
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1660
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 3008
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 813
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 825
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1962
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2446
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1226
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1551
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2925
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 920
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 346
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1522
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2899
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1189
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 721
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1336
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 845
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 791
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1450
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 689
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 968
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2135
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2997
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1650
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1514
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2893
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2005
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1171
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2006
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1167
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1442
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 869
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1501
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2883
            },
            {
                "MODEL": "NUVO10",
                "MACHINE_NO": 112
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1183
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 950
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1825
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 449
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 145
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 838
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2094
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1424
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 610
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2613
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1162
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 812
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 1321
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2307
            },
            {
                "MODEL": "NUVO10",
                "MACHINE_NO": 32
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2023
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2118
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2012
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 685
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 627
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1408
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 290
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 887
            },
            {
                "MODEL": "MGA2",
                "MACHINE_NO": 619
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1404
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 653
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2630
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 1766
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2474
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1261
            },
            {
                "MODEL": "MGA1",
                "MACHINE_NO": 1493
            },
            {
                "MODEL": "DSM",
                "MACHINE_NO": 2688
            }
        ]
        await MachineModel.insertMany(dbData).then((data)=>{
            return res.status(200).json({ code : "200" , message: "State List Created Successfully!!", data: data });
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

const getCylinderDetails = async(req,res)=>{
    try{
        const data = await CylinderDetails.find();
        return res.status(200).json({code : "200" , message : 'Cylinder Details Fetched!' , data : data});
    }catch(err){
        console.log(err);
    }
}

const insertNewMachineDetails = async(req,res)=>{
    try{
        if(!req.body.model || !req.body.machineNumber){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }
        await MachineModel.create({
            MODEL : req.body.model,
            MACHINE_NO : req.body.machineNumber
        }).then(data=>{
            return res.status(200).json({code : "200" , message : 'Machine Details Added Successfully!' , data : data});
        }).catch(err=>{
            console.log(err);
        })
    }catch(err){    
        console.log(err);
    }
}

const updateCalibrationStatusById = async(req,res)=>{
    try{
        let reqData = {
            status : "2"
        }
        
        await CalibrationRequest.where({_id : req.body.calibrationId}).updateOne({
            $set : reqData
        }).then(async(data)=>{
            return res.status(200).json({code : "200" , message : 'Request updated successfully!' , data : data});
        });
    }catch(err){
        console.log(err);
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
    generateAndSendCalibration : generateAndSendCalibration,
    insertMachineModel : insertMachineModel,
    getCylinderDetails : getCylinderDetails,
    insertNewMachineDetails : insertNewMachineDetails,
    updateCalibrationStatusById : updateCalibrationStatusById
}