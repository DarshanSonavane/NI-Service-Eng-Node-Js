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
const MasterInventory = require("../model/MasterInventory.js");
const EmployeeInventory = require('../model/EmployeeInventory.js');
const FSR = require('../model/FSR.js');

const insertMasterInventory=async(req,res)=>{
    try{
        const data = [
            {
                "Sr. No.": "1",
                "productCode": "NI0067",
                "productName": "PU PIPE 4.5 MM/6 MM",
                "price": "400",
                "totalQuantity": "33"
            },
            {
                "Sr. No.": "2",
                "productCode": "111F800A4",
                "productName": "Silicon Tube 4mm ID X 8mm OD",
                "price": "300",
                "totalQuantity": "18"
            },
            {
                "Sr. No.": "3",
                "productCode": "11230F210",
                "productName": "WI FI MODULE FINEX MAKE",
                "price": "6500",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "4",
                "productCode": "1143000K2",
                "productName": "3/2 Way Direct Acting Solenoid",
                "price": "2800",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "5",
                "productCode": "114400010",
                "productName": "Filter Airmatic Type MF-10-02",
                "price": "1400",
                "totalQuantity": "20"
            },
            {
                "Sr. No.": "6",
                "productCode": "114400012",
                "productName": "Sintered Bronze Element",
                "price": "650",
                "totalQuantity": "15"
            },
            {
                "Sr. No.": "7",
                "productCode": "114400014",
                "productName": "Plastic Bowl Part No. MFC - 07",
                "price": "550",
                "totalQuantity": "8"
            },
            {
                "Sr. No.": "8",
                "productCode": "1144000I0",
                "productName": "Pick UP Probe Filter",
                "price": "400",
                "totalQuantity": "119"
            },
            {
                "Sr. No.": "9",
                "productCode": "1146000G0",
                "productName": "Sampling Probe for MGA",
                "price": "1250",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "10",
                "productCode": "1146000g0",
                "productName": "SS Breaded Teflon Hose Pipe",
                "price": "1250",
                "totalQuantity": "6"
            },
            {
                "Sr. No.": "11",
                "productCode": "1210AD508",
                "productName": "IC ADG508",
                "price": "770",
                "totalQuantity": "12"
            },
            {
                "Sr. No.": "12",
                "productCode": "1210AD574",
                "productName": " IC AD 574",
                "price": "2600",
                "totalQuantity": "11"
            },
            {
                "Sr. No.": "13",
                "productCode": "1210IC4017",
                "productName": "CD4017",
                "price": "200",
                "totalQuantity": "100"
            },
            {
                "Sr. No.": "14",
                "productCode": "1210IC555",
                "productName": "NE555",
                "price": "100",
                "totalQuantity": "14"
            },
            {
                "Sr. No.": "15",
                "productCode": "1210L4234",
                "productName": "5MM Green LED, P/N LTL - 4234",
                "price": "100",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "16",
                "productCode": "1210LM324",
                "productName": "IC LM 324, 14 PIN, DIP ST MAKE",
                "price": "150",
                "totalQuantity": "32"
            },
            {
                "Sr. No.": "17",
                "productCode": "1210LM358",
                "productName": " IC LM 358,8 PIN (MINI-DIP) NAT",
                "price": "150",
                "totalQuantity": "25"
            },
            {
                "Sr. No.": "18",
                "productCode": "1210LM741",
                "productName": "IC LM 741, 8 PIN MINI DIP SIGNA",
                "price": "150",
                "totalQuantity": "2"
            },
            {
                "Sr. No.": "19",
                "productCode": "1230LM338",
                "productName": "REGULATOR LM338K, TO-3 PACKAGE",
                "price": "1095",
                "totalQuantity": "4"
            },
            {
                "Sr. No.": "20",
                "productCode": "12601244Y",
                "productName": "IC DS1244Y-120Dallas Make",
                "price": "3800",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "21",
                "productCode": "12874LS04",
                "productName": "IC HD74LS04P",
                "price": "100",
                "totalQuantity": "11"
            },
            {
                "Sr. No.": "22",
                "productCode": "12ACD4013",
                "productName": "IC HEF4013BP PHILIPS/ST MAKE",
                "price": "100",
                "totalQuantity": "23"
            },
            {
                "Sr. No.": "23",
                "productCode": "12ACD4052",
                "productName": "IC TC4052BP TOSHIBA OR HCF4052",
                "price": "125",
                "totalQuantity": "16"
            },
            {
                "Sr. No.": "24",
                "productCode": "12ACD4066",
                "productName": "IC CD 4066 ST MAKE.",
                "price": "125",
                "totalQuantity": "22"
            },
            {
                "Sr. No.": "25",
                "productCode": "12ACD4098",
                "productName": "IC CD 4098",
                "price": "125",
                "totalQuantity": "34"
            },
            {
                "Sr. No.": "26",
                "productCode": "12D008031",
                "productName": "  IC8031 (SAB-C-501-LP SIEMENS",
                "price": "900",
                "totalQuantity": "17"
            },
            {
                "Sr. No.": "27",
                "productCode": "12D008255",
                "productName": " IC8255 MITSUBISHI MAKE",
                "price": "850",
                "totalQuantity": "15"
            },
            {
                "Sr. No.": "28",
                "productCode": "12D00OP07",
                "productName": "IC OP07 8 Pin Mini DIP Texas",
                "price": "150",
                "totalQuantity": "9"
            },
            {
                "Sr. No.": "29",
                "productCode": "12D00OPT",
                "productName": " IC OPT 211",
                "price": "3500",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "30",
                "productCode": "12D020K",
                "productName": "20k Trimming Pot",
                "price": "50",
                "totalQuantity": "16"
            },
            {
                "Sr. No.": "31",
                "productCode": "12D027512",
                "productName": "  IC 27C512 ST MAKE",
                "price": "5650",
                "totalQuantity": "40"
            },
            {
                "Sr. No.": "32",
                "productCode": "12D074245",
                "productName": "IC SN 74LS245N TEXAS MAKE",
                "price": "180",
                "totalQuantity": "17"
            },
            {
                "Sr. No.": "33",
                "productCode": "12D074573",
                "productName": "IC DM 74ALS573BN FAIRCHILD MAKE",
                "price": "180",
                "totalQuantity": "26"
            },
            {
                "Sr. No.": "34",
                "productCode": "12DS12320",
                "productName": "IC DS 1232",
                "price": "400",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "35",
                "productCode": "12E0L16L8",
                "productName": "IC PAL16L8ACN 20 PIN DIP",
                "price": "4250",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "36",
                "productCode": "NI0001",
                "productName": "12V DC Adaptor",
                "price": "200",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "37",
                "productCode": "12Z000050",
                "productName": "CRYSTAL 11.0592 MHZ KDS MAKE",
                "price": "750",
                "totalQuantity": "19"
            },
            {
                "Sr. No.": "38",
                "productCode": "133016216",
                "productName": "LCD  DSM Display 16 CharachtersX2 LINES LED ",
                "price": "1000",
                "totalQuantity": "5"
            },
            {
                "Sr. No.": "39",
                "productCode": "133016217",
                "productName": " LCD DISPLAY TFT COLOUR 3.5\"\"",
                "price": "7500",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "40",
                "productCode": "133S16216",
                "productName": "DISPLAY FOR DSM REMOTE",
                "price": "1000",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "41",
                "productCode": "133WH2005",
                "productName": "LCD MGA Display Model No.",
                "price": "3000",
                "totalQuantity": "10"
            },
            {
                "Sr. No.": "42",
                "productCode": "1A3001048",
                "productName": "ELCOM SWITCH",
                "price": "400",
                "totalQuantity": "85"
            },
            {
                "Sr. No.": "43",
                "productCode": "1B5060002",
                "productName": "PIRI CONNECTOR 6 WAY",
                "price": "300",
                "totalQuantity": "3"
            },
            {
                "Sr. No.": "44",
                "productCode": "1B6080704",
                "productName": "8+8 PIN BOTH ENDED FEMALE",
                "price": "250",
                "totalQuantity": "40"
            },
            {
                "Sr. No.": "45",
                "productCode": "1B6150402",
                "productName": "16 + 16 PIN BOTH ENDED FEMALE",
                "price": "350",
                "totalQuantity": "31"
            },
            {
                "Sr. No.": "46",
                "productCode": "1C3000C2",
                "productName": "COOLING FAN DSM 120 MM X120 MM X",
                "price": "950",
                "totalQuantity": "2"
            },
            {
                "Sr. No.": "47",
                "productCode": "1C31000E0",
                "productName": "COOLING FAN 12 VDC Size 60X60",
                "price": "625",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "48",
                "productCode": "1C42100F9",
                "productName": "12VDC 2 Head-Pump",
                "price": "18000",
                "totalQuantity": "3"
            },
            {
                "Sr. No.": "49",
                "productCode": "1D3000114",
                "productName": "Cable for GASBOARD 8220",
                "price": "22500",
                "totalQuantity": "1"
            },
            {
                "Sr. No.": "50",
                "productCode": "1X403004A",
                "productName": "OXYGEN SENSOR",
                "price": "3700",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "51",
                "productCode": "1X4030092",
                "productName": "Engine Tachometer",
                "price": "70000",
                "totalQuantity": "1"
            },
            {
                "Sr. No.": "52",
                "productCode": "1X40300A5",
                "productName": "CABLE FOR MGT - 300 ST UNIVERSAL",
                "price": "13000",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "53",
                "productCode": "1X40300L0",
                "productName": "RPM Magnetic Dual Channel Sensor",
                "price": "76000",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "54",
                "productCode": "201262010",
                "productName": "Probe Handles For Smoke Meter",
                "price": "1500",
                "totalQuantity": "1"
            },
            {
                "Sr. No.": "55",
                "productCode": "201N10095",
                "productName": "SMPS I/P 230 VAC, O/P:-+12VDC",
                "price": "2000",
                "totalQuantity": "15"
            },
            {
                "Sr. No.": "56",
                "productCode": "201N20010",
                "productName": "DC TO DC CON. 1/PO 12 VDC",
                "price": "4500",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "57",
                "productCode": "2023000L1",
                "productName": "KEYBOARD SIZE : 9 CM X 4 CM AS",
                "price": "550",
                "totalQuantity": "46"
            },
            {
                "Sr. No.": "58",
                "productCode": "2023000LA",
                "productName": " Keyboard for Multigas Analyse (MGA)",
                "price": "550",
                "totalQuantity": "138"
            },
            {
                "Sr. No.": "59",
                "productCode": "2023000LC",
                "productName": "KEYPAD FOR DSM REMOTE SIZE",
                "price": "550",
                "totalQuantity": "59"
            },
            {
                "Sr. No.": "60",
                "productCode": "202300296",
                "productName": "FT232 USB TO RS232 CONVERTER",
                "price": "950",
                "totalQuantity": "44"
            },
            {
                "Sr. No.": "61",
                "productCode": "202400168",
                "productName": "CAP3300 IR GAS BENCH",
                "price": "88000",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "62",
                "productCode": "202700095",
                "productName": "ADC Card for DSM STM32",
                "price": "15000",
                "totalQuantity": "1"
            },
            {
                "Sr. No.": "63",
                "productCode": "202700132",
                "productName": "Ripple Assembled Cable",
                "price": "1200",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "64",
                "productCode": "202700138",
                "productName": "MGT RPM CABLE",
                "price": "1200",
                "totalQuantity": "4"
            },
            {
                "Sr. No.": "65",
                "productCode": "202700139",
                "productName": "CUBIC RPM CABLE",
                "price": "1200",
                "totalQuantity": "11"
            },
            {
                "Sr. No.": "66",
                "productCode": "202800037",
                "productName": "WI FI Upgradation KIT",
                "price": "10000",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "67",
                "productCode": "20280015A",
                "productName": "DSM REMOTE CABLE ASSEMBLY",
                "price": "3300",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "68",
                "productCode": "205200152",
                "productName": "CPU PCB Assembly for DSMSTM",
                "price": "12000",
                "totalQuantity": "1"
            },
            {
                "Sr. No.": "69",
                "productCode": "205200156",
                "productName": "INDUCTION RPM PCB ASSY MGA",
                "price": "1000",
                "totalQuantity": "3"
            },
            {
                "Sr. No.": "70",
                "productCode": "NI0006",
                "productName": "25PIN  D TYPE CONNECTOR FEMALE",
                "price": "100",
                "totalQuantity": "23"
            },
            {
                "Sr. No.": "71",
                "productCode": "NI0007",
                "productName": "25PIN D TYPE CONNECTOR MALE",
                "price": "100",
                "totalQuantity": "133"
            },
            {
                "Sr. No.": "72",
                "productCode": "NI0008",
                "productName": "25 PIN PLASTIC HOOD",
                "price": "100",
                "totalQuantity": "159"
            },
            {
                "Sr. No.": "73",
                "productCode": "4030120BA",
                "productName": "SG-20 Sensor for MGT - 300",
                "price": "27500",
                "totalQuantity": "3"
            },
            {
                "Sr. No.": "74",
                "productCode": "4030120BB",
                "productName": " C.S.ASS. EA 1135-02-2 SCHEDA PCB",
                "price": "48000",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "75",
                "productCode": "NI0016",
                "productName": "5+5 PIN BOTH ENDED FEMALE",
                "price": "250",
                "totalQuantity": "36"
            },
            {
                "Sr. No.": "76",
                "productCode": "7050400X1",
                "productName": "7 Key Flexibale Keypad",
                "price": "800",
                "totalQuantity": "12"
            },
            {
                "Sr. No.": "77",
                "productCode": "NI0017",
                "productName": "DISPLAY MALE ST 16 Pin CONNECTOR",
                "price": "100",
                "totalQuantity": "92"
            },
            {
                "Sr. No.": "78",
                "productCode": "NI0019",
                "productName": "9 PIN D TYPE CONNECTOR FEMALE",
                "price": "150",
                "totalQuantity": "92"
            },
            {
                "Sr. No.": "79",
                "productCode": "NI0020",
                "productName": "9 PIN D TYPE CONNECTOR MALE",
                "price": "150",
                "totalQuantity": "70"
            },
            {
                "Sr. No.": "80",
                "productCode": "NI0021",
                "productName": "9 PIN PLASTIC HOOD",
                "price": "150",
                "totalQuantity": "146"
            },
            {
                "Sr. No.": "81",
                "productCode": "NI0023",
                "productName": "Alen Key",
                "price": "100",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "82",
                "productCode": "NI0024",
                "productName": "CALIPORT-34 (0.5 LTR)",
                "price": "4250",
                "totalQuantity": "3"
            },
            {
                "Sr. No.": "83",
                "productCode": "NI0025",
                "productName": "Chlam Multimeter MS 2101",
                "price": "1200",
                "totalQuantity": "2"
            },
            {
                "Sr. No.": "84",
                "productCode": "NI0027",
                "productName": "Cutter",
                "price": "200",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "85",
                "productCode": "NI0028",
                "productName": "Detector PCB Cable Assembly",
                "price": "3500",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "86",
                "productCode": "NI0029",
                "productName": "Diesel Rubber Hose Pipe",
                "price": "1500",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "87",
                "productCode": "NI0032",
                "productName": "Fuse 3AMP",
                "price": "50",
                "totalQuantity": "65"
            },
            {
                "Sr. No.": "88",
                "productCode": "NI0035",
                "productName": "JST FEMALE WITH WIRE 3 PIN",
                "price": "200",
                "totalQuantity": "46"
            },
            {
                "Sr. No.": "89",
                "productCode": "NI0037",
                "productName": "MGT Battery 7.4 V",
                "price": "800",
                "totalQuantity": "1"
            },
            {
                "Sr. No.": "90",
                "productCode": "NI0039",
                "productName": "Multimeter Probe",
                "price": "250",
                "totalQuantity": "2"
            },
            {
                "Sr. No.": "91",
                "productCode": "NI0040",
                "productName": "OXYGEN SENSOR CABLE (O2)",
                "price": "300",
                "totalQuantity": "16"
            },
            {
                "Sr. No.": "92",
                "productCode": "NI0041",
                "productName": "Power Cord 1.8Mtr 5AMP",
                "price": "250",
                "totalQuantity": "17"
            },
            {
                "Sr. No.": "93",
                "productCode": "NI0042",
                "productName": "REMOTE DISPLAY CONNECTOR",
                "price": "550",
                "totalQuantity": "49"
            },
            {
                "Sr. No.": "94",
                "productCode": "NI0043",
                "productName": "Roker Switch",
                "price": "200",
                "totalQuantity": "30"
            },
            {
                "Sr. No.": "95",
                "productCode": "NI0046",
                "productName": "Screw Driver Set",
                "price": "500",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "96",
                "productCode": "NI0047",
                "productName": "Solidering Iron",
                "price": "300",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "97",
                "productCode": "NI0048",
                "productName": "Spanner 14/15",
                "price": "100",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "98",
                "productCode": "NI0049",
                "productName": "Spanner 16/17",
                "price": "100",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "99",
                "productCode": "NI0050",
                "productName": "Spanner 6/7",
                "price": "100",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "100",
                "productCode": "NI0052",
                "productName": "STM Programmer",
                "price": "2000",
                "totalQuantity": "4"
            },
            {
                "Sr. No.": "101",
                "productCode": "NI0053",
                "productName": "Thumb Player",
                "price": "200",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "102",
                "productCode": "NI0054",
                "productName": "Toggle Switch CE101",
                "price": "200",
                "totalQuantity": "48"
            },
            {
                "Sr. No.": "103",
                "productCode": "NI0055",
                "productName": "Toggle Switch CE201",
                "price": "200",
                "totalQuantity": "34"
            },
            {
                "Sr. No.": "104",
                "productCode": "NI0058",
                "productName": "USB Cable",
                "price": "300",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "105",
                "productCode": "NI0059",
                "productName": "Wire Stripper",
                "price": "200",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "106",
                "productCode": "NI0060",
                "productName": "Wiring Harness",
                "price": "3000",
                "totalQuantity": "0"
            },
            {
                "Sr. No.": "107",
                "productCode": "12D0MX232",
                "productName": "IC MAX232 MAXIM MAKE",
                "price": "300",
                "totalQuantity": "0"
            }
        ];
        await MasterInventory.insertMany(data);
        return res.status(200).json({ code : "200" , message: "Master Inventory Created Successfully!!" });
    }catch(err){
        console.log(err);
    }
}

