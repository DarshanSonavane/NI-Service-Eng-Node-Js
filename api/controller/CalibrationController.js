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
const qr = require('qr-image');
const AppVersion = require("../model/AppVersion.js");

const generateCalibrationRequest = async(req,res)=>{
    try{
        if(!req.body.customerId || !req.body.machineType || !req.body.employeeId || !req.body.version){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }
        if(req.body.version){
            const version = await AppVersion.find();
            isValidCalibrationRequest = await validateCalibrationOnBackend(req.body.customerId , req.body.machineType );
            if(isValidCalibrationRequest){
                if(version && version.length > 0){
                    if(req.body.version == version[0].version){
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
                            await CalibrationHistory.create({ requestId : data._id, status : '2'});
                            sendMail(customerDetails.customerName , customerDetails.customerCode , "Calibration" , type , employeeDetails.email , customerDetails.city , customerDetails.mobile , 'calibration')
                            return res.status(200).json({ code : "200" , message: "Calibration Request Raised Successfully!", data: data });
                        }).catch((err)=>{
                            console.log(err);
                            return res.status(500).json({
                                message: "Internal server error",
                                status: false,
                            });
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
                return res.status(401).json({
                    message: "You can't make a new request as 10 days have not passed since you sent last Calibration Request!",
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
        let data = await CalibrationRequest.find().sort({_id : -1}).populate('customerId').populate('employeeId');
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
        let data = await CalibrationRequest.find({employeeId : req.body.employeeId}).sort({_id : -1}).populate('customerId').populate('employeeId');
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
        let data = await CalibrationRequest.find({customerId : req.body.customerId}).sort({_id : -1}).populate('customerId').populate('employeeId');
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
            console.log("Calibration Request validateCalibration API======== newCreatedDate : " , newCreatedDate , 'newCreatedDate' , newCurrentDate , 'difference' , diffTime ,"======" ,  diffDays)
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
        const customerName = calibrationrequestData['customerId']['customerName'];
        await generateBarcodeForCalibrationRequest(req.body.calibrationId , customerName);

        console.log('nextCalibrationDate', nextCalibrationDate , calibrationrequestData['machineType'] , calibrationrequestData);
        let fileName = '';
        let machineModelDetails = '';
        let machineNumber = '';
        if(calibrationrequestData && ( calibrationrequestData['machineType'] == '0' || calibrationrequestData['machineType'] == 0)){
            console.log("Here")
            fileName = await getFileName('Petrol' , customerState);
            machineModelDetails = await MachineModel.findOne({MACHINE_NO : calibrationrequestData['customerId']['petrolMachineNumber'] , CUSTOMER_CODE : calibrationrequestData['customerId']['customerCode']});
            machineNumber = calibrationrequestData['customerId']['petrolMachineNumber'];
        }else if(calibrationrequestData && calibrationrequestData['machineType'] == '1'){
            console.log("Here1")
            fileName = await getFileName('Diesel' , customerState);
            machineModelDetails = await MachineModel.findOne({MACHINE_NO : calibrationrequestData['customerId']['dieselMachineNumber'] , CUSTOMER_CODE : calibrationrequestData['customerId']['customerCode']});
            machineNumber = calibrationrequestData['customerId']['dieselMachineNumber'];
        }else if(calibrationrequestData && calibrationrequestData['machineType'] == '2'){
            console.log("Here2")
            fileName = await getFileName('Combo' , customerState);
            machineModelDetails = await MachineModel.findOne({MACHINE_NO : calibrationrequestData['customerId']['comboMachineNumber'] , CUSTOMER_CODE : calibrationrequestData['customerId']['customerCode']});
            machineNumber = calibrationrequestData['customerId']['comboMachineNumber'];
        } 
        let state = '';
        if(customerState == 'GA'){
            state = 'GOA';
        }else if(customerState == 'GJ'){
            state = 'GUJRAT';
        }else if(customerState == 'MH'){
            state = 'MAHARASHTRA'
        }else if(customerState == 'MP'){
            state = 'MADHYA PRADESH'
        }else if(customerState == 'CH'){
            state = 'CHHASTTISGARH'
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
                    qrURL : `${constants.SERVER_FILE_PATH}QR-Codes/calibration/qr-code_${req.body.calibrationId}.png`
                },async (err, newHtml) => {
                    if(err){
                        console.log(err);
                    }
                    
                    const outputPath = `./assets/uploads/calibration/${calibrationrequestData['customerId']['customerName']}_${req.body.calibrationId}.pdf`;
                    // const options = { type: "A4" };
                    // const options = { type: 'A4'};
                    var options = {
                        format: 'A4',
                        border: '0.5cm',
                        zoomFactor: '0.5',
                        timeout : 90000,
                        renderDelay: 3000,
                        // other options
                    };
    
                    try {
                        // Generate the PDF
                        pdf.create(newHtml, options).toFile(outputPath, async function(err, res) {
                            if (err) return console.log(err);
                            console.log(`PDF saved to ${res.filename}`);
                            const htmlEmailContents = `<html>
                                  <body>
                                    <p>Your calibration request is been handled successfully!. Please find attachment for same</p>
                            
                                    <!-- Footer content with an embedded image -->
                                    <footer style="margin-top: 20px; font-size: 12px; color: green; text-align: left;">
                                      <p><b>Best Regards</b></p>
                                      <img src="${constants.SERVER_FILE_PATH}NI-SERVICE-LOGO.jpg" alt="Company Logo" style="width: 100px; margin-top: 10px;" />
                                      <p><b>Office No.18,2nd Floor, GNP Gallaria  MIDC Road , Dombivali (E) 421202</b></p>
                                      <p><b>Contact Us : 9892151843</b></p>
                                      <p><b>Email : <a href="mailto:service@niserviceeng.com">service@niserviceeng.com</a></b></p>
                                      <p><b><a href="http://www.niserviceeng.com" style="color: green;">Website</a></b></p>
                                      
                                    </footer>
                                  </body>
                                </html>`;
                            const subject = `Calibration Certificate`;
                            const receiverEmail = calibrationrequestData['customerId']['email'];
                            const reqData = {
                                status : '0'
                            }
                            await CalibrationRequest.where({_id : req.body.calibrationId}).updateOne({
                                $set : reqData
                            }).then(async(data)=>{});
                            await CalibrationHistory.create({ requestId : req.body.calibrationId, status : '0'})
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
    state.toLowerCase() == 'gj' ? newDate.setDate(newDate.getDate()) : newDate.setDate(newDate.getDate() - 1);
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
        case 'mp':
            adjustedDate = addMonths(currentDate, 4);
            break;
        case 'ch':
            adjustedDate = addMonths(currentDate, 4);
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

const generateBarcodeForCalibrationRequest =  async(calibrationId , customerName)=>{
    try{
        const URL = `http://13.49.111.133:3000/uploads/calibration/${customerName}_${calibrationId}.pdf`;
        const qrSvg = qr.imageSync(URL, { type: 'png' });
        const filePath = `./assets/QR-Codes/qr-code_${calibrationId}.png`
        // Save the image to a file
        fs.writeFileSync(filePath, qrSvg);
        console.log("QR Generated and saved successfully!" , filePath);
    }catch(err){
        console.log(err);
    }
}

const insertMachineModel = async(req,res)=>{
    try{
        const dbData = [
            {
             "CUSTOMER_CODE": 131040,
             "MODEL": "NUVO 10",
             "MACHINE_NO": 73
            },
            {
             "CUSTOMER_CODE": 108521,
             "MODEL": "DSM",
             "MACHINE_NO": 2059
            },
            {
             "CUSTOMER_CODE": 108521,
             "MODEL": "MGA2",
             "MACHINE_NO": 261
            },
            {
             "CUSTOMER_CODE": 130120,
             "MODEL": "MGA1",
             "MACHINE_NO": 1377
            },
            {
             "CUSTOMER_CODE": 130120,
             "MODEL": "DSM",
             "MACHINE_NO": 2396
            },
            {
             "CUSTOMER_CODE": 110280,
             "MODEL": "DSM",
             "MACHINE_NO": 1279
            },
            {
             "CUSTOMER_CODE": 110280,
             "MODEL": "MGA1",
             "MACHINE_NO": 817
            },
            {
             "CUSTOMER_CODE": 111803,
             "MODEL": "MGA 1",
             "MACHINE_NO": 1155
            },
            {
             "CUSTOMER_CODE": 111803,
             "MODEL": "DSM",
             "MACHINE_NO": 2001
            },
            {
             "CUSTOMER_CODE": 111952,
             "MODEL": "DSM",
             "MACHINE_NO": 2120
            },
            {
             "CUSTOMER_CODE": 111952,
             "MODEL": "MGA 2",
             "MACHINE_NO": 1067
            },
            {
             "CUSTOMER_CODE": 110379,
             "MODEL": "DSM",
             "MACHINE_NO": 1167
            },
            {
             "CUSTOMER_CODE": 110379,
             "MODEL": "MGA 2",
             "MACHINE_NO": 806
            },
            {
             "CUSTOMER_CODE": 109440,
             "MODEL": "DSM",
             "MACHINE_NO": 683
            },
            {
             "CUSTOMER_CODE": 109440,
             "MODEL": "MGA1",
             "MACHINE_NO": 1209
            },
            {
             "CUSTOMER_CODE": 130356,
             "MODEL": "MGA2",
             "MACHINE_NO": 1395
            },
            {
             "CUSTOMER_CODE": 130356,
             "MODEL": "DSM",
             "MACHINE_NO": 2598
            },
            {
             "CUSTOMER_CODE": 109868,
             "MODEL": "DSM",
             "MACHINE_NO": 956
            },
            {
             "CUSTOMER_CODE": 109868,
             "MODEL": "MGA2",
             "MACHINE_NO": 341
            },
            {
             "CUSTOMER_CODE": 108804,
             "MODEL": "MGA1",
             "MACHINE_NO": 374
            },
            {
             "CUSTOMER_CODE": 108804,
             "MODEL": "DSM",
             "MACHINE_NO": 319
            },
            {
             "CUSTOMER_CODE": 109528,
             "MODEL": "MGA2",
             "MACHINE_NO": 1085
            },
            {
             "CUSTOMER_CODE": 109528,
             "MODEL": "DSM",
             "MACHINE_NO": 770
            },
            {
             "CUSTOMER_CODE": 109254,
             "MODEL": "MGA",
             "MACHINE_NO": 468
            },
            {
             "CUSTOMER_CODE": 109254,
             "MODEL": "DSM",
             "MACHINE_NO": 1050
            },
            {
             "CUSTOMER_CODE": 109049,
             "MODEL": "DSM",
             "MACHINE_NO": 497
            },
            {
             "CUSTOMER_CODE": 109049,
             "MODEL": "MGA",
             "MACHINE_NO": 442
            },
            {
             "CUSTOMER_CODE": 109844,
             "MODEL": "MGA2",
             "MACHINE_NO": 260
            },
            {
             "CUSTOMER_CODE": 109844,
             "MODEL": "DSM",
             "MACHINE_NO": 1230
            },
            {
             "CUSTOMER_CODE": 130807,
             "MODEL": "MGA2",
             "MACHINE_NO": 1550
            },
            {
             "CUSTOMER_CODE": 108709,
             "MODEL": "MGA2",
             "MACHINE_NO": 1090
            },
            {
             "CUSTOMER_CODE": 108709,
             "MODEL": "DSM",
             "MACHINE_NO": 2149
            },
            {
             "CUSTOMER_CODE": 111857,
             "MODEL": "DSM",
             "MACHINE_NO": 2300
            },
            {
             "CUSTOMER_CODE": 111857,
             "MODEL": "MGA",
             "MACHINE_NO": 1250
            },
            {
             "CUSTOMER_CODE": 130083,
             "MODEL": "MGA1",
             "MACHINE_NO": 1376
            },
            {
             "CUSTOMER_CODE": 130083,
             "MODEL": "DSM",
             "MACHINE_NO": 2397
            },
            {
             "CUSTOMER_CODE": 131057,
             "MODEL": "DSM",
             "MACHINE_NO": 3021
            },
            {
             "CUSTOMER_CODE": 131057,
             "MODEL": "MGA1",
             "MACHINE_NO": 1673
            },
            {
             "CUSTOMER_CODE": 111655,
             "MODEL": "DSM",
             "MACHINE_NO": 1871
            },
            {
             "CUSTOMER_CODE": 130074,
             "MODEL": "DSM",
             "MACHINE_NO": 2262
            },
            {
             "CUSTOMER_CODE": 130074,
             "MODEL": "MGA1",
             "MACHINE_NO": 1210
            },
            {
             "CUSTOMER_CODE": 111465,
             "MODEL": "MGA1",
             "MACHINE_NO": 1004
            },
            {
             "CUSTOMER_CODE": 111465,
             "MODEL": "DSM",
             "MACHINE_NO": 1600
            },
            {
             "CUSTOMER_CODE": 109347,
             "MODEL": "DSM",
             "MACHINE_NO": 2345
            },
            {
             "CUSTOMER_CODE": 109347,
             "MODEL": "MGA1",
             "MACHINE_NO": 1144
            },
            {
             "CUSTOMER_CODE": 108820,
             "MODEL": "MGA1",
             "MACHINE_NO": 1196
            },
            {
             "CUSTOMER_CODE": 108820,
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
             "CUSTOMER_CODE": 110025,
             "MODEL": "MGA2",
             "MACHINE_NO": 565
            },
            {
             "CUSTOMER_CODE": 110025,
             "MODEL": "DSM",
             "MACHINE_NO": 1066
            },
            {
             "CUSTOMER_CODE": 111843,
             "MODEL": "DSM",
             "MACHINE_NO": 2033
            },
            {
             "CUSTOMER_CODE": 111843,
             "MODEL": "MGA1",
             "MACHINE_NO": 1186
            },
            {
             "CUSTOMER_CODE": 109965,
             "MODEL": "MGA2",
             "MACHINE_NO": 426
            },
            {
             "CUSTOMER_CODE": 109965,
             "MODEL": "DSM",
             "MACHINE_NO": 2261
            },
            {
             "CUSTOMER_CODE": 130529,
             "MODEL": "MGA1",
             "MACHINE_NO": 1532
            },
            {
             "CUSTOMER_CODE": 130529,
             "MODEL": "DSM",
             "MACHINE_NO": 2727
            },
            {
             "CUSTOMER_CODE": 131032,
             "MODEL": "NUVO 10",
             "MACHINE_NO": 71
            },
            {
             "CUSTOMER_CODE": 111788,
             "MODEL": "MGA1",
             "MACHINE_NO": 1149
            },
            {
             "CUSTOMER_CODE": 111788,
             "MODEL": "DSM",
             "MACHINE_NO": 1998
            },
            {
             "CUSTOMER_CODE": 108161,
             "MODEL": "DSM",
             "MACHINE_NO": 949
            },
            {
             "CUSTOMER_CODE": 108161,
             "MODEL": "MGA1",
             "MACHINE_NO": 707
            },
            {
             "CUSTOMER_CODE": 130516,
             "MODEL": "MGA1",
             "MACHINE_NO": 1525
            },
            {
             "CUSTOMER_CODE": 130516,
             "MODEL": "DSM",
             "MACHINE_NO": 2720
            },
            {
             "CUSTOMER_CODE": 109965,
             "MODEL": "DSM",
             "MACHINE_NO": 977
            },
            {
             "CUSTOMER_CODE": 111856,
             "MODEL": "MGA2",
             "MACHINE_NO": 1006
            },
            {
             "CUSTOMER_CODE": 111856,
             "MODEL": "DSM",
             "MACHINE_NO": 2060
            },
            {
             "CUSTOMER_CODE": 111558,
             "MODEL": "MGA2",
             "MACHINE_NO": 872
            },
            {
             "CUSTOMER_CODE": 111558,
             "MODEL": "DSM",
             "MACHINE_NO": 1751
            },
            {
             "CUSTOMER_CODE": 130787,
             "MODEL": "NUVO 20",
             "MACHINE_NO": 22
            },
            {
             "CUSTOMER_CODE": 111573,
             "MODEL": "MGA2",
             "MACHINE_NO": 892
            },
            {
             "CUSTOMER_CODE": 111573,
             "MODEL": "DSM",
             "MACHINE_NO": 1770
            },
            {
             "CUSTOMER_CODE": 108249,
             "MODEL": "MGA1",
             "MACHINE_NO": 453
            },
            {
             "CUSTOMER_CODE": 110399,
             "MODEL": "MGA2",
             "MACHINE_NO": 603
            },
            {
             "CUSTOMER_CODE": 110399,
             "MODEL": "DSM",
             "MACHINE_NO": 1386
            },
            {
             "CUSTOMER_CODE": 108783,
             "MODEL": "DSM",
             "MACHINE_NO": 1040
            },
            {
             "CUSTOMER_CODE": 108783,
             "MODEL": "MGA",
             "MACHINE_NO": 778
            },
            {
             "CUSTOMER_CODE": 130084,
             "MODEL": "MGA1",
             "MACHINE_NO": 1271
            },
            {
             "CUSTOMER_CODE": 130084,
             "MODEL": "DSM",
             "MACHINE_NO": 2320
            },
            {
             "CUSTOMER_CODE": 111470,
             "MODEL": "DSM",
             "MACHINE_NO": 1635
            },
            {
             "CUSTOMER_CODE": 111470,
             "MODEL": "MGA1",
             "MACHINE_NO": 771
            },
            {
             "CUSTOMER_CODE": 108328,
             "MODEL": "DSM",
             "MACHINE_NO": 294
            },
            {
             "CUSTOMER_CODE": 111602,
             "MODEL": "MGA2",
             "MACHINE_NO": 918
            },
            {
             "CUSTOMER_CODE": 111517,
             "MODEL": "MGA2",
             "MACHINE_NO": 1089
            },
            {
             "CUSTOMER_CODE": 130495,
             "MODEL": "MGA1",
             "MACHINE_NO": 1516
            },
            {
             "CUSTOMER_CODE": 130495,
             "MODEL": "DSM",
             "MACHINE_NO": 2711
            },
            {
             "CUSTOMER_CODE": 130111,
             "MODEL": "MGA1",
             "MACHINE_NO": 1273
            },
            {
             "CUSTOMER_CODE": 130114,
             "MODEL": "MGA1",
             "MACHINE_NO": 1299
            },
            {
             "CUSTOMER_CODE": 130114,
             "MODEL": "DSM",
             "MACHINE_NO": 2335
            },
            {
             "CUSTOMER_CODE": 111573,
             "MODEL": "MGA2",
             "MACHINE_NO": 892
            },
            {
             "CUSTOMER_CODE": 111573,
             "MODEL": "DSM",
             "MACHINE_NO": 1770
            },
            {
             "CUSTOMER_CODE": 111727,
             "MODEL": "MGA1",
             "MACHINE_NO": 1111
            },
            {
             "CUSTOMER_CODE": 108057,
             "MODEL": "MGA1",
             "MACHINE_NO": 1255
            },
            {
             "CUSTOMER_CODE": 108057,
             "MODEL": "DSM",
             "MACHINE_NO": 2306
            },
            {
             "CUSTOMER_CODE": 130201,
             "MODEL": "DSM",
             "MACHINE_NO": 1881
            },
            {
             "CUSTOMER_CODE": 130201,
             "MODEL": "MGA1",
             "MACHINE_NO": 1033
            },
            {
             "CUSTOMER_CODE": 130003,
             "MODEL": "DSM",
             "MACHINE_NO": 2289
            },
            {
             "CUSTOMER_CODE": 130134,
             "MODEL": "MGA1",
             "MACHINE_NO": 1331
            },
            {
             "CUSTOMER_CODE": 130134,
             "MODEL": "DSM",
             "MACHINE_NO": 2365
            },
            {
             "CUSTOMER_CODE": 111854,
             "MODEL": "MGA2",
             "MACHINE_NO": 999
            },
            {
             "CUSTOMER_CODE": 110356,
             "MODEL": "MGA2",
             "MACHINE_NO": 882
            },
            {
             "CUSTOMER_CODE": 110356,
             "MODEL": "DSM",
             "MACHINE_NO": 1336
            },
            {
             "CUSTOMER_CODE": 111856,
             "MODEL": "DSM",
             "MACHINE_NO": 2060
            },
            {
             "CUSTOMER_CODE": 111856,
             "MODEL": "MGA2",
             "MACHINE_NO": 1006
            },
            {
             "CUSTOMER_CODE": 108059,
             "MODEL": "DSM",
             "MACHINE_NO": 2388
            },
            {
             "CUSTOMER_CODE": 108059,
             "MODEL": "MGA1",
             "MACHINE_NO": 1363
            },
            {
             "CUSTOMER_CODE": 108068,
             "MODEL": "MGA",
             "MACHINE_NO": 1276
            },
            {
             "CUSTOMER_CODE": 130837,
             "MODEL": "NUVO 10",
             "MACHINE_NO": 10
            },
            {
             "CUSTOMER_CODE": 109722,
             "MODEL": "DSM",
             "MACHINE_NO": 841
            },
            {
             "CUSTOMER_CODE": 109722,
             "MODEL": "MGA1",
             "MACHINE_NO": 196
            },
            {
             "CUSTOMER_CODE": 108826,
             "MODEL": "DSM",
             "MACHINE_NO": 2186
            },
            {
             "CUSTOMER_CODE": 108826,
             "MODEL": "MGA2",
             "MACHINE_NO": 1104
            },
            {
             "CUSTOMER_CODE": 111553,
             "MODEL": "MGA2",
             "MACHINE_NO": 876
            },
            {
             "CUSTOMER_CODE": 111553,
             "MODEL": "DSM",
             "MACHINE_NO": 1756
            },
            {
             "CUSTOMER_CODE": 130822,
             "MODEL": "DSM",
             "MACHINE_NO": 2927
            },
            {
             "CUSTOMER_CODE": 130822,
             "MODEL": "MGA2",
             "MACHINE_NO": 1555
            },
            {
             "CUSTOMER_CODE": 130247,
             "MODEL": "MGA2",
             "MACHINE_NO": 1243
            },
            {
             "CUSTOMER_CODE": 130247,
             "MODEL": "DSM",
             "MACHINE_NO": 2466
            },
            {
             "CUSTOMER_CODE": 130124,
             "MODEL": "DSM",
             "MACHINE_NO": 2338
            },
            {
             "CUSTOMER_CODE": 130124,
             "MODEL": "MGA1",
             "MACHINE_NO": 1304
            },
            {
             "CUSTOMER_CODE": 112433,
             "MODEL": "DSM",
             "MACHINE_NO": 2233
            },
            {
             "CUSTOMER_CODE": 108502,
             "MODEL": "DSM",
             "MACHINE_NO": 2203
            },
            {
             "CUSTOMER_CODE": 108502,
             "MODEL": "MGA2",
             "MACHINE_NO": 149
            },
            {
             "CUSTOMER_CODE": 108496,
             "MODEL": "MGA1",
             "MACHINE_NO": 1324
            },
            {
             "CUSTOMER_CODE": 109352,
             "MODEL": "MGA1",
             "MACHINE_NO": 727
            },
            {
             "CUSTOMER_CODE": 131045,
             "MODEL": "NUVO10",
             "MACHINE_NO": 76
            },
            {
             "CUSTOMER_CODE": 108620,
             "MODEL": "MGA2",
             "MACHINE_NO": 195
            },
            {
             "CUSTOMER_CODE": 108620,
             "MODEL": "DSM",
             "MACHINE_NO": 2556
            },
            {
             "CUSTOMER_CODE": 109808,
             "MODEL": "DSM",
             "MACHINE_NO": 901
            },
            {
             "CUSTOMER_CODE": 109808,
             "MODEL": "MGA2",
             "MACHINE_NO": 227
            },
            {
             "CUSTOMER_CODE": 108074,
             "MODEL": "MGA",
             "MACHINE_NO": 143
            },
            {
             "CUSTOMER_CODE": 108074,
             "MODEL": "DSM",
             "MACHINE_NO": 2231
            },
            {
             "CUSTOMER_CODE": 111975,
             "MODEL": "MGA2",
             "MACHINE_NO": 1079
            },
            {
             "CUSTOMER_CODE": 131073,
             "MODEL": "NUVO10",
             "MACHINE_NO": 84
            },
            {
             "CUSTOMER_CODE": 130551,
             "MODEL": "MGA1",
             "MACHINE_NO": 1568
            },
            {
             "CUSTOMER_CODE": 130551,
             "MODEL": "DSM",
             "MACHINE_NO": 2754
            },
            {
             "CUSTOMER_CODE": 108608,
             "MODEL": "MGA1",
             "MACHINE_NO": 462
            },
            {
             "CUSTOMER_CODE": 108608,
             "MODEL": "DSM",
             "MACHINE_NO": 1013
            },
            {
             "CUSTOMER_CODE": 110171,
             "MODEL": "DSM",
             "MACHINE_NO": 1195
            },
            {
             "CUSTOMER_CODE": 110171,
             "MODEL": "MGA1",
             "MACHINE_NO": 730
            },
            {
             "CUSTOMER_CODE": 112436,
             "MODEL": "DSM",
             "MACHINE_NO": 1538
            },
            {
             "CUSTOMER_CODE": 110446,
             "MODEL": "DSM",
             "MACHINE_NO": 530
            },
            {
             "CUSTOMER_CODE": 110446,
             "MODEL": "MGA2",
             "MACHINE_NO": 670
            },
            {
             "CUSTOMER_CODE": 111826,
             "MODEL": "MGA2",
             "MACHINE_NO": 856
            },
            {
             "CUSTOMER_CODE": 111186,
             "MODEL": "DSM",
             "MACHINE_NO": 2025
            },
            {
             "CUSTOMER_CODE": 130175,
             "MODEL": "MGA1",
             "MACHINE_NO": 1330
            },
            {
             "CUSTOMER_CODE": 130116,
             "MODEL": "MGA1",
             "MACHINE_NO": 1311
            },
            {
             "CUSTOMER_CODE": 130116,
             "MODEL": "DSM",
             "MACHINE_NO": 2346
            },
            {
             "CUSTOMER_CODE": 108807,
             "MODEL": "DSM",
             "MACHINE_NO": 1508
            },
            {
             "CUSTOMER_CODE": 108807,
             "MODEL": "MGA2",
             "MACHINE_NO": 161
            },
            {
             "CUSTOMER_CODE": 109248,
             "MODEL": "MGA1",
             "MACHINE_NO": 708
            },
            {
             "CUSTOMER_CODE": 108022,
             "MODEL": "MGA1",
             "MACHINE_NO": 703
            },
            {
             "CUSTOMER_CODE": 108022,
             "MODEL": "DSM",
             "MACHINE_NO": 2665
            },
            {
             "CUSTOMER_CODE": 130315,
             "MODEL": "DSM",
             "MACHINE_NO": 2922
            },
            {
             "CUSTOMER_CODE": 130315,
             "MODEL": "MGA2",
             "MACHINE_NO": 1339
            },
            {
             "CUSTOMER_CODE": 108659,
             "MODEL": "MGA2",
             "MACHINE_NO": 393
            },
            {
             "CUSTOMER_CODE": 108839,
             "MODEL": "DSM",
             "MACHINE_NO": 1300
            },
            {
             "CUSTOMER_CODE": 130536,
             "MODEL": "DSM",
             "MACHINE_NO": 2734
            },
            {
             "CUSTOMER_CODE": 130536,
             "MODEL": "MGA1",
             "MACHINE_NO": 1544
            },
            {
             "CUSTOMER_CODE": 109351,
             "MODEL": "MGA1",
             "MACHINE_NO": 1392
            },
            {
             "CUSTOMER_CODE": 130147,
             "MODEL": "MGA1",
             "MACHINE_NO": 1391
            },
            {
             "CUSTOMER_CODE": 130147,
             "MODEL": "DSM",
             "MACHINE_NO": 2411
            },
            {
             "CUSTOMER_CODE": 130150,
             "MODEL": "DSM",
             "MACHINE_NO": 2402
            },
            {
             "CUSTOMER_CODE": 130150,
             "MODEL": "MGA1",
             "MACHINE_NO": 1379
            },
            {
             "CUSTOMER_CODE": 111590,
             "MODEL": "MGA1",
             "MACHINE_NO": 1159
            },
            {
             "CUSTOMER_CODE": 111590,
             "MODEL": "DSM",
             "MACHINE_NO": 1792
            },
            {
             "CUSTOMER_CODE": 130563,
             "MODEL": "DSM",
             "MACHINE_NO": 2732
            },
            {
             "CUSTOMER_CODE": 130563,
             "MODEL": "MGA1",
             "MACHINE_NO": 1542
            },
            {
             "CUSTOMER_CODE": 110281,
             "MODEL": "MGA",
             "MACHINE_NO": 628
            },
            {
             "CUSTOMER_CODE": 110281,
             "MODEL": "DSM",
             "MACHINE_NO": 1284
            },
            {
             "CUSTOMER_CODE": 110379,
             "MODEL": "DSM",
             "MACHINE_NO": 1667
            },
            {
             "CUSTOMER_CODE": 110379,
             "MODEL": "MGA2",
             "MACHINE_NO": 806
            },
            {
             "CUSTOMER_CODE": 109274,
             "MODEL": "MGA",
             "MACHINE_NO": 271
            },
            {
             "CUSTOMER_CODE": 109724,
             "MODEL": "DSM",
             "MACHINE_NO": 560
            },
            {
             "CUSTOMER_CODE": 140001,
             "MODEL": "MGA2",
             "MACHINE_NO": 36
            },
            {
             "CUSTOMER_CODE": 130107,
             "MODEL": "MGA1",
             "MACHINE_NO": 1303
            },
            {
             "CUSTOMER_CODE": 130107,
             "MODEL": "DSM",
             "MACHINE_NO": 2337
            },
            {
             "CUSTOMER_CODE": 110490,
             "MODEL": "DSM",
             "MACHINE_NO": 1511
            },
            {
             "CUSTOMER_CODE": 110490,
             "MODEL": "MGA2",
             "MACHINE_NO": 722
            },
            {
             "CUSTOMER_CODE": 112442,
             "MODEL": "MGA1",
             "MACHINE_NO": 1367
            },
            {
             "CUSTOMER_CODE": 112442,
             "MODEL": "DSM",
             "MACHINE_NO": 2391
            },
            {
             "CUSTOMER_CODE": 110084,
             "MODEL": "DSM",
             "MACHINE_NO": 1035
            },
            {
             "CUSTOMER_CODE": 110084,
             "MODEL": "MGA2",
             "MACHINE_NO": 1098
            },
            {
             "CUSTOMER_CODE": 130162,
             "MODEL": "MGA1",
             "MACHINE_NO": 1388
            },
            {
             "CUSTOMER_CODE": 130162,
             "MODEL": "DSM",
             "MACHINE_NO": 2409
            },
            {
             "CUSTOMER_CODE": 110164,
             "MODEL": "DSM",
             "MACHINE_NO": 1447
            },
            {
             "CUSTOMER_CODE": 110164,
             "MODEL": "MGA1",
             "MACHINE_NO": 715
            },
            {
             "CUSTOMER_CODE": 131070,
             "MODEL": "NUVO10",
             "MACHINE_NO": 80
            },
            {
             "CUSTOMER_CODE": 111863,
             "MODEL": "MGA2",
             "MACHINE_NO": 1007
            },
            {
             "CUSTOMER_CODE": 111863,
             "MODEL": "DSM",
             "MACHINE_NO": 2061
            },
            {
             "CUSTOMER_CODE": 111556,
             "MODEL": "DSM",
             "MACHINE_NO": 1755
            },
            {
             "CUSTOMER_CODE": 108820,
             "MODEL": "MGA1",
             "MACHINE_NO": 494
            },
            {
             "CUSTOMER_CODE": 108167,
             "MODEL": "DSM",
             "MACHINE_NO": 1782
            },
            {
             "CUSTOMER_CODE": 130347,
             "MODEL": "DSM",
             "MACHINE_NO": 2612
            },
            {
             "CUSTOMER_CODE": 108702,
             "MODEL": "DSM",
             "MACHINE_NO": 1474
            },
            {
             "CUSTOMER_CODE": 112448,
             "MODEL": "DSM",
             "MACHINE_NO": 2392
            },
            {
             "CUSTOMER_CODE": 112448,
             "MODEL": "MGA1",
             "MACHINE_NO": 1368
            },
            {
             "CUSTOMER_CODE": 109647,
             "MODEL": "DSM",
             "MACHINE_NO": 2434
            },
            {
             "CUSTOMER_CODE": 130847,
             "MODEL": "NUVO10",
             "MACHINE_NO": 14
            },
            {
             "CUSTOMER_CODE": 110274,
             "MODEL": "MGA1",
             "MACHINE_NO": 1251
            },
            {
             "CUSTOMER_CODE": 110274,
             "MODEL": "DSM",
             "MACHINE_NO": 858
            },
            {
             "CUSTOMER_CODE": 130000,
             "MODEL": "MGA1",
             "MACHINE_NO": 1237
            },
            {
             "CUSTOMER_CODE": 111474,
             "MODEL": "MGA",
             "MACHINE_NO": 859
            },
            {
             "CUSTOMER_CODE": 112441,
             "MODEL": "MGA1",
             "MACHINE_NO": 1378
            },
            {
             "CUSTOMER_CODE": 112441,
             "MODEL": "DSM",
             "MACHINE_NO": 2401
            },
            {
             "CUSTOMER_CODE": 109653,
             "MODEL": "MGA2",
             "MACHINE_NO": 158
            },
            {
             "CUSTOMER_CODE": 110051,
             "MODEL": "MGA1",
             "MACHINE_NO": 687
            },
            {
             "CUSTOMER_CODE": 110051,
             "MODEL": "DSM",
             "MACHINE_NO": 1465
            },
            {
             "CUSTOMER_CODE": 130032,
             "MODEL": "MGA2",
             "MACHINE_NO": 1147
            },
            {
             "CUSTOMER_CODE": 130146,
             "MODEL": "MGA2",
             "MACHINE_NO": 1218
            },
            {
             "CUSTOMER_CODE": 130146,
             "MODEL": "DSM",
             "MACHINE_NO": 2440
            },
            {
             "CUSTOMER_CODE": 130565,
             "MODEL": "DSM",
             "MACHINE_NO": 2752
            },
            {
             "CUSTOMER_CODE": 130565,
             "MODEL": "MGA1",
             "MACHINE_NO": 1563
            },
            {
             "CUSTOMER_CODE": 130112,
             "MODEL": "MGA1",
             "MACHINE_NO": 1275
            },
            {
             "CUSTOMER_CODE": 130113,
             "MODEL": "MGA1",
             "MACHINE_NO": 1274
            },
            {
             "CUSTOMER_CODE": 130527,
             "MODEL": "MGA1",
             "MACHINE_NO": 1537
            },
            {
             "CUSTOMER_CODE": 109451,
             "MODEL": "MGA2",
             "MACHINE_NO": 18
            },
            {
             "CUSTOMER_CODE": 112449,
             "MODEL": "MGA1",
             "MACHINE_NO": 1381
            },
            {
             "CUSTOMER_CODE": 112449,
             "MODEL": "DSM",
             "MACHINE_NO": 2404
            },
            {
             "CUSTOMER_CODE": 108497,
             "MODEL": "DSM",
             "MACHINE_NO": 795
            },
            {
             "CUSTOMER_CODE": 130141,
             "MODEL": "DSM",
             "MACHINE_NO": 2375
            },
            {
             "CUSTOMER_CODE": 130141,
             "MODEL": "MGA1",
             "MACHINE_NO": 1341
            },
            {
             "CUSTOMER_CODE": 110088,
             "MODEL": "MGA1",
             "MACHINE_NO": 638
            },
            {
             "CUSTOMER_CODE": 110088,
             "MODEL": "DSM",
             "MACHINE_NO": 1124
            },
            {
             "CUSTOMER_CODE": 110402,
             "MODEL": "DSM",
             "MACHINE_NO": 2158
            },
            {
             "CUSTOMER_CODE": 110402,
             "MODEL": "MGA1",
             "MACHINE_NO": 876
            },
            {
             "CUSTOMER_CODE": 110130,
             "MODEL": "MGA2",
             "MACHINE_NO": 438
            },
            {
             "CUSTOMER_CODE": 110130,
             "MODEL": "DSM",
             "MACHINE_NO": 991
            },
            {
             "CUSTOMER_CODE": 131090,
             "MODEL": "NUVO10",
             "MACHINE_NO": 87
            },
            {
             "CUSTOMER_CODE": 130580,
             "MODEL": "MGA1",
             "MACHINE_NO": 1579
            },
            {
             "CUSTOMER_CODE": 130580,
             "MODEL": "DSM",
             "MACHINE_NO": 2768
            },
            {
             "CUSTOMER_CODE": 109519,
             "MODEL": "DSM",
             "MACHINE_NO": 1174
            },
            {
             "CUSTOMER_CODE": 109519,
             "MODEL": "MGA2",
             "MACHINE_NO": 40
            },
            null,
            {
             "CUSTOMER_CODE": 108791,
             "MODEL": "DSM",
             "MACHINE_NO": 1913
            },
            {
             "CUSTOMER_CODE": 140003,
             "MODEL": "MGA2",
             "MACHINE_NO": 1318
            },
            {
             "CUSTOMER_CODE": 140003,
             "MODEL": "DSM",
             "MACHINE_NO": 2532
            },
            {
             "CUSTOMER_CODE": 109955,
             "MODEL": "MGA2",
             "MACHINE_NO": 408
            },
            {
             "CUSTOMER_CODE": 109955,
             "MODEL": "DSM",
             "MACHINE_NO": 963
            },
            {
             "CUSTOMER_CODE": 130352,
             "MODEL": "DSM",
             "MACHINE_NO": 2587
            },
            {
             "CUSTOMER_CODE": 130352,
             "MODEL": "MGA2",
             "MACHINE_NO": 1385
            },
            {
             "CUSTOMER_CODE": 109644,
             "MODEL": "MGA2",
             "MACHINE_NO": 136
            },
            {
             "CUSTOMER_CODE": 109644,
             "MODEL": "DSM",
             "MACHINE_NO": 788
            },
            {
             "CUSTOMER_CODE": 109945,
             "MODEL": "DSM",
             "MACHINE_NO": 776
            },
            {
             "CUSTOMER_CODE": 109945,
             "MODEL": "MGA1",
             "MACHINE_NO": 123
            },
            {
             "CUSTOMER_CODE": 110386,
             "MODEL": "NUVO10",
             "MACHINE_NO": 17
            },
            {
             "CUSTOMER_CODE": 130077,
             "MODEL": "DSM",
             "MACHINE_NO": 2308
            },
            {
             "CUSTOMER_CODE": 130003,
             "MODEL": "DSM",
             "MACHINE_NO": 2289
            },
            {
             "CUSTOMER_CODE": 109813,
             "MODEL": "MGA2",
             "MACHINE_NO": 224
            },
            {
             "CUSTOMER_CODE": 110131,
             "MODEL": "MGA1",
             "MACHINE_NO": 702
            },
            {
             "CUSTOMER_CODE": 130220,
             "MODEL": "MGA2",
             "MACHINE_NO": 1239
            },
            {
             "CUSTOMER_CODE": 130220,
             "MODEL": "DSM",
             "MACHINE_NO": 2462
            },
            {
             "CUSTOMER_CODE": 108628,
             "MODEL": "DSM",
             "MACHINE_NO": 2435
            },
            {
             "CUSTOMER_CODE": 108628,
             "MODEL": "MGA2",
             "MACHINE_NO": 1088
            },
            {
             "CUSTOMER_CODE": 108073,
             "MODEL": "MGA2",
             "MACHINE_NO": 526
            },
            {
             "CUSTOMER_CODE": 108073,
             "MODEL": "DSM",
             "MACHINE_NO": 710
            },
            {
             "CUSTOMER_CODE": 108723,
             "MODEL": "DSM",
             "MACHINE_NO": 1285
            },
            {
             "CUSTOMER_CODE": 108723,
             "MODEL": "MGA2",
             "MACHINE_NO": 570
            },
            {
             "CUSTOMER_CODE": 130777,
             "MODEL": "MGA2",
             "MACHINE_NO": 1535
            },
            {
             "CUSTOMER_CODE": 130777,
             "MODEL": "DSM",
             "MACHINE_NO": 2910
            },
            {
             "CUSTOMER_CODE": 109451,
             "MODEL": "DSM",
             "MACHINE_NO": 689
            },
            {
             "CUSTOMER_CODE": 131098,
             "MODEL": "DSM",
             "MACHINE_NO": 3037
            },
            {
             "CUSTOMER_CODE": 131098,
             "MODEL": "MGA1",
             "MACHINE_NO": 1687
            },
            {
             "CUSTOMER_CODE": 109860,
             "MODEL": "MGA2",
             "MACHINE_NO": 1202
            },
            {
             "CUSTOMER_CODE": 130173,
             "MODEL": "MGA2",
             "MACHINE_NO": 1217
            },
            {
             "CUSTOMER_CODE": 130173,
             "MODEL": "DSM",
             "MACHINE_NO": 2439
            },
            {
             "CUSTOMER_CODE": 131129,
             "MODEL": "NUVO10",
             "MACHINE_NO": 98
            },
            {
             "CUSTOMER_CODE": 109860,
             "MODEL": "DSM",
             "MACHINE_NO": 907
            },
            {
             "CUSTOMER_CODE": 130133,
             "MODEL": "DSM",
             "MACHINE_NO": 2161
            },
            {
             "CUSTOMER_CODE": 130133,
             "MODEL": "MGA1",
             "MACHINE_NO": 1369
            },
            {
             "CUSTOMER_CODE": 108592,
             "MODEL": "MGA1",
             "MACHINE_NO": 462
            },
            {
             "CUSTOMER_CODE": 131081,
             "MODEL": "MGA1",
             "MACHINE_NO": 1680
            },
            {
             "CUSTOMER_CODE": 131081,
             "MODEL": "DSM",
             "MACHINE_NO": 3029
            },
            {
             "CUSTOMER_CODE": 130350,
             "MODEL": "DSM",
             "MACHINE_NO": 2567
            },
            {
             "CUSTOMER_CODE": 130350,
             "MODEL": "MGA2",
             "MACHINE_NO": 1367
            },
            {
             "CUSTOMER_CODE": 109813,
             "MODEL": "MGA2",
             "MACHINE_NO": 224
            },
            {
             "CUSTOMER_CODE": 130228,
             "MODEL": "MGA2",
             "MACHINE_NO": 1228
            },
            {
             "CUSTOMER_CODE": 130228,
             "MODEL": "DSM",
             "MACHINE_NO": 2449
            },
            {
             "CUSTOMER_CODE": 130142,
             "MODEL": "DSM",
             "MACHINE_NO": 2373
            },
            {
             "CUSTOMER_CODE": 130142,
             "MODEL": "MGA1",
             "MACHINE_NO": 1340
            },
            {
             "CUSTOMER_CODE": 111704,
             "MODEL": "MGA2",
             "MACHINE_NO": 1077
            },
            {
             "CUSTOMER_CODE": 111704,
             "MODEL": "DSM",
             "MACHINE_NO": 962
            },
            {
             "CUSTOMER_CODE": 110342,
             "MODEL": "DSM",
             "MACHINE_NO": 1340
            },
            {
             "CUSTOMER_CODE": 110342,
             "MODEL": "MGA1",
             "MACHINE_NO": 885
            },
            {
             "CUSTOMER_CODE": 140005,
             "MODEL": "MGA1",
             "MACHINE_NO": 1396
            },
            {
             "CUSTOMER_CODE": 140005,
             "MODEL": "DSM",
             "MACHINE_NO": 1333
            },
            {
             "CUSTOMER_CODE": 130508,
             "MODEL": "DSM",
             "MACHINE_NO": 2642
            },
            {
             "CUSTOMER_CODE": 130508,
             "MODEL": "MGA2",
             "MACHINE_NO": 1448
            },
            {
             "CUSTOMER_CODE": 108512,
             "MODEL": "MGA1",
             "MACHINE_NO": 718
            },
            {
             "CUSTOMER_CODE": 111512,
             "MODEL": "MGA1",
             "MACHINE_NO": 717
            },
            {
             "CUSTOMER_CODE": 111677,
             "MODEL": "DSM",
             "MACHINE_NO": 1903
            },
            {
             "CUSTOMER_CODE": 111678,
             "MODEL": "DSM",
             "MACHINE_NO": 1902
            },
            {
             "CUSTOMER_CODE": 130236,
             "MODEL": "DSM",
             "MACHINE_NO": 2461
            },
            {
             "CUSTOMER_CODE": 130236,
             "MODEL": "MGA2",
             "MACHINE_NO": 1238
            },
            {
             "CUSTOMER_CODE": 111568,
             "MODEL": "MGA1",
             "MACHINE_NO": 629
            },
            {
             "CUSTOMER_CODE": 111568,
             "MODEL": "DSM",
             "MACHINE_NO": 1762
            },
            {
             "CUSTOMER_CODE": 108631,
             "MODEL": "MGA2",
             "MACHINE_NO": 427
            },
            {
             "CUSTOMER_CODE": 130684,
             "MODEL": "DSM",
             "MACHINE_NO": 229
            },
            {
             "CUSTOMER_CODE": 130163,
             "MODEL": "MGA1",
             "MACHINE_NO": 1395
            },
            {
             "CUSTOMER_CODE": 108753,
             "MODEL": "MGA1",
             "MACHINE_NO": 734
            },
            {
             "CUSTOMER_CODE": 130227,
             "MODEL": "MGA2",
             "MACHINE_NO": 1229
            },
            {
             "CUSTOMER_CODE": 130227,
             "MODEL": "DSM",
             "MACHINE_NO": 2450
            },
            {
             "CUSTOMER_CODE": 111991,
             "MODEL": "DSM",
             "MACHINE_NO": 2175
            },
            {
             "CUSTOMER_CODE": 111991,
             "MODEL": "MGA2",
             "MACHINE_NO": 1114
            },
            {
             "CUSTOMER_CODE": 130000,
             "MODEL": "DSM",
             "MACHINE_NO": 2198
            },
            {
             "CUSTOMER_CODE": 130046,
             "MODEL": "DSM",
             "MACHINE_NO": 2235
            },
            {
             "CUSTOMER_CODE": 130046,
             "MODEL": "MGA2",
             "MACHINE_NO": 1167
            },
            {
             "CUSTOMER_CODE": 109243,
             "MODEL": "MGA1",
             "MACHINE_NO": 889
            },
            {
             "CUSTOMER_CODE": 109423,
             "MODEL": "DSM",
             "MACHINE_NO": 525
            },
            {
             "CUSTOMER_CODE": 108342,
             "MODEL": "DSM",
             "MACHINE_NO": 253
            },
            {
             "CUSTOMER_CODE": 130511,
             "MODEL": "DSM",
             "MACHINE_NO": 2715
            },
            {
             "CUSTOMER_CODE": 130511,
             "MODEL": "MGA1",
             "MACHINE_NO": 1371
            },
            {
             "CUSTOMER_CODE": 109524,
             "MODEL": "MGA1",
             "MACHINE_NO": 756
            },
            {
             "CUSTOMER_CODE": 109524,
             "MODEL": "DSM",
             "MACHINE_NO": 1064
            },
            {
             "CUSTOMER_CODE": 131102,
             "MODEL": "NUVO10",
             "MACHINE_NO": 88
            },
            {
             "CUSTOMER_CODE": 110305,
             "MODEL": "MGA2",
             "MACHINE_NO": 193
            },
            {
             "CUSTOMER_CODE": 110520,
             "MODEL": "MGA2",
             "MACHINE_NO": 748
            },
            {
             "CUSTOMER_CODE": 110520,
             "MODEL": "DSM",
             "MACHINE_NO": 1569
            },
            {
             "CUSTOMER_CODE": 108320,
             "MODEL": "MGA2",
             "MACHINE_NO": 2
            },
            {
             "CUSTOMER_CODE": 108798,
             "MODEL": "MGA2",
             "MACHINE_NO": 249
            },
            {
             "CUSTOMER_CODE": 110361,
             "MODEL": "DSM",
             "MACHINE_NO": 1335
            },
            {
             "CUSTOMER_CODE": 108320,
             "MODEL": "DSM",
             "MACHINE_NO": 775
            },
            {
             "CUSTOMER_CODE": 130253,
             "MODEL": "DSM",
             "MACHINE_NO": 2512
            },
            {
             "CUSTOMER_CODE": 130253,
             "MODEL": "MGA1",
             "MACHINE_NO": 1297
            },
            {
             "CUSTOMER_CODE": 130249,
             "MODEL": "MGA2",
             "MACHINE_NO": 1276
            },
            {
             "CUSTOMER_CODE": 130249,
             "MODEL": "DSM",
             "MACHINE_NO": 2491
            },
            {
             "CUSTOMER_CODE": 110299,
             "MODEL": "DSM",
             "MACHINE_NO": 1293
            },
            {
             "CUSTOMER_CODE": 110299,
             "MODEL": "MGA1",
             "MACHINE_NO": 830
            },
            {
             "CUSTOMER_CODE": 108806,
             "MODEL": "DSM",
             "MACHINE_NO": 965
            },
            {
             "CUSTOMER_CODE": 130304,
             "MODEL": "DSM",
             "MACHINE_NO": 2552
            },
            {
             "CUSTOMER_CODE": 130304,
             "MODEL": "MGA2",
             "MACHINE_NO": 1338
            },
            {
             "CUSTOMER_CODE": 109348,
             "MODEL": "DSM",
             "MACHINE_NO": 571
            },
            {
             "CUSTOMER_CODE": 110276,
             "MODEL": "MGA1",
             "MACHINE_NO": 816
            },
            {
             "CUSTOMER_CODE": 110276,
             "MODEL": "DSM",
             "MACHINE_NO": 1277
            },
            {
             "CUSTOMER_CODE": 108869,
             "MODEL": "DSM",
             "MACHINE_NO": 960
            },
            {
             "CUSTOMER_CODE": 108869,
             "MODEL": "MGA2",
             "MACHINE_NO": 3
            },
            {
             "CUSTOMER_CODE": 111706,
             "MODEL": "MGA1",
             "MACHINE_NO": 1054
            },
            {
             "CUSTOMER_CODE": 111706,
             "MODEL": "DSM",
             "MACHINE_NO": 1910
            },
            {
             "CUSTOMER_CODE": 130179,
             "MODEL": "DSM",
             "MACHINE_NO": 2477
            },
            {
             "CUSTOMER_CODE": 130179,
             "MODEL": "MGA2",
             "MACHINE_NO": 1262
            },
            {
             "CUSTOMER_CODE": 130645,
             "MODEL": "MGA2",
             "MACHINE_NO": 1443
            },
            {
             "CUSTOMER_CODE": 130645,
             "MODEL": "DSM",
             "MACHINE_NO": 2833
            },
            {
             "CUSTOMER_CODE": 110472,
             "MODEL": "DSM",
             "MACHINE_NO": 1477
            },
            {
             "CUSTOMER_CODE": 110472,
             "MODEL": "MGA2",
             "MACHINE_NO": 697
            },
            {
             "CUSTOMER_CODE": 130867,
             "MODEL": "MGA2",
             "MACHINE_NO": 1581
            },
            {
             "CUSTOMER_CODE": 109372,
             "MODEL": "MGA2",
             "MACHINE_NO": 178
            },
            {
             "CUSTOMER_CODE": 109372,
             "MODEL": "DSM",
             "MACHINE_NO": 1227
            },
            {
             "CUSTOMER_CODE": 110183,
             "MODEL": "MGA1",
             "MACHINE_NO": 761
            },
            {
             "CUSTOMER_CODE": 109295,
             "MODEL": "MGA2",
             "MACHINE_NO": 677
            },
            {
             "CUSTOMER_CODE": 109295,
             "MODEL": "DSM",
             "MACHINE_NO": 570
            },
            {
             "CUSTOMER_CODE": 130587,
             "MODEL": "DSM",
             "MACHINE_NO": 2780
            },
            {
             "CUSTOMER_CODE": 130587,
             "MODEL": "MGA1",
             "MACHINE_NO": 1590
            },
            {
             "CUSTOMER_CODE": 130188,
             "MODEL": "DSM",
             "MACHINE_NO": 2472
            },
            {
             "CUSTOMER_CODE": 109516,
             "MODEL": "DSM",
             "MACHINE_NO": 2358
            },
            {
             "CUSTOMER_CODE": 108666,
             "MODEL": "DSM",
             "MACHINE_NO": 523
            },
            {
             "CUSTOMER_CODE": 108666,
             "MODEL": "MGA2",
             "MACHINE_NO": 683
            },
            {
             "CUSTOMER_CODE": 130115,
             "MODEL": "MGA1",
             "MACHINE_NO": 1301
            },
            {
             "CUSTOMER_CODE": 130115,
             "MODEL": "DSM",
             "MACHINE_NO": 2336
            },
            {
             "CUSTOMER_CODE": 130181,
             "MODEL": "DSM",
             "MACHINE_NO": 2457
            },
            {
             "CUSTOMER_CODE": 130181,
             "MODEL": "MGA1",
             "MACHINE_NO": 1234
            },
            {
             "CUSTOMER_CODE": 130546,
             "MODEL": "MGA1",
             "MACHINE_NO": 1137
            },
            {
             "CUSTOMER_CODE": 130546,
             "MODEL": "DSM",
             "MACHINE_NO": 1988
            },
            {
             "CUSTOMER_CODE": 108502,
             "MODEL": "DSM",
             "MACHINE_NO": 1746
            },
            {
             "CUSTOMER_CODE": 108502,
             "MODEL": "MGA1",
             "MACHINE_NO": 1039
            },
            {
             "CUSTOMER_CODE": 109260,
             "MODEL": "MGA2",
             "MACHINE_NO": 1011
            },
            {
             "CUSTOMER_CODE": 109997,
             "MODEL": "MGA2",
             "MACHINE_NO": 477
            },
            {
             "CUSTOMER_CODE": 109997,
             "MODEL": "DSM",
             "MACHINE_NO": 1020
            },
            {
             "CUSTOMER_CODE": 130315,
             "MODEL": "MGA2",
             "MACHINE_NO": 1220
            },
            {
             "CUSTOMER_CODE": 130223,
             "MODEL": "MGA2",
             "MACHINE_NO": 1251
            },
            {
             "CUSTOMER_CODE": 130223,
             "MODEL": "DSM",
             "MACHINE_NO": 2417
            },
            {
             "CUSTOMER_CODE": 130283,
             "MODEL": "MGA2",
             "MACHINE_NO": 1315
            },
            {
             "CUSTOMER_CODE": 130283,
             "MODEL": "DSM",
             "MACHINE_NO": 2529
            },
            {
             "CUSTOMER_CODE": 110339,
             "MODEL": "MGA1",
             "MACHINE_NO": 861
            },
            {
             "CUSTOMER_CODE": 130855,
             "MODEL": "MGA1",
             "MACHINE_NO": 428
            },
            {
             "CUSTOMER_CODE": 130855,
             "MODEL": "DSM",
             "MACHINE_NO": 503
            },
            {
             "CUSTOMER_CODE": 110445,
             "MODEL": "DSM",
             "MACHINE_NO": 2792
            },
            {
             "CUSTOMER_CODE": 110445,
             "MODEL": "MGA2",
             "MACHINE_NO": 681
            },
            {
             "CUSTOMER_CODE": 111962,
             "MODEL": "MGA1",
             "MACHINE_NO": 645
            },
            {
             "CUSTOMER_CODE": 111962,
             "MODEL": "DSM",
             "MACHINE_NO": 1126
            },
            {
             "CUSTOMER_CODE": 108078,
             "MODEL": "MGA2",
             "MACHINE_NO": 514
            },
            {
             "CUSTOMER_CODE": 108078,
             "MODEL": "DSM",
             "MACHINE_NO": 271
            },
            {
             "CUSTOMER_CODE": 109859,
             "MODEL": "MGA2",
             "MACHINE_NO": 297
            },
            {
             "CUSTOMER_CODE": 110456,
             "MODEL": "MGA1",
             "MACHINE_NO": 678
            },
            {
             "CUSTOMER_CODE": 108089,
             "MODEL": "MGA1",
             "MACHINE_NO": 253
            },
            {
             "CUSTOMER_CODE": 109398,
             "MODEL": "DSM",
             "MACHINE_NO": 2442
            },
            {
             "CUSTOMER_CODE": 109866,
             "MODEL": "DSM",
             "MACHINE_NO": 910
            },
            {
             "CUSTOMER_CODE": 109866,
             "MODEL": "MGA1",
             "MACHINE_NO": 663
            },
            {
             "CUSTOMER_CODE": 130589,
             "MODEL": "MGA1",
             "MACHINE_NO": 1595
            },
            {
             "CUSTOMER_CODE": 130589,
             "MODEL": "DSM",
             "MACHINE_NO": 2785
            },
            {
             "CUSTOMER_CODE": 130589,
             "MODEL": "DSM",
             "MACHINE_NO": 2785
            },
            {
             "CUSTOMER_CODE": 130589,
             "MODEL": "MGA1",
             "MACHINE_NO": 1595
            },
            {
             "CUSTOMER_CODE": 108229,
             "MODEL": "MGA1",
             "MACHINE_NO": 644
            },
            {
             "CUSTOMER_CODE": 108229,
             "MODEL": "DSM",
             "MACHINE_NO": 251
            },
            {
             "CUSTOMER_CODE": 130515,
             "MODEL": "DSM",
             "MACHINE_NO": 2719
            },
            {
             "CUSTOMER_CODE": 130515,
             "MODEL": "MGA1",
             "MACHINE_NO": 1524
            },
            {
             "CUSTOMER_CODE": 111538,
             "MODEL": "MGA2",
             "MACHINE_NO": 844
            },
            {
             "CUSTOMER_CODE": 111538,
             "MODEL": "DSM",
             "MACHINE_NO": 1731
            },
            {
             "CUSTOMER_CODE": 130562,
             "MODEL": "DSM",
             "MACHINE_NO": 799
            },
            {
             "CUSTOMER_CODE": 130562,
             "MODEL": "MGA1",
             "MACHINE_NO": 387
            },
            {
             "CUSTOMER_CODE": 130250,
             "MODEL": "MGA2",
             "MACHINE_NO": 1304
            },
            {
             "CUSTOMER_CODE": 130250,
             "MODEL": "DSM",
             "MACHINE_NO": 2517
            },
            {
             "CUSTOMER_CODE": 110097,
             "MODEL": "MGA1",
             "MACHINE_NO": 653
            },
            {
             "CUSTOMER_CODE": 111550,
             "MODEL": "MGA2",
             "MACHINE_NO": 870
            },
            {
             "CUSTOMER_CODE": 111550,
             "MODEL": "DSM",
             "MACHINE_NO": 1749
            },
            {
             "CUSTOMER_CODE": 103122,
             "MODEL": "MGA2",
             "MACHINE_NO": 673
            },
            {
             "CUSTOMER_CODE": 130668,
             "MODEL": "MGA2",
             "MACHINE_NO": 1310
            },
            {
             "CUSTOMER_CODE": 130668,
             "MODEL": "DSM",
             "MACHINE_NO": 2524
            },
            {
             "CUSTOMER_CODE": 110172,
             "MODEL": "DSM",
             "MACHINE_NO": 1993
            },
            {
             "CUSTOMER_CODE": 110172,
             "MODEL": "MGA1",
             "MACHINE_NO": 747
            },
            {
             "CUSTOMER_CODE": 110482,
             "MODEL": "MGA2",
             "MACHINE_NO": 704
            },
            {
             "CUSTOMER_CODE": 110482,
             "MODEL": "DSM",
             "MACHINE_NO": 1493
            },
            {
             "CUSTOMER_CODE": 108092,
             "MODEL": "DSM",
             "MACHINE_NO": 1671
            },
            {
             "CUSTOMER_CODE": 108092,
             "MODEL": "MGA2",
             "MACHINE_NO": 793
            },
            {
             "CUSTOMER_CODE": 130312,
             "MODEL": "MGA2",
             "MACHINE_NO": 1309
            },
            {
             "CUSTOMER_CODE": 130239,
             "MODEL": "MGA2",
             "MACHINE_NO": 1316
            },
            {
             "CUSTOMER_CODE": 130296,
             "MODEL": "MGA2",
             "MACHINE_NO": 1331
            },
            {
             "CUSTOMER_CODE": 130296,
             "MODEL": "DSM",
             "MACHINE_NO": 2539
            },
            {
             "CUSTOMER_CODE": 131038,
             "MODEL": "NUVO10",
             "MACHINE_NO": 72
            },
            {
             "CUSTOMER_CODE": 130159,
             "MODEL": "DSM",
             "MACHINE_NO": 2369
            },
            {
             "CUSTOMER_CODE": 130159,
             "MODEL": "MGA1",
             "MACHINE_NO": 1332
            },
            {
             "CUSTOMER_CODE": 130246,
             "MODEL": "MGA2",
             "MACHINE_NO": 1299
            },
            {
             "CUSTOMER_CODE": 130246,
             "MODEL": "DSM",
             "MACHINE_NO": 2509
            },
            {
             "CUSTOMER_CODE": 130121,
             "MODEL": "DSM",
             "MACHINE_NO": 2339
            },
            {
             "CUSTOMER_CODE": 130121,
             "MODEL": "MGA1",
             "MACHINE_NO": 1305
            },
            {
             "CUSTOMER_CODE": 140007,
             "MODEL": "MGA2",
             "MACHINE_NO": 957
            },
            {
             "CUSTOMER_CODE": 140007,
             "MODEL": "DSM",
             "MACHINE_NO": 1875
            },
            {
             "CUSTOMER_CODE": 108507,
             "MODEL": "DSM",
             "MACHINE_NO": 2148
            },
            {
             "CUSTOMER_CODE": 108507,
             "MODEL": "MGA2",
             "MACHINE_NO": 1087
            },
            {
             "CUSTOMER_CODE": 130887,
             "MODEL": "MGA1",
             "MACHINE_NO": 1613
            },
            {
             "CUSTOMER_CODE": 130887,
             "MODEL": "DSM",
             "MACHINE_NO": 2965
            },
            {
             "CUSTOMER_CODE": 111709,
             "MODEL": "DSM",
             "MACHINE_NO": 1951
            },
            {
             "CUSTOMER_CODE": 111709,
             "MODEL": "MGA1",
             "MACHINE_NO": 686
            },
            {
             "CUSTOMER_CODE": 109716,
             "MODEL": "MGA1",
             "MACHINE_NO": 169
            },
            {
             "CUSTOMER_CODE": 109716,
             "MODEL": "DSM",
             "MACHINE_NO": 822
            },
            {
             "CUSTOMER_CODE": 111515,
             "MODEL": "DSM",
             "MACHINE_NO": 2647
            },
            {
             "CUSTOMER_CODE": 111515,
             "MODEL": "MGA2",
             "MACHINE_NO": 1248
            },
            {
             "CUSTOMER_CODE": 111974,
             "MODEL": "MGA2",
             "MACHINE_NO": 1080
            },
            {
             "CUSTOMER_CODE": 111974,
             "MODEL": "DSM",
             "MACHINE_NO": 2139
            },
            {
             "CUSTOMER_CODE": 140008,
             "MODEL": "MGA2",
             "MACHINE_NO": 131
            },
            {
             "CUSTOMER_CODE": 130289,
             "MODEL": "MGA2",
             "MACHINE_NO": 1320
            },
            {
             "CUSTOMER_CODE": 110039,
             "MODEL": "MGA2",
             "MACHINE_NO": 540
            },
            {
             "CUSTOMER_CODE": 108807,
             "MODEL": "MGA1",
             "MACHINE_NO": 886
            },
            {
             "CUSTOMER_CODE": 109943,
             "MODEL": "MGA2",
             "MACHINE_NO": 409
            },
            {
             "CUSTOMER_CODE": 109443,
             "MODEL": "DSM",
             "MACHINE_NO": 1274
            },
            {
             "CUSTOMER_CODE": 130591,
             "MODEL": "DSM",
             "MACHINE_NO": 2787
            },
            {
             "CUSTOMER_CODE": 130591,
             "MODEL": "MGA2",
             "MACHINE_NO": 1597
            },
            {
             "CUSTOMER_CODE": 130585,
             "MODEL": "DSM",
             "MACHINE_NO": 2161
            },
            {
             "CUSTOMER_CODE": 130585,
             "MODEL": "MGA2",
             "MACHINE_NO": 1588
            },
            {
             "CUSTOMER_CODE": 130165,
             "MODEL": "MGA1",
             "MACHINE_NO": 1329
            },
            {
             "CUSTOMER_CODE": 130165,
             "MODEL": "DSM",
             "MACHINE_NO": 2370
            },
            {
             "CUSTOMER_CODE": 130277,
             "MODEL": "DSM",
             "MACHINE_NO": 2526
            },
            {
             "CUSTOMER_CODE": 130277,
             "MODEL": "MGA2",
             "MACHINE_NO": 1311
            },
            {
             "CUSTOMER_CODE": 130503,
             "MODEL": "MGA1",
             "MACHINE_NO": 1543
            },
            {
             "CUSTOMER_CODE": 130503,
             "MODEL": "DSM",
             "MACHINE_NO": 2733
            },
            {
             "CUSTOMER_CODE": 108036,
             "MODEL": "DSM",
             "MACHINE_NO": 1341
            },
            {
             "CUSTOMER_CODE": 108485,
             "MODEL": "MGA2",
             "MACHINE_NO": 538
            },
            {
             "CUSTOMER_CODE": 109292,
             "MODEL": "DSM",
             "MACHINE_NO": 564
            },
            {
             "CUSTOMER_CODE": 109292,
             "MODEL": "MGA2",
             "MACHINE_NO": 1354
            },
            {
             "CUSTOMER_CODE": 108729,
             "MODEL": "DSM",
             "MACHINE_NO": 310
            },
            {
             "CUSTOMER_CODE": 130341,
             "MODEL": "DSM",
             "MACHINE_NO": 2571
            },
            {
             "CUSTOMER_CODE": 130341,
             "MODEL": "MGA2",
             "MACHINE_NO": 1369
            },
            {
             "CUSTOMER_CODE": 109689,
             "MODEL": "DSM",
             "MACHINE_NO": 1748
            },
            {
             "CUSTOMER_CODE": 130623,
             "MODEL": "DSM",
             "MACHINE_NO": 2840
            },
            {
             "CUSTOMER_CODE": 130623,
             "MODEL": "MGA2",
             "MACHINE_NO": 1428
            },
            {
             "CUSTOMER_CODE": 109448,
             "MODEL": "NUVO10",
             "MACHINE_NO": 50
            },
            {
             "CUSTOMER_CODE": 130242,
             "MODEL": "DSM",
             "MACHINE_NO": 2513
            },
            {
             "CUSTOMER_CODE": 130242,
             "MODEL": "MGA2",
             "MACHINE_NO": 1298
            },
            {
             "CUSTOMER_CODE": 110244,
             "MODEL": "MGA2",
             "MACHINE_NO": 585
            },
            {
             "CUSTOMER_CODE": 110244,
             "MODEL": "DSM",
             "MACHINE_NO": 1260
            },
            {
             "CUSTOMER_CODE": 108692,
             "MODEL": "DSM",
             "MACHINE_NO": 141
            },
            {
             "CUSTOMER_CODE": 108692,
             "MODEL": "MGA1",
             "MACHINE_NO": 961
            },
            {
             "CUSTOMER_CODE": 110348,
             "MODEL": "MGA1",
             "MACHINE_NO": 871
            },
            {
             "CUSTOMER_CODE": 110348,
             "MODEL": "DSM",
             "MACHINE_NO": 1328
            },
            {
             "CUSTOMER_CODE": 110224,
             "MODEL": "DSM",
             "MACHINE_NO": 1246
            },
            {
             "CUSTOMER_CODE": 110224,
             "MODEL": "MGA2",
             "MACHINE_NO": 576
            },
            {
             "CUSTOMER_CODE": 130569,
             "MODEL": "MGA1",
             "MACHINE_NO": 607
            },
            {
             "CUSTOMER_CODE": 130569,
             "MODEL": "DSM",
             "MACHINE_NO": 1088
            },
            {
             "CUSTOMER_CODE": 111696,
             "MODEL": "DSM",
             "MACHINE_NO": 1928
            },
            {
             "CUSTOMER_CODE": 111696,
             "MODEL": "MGA1",
             "MACHINE_NO": 1070
            },
            {
             "CUSTOMER_CODE": 130299,
             "MODEL": "MGA2",
             "MACHINE_NO": 1337
            },
            {
             "CUSTOMER_CODE": 130299,
             "MODEL": "DSM",
             "MACHINE_NO": 2551
            },
            {
             "CUSTOMER_CODE": 140009,
             "MODEL": "MGA2",
             "MACHINE_NO": 1017
            },
            {
             "CUSTOMER_CODE": 111873,
             "MODEL": "MGA1",
             "MACHINE_NO": 1387
            },
            {
             "CUSTOMER_CODE": 111873,
             "MODEL": "DSM",
             "MACHINE_NO": 2408
            },
            {
             "CUSTOMER_CODE": 109499,
             "MODEL": "DSM",
             "MACHINE_NO": 2092
            },
            {
             "CUSTOMER_CODE": 130888,
             "MODEL": "DSM",
             "MACHINE_NO": 2959
            },
            {
             "CUSTOMER_CODE": 130888,
             "MODEL": "MGA1",
             "MACHINE_NO": 1611
            },
            {
             "CUSTOMER_CODE": 130183,
             "MODEL": "MGA2",
             "MACHINE_NO": 1201
            },
            {
             "CUSTOMER_CODE": 130183,
             "MODEL": "DSM",
             "MACHINE_NO": 2423
            },
            {
             "CUSTOMER_CODE": 108647,
             "MODEL": "DSM",
             "MACHINE_NO": 1027
            },
            {
             "CUSTOMER_CODE": 108647,
             "MODEL": "MGA1",
             "MACHINE_NO": 772
            },
            {
             "MODEL": "MGA2",
             "MACHINE_NO": 1046
            },
            {
             "CUSTOMER_CODE": 112440,
             "MODEL": "MGA1",
             "MACHINE_NO": 1389
            },
            {
             "CUSTOMER_CODE": 112440,
             "MODEL": "DSM",
             "MACHINE_NO": 2410
            },
            {
             "CUSTOMER_CODE": 111914,
             "MODEL": "DSM",
             "MACHINE_NO": 2082
            },
            {
             "CUSTOMER_CODE": 108558,
             "MODEL": "DSM",
             "MACHINE_NO": 818
            },
            {
             "CUSTOMER_CODE": 130325,
             "MODEL": "DSM",
             "MACHINE_NO": 2344
            },
            {
             "CUSTOMER_CODE": 130325,
             "MODEL": "MGA2",
             "MACHINE_NO": 1363
            },
            {
             "CUSTOMER_CODE": 111966,
             "MODEL": "MGA1",
             "MACHINE_NO": 1323
            },
            {
             "CUSTOMER_CODE": 110248,
             "MODEL": "MGA1",
             "MACHINE_NO": 909
            },
            {
             "CUSTOMER_CODE": 110248,
             "MODEL": "DSM",
             "MACHINE_NO": 1363
            },
            {
             "CUSTOMER_CODE": 110302,
             "MODEL": "MGA1",
             "MACHINE_NO": 837
            },
            {
             "CUSTOMER_CODE": 130226,
             "MODEL": "MGA2",
             "MACHINE_NO": 1235
            },
            {
             "CUSTOMER_CODE": 130226,
             "MODEL": "DSM",
             "MACHINE_NO": 2458
            },
            {
             "CUSTOMER_CODE": 131112,
             "MODEL": "NUVO10",
             "MACHINE_NO": 23
            },
            {
             "CUSTOMER_CODE": 130627,
             "MODEL": "DSM",
             "MACHINE_NO": 2819
            },
            {
             "CUSTOMER_CODE": 130267,
             "MODEL": "MGA2",
             "MACHINE_NO": 1427
            },
            {
             "CUSTOMER_CODE": 111852,
             "MODEL": "MGA2",
             "MACHINE_NO": 1001
            },
            {
             "CUSTOMER_CODE": 111852,
             "MODEL": "DSM",
             "MACHINE_NO": 2054
            },
            {
             "CUSTOMER_CODE": 130185,
             "MODEL": "DSM",
             "MACHINE_NO": 2469
            },
            {
             "CUSTOMER_CODE": 130185,
             "MODEL": "MGA2",
             "MACHINE_NO": 1250
            },
            {
             "CUSTOMER_CODE": 130630,
             "MODEL": "MGA2",
             "MACHINE_NO": 1434
            },
            {
             "CUSTOMER_CODE": 109375,
             "MODEL": "DSM",
             "MACHINE_NO": 1292
            },
            {
             "CUSTOMER_CODE": 109375,
             "MODEL": "MGA1",
             "MACHINE_NO": 979
            },
            {
             "CUSTOMER_CODE": 110296,
             "MODEL": "MGA1",
             "MACHINE_NO": 1040
            },
            {
             "CUSTOMER_CODE": 111525,
             "MODEL": "MGA2",
             "MACHINE_NO": 830
            },
            {
             "CUSTOMER_CODE": 111525,
             "MODEL": "DSM",
             "MACHINE_NO": 1714
            },
            {
             "CUSTOMER_CODE": 130241,
             "MODEL": "DSM",
             "MACHINE_NO": 2533
            },
            {
             "CUSTOMER_CODE": 130241,
             "MODEL": "MGA2",
             "MACHINE_NO": 1319
            },
            {
             "CUSTOMER_CODE": 130169,
             "MODEL": "MGA2",
             "MACHINE_NO": 2463
            },
            {
             "CUSTOMER_CODE": 130169,
             "MODEL": "DSM",
             "MACHINE_NO": 1232
            },
            {
             "CUSTOMER_CODE": 130415,
             "MODEL": "DSM",
             "MACHINE_NO": 2636
            },
            {
             "CUSTOMER_CODE": 130415,
             "MODEL": "MGA1",
             "MACHINE_NO": 1442
            },
            {
             "CUSTOMER_CODE": 111702,
             "MODEL": "MGA1",
             "MACHINE_NO": 1078
            },
            {
             "CUSTOMER_CODE": 111702,
             "MODEL": "DSM",
             "MACHINE_NO": 1933
            },
            {
             "CUSTOMER_CODE": 111557,
             "MODEL": "DSM",
             "MACHINE_NO": 1758
            },
            {
             "CUSTOMER_CODE": 111557,
             "MODEL": "MGA2",
             "MACHINE_NO": 878
            },
            {
             "CUSTOMER_CODE": 109487,
             "MODEL": "MGA2",
             "MACHINE_NO": 587
            },
            {
             "CUSTOMER_CODE": 109487,
             "MODEL": "DSM",
             "MACHINE_NO": 715
            },
            {
             "CUSTOMER_CODE": 110385,
             "MODEL": "MGA2",
             "MACHINE_NO": 198
            },
            {
             "CUSTOMER_CODE": 111505,
             "MODEL": "MGA1",
             "MACHINE_NO": 794
            },
            {
             "CUSTOMER_CODE": 111505,
             "MODEL": "DSM",
             "MACHINE_NO": 1367
            },
            {
             "CUSTOMER_CODE": 131125,
             "MODEL": "DSM",
             "MACHINE_NO": 3045
            },
            {
             "CUSTOMER_CODE": 131125,
             "MODEL": "MGA1",
             "MACHINE_NO": 1695
            },
            {
             "CUSTOMER_CODE": 109699,
             "MODEL": "MGA2",
             "MACHINE_NO": 469
            },
            {
             "CUSTOMER_CODE": 109699,
             "MODEL": "DSM",
             "MACHINE_NO": 1333
            },
            {
             "CUSTOMER_CODE": 130053,
             "MODEL": "DSM",
             "MACHINE_NO": 2223
            },
            {
             "CUSTOMER_CODE": 130053,
             "MODEL": "MGA2",
             "MACHINE_NO": 1166
            },
            {
             "CUSTOMER_CODE": 111687,
             "MODEL": "MGA1",
             "MACHINE_NO": 1057
            },
            {
             "CUSTOMER_CODE": 111687,
             "MODEL": "DSM",
             "MACHINE_NO": 1912
            },
            {
             "CUSTOMER_CODE": 108492,
             "MODEL": "DSM",
             "MACHINE_NO": 360
            },
            {
             "CUSTOMER_CODE": 108492,
             "MODEL": "MGA2",
             "MACHINE_NO": 287
            },
            {
             "CUSTOMER_CODE": 110359,
             "MODEL": "MGA2",
             "MACHINE_NO": 883
            },
            {
             "CUSTOMER_CODE": 110359,
             "MODEL": "DSM",
             "MACHINE_NO": 1337
            },
            {
             "CUSTOMER_CODE": 130384,
             "MODEL": "DSM",
             "MACHINE_NO": 2603
            },
            {
             "CUSTOMER_CODE": 130384,
             "MODEL": "MGA1",
             "MACHINE_NO": 1408
            },
            {
             "CUSTOMER_CODE": 109848,
             "MODEL": "MGA2",
             "MACHINE_NO": 268
            },
            {
             "CUSTOMER_CODE": 109848,
             "MODEL": "DSM",
             "MACHINE_NO": 898
            },
            {
             "CUSTOMER_CODE": 111555,
             "MODEL": "DSM",
             "MACHINE_NO": 523
            },
            {
             "CUSTOMER_CODE": 111555,
             "MODEL": "MGA1",
             "MACHINE_NO": 84
            },
            {
             "CUSTOMER_CODE": 130838,
             "MODEL": "NUVO10",
             "MACHINE_NO": 12
            },
            {
             "CUSTOMER_CODE": 130281,
             "MODEL": "MGA2",
             "MACHINE_NO": 1312
            },
            {
             "CUSTOMER_CODE": 130869,
             "MODEL": "NUVO10",
             "MACHINE_NO": 18
            },
            {
             "CUSTOMER_CODE": 110296,
             "MODEL": "DSM",
             "MACHINE_NO": 1290
            },
            {
             "CUSTOMER_CODE": 108464,
             "MODEL": "MGA2",
             "MACHINE_NO": 215
            },
            {
             "CUSTOMER_CODE": 108464,
             "MODEL": "DSM",
             "MACHINE_NO": 2463
            },
            {
             "CUSTOMER_CODE": 130643,
             "MODEL": "DSM",
             "MACHINE_NO": 2825
            },
            {
             "CUSTOMER_CODE": 130643,
             "MODEL": "MGA2",
             "MACHINE_NO": 1433
            },
            {
             "CUSTOMER_CODE": 111906,
             "MODEL": "MGA2",
             "MACHINE_NO": 1015
            },
            {
             "CUSTOMER_CODE": 111906,
             "MODEL": "DSM",
             "MACHINE_NO": 2088
            },
            {
             "CUSTOMER_CODE": 130572,
             "MODEL": "DSM",
             "MACHINE_NO": 2766
            },
            {
             "CUSTOMER_CODE": 130572,
             "MODEL": "MGA2",
             "MACHINE_NO": 1015
            },
            {
             "CUSTOMER_CODE": 108613,
             "MODEL": "MGA2",
             "MACHINE_NO": 562
            },
            {
             "CUSTOMER_CODE": 108613,
             "MODEL": "DSM",
             "MACHINE_NO": 1952
            },
            {
             "CUSTOMER_CODE": 130232,
             "MODEL": "MGA2",
             "MACHINE_NO": 1333
            },
            {
             "CUSTOMER_CODE": 111433,
             "MODEL": "DSM",
             "MACHINE_NO": 1601
            },
            {
             "CUSTOMER_CODE": 111433,
             "MODEL": "MGA1",
             "MACHINE_NO": 985
            },
            {
             "CUSTOMER_CODE": 130664,
             "MODEL": "MGA2",
             "MACHINE_NO": 1458
            },
            {
             "CUSTOMER_CODE": 130664,
             "MODEL": "DSM",
             "MACHINE_NO": 2973
            },
            {
             "CUSTOMER_CODE": 130160,
             "MODEL": "MGA1",
             "MACHINE_NO": 1622
            },
            {
             "CUSTOMER_CODE": 130161,
             "MODEL": "MGA2",
             "MACHINE_NO": 1225
            },
            {
             "CUSTOMER_CODE": 130161,
             "MODEL": "DSM",
             "MACHINE_NO": 2447
            },
            {
             "CUSTOMER_CODE": 111518,
             "MODEL": "DSM",
             "MACHINE_NO": 1700
            },
            {
             "CUSTOMER_CODE": 130639,
             "MODEL": "MGA2",
             "MACHINE_NO": 1439
            },
            {
             "CUSTOMER_CODE": 108009,
             "MODEL": "MGA2",
             "MACHINE_NO": 1394
            },
            {
             "CUSTOMER_CODE": 108009,
             "MODEL": "DSM",
             "MACHINE_NO": 2596
            },
            {
             "CUSTOMER_CODE": 112445,
             "MODEL": "DSM",
             "MACHINE_NO": 2405
            },
            {
             "CUSTOMER_CODE": 112445,
             "MODEL": "MGA1",
             "MACHINE_NO": 1382
            },
            {
             "CUSTOMER_CODE": 109076,
             "MODEL": "MGA1",
             "MACHINE_NO": 975
            },
            {
             "CUSTOMER_CODE": 109076,
             "MODEL": "DSM",
             "MACHINE_NO": 1593
            },
            {
             "CUSTOMER_CODE": 109044,
             "MODEL": "MGA1",
             "MACHINE_NO": 748
            },
            {
             "CUSTOMER_CODE": 111608,
             "MODEL": "MGA2",
             "MACHINE_NO": 938
            },
            {
             "CUSTOMER_CODE": 111608,
             "MODEL": "DSM",
             "MACHINE_NO": 1815
            },
            {
             "CUSTOMER_CODE": 108778,
             "MODEL": "MGA1",
             "MACHINE_NO": 895
            },
            {
             "CUSTOMER_CODE": 111545,
             "MODEL": "MGA2",
             "MACHINE_NO": 562
            },
            {
             "CUSTOMER_CODE": 111545,
             "MODEL": "DSM",
             "MACHINE_NO": 1743
            },
            {
             "CUSTOMER_CODE": 110195,
             "MODEL": "DSM",
             "MACHINE_NO": 2545
            },
            {
             "CUSTOMER_CODE": 110195,
             "MODEL": "MGA2",
             "MACHINE_NO": 940
            },
            {
             "CUSTOMER_CODE": 131119,
             "MODEL": "NUVO10",
             "MACHINE_NO": 94
            },
            {
             "CUSTOMER_CODE": 130261,
             "MODEL": "MGA1",
             "MACHINE_NO": 1296
            },
            {
             "CUSTOMER_CODE": 130261,
             "MODEL": "DSM",
             "MACHINE_NO": 2511
            },
            {
             "CUSTOMER_CODE": 111506,
             "MODEL": "DSM",
             "MACHINE_NO": 1687
            },
            {
             "CUSTOMER_CODE": 111506,
             "MODEL": "MGA2",
             "MACHINE_NO": 459
            },
            {
             "CUSTOMER_CODE": 130493,
             "MODEL": "MGA2",
             "MACHINE_NO": 883
            },
            {
             "CUSTOMER_CODE": 130493,
             "MODEL": "DSM",
             "MACHINE_NO": 2710
            },
            {
             "CUSTOMER_CODE": 131100,
             "MODEL": "DSM",
             "MACHINE_NO": 3039
            },
            {
             "CUSTOMER_CODE": 131100,
             "MODEL": "MGA1",
             "MACHINE_NO": 1689
            },
            {
             "CUSTOMER_CODE": 130293,
             "MODEL": "MGA2",
             "MACHINE_NO": 1357
            },
            {
             "CUSTOMER_CODE": 130293,
             "MODEL": "DSM",
             "MACHINE_NO": 2536
            },
            {
             "CUSTOMER_CODE": 130292,
             "MODEL": "DSM",
             "MACHINE_NO": 2386
            },
            {
             "CUSTOMER_CODE": 130292,
             "MODEL": "MGA2",
             "MACHINE_NO": 1358
            },
            {
             "CUSTOMER_CODE": 130519,
             "MODEL": "DSM",
             "MACHINE_NO": 2723
            },
            {
             "CUSTOMER_CODE": 130519,
             "MODEL": "MGA1",
             "MACHINE_NO": 1528
            },
            {
             "CUSTOMER_CODE": 108054,
             "MODEL": "MGA2",
             "MACHINE_NO": 559
            },
            {
             "CUSTOMER_CODE": 108054,
             "MODEL": "DSM",
             "MACHINE_NO": 1160
            },
            {
             "CUSTOMER_CODE": 140012,
             "MODEL": "DSM",
             "MACHINE_NO": 2658
            },
            {
             "CUSTOMER_CODE": 140012,
             "MODEL": "MGA1",
             "MACHINE_NO": 1506
            },
            {
             "CUSTOMER_CODE": 108034,
             "MODEL": "MGA2",
             "MACHINE_NO": 511
            },
            {
             "CUSTOMER_CODE": 108034,
             "MODEL": "DSM",
             "MACHINE_NO": 1060
            },
            {
             "CUSTOMER_CODE": 111919,
             "MODEL": "MGA2",
             "MACHINE_NO": 1038
            },
            {
             "CUSTOMER_CODE": 130193,
             "MODEL": "DSM",
             "MACHINE_NO": 2441
            },
            {
             "CUSTOMER_CODE": 130193,
             "MODEL": "MGA2",
             "MACHINE_NO": 1219
            },
            {
             "CUSTOMER_CODE": 130386,
             "MODEL": "MGA1",
             "MACHINE_NO": 1406
            },
            {
             "CUSTOMER_CODE": 130386,
             "MODEL": "DSM",
             "MACHINE_NO": 2608
            },
            {
             "CUSTOMER_CODE": 130512,
             "MODEL": "DSM",
             "MACHINE_NO": 2717
            },
            {
             "CUSTOMER_CODE": 130512,
             "MODEL": "MGA1",
             "MACHINE_NO": 1456
            },
            {
             "CUSTOMER_CODE": 130657,
             "MODEL": "MGA2",
             "MACHINE_NO": 1453
            },
            {
             "CUSTOMER_CODE": 130657,
             "MODEL": "DSM",
             "MACHINE_NO": 2843
            },
            {
             "CUSTOMER_CODE": 108649,
             "MODEL": "DSM",
             "MACHINE_NO": 453
            },
            {
             "CUSTOMER_CODE": 108649,
             "MODEL": "MGA1",
             "MACHINE_NO": 420
            },
            {
             "CUSTOMER_CODE": 140013,
             "MODEL": "MGA2",
             "MACHINE_NO": 643
            },
            {
             "CUSTOMER_CODE": 140013,
             "MODEL": "DSM",
             "MACHINE_NO": 1428
            },
            {
             "CUSTOMER_CODE": 110319,
             "MODEL": "DSM",
             "MACHINE_NO": 1311
            },
            {
             "CUSTOMER_CODE": 110319,
             "MODEL": "MGA1",
             "MACHINE_NO": 853
            },
            {
             "CUSTOMER_CODE": 110202,
             "MODEL": "DSM",
             "MACHINE_NO": 1236
            },
            {
             "CUSTOMER_CODE": 110202,
             "MODEL": "MGA1",
             "MACHINE_NO": 729
            },
            {
             "CUSTOMER_CODE": 111553,
             "MODEL": "MGA1",
             "MACHINE_NO": 836
            },
            {
             "CUSTOMER_CODE": 110262,
             "MODEL": "DSM",
             "MACHINE_NO": 2302
            },
            {
             "CUSTOMER_CODE": 110262,
             "MODEL": "MGA2",
             "MACHINE_NO": 1111
            },
            {
             "CUSTOMER_CODE": 111469,
             "MODEL": "MGA2",
             "MACHINE_NO": 770
            },
            {
             "CUSTOMER_CODE": 111469,
             "MODEL": "DSM",
             "MACHINE_NO": 1644
            },
            {
             "CUSTOMER_CODE": 109710,
             "MODEL": "DSM",
             "MACHINE_NO": 2238
            },
            {
             "CUSTOMER_CODE": 109710,
             "MODEL": "MGA1",
             "MACHINE_NO": 763
            },
            {
             "CUSTOMER_CODE": 111604,
             "MODEL": "MGA2",
             "MACHINE_NO": 933
            },
            {
             "CUSTOMER_CODE": 111604,
             "MODEL": "DSM",
             "MACHINE_NO": 1807
            },
            {
             "CUSTOMER_CODE": 110307,
             "MODEL": "DSM",
             "MACHINE_NO": 688
            },
            {
             "CUSTOMER_CODE": 110307,
             "MODEL": "MGA2",
             "MACHINE_NO": 19
            },
            {
             "CUSTOMER_CODE": 109521,
             "MODEL": "DSM",
             "MACHINE_NO": 747
            },
            {
             "CUSTOMER_CODE": 108325,
             "MODEL": "DSM",
             "MACHINE_NO": 384
            },
            {
             "CUSTOMER_CODE": 108325,
             "MODEL": "MGA1",
             "MACHINE_NO": 228
            },
            {
             "CUSTOMER_CODE": 130918,
             "MODEL": "MGA1",
             "MACHINE_NO": 1626
            },
            {
             "CUSTOMER_CODE": 130918,
             "MODEL": "DSM",
             "MACHINE_NO": 2981
            },
            {
             "CUSTOMER_CODE": 130552,
             "MODEL": "DSM",
             "MACHINE_NO": 2743
            },
            {
             "CUSTOMER_CODE": 130552,
             "MODEL": "MGA1",
             "MACHINE_NO": 1555
            },
            {
             "CUSTOMER_CODE": 109639,
             "MODEL": "DSM",
             "MACHINE_NO": 772
            },
            {
             "CUSTOMER_CODE": 108013,
             "MODEL": "DSM",
             "MACHINE_NO": 2167
            },
            {
             "CUSTOMER_CODE": 108013,
             "MODEL": "MGA1",
             "MACHINE_NO": 733
            },
            {
             "CUSTOMER_CODE": 109822,
             "MODEL": "MGA2",
             "MACHINE_NO": 228
            },
            {
             "CUSTOMER_CODE": 108667,
             "MODEL": "MGA1",
             "MACHINE_NO": 835
            },
            {
             "CUSTOMER_CODE": 108667,
             "MODEL": "DSM",
             "MACHINE_NO": 1205
            },
            {
             "CUSTOMER_CODE": 110116,
             "MODEL": "MGA1",
             "MACHINE_NO": 762
            },
            {
             "CUSTOMER_CODE": 110116,
             "MODEL": "DSM",
             "MACHINE_NO": 1148
            },
            {
             "CUSTOMER_CODE": 130513,
             "MODEL": "MGA1",
             "MACHINE_NO": 1375
            },
            {
             "CUSTOMER_CODE": 130513,
             "MODEL": "DSM",
             "MACHINE_NO": 2716
            },
            {
             "CUSTOMER_CODE": 130521,
             "MODEL": "DSM",
             "MACHINE_NO": 2725
            },
            {
             "CUSTOMER_CODE": 130521,
             "MODEL": "MGA1",
             "MACHINE_NO": 1530
            },
            {
             "CUSTOMER_CODE": 130520,
             "MODEL": "MGA1",
             "MACHINE_NO": 1529
            },
            {
             "CUSTOMER_CODE": 130520,
             "MODEL": "DSM",
             "MACHINE_NO": 2724
            },
            {
             "CUSTOMER_CODE": 108103,
             "MODEL": "DSM",
             "MACHINE_NO": 1361
            },
            {
             "CUSTOMER_CODE": 108103,
             "MODEL": "MGA1",
             "MACHINE_NO": 906
            },
            {
             "CUSTOMER_CODE": 111842,
             "MODEL": "MGA1",
             "MACHINE_NO": 1191
            },
            {
             "CUSTOMER_CODE": 111842,
             "MODEL": "DSM",
             "MACHINE_NO": 2040
            },
            {
             "CUSTOMER_CODE": 130562,
             "MODEL": "DSM",
             "MACHINE_NO": 2731
            },
            {
             "CUSTOMER_CODE": 130562,
             "MODEL": "MGA1",
             "MACHINE_NO": 1541
            },
            {
             "CUSTOMER_CODE": 130564,
             "MODEL": "MGA1",
             "MACHINE_NO": 1544
            },
            {
             "CUSTOMER_CODE": 130564,
             "MODEL": "DSM",
             "MACHINE_NO": 2730
            },
            {
             "CUSTOMER_CODE": 111881,
             "MODEL": "DSM",
             "MACHINE_NO": 2058
            },
            {
             "CUSTOMER_CODE": 111881,
             "MODEL": "MGA2",
             "MACHINE_NO": 1016
            },
            {
             "CUSTOMER_CODE": 130514,
             "MODEL": "MGA1",
             "MACHINE_NO": 1523
            },
            {
             "CUSTOMER_CODE": 130514,
             "MODEL": "DSM",
             "MACHINE_NO": 2718
            },
            {
             "CUSTOMER_CODE": 140014,
             "MODEL": "DSM",
             "MACHINE_NO": 1087
            },
            {
             "CUSTOMER_CODE": 140014,
             "MODEL": "MGA1",
             "MACHINE_NO": 1527
            },
            {
             "CUSTOMER_CODE": 130267,
             "MODEL": "MGA2",
             "MACHINE_NO": 1330
            },
            {
             "CUSTOMER_CODE": 130267,
             "MODEL": "DSM",
             "MACHINE_NO": 2538
            },
            {
             "CUSTOMER_CODE": 111526,
             "MODEL": "MGA2",
             "MACHINE_NO": 842
            },
            {
             "CUSTOMER_CODE": 111526,
             "MODEL": "DSM",
             "MACHINE_NO": 1728
            },
            {
             "CUSTOMER_CODE": 111454,
             "MODEL": "DSM",
             "MACHINE_NO": 1624
            },
            {
             "CUSTOMER_CODE": 111454,
             "MODEL": "MGA2",
             "MACHINE_NO": 1000
            },
            {
             "CUSTOMER_CODE": 111705,
             "MODEL": "MGA1",
             "MACHINE_NO": 1068
            },
            {
             "CUSTOMER_CODE": 111705,
             "MODEL": "DSM",
             "MACHINE_NO": 1925
            },
            {
             "CUSTOMER_CODE": 130397,
             "MODEL": "DSM",
             "MACHINE_NO": 2623
            },
            {
             "CUSTOMER_CODE": 130397,
             "MODEL": "MGA1",
             "MACHINE_NO": 1418
            },
            {
             "CUSTOMER_CODE": 111461,
             "MODEL": "MGA2",
             "MACHINE_NO": 1058
            },
            {
             "CUSTOMER_CODE": 111461,
             "MODEL": "DSM",
             "MACHINE_NO": 2108
            },
            {
             "CUSTOMER_CODE": 111524,
             "MODEL": "DSM",
             "MACHINE_NO": 1713
            },
            {
             "CUSTOMER_CODE": 111524,
             "MODEL": "MGA2",
             "MACHINE_NO": 829
            },
            {
             "CUSTOMER_CODE": 108843,
             "MODEL": "MGA1",
             "MACHINE_NO": 808
            },
            {
             "CUSTOMER_CODE": 108843,
             "MODEL": "DSM",
             "MACHINE_NO": 581
            },
            {
             "CUSTOMER_CODE": 108633,
             "MODEL": "DSM",
             "MACHINE_NO": 412
            },
            {
             "CUSTOMER_CODE": 130924,
             "MODEL": "NUV010",
             "MACHINE_NO": 44
            },
            {
             "CUSTOMER_CODE": 108407,
             "MODEL": "DSM",
             "MACHINE_NO": 295
            },
            {
             "CUSTOMER_CODE": 108407,
             "MODEL": "MGA2",
             "MACHINE_NO": 480
            },
            {
             "CUSTOMER_CODE": 111932,
             "MODEL": "MGA2",
             "MACHINE_NO": 1042
            },
            {
             "CUSTOMER_CODE": 111932,
             "MODEL": "DSM",
             "MACHINE_NO": 2083
            },
            {
             "CUSTOMER_CODE": 108160,
             "MODEL": "DSM",
             "MACHINE_NO": 1044
            },
            {
             "CUSTOMER_CODE": 108160,
             "MODEL": "MGA1",
             "MACHINE_NO": 1310
            },
            {
             "CUSTOMER_CODE": 108702,
             "MODEL": "MGA2",
             "MACHINE_NO": 1082
            },
            {
             "CUSTOMER_CODE": 109015,
             "MODEL": "MGA2",
             "MACHINE_NO": 1095
            },
            {
             "CUSTOMER_CODE": 109015,
             "MODEL": "DSM",
             "MACHINE_NO": 1348
            },
            {
             "CUSTOMER_CODE": 108231,
             "MODEL": "DSM",
             "MACHINE_NO": 270
            },
            {
             "CUSTOMER_CODE": 108231,
             "MODEL": "MGA2",
             "MACHINE_NO": 476
            },
            {
             "CUSTOMER_CODE": 130849,
             "MODEL": "MGA2",
             "MACHINE_NO": 1572
            },
            {
             "CUSTOMER_CODE": 130489,
             "MODEL": "DSM",
             "MACHINE_NO": 2943
            },
            {
             "CUSTOMER_CODE": 110029,
             "MODEL": "DSM",
             "MACHINE_NO": 1070
            },
            {
             "CUSTOMER_CODE": 130911,
             "MODEL": "DSM",
             "MACHINE_NO": 2977
            },
            {
             "CUSTOMER_CODE": 130911,
             "MODEL": "MGA1",
             "MACHINE_NO": 1625
            },
            {
             "CUSTOMER_CODE": 108543,
             "MODEL": "MGA2",
             "MACHINE_NO": 1137
            },
            {
             "CUSTOMER_CODE": 108543,
             "MODEL": "DSM",
             "MACHINE_NO": 563
            },
            {
             "CUSTOMER_CODE": 111729,
             "MODEL": "DSM",
             "MACHINE_NO": 1953
            },
            {
             "CUSTOMER_CODE": 111729,
             "MODEL": "MGA1",
             "MACHINE_NO": 1090
            },
            {
             "CUSTOMER_CODE": 130932,
             "MODEL": "MGA1",
             "MACHINE_NO": 1105
            },
            {
             "CUSTOMER_CODE": 130932,
             "MODEL": "DSM",
             "MACHINE_NO": 2028
            },
            {
             "CUSTOMER_CODE": 109731,
             "MODEL": "DSM",
             "MACHINE_NO": 826
            },
            {
             "CUSTOMER_CODE": 109731,
             "MODEL": "MGA1",
             "MACHINE_NO": 175
            },
            {
             "CUSTOMER_CODE": 130195,
             "MODEL": "MGA2",
             "MACHINE_NO": 795
            },
            {
             "CUSTOMER_CODE": 130574,
             "MODEL": "MGA1",
             "MACHINE_NO": 1593
            },
            {
             "CUSTOMER_CODE": 130574,
             "MODEL": "DSM",
             "MACHINE_NO": 2794
            },
            {
             "CUSTOMER_CODE": 108248,
             "MODEL": "DSM",
             "MACHINE_NO": 23
            },
            {
             "CUSTOMER_CODE": 108248,
             "MODEL": "MGA1",
             "MACHINE_NO": 184
            },
            {
             "CUSTOMER_CODE": 130260,
             "MODEL": "MGA2",
             "MACHINE_NO": 1349
            },
            {
             "CUSTOMER_CODE": 130260,
             "MODEL": "DSM",
             "MACHINE_NO": 2555
            },
            {
             "CUSTOMER_CODE": 140018,
             "MODEL": "DSM",
             "MACHINE_NO": 2845
            },
            {
             "CUSTOMER_CODE": 140018,
             "MODEL": "MGA",
             "MACHINE_NO": 1454
            },
            {
             "CUSTOMER_CODE": 130690,
             "MODEL": "DSM",
             "MACHINE_NO": 2862
            },
            {
             "CUSTOMER_CODE": 130554,
             "MODEL": "MGA1",
             "MACHINE_NO": 1566
            },
            {
             "CUSTOMER_CODE": 130554,
             "MODEL": "DSM",
             "MACHINE_NO": 2749
            },
            {
             "CUSTOMER_CODE": 108092,
             "MODEL": "DSM",
             "MACHINE_NO": 551
            },
            {
             "CUSTOMER_CODE": 108092,
             "MODEL": "MGA2",
             "MACHINE_NO": 558
            },
            {
             "CUSTOMER_CODE": 111979,
             "MODEL": "MGA1",
             "MACHINE_NO": 694
            },
            {
             "CUSTOMER_CODE": 111979,
             "MODEL": "DSM",
             "MACHINE_NO": 2147
            },
            {
             "CUSTOMER_CODE": 130232,
             "MODEL": "DSM",
             "MACHINE_NO": 2570
            },
            {
             "CUSTOMER_CODE": 130232,
             "MODEL": "MGA",
             "MACHINE_NO": 1525
            },
            {
             "CUSTOMER_CODE": 108320,
             "MODEL": "MGA2",
             "MACHINE_NO": 2
            },
            {
             "CUSTOMER_CODE": 130112,
             "MODEL": "DSM",
             "MACHINE_NO": 2454
            },
            {
             "CUSTOMER_CODE": 111452,
             "MODEL": "MGA2",
             "MACHINE_NO": 1328
            },
            {
             "CUSTOMER_CODE": 111452,
             "MODEL": "DSM",
             "MACHINE_NO": 687
            },
            {
             "CUSTOMER_CODE": 130423,
             "MODEL": "DSM",
             "MACHINE_NO": 2654
            },
            {
             "CUSTOMER_CODE": 130423,
             "MODEL": "MGA1",
             "MACHINE_NO": 1460
            },
            {
             "CUSTOMER_CODE": 108400,
             "MODEL": "DSM",
             "MACHINE_NO": 1287
            },
            {
             "CUSTOMER_CODE": 130294,
             "MODEL": "MGA1",
             "MACHINE_NO": 1393
            },
            {
             "CUSTOMER_CODE": 130294,
             "MODEL": "DSM",
             "MACHINE_NO": 2595
            },
            {
             "CUSTOMER_CODE": 130670,
             "MODEL": "DSM",
             "MACHINE_NO": 2852
            },
            {
             "CUSTOMER_CODE": 130670,
             "MODEL": "MGA2",
             "MACHINE_NO": 1462
            },
            {
             "CUSTOMER_CODE": 108400,
             "MODEL": "MGA2",
             "MACHINE_NO": 561
            },
            {
             "CUSTOMER_CODE": 108400,
             "MODEL": "MGA2",
             "MACHINE_NO": 561
            },
            {
             "CUSTOMER_CODE": 130268,
             "MODEL": "MGA2",
             "MACHINE_NO": 1329
            },
            {
             "CUSTOMER_CODE": 130268,
             "MODEL": "DSM",
             "MACHINE_NO": 2537
            },
            {
             "CUSTOMER_CODE": 108086,
             "MODEL": "DSM",
             "MACHINE_NO": 1087
            },
            {
             "CUSTOMER_CODE": 108086,
             "MODEL": "MGA1",
             "MACHINE_NO": 1701
            },
            {
             "CUSTOMER_CODE": 110093,
             "MODEL": "MGA1",
             "MACHINE_NO": 648
            },
            {
             "CUSTOMER_CODE": 110093,
             "MODEL": "DSM",
             "MACHINE_NO": 1132
            },
            {
             "CUSTOMER_CODE": 140020,
             "MODEL": "DSM",
             "MACHINE_NO": 2537
            },
            {
             "CUSTOMER_CODE": 140020,
             "MODEL": "MGA2",
             "MACHINE_NO": 1329
            },
            {
             "CUSTOMER_CODE": 130323,
             "MODEL": "MGA2",
             "MACHINE_NO": 1352
            },
            {
             "CUSTOMER_CODE": 130323,
             "MODEL": "DSM",
             "MACHINE_NO": 2560
            },
            {
             "CUSTOMER_CODE": 130307,
             "MODEL": "DSM",
             "MACHINE_NO": 2543
            },
            {
             "CUSTOMER_CODE": 130307,
             "MODEL": "MGA2",
             "MACHINE_NO": 953
            },
            {
             "CUSTOMER_CODE": 111578,
             "MODEL": "MGA2",
             "MACHINE_NO": 894
            },
            {
             "CUSTOMER_CODE": 111578,
             "MODEL": "DSM",
             "MACHINE_NO": 1771
            },
            {
             "CUSTOMER_CODE": 130939,
             "MODEL": "DSM",
             "MACHINE_NO": 2991
            },
            {
             "CUSTOMER_CODE": 130939,
             "MODEL": "MGA2",
             "MACHINE_NO": 724
            },
            {
             "CUSTOMER_CODE": 130946,
             "MODEL": "MGA2",
             "MACHINE_NO": 684
            },
            {
             "CUSTOMER_CODE": 130946,
             "MODEL": "DSM",
             "MACHINE_NO": 1463
            },
            {
             "CUSTOMER_CODE": 108352,
             "MODEL": "DSM",
             "MACHINE_NO": 173
            },
            {
             "CUSTOMER_CODE": 108352,
             "MODEL": "MGA2",
             "MACHINE_NO": 1221
            },
            {
             "CUSTOMER_CODE": 111540,
             "MODEL": "MGA1",
             "MACHINE_NO": 855
            },
            {
             "CUSTOMER_CODE": 111540,
             "MODEL": "DSM",
             "MACHINE_NO": 1752
            },
            {
             "CUSTOMER_CODE": 130590,
             "MODEL": "DSM",
             "MACHINE_NO": 2783
            },
            {
             "CUSTOMER_CODE": 130590,
             "MODEL": "MGA1",
             "MACHINE_NO": 1592
            },
            {
             "CUSTOMER_CODE": 130945,
             "MODEL": "MGA2",
             "MACHINE_NO": 1335
            },
            {
             "CUSTOMER_CODE": 130945,
             "MODEL": "DSM",
             "MACHINE_NO": 2548
            },
            {
             "CUSTOMER_CODE": 110507,
             "MODEL": "DSM",
             "MACHINE_NO": 1552
            },
            {
             "CUSTOMER_CODE": 110507,
             "MODEL": "MGA2",
             "MACHINE_NO": 747
            },
            {
             "CUSTOMER_CODE": 140023,
             "MODEL": "MGA1",
             "MACHINE_NO": 1712
            },
            {
             "CUSTOMER_CODE": 140023,
             "MODEL": "DSM",
             "MACHINE_NO": 3058
            },
            {
             "CUSTOMER_CODE": 130188,
             "MODEL": "MGA",
             "MACHINE_NO": 1252
            },
            {
             "CUSTOMER_CODE": 111434,
             "MODEL": "MGA1",
             "MACHINE_NO": 1362
            },
            {
             "CUSTOMER_CODE": 109328,
             "MODEL": "MGA2",
             "MACHINE_NO": 1075
            },
            {
             "CUSTOMER_CODE": 109328,
             "MODEL": "DSM",
             "MACHINE_NO": 927
            },
            {
             "CUSTOMER_CODE": 108715,
             "MODEL": "DSM",
             "MACHINE_NO": 2421
            },
            {
             "CUSTOMER_CODE": 108715,
             "MODEL": "MGA1",
             "MACHINE_NO": 1134
            },
            {
             "CUSTOMER_CODE": 131025,
             "MODEL": "NUVO10",
             "MACHINE_NO": 109
            },
            {
             "CUSTOMER_CODE": 130432,
             "MODEL": "MGA1",
             "MACHINE_NO": 1461
            },
            {
             "CUSTOMER_CODE": 130432,
             "MODEL": "DSM",
             "MACHINE_NO": 2655
            },
            {
             "CUSTOMER_CODE": 108803,
             "MODEL": "MGA2",
             "MACHINE_NO": 695
            },
            {
             "CUSTOMER_CODE": 130355,
             "MODEL": "MGA2",
             "MACHINE_NO": 1391
            },
            {
             "CUSTOMER_CODE": 130355,
             "MODEL": "DSM",
             "MACHINE_NO": 2593
            },
            {
             "CUSTOMER_CODE": 109329,
             "MODEL": "MGA1",
             "MACHINE_NO": 470
            },
            {
             "CUSTOMER_CODE": 108721,
             "MODEL": "MGA1",
             "MACHINE_NO": 632
            },
            {
             "CUSTOMER_CODE": 108721,
             "MODEL": "DSM",
             "MACHINE_NO": 2142
            },
            {
             "CUSTOMER_CODE": 130346,
             "MODEL": "DSM",
             "MACHINE_NO": 2580
            },
            {
             "CUSTOMER_CODE": 130346,
             "MODEL": "MGA2",
             "MACHINE_NO": 1376
            },
            {
             "CUSTOMER_CODE": 130711,
             "MODEL": "MGA2",
             "MACHINE_NO": 1495
            },
            {
             "CUSTOMER_CODE": 110341,
             "MODEL": "MGA1",
             "MACHINE_NO": 864
            },
            {
             "CUSTOMER_CODE": 110341,
             "MODEL": "DSM",
             "MACHINE_NO": 1320
            },
            {
             "CUSTOMER_CODE": 111802,
             "MODEL": "DSM",
             "MACHINE_NO": 524
            },
            {
             "CUSTOMER_CODE": 111802,
             "MODEL": "MGA1",
             "MACHINE_NO": 1154
            },
            {
             "CUSTOMER_CODE": 130173,
             "MODEL": "MGA1",
             "MACHINE_NO": 803
            },
            {
             "CUSTOMER_CODE": 130173,
             "MODEL": "DSM",
             "MACHINE_NO": 1269
            },
            {
             "CUSTOMER_CODE": 111577,
             "MODEL": "DSM",
             "MACHINE_NO": 1805
            },
            {
             "CUSTOMER_CODE": 111577,
             "MODEL": "MGA2",
             "MACHINE_NO": 927
            },
            {
             "CUSTOMER_CODE": 130962,
             "MODEL": "MGA1",
             "MACHINE_NO": 1649
            },
            {
             "CUSTOMER_CODE": 130962,
             "MODEL": "DSM",
             "MACHINE_NO": 2996
            },
            {
             "CUSTOMER_CODE": 109952,
             "MODEL": "DSM",
             "MACHINE_NO": 973
            },
            {
             "CUSTOMER_CODE": 109952,
             "MODEL": "MGA2",
             "MACHINE_NO": 418
            },
            {
             "CUSTOMER_CODE": 111538,
             "MODEL": "DSM",
             "MACHINE_NO": 1298
            },
            {
             "CUSTOMER_CODE": 130703,
             "MODEL": "DSM",
             "MACHINE_NO": 2885
            },
            {
             "CUSTOMER_CODE": 130703,
             "MODEL": "MGA2",
             "MACHINE_NO": 1504
            },
            {
             "CUSTOMER_CODE": 110467,
             "MODEL": "MGA2",
             "MACHINE_NO": 694
            },
            {
             "CUSTOMER_CODE": 110467,
             "MODEL": "DSM",
             "MACHINE_NO": 1472
            },
            {
             "CUSTOMER_CODE": 112451,
             "MODEL": "MGA2",
             "MACHINE_NO": 1214
            },
            {
             "CUSTOMER_CODE": 112451,
             "MODEL": "DSM",
             "MACHINE_NO": 2436
            },
            {
             "CUSTOMER_CODE": 108693,
             "MODEL": "DSM",
             "MACHINE_NO": 142
            },
            {
             "CUSTOMER_CODE": 108693,
             "MODEL": "MGA2",
             "MACHINE_NO": 1076
            },
            {
             "CUSTOMER_CODE": 110019,
             "MODEL": "MGA2",
             "MACHINE_NO": 980
            },
            {
             "CUSTOMER_CODE": 110019,
             "MODEL": "DSM",
             "MACHINE_NO": 1857
            },
            {
             "CUSTOMER_CODE": 111978,
             "MODEL": "DSM",
             "MACHINE_NO": 2144
            },
            {
             "CUSTOMER_CODE": 111978,
             "MODEL": "MGA2",
             "MACHINE_NO": 1078
            },
            {
             "CUSTOMER_CODE": 112444,
             "MODEL": "DSM",
             "MACHINE_NO": 2390
            },
            {
             "CUSTOMER_CODE": 112444,
             "MODEL": "MGA1",
             "MACHINE_NO": 1365
            },
            {
             "CUSTOMER_CODE": 130459,
             "MODEL": "MGA1",
             "MACHINE_NO": 1366
            },
            {
             "CUSTOMER_CODE": 130459,
             "MODEL": "DSM",
             "MACHINE_NO": 2393
            },
            {
             "CUSTOMER_CODE": 130284,
             "MODEL": "DSM",
             "MACHINE_NO": 2528
            },
            {
             "CUSTOMER_CODE": 130284,
             "MODEL": "MGA2",
             "MACHINE_NO": 1314
            },
            {
             "CUSTOMER_CODE": 110477,
             "MODEL": "MGA2",
             "MACHINE_NO": 705
            },
            {
             "CUSTOMER_CODE": 110477,
             "MODEL": "DSM",
             "MACHINE_NO": 1486
            },
            {
             "CUSTOMER_CODE": 140024,
             "MODEL": "DSM",
             "MACHINE_NO": 1791
            },
            {
             "CUSTOMER_CODE": 140024,
             "MODEL": "MGA1",
             "MACHINE_NO": 1307
            },
            {
             "CUSTOMER_CODE": 108612,
             "MODEL": "MGA1",
             "MACHINE_NO": 510
            },
            {
             "CUSTOMER_CODE": 108612,
             "MODEL": "DSM",
             "MACHINE_NO": 312
            },
            {
             "CUSTOMER_CODE": 130139,
             "MODEL": "DSM",
             "MACHINE_NO": 2395
            },
            {
             "CUSTOMER_CODE": 130139,
             "MODEL": "MGA1",
             "MACHINE_NO": 1370
            },
            {
             "CUSTOMER_CODE": 118064,
             "MODEL": "MGA2",
             "MACHINE_NO": 1490
            },
            {
             "CUSTOMER_CODE": 118064,
             "MODEL": "DSM",
             "MACHINE_NO": 2873
            },
            {
             "CUSTOMER_CODE": 140025,
             "MODEL": "MGA1",
             "MACHINE_NO": 1151
            },
            {
             "CUSTOMER_CODE": 111738,
             "MODEL": "MGA1",
             "MACHINE_NO": 1115
            },
            {
             "CUSTOMER_CODE": 111738,
             "MODEL": "DSM",
             "MACHINE_NO": 1969
            },
            {
             "CUSTOMER_CODE": 108415,
             "MODEL": "DSM",
             "MACHINE_NO": 1981
            },
            {
             "CUSTOMER_CODE": 108415,
             "MODEL": "MGA1",
             "MACHINE_NO": 1135
            },
            {
             "CUSTOMER_CODE": 108129,
             "MODEL": "MGA2",
             "MACHINE_NO": 1086
            },
            {
             "CUSTOMER_CODE": 108129,
             "MODEL": "DSM",
             "MACHINE_NO": 2150
            },
            {
             "CUSTOMER_CODE": 131072,
             "MODEL": "NUVO10",
             "MACHINE_NO": 83
            },
            {
             "CUSTOMER_CODE": 130447,
             "MODEL": "DSM",
             "MACHINE_NO": 2703
            },
            {
             "CUSTOMER_CODE": 130447,
             "MODEL": "MGA1",
             "MACHINE_NO": 1509
            },
            {
             "CUSTOMER_CODE": 110430,
             "MODEL": "MGA2",
             "MACHINE_NO": 639
            },
            {
             "CUSTOMER_CODE": 130389,
             "MODEL": "MGA1",
             "MACHINE_NO": 1419
            },
            {
             "CUSTOMER_CODE": 130389,
             "MODEL": "DSM",
             "MACHINE_NO": 2611
            },
            {
             "CUSTOMER_CODE": 109099,
             "MODEL": "DSM",
             "MACHINE_NO": 1982
            },
            {
             "CUSTOMER_CODE": 109036,
             "MODEL": "DSM",
             "MACHINE_NO": 492
            },
            {
             "CUSTOMER_CODE": 109663,
             "MODEL": "DSM",
             "MACHINE_NO": 509
            },
            {
             "CUSTOMER_CODE": 109637,
             "MODEL": "DSM",
             "MACHINE_NO": 774
            },
            {
             "CUSTOMER_CODE": 109721,
             "MODEL": "DSM",
             "MACHINE_NO": 842
            },
            {
             "CUSTOMER_CODE": 109721,
             "MODEL": "MGA2",
             "MACHINE_NO": 199
            },
            {
             "CUSTOMER_CODE": 130128,
             "MODEL": "MGA1",
             "MACHINE_NO": 1298
            },
            {
             "CUSTOMER_CODE": 130128,
             "MODEL": "DSM",
             "MACHINE_NO": 2334
            },
            {
             "CUSTOMER_CODE": 110408,
             "MODEL": "DSM",
             "MACHINE_NO": 1397
            },
            {
             "CUSTOMER_CODE": 110408,
             "MODEL": "MGA2",
             "MACHINE_NO": 613
            },
            {
             "CUSTOMER_CODE": 110407,
             "MODEL": "MGA2",
             "MACHINE_NO": 612
            },
            {
             "CUSTOMER_CODE": 110407,
             "MODEL": "DSM",
             "MACHINE_NO": 1396
            },
            {
             "CUSTOMER_CODE": 109919,
             "MODEL": "DSM",
             "MACHINE_NO": 940
            },
            {
             "CUSTOMER_CODE": 109919,
             "MODEL": "MGA2",
             "MACHINE_NO": 369
            },
            {
             "CUSTOMER_CODE": 110409,
             "MODEL": "MGA2",
             "MACHINE_NO": 614
            },
            {
             "CUSTOMER_CODE": 110409,
             "MODEL": "DSM",
             "MACHINE_NO": 1398
            },
            {
             "CUSTOMER_CODE": 109720,
             "MODEL": "DSM",
             "MACHINE_NO": 843
            },
            {
             "CUSTOMER_CODE": 110385,
             "MODEL": "DSM",
             "MACHINE_NO": 816
            },
            {
             "CUSTOMER_CODE": 140027,
             "MODEL": "DSM",
             "MACHINE_NO": 2460
            },
            {
             "CUSTOMER_CODE": 140027,
             "MODEL": "MGA2",
             "MACHINE_NO": 1236
            },
            {
             "CUSTOMER_CODE": 130905,
             "MODEL": "NUVO10",
             "MACHINE_NO": 36
            },
            {
             "CUSTOMER_CODE": 108551,
             "MODEL": "DSM",
             "MACHINE_NO": 6
            },
            {
             "CUSTOMER_CODE": 108454,
             "MODEL": "DSM",
             "MACHINE_NO": 964
            },
            {
             "CUSTOMER_CODE": 108951,
             "MODEL": "DSM",
             "MACHINE_NO": 936
            },
            {
             "CUSTOMER_CODE": 130332,
             "MODEL": "MGA2",
             "MACHINE_NO": 1364
            },
            {
             "CUSTOMER_CODE": 130984,
             "MODEL": "NUVO10",
             "MACHINE_NO": 56
            },
            {
             "CUSTOMER_CODE": 130429,
             "MODEL": "MGA1",
             "MACHINE_NO": 1471
            },
            {
             "CUSTOMER_CODE": 130249,
             "MODEL": "DSM",
             "MACHINE_NO": 2663
            },
            {
             "CUSTOMER_CODE": 111840,
             "MODEL": "DSM",
             "MACHINE_NO": 2031
            },
            {
             "CUSTOMER_CODE": 111840,
             "MODEL": "MGA1",
             "MACHINE_NO": 1185
            },
            {
             "CUSTOMER_CODE": 108780,
             "MODEL": "MGA1",
             "MACHINE_NO": 1162
            },
            {
             "CUSTOMER_CODE": 109995,
             "MODEL": "MGA2",
             "MACHINE_NO": 474
            },
            {
             "CUSTOMER_CODE": 108637,
             "MODEL": "MGA1",
             "MACHINE_NO": 450
            },
            {
             "CUSTOMER_CODE": 108637,
             "MODEL": "DSM",
             "MACHINE_NO": 342
            },
            {
             "CUSTOMER_CODE": 111984,
             "MODEL": "DSM",
             "MACHINE_NO": 2154
            },
            {
             "CUSTOMER_CODE": 110081,
             "MODEL": "DSM",
             "MACHINE_NO": 1120
            },
            {
             "CUSTOMER_CODE": 110081,
             "MODEL": "MGA1",
             "MACHINE_NO": 631
            },
            {
             "CUSTOMER_CODE": 108594,
             "MODEL": "MGA2",
             "MACHINE_NO": 552
            },
            {
             "CUSTOMER_CODE": 109851,
             "MODEL": "MGA2",
             "MACHINE_NO": 269
            },
            {
             "CUSTOMER_CODE": 109851,
             "MODEL": "DSM",
             "MACHINE_NO": 1329
            },
            {
             "CUSTOMER_CODE": 111964,
             "MODEL": "DSM",
             "MACHINE_NO": 2129
            },
            {
             "CUSTOMER_CODE": 111964,
             "MODEL": "MGA2",
             "MACHINE_NO": 1074
            },
            {
             "CUSTOMER_CODE": 111990,
             "MODEL": "MGA2",
             "MACHINE_NO": 1102
            },
            {
             "CUSTOMER_CODE": 109675,
             "MODEL": "MGA2",
             "MACHINE_NO": 183
            },
            {
             "CUSTOMER_CODE": 109675,
             "MODEL": "DSM",
             "MACHINE_NO": 1042
            },
            {
             "CUSTOMER_CODE": 108291,
             "MODEL": "MGA2",
             "MACHINE_NO": 85
            },
            {
             "CUSTOMER_CODE": 109733,
             "MODEL": "MGA2",
             "MACHINE_NO": 179
            },
            {
             "CUSTOMER_CODE": 130433,
             "MODEL": "MGA1",
             "MACHINE_NO": 1465
            },
            {
             "CUSTOMER_CODE": 140028,
             "MODEL": "MGA2",
             "MACHINE_NO": 12
            },
            {
             "CUSTOMER_CODE": 140028,
             "MODEL": "DSM",
             "MACHINE_NO": 691
            },
            {
             "CUSTOMER_CODE": 111745,
             "MODEL": "MGA1",
             "MACHINE_NO": 1117
            },
            {
             "CUSTOMER_CODE": 111745,
             "MODEL": "DSM",
             "MACHINE_NO": 1971
            },
            {
             "CUSTOMER_CODE": 109647,
             "MODEL": "MGA2",
             "MACHINE_NO": 133
            },
            {
             "CUSTOMER_CODE": 110425,
             "MODEL": "MGA2",
             "MACHINE_NO": 1081
            },
            {
             "CUSTOMER_CODE": 110425,
             "MODEL": "DSM",
             "MACHINE_NO": 2415
            },
            {
             "CUSTOMER_CODE": 108186,
             "MODEL": "MGA1",
             "MACHINE_NO": 728
            },
            {
             "CUSTOMER_CODE": 110388,
             "MODEL": "MGA1",
             "MACHINE_NO": 911
            },
            {
             "CUSTOMER_CODE": 110388,
             "MODEL": "DSM",
             "MACHINE_NO": 1370
            },
            {
             "CUSTOMER_CODE": 131130,
             "MODEL": "NUVO10",
             "MACHINE_NO": 74
            },
            {
             "CUSTOMER_CODE": 130901,
             "MODEL": "NUVO10",
             "MACHINE_NO": 34
            },
            {
             "CUSTOMER_CODE": 111477,
             "MODEL": "DSM",
             "MACHINE_NO": 1651
            },
            {
             "CUSTOMER_CODE": 111477,
             "MODEL": "MGA2",
             "MACHINE_NO": 765
            },
            {
             "CUSTOMER_CODE": 111781,
             "MODEL": "MGA1",
             "MACHINE_NO": 1148
            },
            {
             "CUSTOMER_CODE": 110019,
             "MODEL": "DSM",
             "MACHINE_NO": 1065
            },
            {
             "CUSTOMER_CODE": 111781,
             "MODEL": "DSM",
             "MACHINE_NO": 1995
            },
            {
             "CUSTOMER_CODE": 110019,
             "MODEL": "MGA2",
             "MACHINE_NO": 523
            },
            {
             "CUSTOMER_CODE": 111963,
             "MODEL": "DSM",
             "MACHINE_NO": 2201
            },
            {
             "CUSTOMER_CODE": 111963,
             "MODEL": "MGA2",
             "MACHINE_NO": 1128
            },
            {
             "CUSTOMER_CODE": 111723,
             "MODEL": "MGA1",
             "MACHINE_NO": 1103
            },
            {
             "CUSTOMER_CODE": 111723,
             "MODEL": "DSM",
             "MACHINE_NO": 1959
            },
            {
             "CUSTOMER_CODE": 110518,
             "MODEL": "DSM",
             "MACHINE_NO": 1568
            },
            {
             "CUSTOMER_CODE": 110518,
             "MODEL": "MGA2",
             "MACHINE_NO": 760
            },
            {
             "CUSTOMER_CODE": 108474,
             "MODEL": "MGA2",
             "MACHINE_NO": 146
            },
            {
             "CUSTOMER_CODE": 108474,
             "MODEL": "DSM",
             "MACHINE_NO": 390
            },
            {
             "CUSTOMER_CODE": 130756,
             "MODEL": "DSM",
             "MACHINE_NO": 2902
            },
            {
             "CUSTOMER_CODE": 110475,
             "MODEL": "DSM",
             "MACHINE_NO": 1484
            },
            {
             "CUSTOMER_CODE": 110475,
             "MODEL": "MGA2",
             "MACHINE_NO": 680
            },
            {
             "CUSTOMER_CODE": 110163,
             "MODEL": "MGA1",
             "MACHINE_NO": 714
            },
            {
             "CUSTOMER_CODE": 110163,
             "MODEL": "DSM",
             "MACHINE_NO": 2128
            },
            {
             "CUSTOMER_CODE": 109043,
             "MODEL": "DSM",
             "MACHINE_NO": 1780
            },
            {
             "CUSTOMER_CODE": 111479,
             "MODEL": "DSM",
             "MACHINE_NO": 184
            },
            {
             "CUSTOMER_CODE": 111479,
             "MODEL": "MGA2",
             "MACHINE_NO": 784
            },
            {
             "CUSTOMER_CODE": 108093,
             "MODEL": "DSM",
             "MACHINE_NO": 606
            },
            {
             "CUSTOMER_CODE": 140029,
             "MODEL": "DSM",
             "MACHINE_NO": 2016
            },
            {
             "CUSTOMER_CODE": 140029,
             "MODEL": "MGA2",
             "MACHINE_NO": 1068
            },
            {
             "CUSTOMER_CODE": 110366,
             "MODEL": "MGA2",
             "MACHINE_NO": 1096
            },
            {
             "CUSTOMER_CODE": 110366,
             "MODEL": "DSM",
             "MACHINE_NO": 1538
            },
            {
             "CUSTOMER_CODE": 140030,
             "MODEL": "DSM",
             "MACHINE_NO": 2483
            },
            {
             "CUSTOMER_CODE": 140030,
             "MODEL": "MGA2",
             "MACHINE_NO": 1265
            },
            {
             "CUSTOMER_CODE": 108551,
             "MODEL": "MGA2",
             "MACHINE_NO": 1099
            },
            {
             "CUSTOMER_CODE": 130289,
             "MODEL": "DSM",
             "MACHINE_NO": 2901
            },
            {
             "CUSTOMER_CODE": 101,
             "MODEL": "DSM",
             "MACHINE_NO": 900
            },
            {
             "CUSTOMER_CODE": 101,
             "MODEL": "MGA2",
             "MACHINE_NO": 8
            },
            {
             "CUSTOMER_CODE": 109104,
             "MODEL": "MGA2",
             "MACHINE_NO": 17
            },
            {
             "CUSTOMER_CODE": 130201,
             "MODEL": "DSM",
             "MACHINE_NO": 1881
            },
            {
             "CUSTOMER_CODE": 130201,
             "MODEL": "MGA1",
             "MACHINE_NO": 1033
            },
            {
             "CUSTOMER_CODE": 108348,
             "MODEL": "MGA2",
             "MACHINE_NO": 1145
            },
            {
             "CUSTOMER_CODE": 108348,
             "MODEL": "DSM",
             "MACHINE_NO": 1871
            },
            {
             "CUSTOMER_CODE": 140031,
             "MODEL": "MGA2",
             "MACHINE_NO": 774
            },
            {
             "CUSTOMER_CODE": 140031,
             "MODEL": "DSM",
             "MACHINE_NO": 1645
            },
            {
             "CUSTOMER_CODE": 111517,
             "MODEL": "DSM",
             "MACHINE_NO": 1702
            },
            {
             "CUSTOMER_CODE": 111457,
             "MODEL": "MGA1",
             "MACHINE_NO": 1165
            },
            {
             "CUSTOMER_CODE": 111457,
             "MODEL": "DSM",
             "MACHINE_NO": 1632
            },
            {
             "CUSTOMER_CODE": 108654,
             "MODEL": "MGA1",
             "MACHINE_NO": 652
            },
            {
             "CUSTOMER_CODE": 108654,
             "MODEL": "DSM",
             "MACHINE_NO": 2143
            },
            {
             "CUSTOMER_CODE": 109869,
             "MODEL": "MGA2",
             "MACHINE_NO": 1161
            },
            {
             "CUSTOMER_CODE": 109869,
             "MODEL": "DSM",
             "MACHINE_NO": 915
            },
            {
             "CUSTOMER_CODE": 108803,
             "MODEL": "DSM",
             "MACHINE_NO": 1473
            },
            {
             "CUSTOMER_CODE": 130475,
             "MODEL": "MGA1",
             "MACHINE_NO": 1505
            },
            {
             "CUSTOMER_CODE": 130475,
             "MODEL": "DSM",
             "MACHINE_NO": 2700
            },
            {
             "CUSTOMER_CODE": 108439,
             "MODEL": "MGA2",
             "MACHINE_NO": 463
            },
            {
             "CUSTOMER_CODE": 108439,
             "MODEL": "DSM",
             "MACHINE_NO": 1014
            },
            {
             "CUSTOMER_CODE": 130616,
             "MODEL": "DSM",
             "MACHINE_NO": 2612
            },
            {
             "CUSTOMER_CODE": 109670,
             "MODEL": "MGA2",
             "MACHINE_NO": 1365
            },
            {
             "CUSTOMER_CODE": 109351,
             "MODEL": "DSM",
             "MACHINE_NO": 582
            },
            {
             "CUSTOMER_CODE": 111959,
             "MODEL": "DSM",
             "MACHINE_NO": 2123
            },
            {
             "CUSTOMER_CODE": 111959,
             "MODEL": "MGA1",
             "MACHINE_NO": 1300
            },
            {
             "CUSTOMER_CODE": 140034,
             "MODEL": "MGA1",
             "MACHINE_NO": 1272
            },
            {
             "CUSTOMER_CODE": 108475,
             "MODEL": "MGA1",
             "MACHINE_NO": 666
            },
            {
             "CUSTOMER_CODE": 140033,
             "MODEL": "DSM",
             "MACHINE_NO": 2151
            },
            {
             "CUSTOMER_CODE": 140033,
             "MODEL": "MGA2",
             "MACHINE_NO": 1092
            },
            {
             "CUSTOMER_CODE": 140032,
             "MODEL": "DSM",
             "MACHINE_NO": 2152
            },
            {
             "CUSTOMER_CODE": 140032,
             "MODEL": "MGA2",
             "MACHINE_NO": 1091
            },
            {
             "CUSTOMER_CODE": 110541,
             "MODEL": "DSM",
             "MACHINE_NO": 1583
            },
            {
             "CUSTOMER_CODE": 110541,
             "MODEL": "MGA1",
             "MACHINE_NO": 969
            },
            {
             "CUSTOMER_CODE": 110220,
             "MODEL": "MGA1",
             "MACHINE_NO": 790
            },
            {
             "CUSTOMER_CODE": 110220,
             "MODEL": "DSM",
             "MACHINE_NO": 1761
            },
            {
             "CUSTOMER_CODE": 110187,
             "MODEL": "MGA2",
             "MACHINE_NO": 1105
            },
            {
             "CUSTOMER_CODE": 110187,
             "MODEL": "DSM",
             "MACHINE_NO": 2178
            },
            {
             "CUSTOMER_CODE": 108602,
             "MODEL": "MGA2",
             "MACHINE_NO": 660
            },
            {
             "CUSTOMER_CODE": 108301,
             "MODEL": "MGA2",
             "MACHINE_NO": 1093
            },
            {
             "CUSTOMER_CODE": 110414,
             "MODEL": "DSM",
             "MACHINE_NO": 1406
            },
            {
             "CUSTOMER_CODE": 110414,
             "MODEL": "MGA2",
             "MACHINE_NO": 625
            },
            {
             "CUSTOMER_CODE": 111769,
             "MODEL": "DSM",
             "MACHINE_NO": 768
            },
            {
             "CUSTOMER_CODE": 108301,
             "MODEL": "DSM",
             "MACHINE_NO": 2153
            },
            {
             "CUSTOMER_CODE": 130027,
             "MODEL": "DSM",
             "MACHINE_NO": 2209
            },
            {
             "CUSTOMER_CODE": 130027,
             "MODEL": "MGA2",
             "MACHINE_NO": 1136
            },
            {
             "CUSTOMER_CODE": 130126,
             "MODEL": "MGA2",
             "MACHINE_NO": 1308
            },
            {
             "CUSTOMER_CODE": 130126,
             "MODEL": "DSM",
             "MACHINE_NO": 2342
            },
            {
             "CUSTOMER_CODE": 130125,
             "MODEL": "DSM",
             "MACHINE_NO": 2343
            },
            {
             "CUSTOMER_CODE": 130125,
             "MODEL": "MGA1",
             "MACHINE_NO": 1309
            },
            {
             "CUSTOMER_CODE": 111445,
             "MODEL": "MGA1",
             "MACHINE_NO": 986
            },
            {
             "CUSTOMER_CODE": 111445,
             "MODEL": "DSM",
             "MACHINE_NO": 1604
            },
            {
             "CUSTOMER_CODE": 108725,
             "MODEL": "DSM",
             "MACHINE_NO": 286
            },
            {
             "CUSTOMER_CODE": 108725,
             "MODEL": "MGA1",
             "MACHINE_NO": 252
            },
            {
             "CUSTOMER_CODE": 130971,
             "MODEL": "NUVO20",
             "MACHINE_NO": 3
            },
            {
             "CUSTOMER_CODE": 111726,
             "MODEL": "MGA1",
             "MACHINE_NO": 1114
            },
            {
             "CUSTOMER_CODE": 111726,
             "MODEL": "DSM",
             "MACHINE_NO": 1964
            },
            {
             "CUSTOMER_CODE": 109353,
             "MODEL": "DSM",
             "MACHINE_NO": 1001
            },
            {
             "CUSTOMER_CODE": 109353,
             "MODEL": "MGA2",
             "MACHINE_NO": 6
            },
            {
             "CUSTOMER_CODE": 110142,
             "MODEL": "MGAA2",
             "MACHINE_NO": 560
            },
            {
             "CUSTOMER_CODE": 110142,
             "MODEL": "DSM",
             "MACHINE_NO": 156
            },
            {
             "CUSTOMER_CODE": 108736,
             "MODEL": "DSM",
             "MACHINE_NO": 374
            },
            {
             "CUSTOMER_CODE": 109516,
             "MODEL": "MGA1",
             "MACHINE_NO": 888
            },
            {
             "CUSTOMER_CODE": 109002,
             "MODEL": "MGA2",
             "MACHINE_NO": 1222
            },
            {
             "CUSTOMER_CODE": 110413,
             "MODEL": "MGA2",
             "MACHINE_NO": 626
            },
            {
             "CUSTOMER_CODE": 110413,
             "MODEL": "DSM",
             "MACHINE_NO": 1407
            },
            {
             "CUSTOMER_CODE": 109522,
             "MODEL": "DSM",
             "MACHINE_NO": 2003
            },
            {
             "CUSTOMER_CODE": 131149,
             "MODEL": "NUVO10",
             "MACHINE_NO": 101
            },
            {
             "CUSTOMER_CODE": 111649,
             "MODEL": "MGA2",
             "MACHINE_NO": 963
            },
            {
             "CUSTOMER_CODE": 111649,
             "MODEL": "DSM",
             "MACHINE_NO": 1786
            },
            {
             "CUSTOMER_CODE": 108036,
             "MODEL": "MGA1",
             "MACHINE_NO": 670
            },
            {
             "CUSTOMER_CODE": 108680,
             "MODEL": "MGA2",
             "MACHINE_NO": 112
            },
            {
             "CUSTOMER_CODE": 108680,
             "MODEL": "DSM",
             "MACHINE_NO": 340
            },
            {
             "CUSTOMER_CODE": 131008,
             "MODEL": "NUVO10",
             "MACHINE_NO": 65
            },
            {
             "CUSTOMER_CODE": 109262,
             "MODEL": "MGA1",
             "MACHINE_NO": 487
            },
            {
             "CUSTOMER_CODE": 109262,
             "MODEL": "DSM",
             "MACHINE_NO": 2189
            },
            {
             "CUSTOMER_CODE": 111565,
             "MODEL": "DSM",
             "MACHINE_NO": 1736
            },
            {
             "CUSTOMER_CODE": 111565,
             "MODEL": "MGA2",
             "MACHINE_NO": 884
            },
            {
             "CUSTOMER_CODE": 140037,
             "MODEL": "DSM",
             "MACHINE_NO": 1034
            },
            {
             "CUSTOMER_CODE": 140037,
             "MODEL": "MGA2",
             "MACHINE_NO": 489
            },
            {
             "CUSTOMER_CODE": 111559,
             "MODEL": "DSM",
             "MACHINE_NO": 1759
            },
            {
             "CUSTOMER_CODE": 111559,
             "MODEL": "MGA2",
             "MACHINE_NO": 873
            },
            {
             "CUSTOMER_CODE": 109813,
             "MODEL": "DSM",
             "MACHINE_NO": 865
            },
            {
             "CUSTOMER_CODE": 108741,
             "MODEL": "DSM",
             "MACHINE_NO": 341
            },
            {
             "CUSTOMER_CODE": 108741,
             "MODEL": "MGA1",
             "MACHINE_NO": 364
            },
            {
             "CUSTOMER_CODE": 130855,
             "MODEL": "MGA1",
             "MACHINE_NO": 428
            },
            {
             "CUSTOMER_CODE": 130760,
             "MODEL": "DSM",
             "MACHINE_NO": 2903
            },
            {
             "CUSTOMER_CODE": 130760,
             "MODEL": "MGA2",
             "MACHINE_NO": 1526
            },
            {
             "CUSTOMER_CODE": 140038,
             "MODEL": "NUVO10",
             "MACHINE_NO": 115
            },
            {
             "CUSTOMER_CODE": 130807,
             "MODEL": "MGA1",
             "MACHINE_NO": 1660
            },
            {
             "CUSTOMER_CODE": 130807,
             "MODEL": "DSM",
             "MACHINE_NO": 3008
            },
            {
             "CUSTOMER_CODE": 108824,
             "MODEL": "DSM",
             "MACHINE_NO": 813
            },
            {
             "CUSTOMER_CODE": 108824,
             "MODEL": "MGA2",
             "MACHINE_NO": 825
            },
            {
             "CUSTOMER_CODE": 111727,
             "MODEL": "DSM",
             "MACHINE_NO": 1962
            },
            {
             "CUSTOMER_CODE": 130760,
             "MODEL": "DSM",
             "MACHINE_NO": 2446
            },
            {
             "CUSTOMER_CODE": 130760,
             "MODEL": "MGA2",
             "MACHINE_NO": 1226
            },
            {
             "CUSTOMER_CODE": 130810,
             "MODEL": "MGA2",
             "MACHINE_NO": 1551
            },
            {
             "CUSTOMER_CODE": 130810,
             "MODEL": "DSM",
             "MACHINE_NO": 2925
            },
            {
             "CUSTOMER_CODE": 108057,
             "MODEL": "DSM",
             "MACHINE_NO": 920
            },
            {
             "CUSTOMER_CODE": 108057,
             "MODEL": "MGA2",
             "MACHINE_NO": 346
            },
            {
             "CUSTOMER_CODE": 130736,
             "MODEL": "MGA2",
             "MACHINE_NO": 1522
            },
            {
             "CUSTOMER_CODE": 130736,
             "MODEL": "DSM",
             "MACHINE_NO": 2899
            },
            {
             "CUSTOMER_CODE": 110160,
             "MODEL": "DSM",
             "MACHINE_NO": 1189
            },
            {
             "CUSTOMER_CODE": 110160,
             "MODEL": "MGA1",
             "MACHINE_NO": 721
            },
            {
             "CUSTOMER_CODE": 108596,
             "MODEL": "MGA1",
             "MACHINE_NO": 1336
            },
            {
             "CUSTOMER_CODE": 108596,
             "MODEL": "DSM",
             "MACHINE_NO": 845
            },
            {
             "CUSTOMER_CODE": 109211,
             "MODEL": "DSM",
             "MACHINE_NO": 791
            },
            {
             "CUSTOMER_CODE": 110462,
             "MODEL": "DSM",
             "MACHINE_NO": 1450
            },
            {
             "CUSTOMER_CODE": 110462,
             "MODEL": "MGA2",
             "MACHINE_NO": 689
            },
            {
             "CUSTOMER_CODE": 108515,
             "MODEL": "MGA1",
             "MACHINE_NO": 968
            },
            {
             "CUSTOMER_CODE": 108515,
             "MODEL": "DSM",
             "MACHINE_NO": 2135
            },
            {
             "CUSTOMER_CODE": 109669,
             "MODEL": "DSM",
             "MACHINE_NO": 2997
            },
            {
             "CUSTOMER_CODE": 109669,
             "MODEL": "MGA1",
             "MACHINE_NO": 1650
            },
            {
             "CUSTOMER_CODE": 130726,
             "MODEL": "MGA2",
             "MACHINE_NO": 1514
            },
            {
             "CUSTOMER_CODE": 130726,
             "MODEL": "DSM",
             "MACHINE_NO": 2893
            },
            {
             "CUSTOMER_CODE": 108134,
             "MODEL": "DSM",
             "MACHINE_NO": 2005
            },
            {
             "CUSTOMER_CODE": 108574,
             "MODEL": "MGA2",
             "MACHINE_NO": 1171
            },
            {
             "CUSTOMER_CODE": 111817,
             "MODEL": "DSM",
             "MACHINE_NO": 2006
            },
            {
             "CUSTOMER_CODE": 111817,
             "MODEL": "MGA1",
             "MACHINE_NO": 1167
            },
            {
             "CUSTOMER_CODE": 108819,
             "MODEL": "DSM",
             "MACHINE_NO": 1442
            },
            {
             "CUSTOMER_CODE": 109442,
             "MODEL": "MGA2",
             "MACHINE_NO": 869
            },
            {
             "CUSTOMER_CODE": 130721,
             "MODEL": "MGA2",
             "MACHINE_NO": 1501
            },
            {
             "CUSTOMER_CODE": 130721,
             "MODEL": "DSM",
             "MACHINE_NO": 2883
            },
            {
             "CUSTOMER_CODE": 131182,
             "MODEL": "NUVO10",
             "MACHINE_NO": 112
            },
            {
             "CUSTOMER_CODE": 109244,
             "MODEL": "MGA1",
             "MACHINE_NO": 1183
            },
            {
             "CUSTOMER_CODE": 111625,
             "MODEL": "MGA2",
             "MACHINE_NO": 950
            },
            {
             "CUSTOMER_CODE": 111625,
             "MODEL": "DSM",
             "MACHINE_NO": 1825
            },
            {
             "CUSTOMER_CODE": 109516,
             "MODEL": "MGA1",
             "MACHINE_NO": 449
            },
            {
             "CUSTOMER_CODE": 109672,
             "MODEL": "MGA1",
             "MACHINE_NO": 145
            },
            {
             "CUSTOMER_CODE": 108391,
             "MODEL": "MGA1",
             "MACHINE_NO": 838
            },
            {
             "CUSTOMER_CODE": 108391,
             "MODEL": "DSM",
             "MACHINE_NO": 2094
            },
            {
             "CUSTOMER_CODE": 108657,
             "MODEL": "DSM",
             "MACHINE_NO": 1424
            },
            {
             "CUSTOMER_CODE": 108657,
             "MODEL": "MGA2",
             "MACHINE_NO": 610
            },
            {
             "CUSTOMER_CODE": 130388,
             "MODEL": "DSM",
             "MACHINE_NO": 2613
            },
            {
             "CUSTOMER_CODE": 109246,
             "MODEL": "DSM",
             "MACHINE_NO": 1162
            },
            {
             "CUSTOMER_CODE": 109246,
             "MODEL": "MGA1",
             "MACHINE_NO": 812
            },
            {
             "CUSTOMER_CODE": 140041,
             "MODEL": "MGA2",
             "MACHINE_NO": 1321
            },
            {
             "CUSTOMER_CODE": 140041,
             "MODEL": "DSM",
             "MACHINE_NO": 2307
            },
            {
             "CUSTOMER_CODE": 109895,
             "MODEL": "NUVO10",
             "MACHINE_NO": 32
            },
            {
             "CUSTOMER_CODE": 109012,
             "MODEL": "DSM",
             "MACHINE_NO": 2023
            },
            {
             "CUSTOMER_CODE": 108762,
             "MODEL": "DSM",
             "MACHINE_NO": 2118
            },
            {
             "CUSTOMER_CODE": 111453,
             "MODEL": "DSM",
             "MACHINE_NO": 2012
            },
            {
             "CUSTOMER_CODE": 111453,
             "MODEL": "MGA1",
             "MACHINE_NO": 685
            },
            {
             "CUSTOMER_CODE": 110412,
             "MODEL": "MGA2",
             "MACHINE_NO": 627
            },
            {
             "CUSTOMER_CODE": 110412,
             "MODEL": "DSM",
             "MACHINE_NO": 1408
            },
            {
             "CUSTOMER_CODE": 108655,
             "MODEL": "DSM",
             "MACHINE_NO": 290
            },
            {
             "CUSTOMER_CODE": 108655,
             "MODEL": "MGA1",
             "MACHINE_NO": 887
            },
            {
             "CUSTOMER_CODE": 110410,
             "MODEL": "MGA2",
             "MACHINE_NO": 619
            },
            {
             "CUSTOMER_CODE": 110410,
             "MODEL": "DSM",
             "MACHINE_NO": 1404
            },
            {
             "CUSTOMER_CODE": 108659,
             "MODEL": "DSM",
             "MACHINE_NO": 653
            },
            {
             "CUSTOMER_CODE": 130353,
             "MODEL": "DSM",
             "MACHINE_NO": 2630
            },
            {
             "CUSTOMER_CODE": 109248,
             "MODEL": "DSM",
             "MACHINE_NO": 1766
            },
            {
             "CUSTOMER_CODE": 130176,
             "MODEL": "DSM",
             "MACHINE_NO": 2474
            },
            {
             "CUSTOMER_CODE": 130176,
             "MODEL": "MGA1",
             "MACHINE_NO": 1261
            },
            {
             "CUSTOMER_CODE": 130469,
             "MODEL": "MGA1",
             "MACHINE_NO": 1493
            },
            {
             "CUSTOMER_CODE": 130469,
             "MODEL": "DSM",
             "MACHINE_NO": 2688
            },
            {
             "MODEL": "DSM",
             "MACHINE_NO": 1843
            },
            {
             "MODEL": "MGA",
             "MACHINE_NO": 964
            },
            {
             "CUSTOMER_CODE": 130214,
             "MODEL": "MGA2",
             "MACHINE_NO": 1492
            },
            {
             "CUSTOMER_CODE": 130614,
             "MODEL": "MGA2",
             "MACHINE_NO": 1415
            },
            {
             "CUSTOMER_CODE": 130614,
             "MODEL": "DSM",
             "MACHINE_NO": 2660
            },
            {
             "CUSTOMER_CODE": 130214,
             "MODEL": "DSM",
             "MACHINE_NO": 2874
            },
            {
             "CUSTOMER_CODE": 109082,
             "MODEL": "DSM",
             "MACHINE_NO": 2159
            },
            {
             "CUSTOMER_CODE": 109082,
             "MODEL": "MGA1",
             "MACHINE_NO": 447
            },
            {
             "CUSTOMER_CODE": 108791,
             "MODEL": "MGA1",
             "MACHINE_NO": 1174
            },
            {
             "CUSTOMER_CODE": 130743,
             "MODEL": "MGA2",
             "MACHINE_NO": 1515
            },
            {
             "CUSTOMER_CODE": 130763,
             "MODEL": "NUVO10",
             "MACHINE_NO": 33
            },
            {
             "CUSTOMER_CODE": 140035,
             "MODEL": "MGA2",
             "MACHINE_NO": 211
            },
            {
             "CUSTOMER_CODE": 140036,
             "MODEL": "MGA2",
             "MACHINE_NO": 825
            },
            {
             "CUSTOMER_CODE": 140036,
             "MODEL": "DSM",
             "MACHINE_NO": 1286
            },
            {
             "CUSTOMER_CODE": 112446,
             "MODEL": "DSM",
             "MACHINE_NO": 2389
            },
            {
             "CUSTOMER_CODE": 112446,
             "MODEL": "MGA1",
             "MACHINE_NO": 1364
            },
            {
             "CUSTOMER_CODE": 109999,
             "MODEL": "MGA2",
             "MACHINE_NO": 479
            },
            {
             "CUSTOMER_CODE": 109999,
             "MODEL": "DSM",
             "MACHINE_NO": 1028
            },
            {
             "CUSTOMER_CODE": 130765,
             "MODEL": "DSM",
             "MACHINE_NO": 2904
            },
            {
             "CUSTOMER_CODE": 130765,
             "MODEL": "MGA1",
             "MACHINE_NO": 623
            },
            {
             "CUSTOMER_CODE": 140044,
             "MODEL": "MGA2",
             "MACHINE_NO": 412
            },
            {
             "CUSTOMER_CODE": 140044,
             "MODEL": "DSM",
             "MACHINE_NO": 330
            },
            {
             "CUSTOMER_CODE": 130052,
             "MODEL": "DSM",
             "MACHINE_NO": 2249
            },
            {
             "CUSTOMER_CODE": 130052,
             "MODEL": "MGA2",
             "MACHINE_NO": 1181
            },
            {
             "CUSTOMER_CODE": 111898,
             "MODEL": "MGA1",
             "MACHINE_NO": 1582
            },
            {
             "CUSTOMER_CODE": 111898,
             "MODEL": "DSM",
             "MACHINE_NO": 2482
            },
            {
             "CUSTOMER_CODE": 111835,
             "MODEL": "DSM",
             "MACHINE_NO": 2027
            },
            {
             "CUSTOMER_CODE": 111835,
             "MODEL": "MGA2",
             "MACHINE_NO": 1139
            },
            {
             "CUSTOMER_CODE": 140047,
             "MODEL": "MGA1",
             "MACHINE_NO": 709
            },
            {
             "CUSTOMER_CODE": 111953,
             "MODEL": "MGA2",
             "MACHINE_NO": 1066
            },
            {
             "CUSTOMER_CODE": 111953,
             "MODEL": "DSM",
             "MACHINE_NO": 2119
            },
            {
             "CUSTOMER_CODE": 140048,
             "MODEL": "MGA2",
             "MACHINE_NO": 535
            },
            {
             "CUSTOMER_CODE": 108665,
             "MODEL": "MGA2",
             "MACHINE_NO": 468
            },
            {
             "CUSTOMER_CODE": 130428,
             "MODEL": "MGA1",
             "MACHINE_NO": 439
            },
            {
             "CUSTOMER_CODE": 130428,
             "MODEL": "DSM",
             "MACHINE_NO": 1016
            },
            {
             "CUSTOMER_CODE": 118056,
             "MODEL": "DSM",
             "MACHINE_NO": 2253
            },
            {
             "CUSTOMER_CODE": 118056,
             "MODEL": "MGA2",
             "MACHINE_NO": 1192
            },
            {
             "CUSTOMER_CODE": 111446,
             "MODEL": "DSM",
             "MACHINE_NO": 1149
            },
            {
             "CUSTOMER_CODE": 111446,
             "MODEL": "MGA1",
             "MACHINE_NO": 662
            },
            {
             "CUSTOMER_CODE": 110301,
             "MODEL": "DSM",
             "MACHINE_NO": 686
            },
            {
             "CUSTOMER_CODE": 110301,
             "MODEL": "MGA1",
             "MACHINE_NO": 1184
            },
            {
             "CUSTOMER_CODE": 109918,
             "MODEL": "MGA2",
             "MACHINE_NO": 370
            },
            {
             "CUSTOMER_CODE": 109918,
             "MODEL": "DSM",
             "MACHINE_NO": 941
            },
            {
             "CUSTOMER_CODE": 140049,
             "MODEL": "DSM",
             "MACHINE_NO": 1924
            },
            {
             "CUSTOMER_CODE": 140049,
             "MODEL": "MGA1",
             "MACHINE_NO": 1067
            },
            {
             "CUSTOMER_CODE": 140050,
             "MODEL": "MGA1",
             "MACHINE_NO": 1066
            },
            {
             "CUSTOMER_CODE": 140050,
             "MODEL": "DSM",
             "MACHINE_NO": 1923
            },
            {
             "CUSTOMER_CODE": 109868,
             "MODEL": "DSM",
             "MACHINE_NO": 956
            },
            {
             "CUSTOMER_CODE": 109868,
             "MODEL": "MGA2",
             "MACHINE_NO": 341
            },
            {
             "CUSTOMER_CODE": 110067,
             "MODEL": "MGA1",
             "MACHINE_NO": 614
            },
            {
             "CUSTOMER_CODE": 140051,
             "MODEL": "MGA1",
             "MACHINE_NO": 439
            },
            {
             "CUSTOMER_CODE": 140051,
             "MODEL": "DSM",
             "MACHINE_NO": 1016
            },
            {
             "CUSTOMER_CODE": 140052,
             "MODEL": "DSM",
             "MACHINE_NO": 1321
            },
            {
             "CUSTOMER_CODE": 140052,
             "MODEL": "MGA2",
             "MACHINE_NO": 932
            },
            {
             "CUSTOMER_CODE": 108158,
             "MODEL": "MGA2",
             "MACHINE_NO": 1325
            },
            {
             "CUSTOMER_CODE": 108158,
             "MODEL": "DSM",
             "MACHINE_NO": 1117
            },
            {
             "CUSTOMER_CODE": 140053,
             "MODEL": "DSM",
             "MACHINE_NO": 2275
            },
            {
             "CUSTOMER_CODE": 140053,
             "MODEL": "MGA1",
             "MACHINE_NO": 1256
            },
            {
             "CUSTOMER_CODE": 130483,
             "MODEL": "DSM",
             "MACHINE_NO": 2704
            },
            {
             "CUSTOMER_CODE": 130483,
             "MODEL": "MGA1",
             "MACHINE_NO": 1511
            },
            {
             "CUSTOMER_CODE": 108860,
             "MODEL": "DSM",
             "MACHINE_NO": 2197
            },
            {
             "CUSTOMER_CODE": 108598,
             "MODEL": "MGA2",
             "MACHINE_NO": 527
            },
            {
             "CUSTOMER_CODE": 110528,
             "MODEL": "MGA2",
             "MACHINE_NO": 682
            },
            {
             "CUSTOMER_CODE": 108860,
             "MODEL": "MGA2",
             "MACHINE_NO": 528
            },
            {
             "CUSTOMER_CODE": 130786,
             "MODEL": "DSM",
             "MACHINE_NO": 2917
            },
            {
             "CUSTOMER_CODE": 130786,
             "MODEL": "MGA2",
             "MACHINE_NO": 1544
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
        if(!req.body.model || !req.body.machineNumber || !req.body.customerCode){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }
        await MachineModel.create({
            MODEL : req.body.model,
            MACHINE_NO : req.body.machineNumber,
            CUSTOMER_CODE : req.body.customerCode
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

const deletecalibrationRequestById = async (req,res)=>{
    try{
        if(!req.body.calibrationId){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }
        let data = await CalibrationRequest.deleteOne({_id : req.body.calibrationId});
        return res.status(200).json({ message: "Calibration Request Deleted Successfully!!", data: data });
    }catch(err){
        console.log(err);
    }
}

const getAllOpenCalibrationList = async(req,res)=>{
    try{
        let data = await CalibrationRequest.find({status: { $in: [1, 2] }}).sort({_id : -1}).populate('customerId').populate('employeeId');
        return res.status(200).json({ code : "200" , message: "Calibration Request List!!", data: data , status:"Open" });
    }catch(err){
        console.log(err);
    }
}

const getAllCloseCalibrationList = async(req,res)=>{
    try{
        let data = await CalibrationRequest.find({status: 0 }).sort({_id : -1}).populate('customerId').populate('employeeId');
        return res.status(200).json({ code : "200" , message: "Calibration Request List!!", data: data , status:"Close" });
    }catch(err){
        console.log(err);
    }
}

const validateCalibrationOnBackend = async(customerId,machineType)=>{
    try{
        if(!customerId || !machineType){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }
        const data = await CalibrationRequest.find({customerId : customerId , machineType : machineType}).sort({_id : -1}).limit(1);
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
            
            return diffDays > 10 ?  true : false; 
        } else {
            return true;
        }
    }catch(err){
        console.log(err);
    }   
}

const convertDateFormat = (dateString)=>{
    let parts = dateString.split('/');
    console.log('Parts=====' , dateString , `${parts[0]}-${parts[2]}-${parts[1]}`);
    return `${parts[0]}-${parts[2]}-${parts[1]}`; // Returns in YYYY-mm-dd format
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
    updateCalibrationStatusById : updateCalibrationStatusById,
    deletecalibrationRequestById : deletecalibrationRequestById,
    getAllOpenCalibrationList : getAllOpenCalibrationList,
    getAllCloseCalibrationList : getAllCloseCalibrationList
}