const fetchMasterInventoryList = async(req,res)=>{
    try{
        const query = { totalQuantity: { $gt: 0 } };
        const data = await MasterInventory.find(query)
        return res.status(200).json({ code : "200" , message: "Master Inventory List!!" , data : data});
    }catch(err){
        console.log(err);
    }
}

async function updateMasterInventory(productId,assignedQuantity){
    try{
        const masterInventoryProductDetails = await MasterInventory.findOne({_id : productId});
        if(masterInventoryProductDetails) {
            const updatedQuantity = parseInt(masterInventoryProductDetails.totalQuantity) - parseInt(assignedQuantity);
            console.log("UpdatedQuantity" , updatedQuantity);
            reqData = {
                totalQuantity : updatedQuantity
            }

            await MasterInventory.where({_id : productId}).updateOne({
                $set : reqData
            })
        }
    }catch(err){
        console.log(err);
    }
}

async function isProductQuanityAvailable(productId , assignedQuantity){
    try{
        console.log("Here" , productId , assignedQuantity);
        const productData = await MasterInventory.findOne({_id : productId});
        if(productData && productData.totalQuantity > 0 && assignedQuantity <= productData.totalQuantity){
            return true;
        }else {
            return false;
        }
    }catch(err){
        console.log(err);
    }
}

const assignInventoryToEmployee = async(req, res)=>{
    try{
        if(!req.body.employeeId || !req.body.productId || !req.body.assignedQuantity || !req.body.createdBy){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }
        const employeeProduct = await EmployeeInventory.find({employeeId : req.body.employeeId , productId : req.body.productId});
        const isProductAvailable = await isProductQuanityAvailable(req.body.productId , req.body.assignedQuantity);
        if(employeeProduct.length > 0){
            if(isProductAvailable){
                updateData = { 
                    assignedQuantity : req.body.assignedQuantity
                }
                await EmployeeInventory.where({productId : req.body.productId}).updateOne({
                    $set : updateData
                }).then(async(data)=>{
                    updateMasterInventory(req.body.productId , req.body.assignedQuantity)
                    return res.status(200).json({
                        message: "Employee Inventory Record Updated Successfully",
                        data : data
                    });
                });
            }else {
                return res.status(400).json({
                    message: "Product Not in stock",
                    code : 400
                });
            }
        }else {
            if(isProductAvailable){
                await EmployeeInventory.create({
                    employeeId : req.body.employeeId,
                    productId : req.body.productId,
                    assignedQuantity : req.body.assignedQuantity,
                    createdBy : req.body.createdBy
                }).then((data)=>{
                    updateMasterInventory(req.body.productId , req.body.assignedQuantity)
                    return res.status(200).json({
                        message: "Employee Inventory Record Created Successfully",
                        data : data
                    });
                }).catch((err)=>{
                    console.log(err);
                })
            }else {
                return res.status(400).json({
                    message: "Product Not in stock",
                    code : 400
                });
            }
        }
    }catch(err){
        console.log(err);
    }
}

const createFSR = async(req,res)=>{
    try{
        if(!req.body.customerCode || !req.body.contactPerson || !req.body.designation || !req.body.employeeCode || !req.body.employeeId || !req.body.complaintType || !req.body.natureOfCompliant || !req.body.productsUsed || !req.body.remark || !req.body.correctiveAction || !req.body.status || !req.body.serviceDetails || !req.body.employeeSignature || !req.body.customerSignature || !req.body.fsrLocation || !req.body.model){
            return res.status(400).json({
                message: "Required Fields are missing",
                code : 400
            });
        }
        const employeeInventory = await EmployeeInventory.find({ employeeId : req.body.employeeId });
        console.log("employeeInventory" , employeeInventory)
        if (!employeeInventory) {
            return res.status(400).json({message : 'Employee inventory not found'});
        }

        for (let product of req.body.productsUsed) {
            console.log("product" , product);
            const inventoryProduct = employeeInventory.find(p => p.productId.toString() === product.productId.toString());
            
            if (!inventoryProduct || inventoryProduct.assignedQuantity < product.quantityUsed) {
              return res.status(400).json({message : `Insufficient quantity for product ${product.product_id}`});
            }else {
                console.log("inventoryProduct" , inventoryProduct , employeeInventory.assignedQuantity , product.quantityUsed);
                const availableQuantiity = parseInt(inventoryProduct.assignedQuantity) - parseInt(product.quantityUsed)
                updateData = { 
                    assignedQuantity : availableQuantiity
                }
                
                await EmployeeInventory.where({productId : product.productId}).updateOne({
                    $set : updateData
                }).then(async(data)=>{});
            }
        }

        await FSR.create({
            customerCode : req.body.customerCode,
            contactPerson : req.body.contactPerson,
            designation : req.body.designation,
            employeeCode : req.body.employeeCode,
            employeeId : req.body.employeeId,
            complaintType : req.body.complaintType,
            natureOfCompliant : req.body.natureOfCompliant,
            productsUsed : req.body.productsUsed,
            remark : req.body.remark,
            correctiveAction : req.body.correctiveAction,
            status : req.body.status,
            serviceDetails : req.body.serviceDetails,
            employeeSignature : req.body.employeeSignature,
            customerSignature : req.body.customerSignature,
            fsrLocation : req.body.fsrLocation,
            model : req.body.model,
            fsrStatus : '1'
        }).then((data)=>{
            // write function to generate and send fsr to customer , employee and admin
            return res.status(200).json({
                message: "FSR Created Successfully",
                code : 200,
                data : data
            });
        }).catch((err)=>{
            console.log(err)
        })
    }catch(err){
        console.log(err);
    }
}

const fsrList = async(req,res)=>{
    try{
        if(!req.body.role){
            return res.status(400).json({
                message: "Required Fields are missing",
                code : 400
            });
        }
        let data;
        let customerData;
        if(req.body.role == '0'){
            const fsrData = await FSR.aggregate([
                // Lookup to join FSR with customer_details collection
                {
                  $lookup: {
                    from: 'customerdetails',           // Collection to join with
                    localField: 'customerCode',        // Field from FSR collection
                    foreignField: 'customerCode',      // Field from customer_details collection
                    as: 'customerInfo'                // Output field that will contain the customer details
                  }
                },
                // Unwind customer_info to flatten the array (if only one result)
                {
                  $unwind: {
                    path: '$customerInfo',            // Unwind the array to get a single object
                    preserveNullAndEmptyArrays: true   // In case there's no matching customerCode
                  }
                },
                // Lookup to join FSR with employees collection using employee's _id
                {
                  $lookup: {
                    from: 'employees',                // Collection to join with (replace 'employees' with your actual collection name)
                    localField: 'employeeId',         // Field from FSR collection (assuming employee_id is the field storing employee's _id)
                    foreignField: '_id',               // Field from employees collection (_id is the primary key in employees)
                    as: 'employeeInfo'                // Output field that will contain employee details
                  }
                },
                // Unwind employee_info to flatten the array (if only one result)
                {
                  $unwind: {
                    path: '$employeeInfo',            // Unwind the array to get a single object
                    preserveNullAndEmptyArrays: true   // In case there's no matching employee_id
                  }
                },
                // Project the necessary fields: customerName, city, state, and employee's firstName, lastName
                {
                  $project: {
                    customerInfo: {
                      customerName: 1,  // Include customerName
                      city: 1,          // Include city
                      stateCode: 1          // Include state
                    },
                    employeeInfo: {
                      firstName: 1,     // Include firstName from employee_details
                      lastName: 1       // Include lastName from employee_details
                    },
                    employee_id: 1,    // Include employee_id
                    customerCode: 1,   // Include customerCode
                    productsUsed: 1,  // Include products_used
                    contactPerson: 1,
                    designation: 1,
                    employeeCode : 1,
                    complaintType : 1,
                    natureOfCompliant : 1,
                    remark : 1,
                    correctiveAction : 1,
                    status: 1,
                    serviceDetails: 1,
                    fsrLocation : 1,
                    fsrStatus: 1
                  }
                }
              ]);
            return res.status(200).json({
                message: "FSR List",
                code : 200,
                fsrData : fsrData,
            });
        }else if(req.body.role == "1"){
            if(!req.body.employeeId){
                return res.status(400).json({
                    message: "Required Fields are missing",
                    code : 400
                });
            }

            const fsrData = await FSR.find({ employeeId: req.body.employeeId })
            .populate('employeeId', 'firstName lastName')

            if (fsrData.length === 0) {
                return res.status(404).json({message : "No FSR data found for this employee."});
            }

            const customerCodes = fsrData.map(fsr => fsr.customerCode);  // Get all customerCodes from the FSR data
            const customerDetails = await CustomerDetails.find({ customerCode: { $in: customerCodes } })
            .select('customerCode customerName city state');  // Select only relevant fields

            // Map customer details to each FSR record
            const fsrWithCustomerDetails = fsrData.map(fsr => {
                const customer = customerDetails.find(customer => customer.customerCode === fsr.customerCode);
                const transformedFsr = {
                    ...fsr.toObject(),  // Convert FSR document to plain object
                    customerInfo: customer || null  // Add customer details or null if not found
                  };
                  
                  // Rename employee_id to employeeInfo
                if (transformedFsr.employeeId) {
                    transformedFsr.employeeInfo = transformedFsr.employeeId;
                    delete transformedFsr.employeeId;
                }
            
                return transformedFsr;
            });

            return res.status(200).json({
                message: "FSR List",
                code : 200,
                fsrData : fsrWithCustomerDetails,
            });
        }
    }catch(err){
        console.log(err);
    }
}

module.exports = {
    insertMasterInventory : insertMasterInventory,
    fetchMasterInventoryList : fetchMasterInventoryList,
    assignInventoryToEmployee : assignInventoryToEmployee,
    createFSR : createFSR,
    fsrList : fsrList,
}