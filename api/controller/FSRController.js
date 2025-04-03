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
const ServiceRequest = require('../model/ServiceRequest.js');
const ComplaintHistory = require('../model/ComplaintHistory.js');

const insertMasterInventory=async(req,res)=>{
    try{
        const data = [
            {
                "Sr. No": "1",
                "productCode": "111F800A4",
                "productName": "Silicon Tube 4mm ID X 8mm OD",
                "totalQuantity": "14",
                "price": "300"
            },
            {
                "Sr. No": "2",
                "productCode": "11230F210",
                "productName": "WI FI MODULE FINEX MAKE",
                "totalQuantity": "0",
                "price": "6500"
            },
            {
                "Sr. No": "3",
                "productCode": "1143000K2",
                "productName": "3/2 Way Direct Acting Solenoid",
                "totalQuantity": "1",
                "price": "2800"
            },
            {
                "Sr. No": "4",
                "productCode": "114400010",
                "productName": "Filter Airmatic Type MF-10-02",
                "totalQuantity": "19",
                "price": "1400"
            },
            {
                "Sr. No": "5",
                "productCode": "114400012",
                "productName": "Sintered Bronze Element",
                "totalQuantity": "21",
                "price": "675"
            },
            {
                "Sr. No": "6",
                "productCode": "114400014",
                "productName": "Plastic Bowl Part No. MFC - 07",
                "totalQuantity": "5",
                "price": "400"
            },
            {
                "Sr. No": "7",
                "productCode": "114400022",
                "productName": "Filter Element for Midi Water",
                "totalQuantity": "0",
                "price": "650"
            },
            {
                "Sr. No": "8",
                "productCode": "1144000I0",
                "productName": "Pick UP Probe Filter",
                "totalQuantity": "83",
                "price": "400"
            },
            {
                "Sr. No": "9",
                "productCode": "1146000G0",
                "productName": "Sampling Probe for MGA",
                "totalQuantity": "0",
                "price": "1250"
            },
            {
                "Sr. No": "10",
                "productCode": "1146000g0",
                "productName": "SS Breaded Teflon Hose Pipe",
                "totalQuantity": "0",
                "price": "1250"
            },
            {
                "Sr. No": "11",
                "productCode": "1210AD508",
                "productName": "IC ADG508",
                "totalQuantity": "12",
                "price": "250"
            },
            {
                "Sr. No": "12",
                "productCode": "1210AD574",
                "productName": "IC AD 574",
                "totalQuantity": "10",
                "price": "2600"
            },
            {
                "Sr. No": "13",
                "productCode": "1210IC4017",
                "productName": "CD4017",
                "totalQuantity": "100",
                "price": "250"
            },
            {
                "Sr. No": "14",
                "productCode": "1210IC555",
                "productName": "NE555",
                "totalQuantity": "14",
                "price": "100"
            },
            {
                "Sr. No": "15",
                "productCode": "1210L4234",
                "productName": "5MM Green LED, P/N LTL - 4234",
                "totalQuantity": "0",
                "price": "20"
            },
            {
                "Sr. No": "16",
                "productCode": "1210LM324",
                "productName": "IC LM 324, 14 PIN, DIP ST MAKE",
                "totalQuantity": "28",
                "price": "180"
            },
            {
                "Sr. No": "17",
                "productCode": "1210LM358",
                "productName": "IC LM 358,8 PIN (MINI-DIP) NAT",
                "totalQuantity": "23",
                "price": "180"
            },
            {
                "Sr. No": "18",
                "productCode": "1210LM741",
                "productName": "IC LM 741, 8 PIN MINI DIP SIGNA",
                "totalQuantity": "2",
                "price": "180"
            },
            {
                "Sr. No": "19",
                "productCode": "1230LM338",
                "productName": "REGULATOR LM338K, TO-3 PACKAGE",
                "totalQuantity": "3",
                "price": "900"
            },
            {
                "Sr. No": "20",
                "productCode": "12601244Y",
                "productName": "IC DS1244Y-120Dallas Make",
                "totalQuantity": "0",
                "price": "3800"
            },
            {
                "Sr. No": "21",
                "productCode": "12874LS04",
                "productName": "IC HD74LS04P",
                "totalQuantity": "11",
                "price": "200"
            },
            {
                "Sr. No": "22",
                "productCode": "12ACD4013",
                "productName": "IC HEF4013BP PHILIPS/ST MAKE",
                "totalQuantity": "18",
                "price": "200"
            },
            {
                "Sr. No": "23",
                "productCode": "12ACD4052",
                "productName": "IC TC4052BP TOSHIBA OR HCF4052",
                "totalQuantity": "12",
                "price": "250"
            },
            {
                "Sr. No": "24",
                "productCode": "12ACD4066",
                "productName": "IC CD 4066 ST MAKE.",
                "totalQuantity": "16",
                "price": "250"
            },
            {
                "Sr. No": "25",
                "productCode": "12ACD4098",
                "productName": "IC CD 4098",
                "totalQuantity": "34",
                "price": "250"
            },
            {
                "Sr. No": "26",
                "productCode": "12D008031",
                "productName": "IC8031 (SAB-C-501-LP SIEMENS",
                "totalQuantity": "15",
                "price": "900"
            },
            {
                "Sr. No": "27",
                "productCode": "12D008255",
                "productName": "IC8255 MITSUBISHI MAKE",
                "totalQuantity": "17",
                "price": "850"
            },
            {
                "Sr. No": "28",
                "productCode": "12D00OP07",
                "productName": "IC OP07 8 Pin Mini DIP Texas",
                "totalQuantity": "6",
                "price": "150"
            },
            {
                "Sr. No": "29",
                "productCode": "12D00OPT",
                "productName": "IC OPT 211",
                "totalQuantity": "0",
                "price": "3500"
            },
            {
                "Sr. No": "30",
                "productCode": "12D020K",
                "productName": "20k Trimming Pot",
                "totalQuantity": "15",
                "price": "50"
            },
            {
                "Sr. No": "31",
                "productCode": "12D027512",
                "productName": "IC 27C512 ST MAKE",
                "totalQuantity": "5",
                "price": "5650"
            },
            {
                "Sr. No": "32",
                "productCode": "12D074245",
                "productName": "IC SN 74LS245N TEXAS MAKE",
                "totalQuantity": "9",
                "price": "180"
            },
            {
                "Sr. No": "33",
                "productCode": "12D074573",
                "productName": "IC DM 74ALS573BN FAIRCHILD MAKE",
                "totalQuantity": "20",
                "price": "165"
            },
            {
                "Sr. No": "34",
                "productCode": "12D0MX232",
                "productName": "IC MAX232 MAXIM MAKE",
                "totalQuantity": "14",
                "price": "300"
            },
            {
                "Sr. No": "35",
                "productCode": "12DS12320",
                "productName": "IC DS 1232",
                "totalQuantity": "0",
                "price": "180"
            },
            {
                "Sr. No": "36",
                "productCode": "12E0L16L8",
                "productName": "IC PAL16L8ACN 20 PIN DIP",
                "totalQuantity": "0",
                "price": "4250"
            },
            {
                "Sr. No": "37",
                "productCode": "12Z000050",
                "productName": "CRYSTAL 11.0592 MHZ KDS MAKE",
                "totalQuantity": "18",
                "price": "190"
            },
            {
                "Sr. No": "38",
                "productCode": "133016216",
                "productName": "LCD Display 16 CharachtersX2 LINES LED",
                "totalQuantity": "3",
                "price": "3520"
            },
            {
                "Sr. No": "39",
                "productCode": "133016217",
                "productName": "LCD DISPLAY TFT COLOUR 3.5\"\"",
                "totalQuantity": "2",
                "price": "7500"
            },
            {
                "Sr. No": "40",
                "productCode": "133S16216",
                "productName": "DISPLAY FOR DSM REMOTE",
                "totalQuantity": "5",
                "price": "1000"
            },
            {
                "Sr. No": "41",
                "productCode": "133WH2005",
                "productName": "LCD Display Model No.",
                "totalQuantity": "7",
                "price": "2500"
            },
            {
                "Sr. No": "42",
                "productCode": "16P 2510",
                "productName": "16P 2510 FEMALE W/WIRE",
                "totalQuantity": "0",
                "price": "100"
            },
            {
                "Sr. No": "43",
                "productCode": "1A3001048",
                "productName": "ELCOM SWITCH",
                "totalQuantity": "85",
                "price": "300"
            },
            {
                "Sr. No": "44",
                "productCode": "1B5060002",
                "productName": "PIRI CONNECTOR 6 WAY",
                "totalQuantity": "0",
                "price": "300"
            },
            {
                "Sr. No": "45",
                "productCode": "1B6080702",
                "productName": "UNI.CON.8 PIN FEMALE WITH 500",
                "totalQuantity": "1",
                "price": "150"
            },
            {
                "Sr. No": "46",
                "productCode": "1B6080703",
                "productName": "CONNECTOR 8+8 PIN BOTH ENDED",
                "totalQuantity": "2",
                "price": "150"
            },
            {
                "Sr. No": "47",
                "productCode": "1B6080704",
                "productName": "8+8 PIN BOTH ENDED FEMALE",
                "totalQuantity": "37",
                "price": "150"
            },
            {
                "Sr. No": "48",
                "productCode": "1B6150401",
                "productName": "UNICON CONNECTOR 16 PIN MALE",
                "totalQuantity": "0",
                "price": "150"
            },
            {
                "Sr. No": "49",
                "productCode": "1B6150402",
                "productName": "16 + 16 PIN BOTH ENDED FEMALE",
                "totalQuantity": "22",
                "price": "180"
            },
            {
                "Sr. No": "50",
                "productCode": "1B8090102",
                "productName": "CABLE CONNECTOR D TYPE FEMALE 9 Pin",
                "totalQuantity": "0",
                "price": "100"
            },
            {
                "Sr. No": "51",
                "productCode": "1B8090104",
                "productName": "9 PIN D TYPE CONN (SOCKET) R/A",
                "totalQuantity": "0",
                "price": "100"
            },
            {
                "Sr. No": "52",
                "productCode": "1B8250101",
                "productName": "25 PIN D TYPE CABLE CONNECTOR",
                "totalQuantity": "0",
                "price": "150"
            },
            {
                "Sr. No": "53",
                "productCode": "1B8250103",
                "productName": "PLASTIC HOOD (DUST COVER) SCREW",
                "totalQuantity": "0",
                "price": "75"
            },
            {
                "Sr. No": "54",
                "productCode": "1C3000C2",
                "productName": "COOLING FAN DSM 120 MM X120 MM X",
                "totalQuantity": "0",
                "price": "950"
            },
            {
                "Sr. No": "55",
                "productCode": "1C31000E0",
                "productName": "COOLING FAN 12 VDC Size 60X60",
                "totalQuantity": "1",
                "price": "575"
            },
            {
                "Sr. No": "56",
                "productCode": "1C42100F9",
                "productName": "12VDC 2 Head-Pump",
                "totalQuantity": "0",
                "price": "18000"
            },
            {
                "Sr. No": "57",
                "productCode": "1D3000113",
                "productName": "New design complete sensor",
                "totalQuantity": "0",
                "price": "76700"
            },
            {
                "Sr. No": "58",
                "productCode": "1D3000114",
                "productName": "Cable for GASBOARD 8220",
                "totalQuantity": "1",
                "price": "22500"
            },
            {
                "Sr. No": "59",
                "productCode": "1X403004A",
                "productName": "OXYGEN SENSOR",
                "totalQuantity": "5",
                "price": "3700"
            },
            {
                "Sr. No": "60",
                "productCode": "1X4030092",
                "productName": "Engine Tachometer",
                "totalQuantity": "0",
                "price": "70000"
            },
            {
                "Sr. No": "61",
                "productCode": "1X40300A5",
                "productName": "CABLE FOR MGT - 300 ST UNIVERSAL",
                "totalQuantity": "0",
                "price": "13000"
            },
            {
                "Sr. No": "62",
                "productCode": "1X40300L0",
                "productName": "RPM Magnetic Dual Channel Sensor",
                "totalQuantity": "0",
                "price": "27500"
            },
            {
                "Sr. No": "63",
                "productCode": "201262010",
                "productName": "Probe Handles For Smoke Meter",
                "totalQuantity": "1",
                "price": "1500"
            },
            {
                "Sr. No": "64",
                "productCode": "201N10095",
                "productName": "SMPS I/P 230 VAC, O/P:-+12VDC",
                "totalQuantity": "7",
                "price": "2000"
            },
            {
                "Sr. No": "65",
                "productCode": "201N20010",
                "productName": "DC TO DC CON. 1/PO 12 VDC",
                "totalQuantity": "0",
                "price": "4500"
            },
            {
                "Sr. No": "66",
                "productCode": "2023000L1",
                "productName": "KEYBOARD SIZE : 9 CM X 4 CM AS",
                "totalQuantity": "35",
                "price": "550"
            },
            {
                "Sr. No": "67",
                "productCode": "2023000LA",
                "productName": "Keyboard for Multigas Analyse (MGA)",
                "totalQuantity": "132",
                "price": "550"
            },
            {
                "Sr. No": "68",
                "productCode": "2023000LC",
                "productName": "KEYPAD FOR DSM REMOTE SIZE",
                "totalQuantity": "50",
                "price": "550"
            },
            {
                "Sr. No": "69",
                "productCode": "202300296",
                "productName": "FT232 USB TO RS232 CONVERTER",
                "totalQuantity": "49",
                "price": "950"
            },
            {
                "Sr. No": "70",
                "productCode": "202400168",
                "productName": "CAP3300 IR GAS BENCH",
                "totalQuantity": "0",
                "price": "88000"
            },
            {
                "Sr. No": "71",
                "productCode": "202700095",
                "productName": "ADC Card for DSM STM32",
                "totalQuantity": "0",
                "price": "15000"
            },
            {
                "Sr. No": "72",
                "productCode": "202700132",
                "productName": "Ripple Assembled Cable",
                "totalQuantity": "0",
                "price": "1200"
            },
            {
                "Sr. No": "73",
                "productCode": "202700138",
                "productName": "MGT RPM CABLE",
                "totalQuantity": "1",
                "price": "1200"
            },
            {
                "Sr. No": "74",
                "productCode": "202700139",
                "productName": "CUBIC RPM CABLE",
                "totalQuantity": "7",
                "price": "1200"
            },
            {
                "Sr. No": "75",
                "productCode": "202700141",
                "productName": "Viabration RPM Sensor Assy",
                "totalQuantity": "0",
                "price": "10000"
            },
            {
                "Sr. No": "76",
                "productCode": "20280015A",
                "productName": "DSM REMOTE CABLE ASSEMBLY",
                "totalQuantity": "21",
                "price": "3300"
            },
            {
                "Sr. No": "77",
                "productCode": "205200152",
                "productName": "CPU PCB Assembly for DSMSTM",
                "totalQuantity": "1",
                "price": "12000"
            },
            {
                "Sr. No": "78",
                "productCode": "205200156",
                "productName": "INDUCTION RPM PCB ASSY MGA",
                "totalQuantity": "0",
                "price": "450"
            },
            {
                "Sr. No": "79",
                "productCode": "2308112PFWR",
                "productName": "2P CPU C/L Female W/Wire",
                "totalQuantity": "10",
                "price": "200"
            },
            {
                "Sr. No": "80",
                "productCode": "230811FRC16",
                "productName": "16 PIN FRC Cable",
                "totalQuantity": "16",
                "price": "350"
            },
            {
                "Sr. No": "81",
                "productCode": "230811FRC26",
                "productName": "26 PIN FRC Cable",
                "totalQuantity": "6",
                "price": "450"
            },
            {
                "Sr. No": "82",
                "productCode": "4030120BA",
                "productName": "SG-20 Sensor for MGT - 300",
                "totalQuantity": "2",
                "price": "27500"
            },
            {
                "Sr. No": "83",
                "productCode": "4030120BB",
                "productName": "C.S.ASS. EA 1135-02-2 SCHEDA PCB",
                "totalQuantity": "0",
                "price": "48000"
            },
            {
                "Sr. No": "84",
                "productCode": "7050400X1",
                "productName": "7 Key Flexibale Keypad",
                "totalQuantity": "2",
                "price": "750"
            },
            {
                "Sr. No": "85",
                "productCode": "NI0079",
                "productName": "ANA BOND 652-C10",
                "totalQuantity": "1",
                "price": "1"
            },
            {
                "Sr. No": "86",
                "productCode": "NI0080",
                "productName": "Blank FT Pcb",
                "totalQuantity": "9",
                "price": "1"
            },
            {
                "Sr. No": "87",
                "productCode": "NI0081",
                "productName": "BT Solder Wire",
                "totalQuantity": "0",
                "price": "1"
            },
            {
                "Sr. No": "88",
                "productCode": "NI0082",
                "productName": "MGA & DSM RPM Cable Assembly (CUBIC)",
                "totalQuantity": "0",
                "price": "2500"
            },
            {
                "Sr. No": "89",
                "productCode": "NI0083",
                "productName": "MGA Z Pipe",
                "totalQuantity": "0",
                "price": "1200"
            },
            {
                "Sr. No": "90",
                "productCode": "NI0001",
                "productName": "12VDC Adaptor",
                "totalQuantity": "1",
                "price": "200"
            },
            {
                "Sr. No": "91",
                "productCode": "NI0002",
                "productName": "14*60 Flexible Wire",
                "totalQuantity": "2",
                "price": "1"
            },
            {
                "Sr. No": "92",
                "productCode": "NI0003",
                "productName": "20 Core Cable",
                "totalQuantity": "133",
                "price": "3300"
            },
            {
                "Sr. No": "93",
                "productCode": "NI0004",
                "productName": "20x4 LCD Jumbo",
                "totalQuantity": "0",
                "price": "3300"
            },
            {
                "Sr. No": "94",
                "productCode": "NI0005",
                "productName": "2510 FEMALE WITH WIRE 8 PIN",
                "totalQuantity": "1",
                "price": "100"
            },
            {
                "Sr. No": "95",
                "productCode": "NI0006",
                "productName": "25PIN D TYPE CONNECTOR FEMALE",
                "totalQuantity": "21",
                "price": "100"
            },
            {
                "Sr. No": "96",
                "productCode": "NI0007",
                "productName": "25PIN D TYPE CONNECTOR MALE",
                "totalQuantity": "79",
                "price": "100"
            },
            {
                "Sr. No": "97",
                "productCode": "NI0008",
                "productName": "25 PIN PLASTIC HOOD",
                "totalQuantity": "132",
                "price": "100"
            },
            {
                "Sr. No": "98",
                "productCode": "NI0009",
                "productName": "2*6P Minifit 5150 Female W/Wire",
                "totalQuantity": "5",
                "price": "150"
            },
            {
                "Sr. No": "99",
                "productCode": "NI0010",
                "productName": "2 Core Shield Cable 14/38",
                "totalQuantity": "90",
                "price": "1200"
            },
            {
                "Sr. No": "100",
                "productCode": "NI0011",
                "productName": "3 Core Shielded Wire",
                "totalQuantity": "0",
                "price": "1200"
            },
            {
                "Sr. No": "101",
                "productCode": "NI0012",
                "productName": "3P 2510 Female W/ WIRE",
                "totalQuantity": "24",
                "price": "100"
            },
            {
                "Sr. No": "102",
                "productCode": "NI0013",
                "productName": "4.2mm Housing FEMALE 4505 RT 2 X 6P 12 PIN MINI FIT",
                "totalQuantity": "15",
                "price": "300"
            },
            {
                "Sr. No": "103",
                "productCode": "NI0014",
                "productName": "4 Core Shielded Teflon Wire 100M",
                "totalQuantity": "199",
                "price": "1200"
            },
            {
                "Sr. No": "104",
                "productCode": "NI0015",
                "productName": "4 x 4 Plastic Box",
                "totalQuantity": "0",
                "price": "500"
            },
            {
                "Sr. No": "105",
                "productCode": "NI0016",
                "productName": "5+5 PIN BOTH ENDED FEMALE",
                "totalQuantity": "32",
                "price": "150"
            },
            {
                "Sr. No": "106",
                "productCode": "NI0017",
                "productName": "712 SERIES 25102.54mm MALE ST 16 Pin",
                "totalQuantity": "63",
                "price": "750"
            },
            {
                "Sr. No": "107",
                "productCode": "NI0019",
                "productName": "9 PIN D TYPE CONNECTOR FEMALE",
                "totalQuantity": "85",
                "price": "150"
            },
            {
                "Sr. No": "108",
                "productCode": "NI0020",
                "productName": "9 PIN D TYPE CONNECTOR MALE",
                "totalQuantity": "56",
                "price": "150"
            },
            {
                "Sr. No": "109",
                "productCode": "NI0021",
                "productName": "9 PIN PLASTIC HOOD",
                "totalQuantity": "134",
                "price": "150"
            },
            {
                "Sr. No": "110",
                "productCode": "NI0022",
                "productName": "Ad1885JST - Qfp48",
                "totalQuantity": "8",
                "price": "150"
            },
            {
                "Sr. No": "111",
                "productCode": "NI0023",
                "productName": "Alen Key",
                "totalQuantity": "1",
                "price": "100"
            },
            {
                "Sr. No": "112",
                "productCode": "NI0024",
                "productName": "CALIPORT-34 (0.5 LTR)",
                "totalQuantity": "0",
                "price": "4250"
            },
            {
                "Sr. No": "113",
                "productCode": "NI0025",
                "productName": "Chlam Multimeter MS 2101",
                "totalQuantity": "1",
                "price": "1200"
            },
            {
                "Sr. No": "114",
                "productCode": "NI0026",
                "productName": "Clamp Miter MS 2101",
                "totalQuantity": "0",
                "price": "300"
            },
            {
                "Sr. No": "115",
                "productCode": "NI0027",
                "productName": "Cutter",
                "totalQuantity": "1",
                "price": "200"
            },
            {
                "Sr. No": "116",
                "productCode": "NI0028",
                "productName": "Detector PCB Cable Assembly",
                "totalQuantity": "0",
                "price": "3500"
            },
            {
                "Sr. No": "117",
                "productCode": "NI0030",
                "productName": "D-SUB Solder Full Gold 9 Pin Female",
                "totalQuantity": "20",
                "price": "200"
            },
            {
                "Sr. No": "118",
                "productCode": "NI0031",
                "productName": "D-SUB Solder Full Gold 9 Pin Male",
                "totalQuantity": "20",
                "price": "300"
            },
            {
                "Sr. No": "119",
                "productCode": "NI0032",
                "productName": "Fuse 3AMP",
                "totalQuantity": "65",
                "price": "50"
            },
            {
                "Sr. No": "120",
                "productCode": "NI0033",
                "productName": "IC FT 232 RL",
                "totalQuantity": "0",
                "price": "300"
            },
            {
                "Sr. No": "121",
                "productCode": "NI0035",
                "productName": "JST FEMALE WITH WIRE 3 PIN",
                "totalQuantity": "41",
                "price": "200"
            },
            {
                "Sr. No": "122",
                "productCode": "NI0036",
                "productName": "JST XH 2.5MM MALE ST 3 PIN",
                "totalQuantity": "10",
                "price": "200"
            },
            {
                "Sr. No": "123",
                "productCode": "NI0037",
                "productName": "MGT Battery 7.4 V",
                "totalQuantity": "6",
                "price": "800"
            },
            {
                "Sr. No": "124",
                "productCode": "NI0038",
                "productName": "Midy Filter Candle.",
                "totalQuantity": "0",
                "price": "800"
            },
            {
                "Sr. No": "125",
                "productCode": "NI0039",
                "productName": "Multimeter Probe",
                "totalQuantity": "1",
                "price": "250"
            },
            {
                "Sr. No": "126",
                "productCode": "NI0040",
                "productName": "OXYGEN SENSOR CABLE (O2)",
                "totalQuantity": "7",
                "price": "400"
            },
            {
                "Sr. No": "127",
                "productCode": "NI0041",
                "productName": "Power Cord 1.8Mtr 5AMP",
                "totalQuantity": "13",
                "price": "250"
            },
            {
                "Sr. No": "128",
                "productCode": "NI0042",
                "productName": "REMOTE DISPLAY CONNECTOR",
                "totalQuantity": "32",
                "price": "200"
            },
            {
                "Sr. No": "129",
                "productCode": "NI0043",
                "productName": "Roker Switch",
                "totalQuantity": "24",
                "price": "200"
            },
            {
                "Sr. No": "130",
                "productCode": "NI0046",
                "productName": "Screw Driver Set",
                "totalQuantity": "1",
                "price": "500"
            },
            {
                "Sr. No": "131",
                "productCode": "NI0047",
                "productName": "Solidering Iron",
                "totalQuantity": "1",
                "price": "300"
            },
            {
                "Sr. No": "132",
                "productCode": "NI0048",
                "productName": "Spanner 14/15",
                "totalQuantity": "1",
                "price": "100"
            },
            {
                "Sr. No": "133",
                "productCode": "NI0049",
                "productName": "Spanner 16/17",
                "totalQuantity": "1",
                "price": "100"
            },
            {
                "Sr. No": "134",
                "productCode": "NI0050",
                "productName": "Spanner 6/7",
                "totalQuantity": "1",
                "price": "100"
            },
            {
                "Sr. No": "135",
                "productCode": "NI0051",
                "productName": "Stm32f446",
                "totalQuantity": "7",
                "price": "500"
            },
            {
                "Sr. No": "136",
                "productCode": "NI0052",
                "productName": "STM Programmer",
                "totalQuantity": "4",
                "price": "2000"
            },
            {
                "Sr. No": "137",
                "productCode": "NI0053",
                "productName": "Thumb Player",
                "totalQuantity": "1",
                "price": "200"
            },
            {
                "Sr. No": "138",
                "productCode": "NI0054",
                "productName": "Toggle Switch CE101",
                "totalQuantity": "37",
                "price": "200"
            },
            {
                "Sr. No": "139",
                "productCode": "NI0055",
                "productName": "Toggle Switch CE201",
                "totalQuantity": "30",
                "price": "200"
            },
            {
                "Sr. No": "140",
                "productCode": "NI0056",
                "productName": "TOYO 726 CPU MALE",
                "totalQuantity": "100",
                "price": "200"
            },
            {
                "Sr. No": "141",
                "productCode": "NI0057",
                "productName": "USB B Female Solder Right Angle",
                "totalQuantity": "48",
                "price": "200"
            },
            {
                "Sr. No": "142",
                "productCode": "NI0058",
                "productName": "USB Cable",
                "totalQuantity": "0",
                "price": "300"
            },
            {
                "Sr. No": "143",
                "productCode": "NI0059",
                "productName": "Wire Stripper",
                "totalQuantity": "1",
                "price": "200"
            },
            {
                "Sr. No": "144",
                "productCode": "NI0060",
                "productName": "Wiring Harness",
                "totalQuantity": "0",
                "price": "3000"
            },
            {
                "Sr. No": "145",
                "productCode": "NI0061",
                "productName": "FIXED FLOW REGULATOR - BRASS-C10",
                "totalQuantity": "0",
                "price": "3250"
            },
            {
                "Sr. No": "146",
                "productCode": "NI0062",
                "productName": "MGA & DSM RPM Cable Assembly (MGT)",
                "totalQuantity": "0",
                "price": "2500"
            },
            {
                "Sr. No": "147",
                "productCode": "NI0064",
                "productName": "MGT-300 EVO/ST UNIVERSAL RPM",
                "totalQuantity": "0",
                "price": "12500"
            },
            {
                "Sr. No": "148",
                "productCode": "NI0066",
                "productName": "P U Pipe 6mm (6 * 4mm)",
                "totalQuantity": "22",
                "price": "400"
            },
            {
                "Sr. No": "149",
                "productCode": "NI0069",
                "productName": "SMD IC ADS 1115 IDGSR",
                "totalQuantity": "7",
                "price": "1"
            },
            {
                "Sr. No": "150",
                "productCode": "NI0070",
                "productName": "SMD IC HCF 4052 MO 13 TR",
                "totalQuantity": "23",
                "price": "1"
            },
            {
                "Sr. No": "151",
                "productCode": "NI0071",
                "productName": "SMD IC HCF 4098 MO 13 TR",
                "totalQuantity": "25",
                "price": "1"
            },
            {
                "Sr. No": "152",
                "productCode": "NI0072",
                "productName": "SMD IC HEF 4013 BT",
                "totalQuantity": "24",
                "price": "1"
            },
            {
                "Sr. No": "153",
                "productCode": "NI0073",
                "productName": "SMD IC HEF 4066 BT",
                "totalQuantity": "24",
                "price": "1"
            },
            {
                "Sr. No": "154",
                "productCode": "NI0074",
                "productName": "SMD IC LM 324 DT",
                "totalQuantity": "24",
                "price": "1"
            },
            {
                "Sr. No": "155",
                "productCode": "NI0075",
                "productName": "SMD IC LM 358 DT-04",
                "totalQuantity": "22",
                "price": "1"
            },
            {
                "Sr. No": "156",
                "productCode": "NI0076",
                "productName": "SMD IC MAX 232 IDR",
                "totalQuantity": "22",
                "price": "1"
            },
            {
                "Sr. No": "157",
                "productCode": "NI0077",
                "productName": "SMD IC MAX 481",
                "totalQuantity": "25",
                "price": "1"
            },
            {
                "Sr. No": "158",
                "productCode": "NI0078",
                "productName": "SMD IC OP 07 CDR",
                "totalQuantity": "24",
                "price": "1"
            },
            {
                "Sr. No": "159",
                "productCode": "NI1001",
                "productName": "Dummy Product 1",
                "totalQuantity": "1000",
                "price": "500"
            },
            {
                "Sr. No": "160",
                "productCode": "NI1002",
                "productName": "Dummy Product 2",
                "totalQuantity": "1000",
                "price": "600"
            },
            {
                "Sr. No": "161",
                "productCode": "NI1003",
                "productName": "Dummy Product 3",
                "totalQuantity": "1000",
                "price": "700"
            },
            {
                "Sr. No": "162",
                "productCode": "NI1004",
                "productName": "Dummy Product 4",
                "totalQuantity": "1000",
                "price": "800"
            },
            {
                "Sr. No": "163",
                "productCode": "NI1005",
                "productName": "Dummy Product 5",
                "totalQuantity": "1000",
                "price": "900"
            },
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
        if(!req.body.customerCode ||
            !req.body.contactPerson ||
            !req.body.designation ||
            !req.body.employeeCode ||
            !req.body.employeeId ||  
            !req.body.complaintType ||
            !req.body.remark ||
            !req.body.correctiveAction || 
            !req.body.status ||
            !req.body.serviceDetails || 
            !req.body.employeeSignature || 
            !req.body.customerSignature || 
            !req.body.fsrLocation || 
            !req.body.model || 
            !req.body.fsrStartTime || 
            !req.body.fsrEndTime || 
            !req.body.fsrFinalAmount ||
            !req.body.complaint ||  
            !req.body.natureOfCall || 
            !req.body.totalGSTAmount ){ 
            return res.status(400).json({
                message: "Required Fields are missing",
                code : "400"
            });
        }
        const employeeInventory = await EmployeeInventory.find({ employeeId : req.body.employeeId });
        console.log("employeeInventory" , employeeInventory)
        if (!employeeInventory) {
            return res.status(400).json({message : 'Employee inventory not found'});
        }

        if(req.body.productsUsed && req.body.productsUsed.length > 0){
            for (let product of req.body.productsUsed) {
                console.log("product" , product);
                const inventoryProduct = employeeInventory.find(p => p.productId.toString() === product._id.toString());
                console.log("Inventory Product" , inventoryProduct);
                if (!inventoryProduct || inventoryProduct.assignedQuantity < product.quantityUsed) {
                  return res.status(400).json({message : `Insufficient quantity for product ${product._id}-${product.productName}`});
                }else {
                    console.log("inventoryProduct" , inventoryProduct , employeeInventory.assignedQuantity , product.quantityUsed);
                    const availableQuantiity = parseInt(inventoryProduct.assignedQuantity) - parseInt(product.quantityUsed)
                    updateData = { 
                        assignedQuantity : availableQuantiity
                    }
                    
                    await EmployeeInventory.where({productId : product._id}).updateOne({
                        $set : updateData
                    }).then(async(data)=>{});
                }
            }
        }
        
        let finalAmount;
        let serviceVisitCharge = 0;
        if(req.body.natureOfCall == 'Service Call'){
            serviceVisitCharge = 2950;
        }
        finalAmount = parseFloat(req.body.fsrFinalAmount) + parseFloat(req.body.totalGSTAmount);
        const machineDetails = await MachineModel.findOne({CUSTOMER_CODE : req.body.customerCode , MODEL : req.body.model});
        if(machineDetails && machineDetails.MACHINE_NO){
            await FSR.create({
                customerCode : req.body.customerCode,
                contactPerson : req.body.contactPerson,
                designation : req.body.designation,
                employeeCode : req.body.employeeCode,
                employeeId : req.body.employeeId,
                complaintType : req.body.complaintType,
                productsUsed : req.body.productsUsed,
                remark : req.body.remark,
                correctiveAction : req.body.correctiveAction,
                status : req.body.status,
                serviceDetails : req.body.serviceDetails,
                employeeSignature : req.body.employeeSignature,
                customerSignature : req.body.customerSignature,
                fsrLocation : req.body.fsrLocation,
                model : req.body.model,
                fsrStatus : '1',
                fsrStartTime : req.body.fsrStartTime,
                fsrEndTime : req.body.fsrEndTime,
                isChargeable : req.body.isChargeable,
                natureOfCall : req.body.natureOfCall,
                complaint : req.body.complaint,
                totalGSTAmount : req.body.totalGSTAmount,
                serviceVisit: serviceVisitCharge,
                fsrFinalAmount : finalAmount
            }).then(async(data)=>{
                await closeServiceRequest(req.body.complaint, req.body.employeeId)
                // write function to generate and send fsr to customer , employee and admin
                await generateAndSendFSR(data._id,res);
                return res.status(200).json({
                    message: "FSR Created Successfully",
                    code : "200",
                    data : data
                });
            }).catch((err)=>{
                console.log(err)
            })
        } else {
            return res.status(400).json({
                message: "Machine Details Not Found",
                code : "400"
            });
        }
        
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
                    fsrStatus: 1,
                    serviceVisit: 1,
                    employeeSignature:1,
                    customerSignature:1,
                    fsrStatus:1,
                    fsrStartTime:1,
                    fsrEndTime:1,
                    fsrFinalAmount:1,
                    isChargeable:1,
                    totalGSTAmount:1
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
                return res.status(200).json({code: 200, message : "No FSR data found for this employee.", fsrData: fsrData});
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

const employeeInventoryList = async(req,res)=>{
    try{
        if(!req.body.employeeId){
            return res.status(400).json({
                message: "Required Fields are missing",
                code : 400
            });
        }
        const employeeInventory = await EmployeeInventory.find({ employeeId  : req.body.employeeId, assignedQuantity: { $gt: 0 }}).populate('employeeId',{_id : 1 , firstName : 1 , lastName : 1}).populate('productId',{_id : 1 , productName : 1 , price : 1 , productCode : 1});
        return res.status(200).json({
            message: "Employee Inventory List",
            code : 200,
            employeeInventory : employeeInventory
        });
    }catch(err){
        console.log(err);
    }
}

const updateAdminMasterInventory = async(req,res)=>{
    try{
        if(!req.body.productCode || !req.body.totalQuantity || !req.body.price || !req.body.productName){
            return res.status(400).json({
                message: "Required Fields are missing",
                code : 400
            });
        }

        const data = await MasterInventory.findOne({productCode : req.body.productCode});
        if(data && data.productCode){
            const reqBody = {
                productName : req.body.productName,
                price : req.body.price,
                totalQuantity : req.body.totalQuantity
            }

            await MasterInventory.where({_id : data._id}).updateOne({
                $set : reqBody
            }).then((data)=>{
                return res.status(200).json({
                    message: "Product Details Updated Successfully!",
                    code : 200
                });
            })
        }else {
            await MasterInventory.create({
                productName : req.body.productName,
                productCode : req.body.productCode,
                price : req.body.price,
                totalQuantity : req.body.totalQuantity
            }).then((data)=>{
                return res.status(200).json({
                    message: "Product Details Created Successfully!",
                    code : 200,
                    data : data
                });
            })
        }
    }catch(err){
        console.log(err);
    }
}

const generateAndSendFSR=async(fsrId,res)=>{
    try{
        const fsrData = await FSR.findOne({_id : fsrId});
        if(fsrData){
            const customerData = await CustomerDetails.findOne({customerCode : fsrData.customerCode}).select({customerName : 1 , city : 1 , stateCode : 1 , email : 1});
            const employeeData = await Employee.findOne({employeeCode : fsrData.employeeCode}).select({firstName : 1 , lastName : 1 , employeeCode : 1 , email : 1});
            const machineDetails = await MachineModel.findOne({CUSTOMER_CODE : fsrData.customerCode , MODEL : fsrData.model});
            const fsrNumber = Math.floor(1000 + Math.random() * 9000);
            const customerNameLocation = customerData.customerName + " ," + customerData.city + "," + customerData.stateCode;
            const customerName = customerData.customerName;
            const currentDate = new Date();
            await generateBarcodeForFSRRequest(fsrId , customerData.customerName);
            const fileName = '../templates/fsr.ejs' // need to create ejs file
            console.log("machineDetails", machineDetails)
            if(machineDetails && machineDetails.MACHINE_NO){
                ejs.renderFile(
                    path.join(__dirname, fileName),{
                        serialNumber : fsrNumber,
                        fsrDate : currentDate.getDate() + "/" + ( currentDate.getMonth() + 1 ) + "/" + currentDate.getFullYear(),
                        customerNameLocation : customerNameLocation,
                        customerName : customerName,
                        contactPerson : fsrData.contactPerson,
                        employeeName : employeeData.firstName + " " + employeeData.lastName,
                        designation : fsrData.designation,
                        fsrStartTime : fsrData.fsrStartTime,
                        fsrEndTime : fsrData.fsrEndTime,
                        model : fsrData.model,
                        machineNumber : machineDetails.MACHINE_NO,
                        complaintType : fsrData.complaintType,
                        natureOfCall : fsrData.natureOfCall,
                        serviceDetails : fsrData.serviceDetails,
                        correctiveAction : fsrData.correctiveAction,
                        status : fsrData.status,
                        productsUsed : fsrData.productsUsed,
                        customerCode : fsrData.customerCode,
                        remark : fsrData.remark,
                        employeeSignature : fsrData.employeeSignature,
                        customerSignature : fsrData.customerSignature,
                        fsrLocation : fsrData.fsrLocation,
                        fsrFinalAmount : fsrData.fsrFinalAmount,
                        isChargeable : fsrData.isChargeable,
                        employeeCode : fsrData.employeeCode,
                        employeeId : fsrData.employeeId,
                        logoPath : `${constants.SERVER_FILE_PATH}ni-fsr-logo.jpg`,
                        qrURL : `${constants.SERVER_FILE_PATH}QR-Codes/fsr/qr-code_${fsrData._id}.png`,
                        maxLimit : 10,
                        gstPercent : '18%',
                        serviceVisit : fsrData.serviceVisit,
                        totalGSTAmount : fsrData.totalGSTAmount
                    },async (err, newHtml) => {
                        if(err){
                            console.log(err);
                            return;
                        }
    
                        const outputPath = `./assets/uploads/fsr/${customerName}_${fsrId}.pdf`;
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
                                const htmlEmailContents = 
                                `<html>
                                    <body>
                                        <p>Field Service Report generated for your complaint with following details</p>                
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
                                const subject = `Field Service Report`;
                                let receiverEmail = [customerData.email , employeeData.email , 'service@niserviceeng.com'];
                                                        
                                await sendMailWithAttachment(htmlEmailContents, receiverEmail, subject , outputPath);
                            });
                            // return res.status(200).json({ code : "200" , message: "Calibration certificate generated and sent on registered email!"});   
                        } catch (error) {
                            console.error('Error generating PDF:', error);
                        }
                    }
                )
            }else {
                return res.status(400).json({ code : "400" , message: "Machine Details Not Found For The User!"});   
            }
        }
    }catch(err){
        console.log(err);
    }
}

const generateBarcodeForFSRRequest =  async(fsrId , customerName)=>{
    try{
        const URL = `http://13.49.111.133:3000/uploads/fsr/${customerName}_${fsrId}.pdf`;
        const qrSvg = qr.imageSync(URL, { type: 'png' });
        const filePath = `./assets/QR-Codes/fsr/qr-code_${fsrId}.png`
        // Save the image to a file
        fs.writeFileSync(filePath, qrSvg);
        console.log("QR Generated and saved successfully!" , filePath);
    }catch(err){
        console.log(err);
    }
}

const closeServiceRequest = async(complaintId,employeeId)=>{
    try{
        console.log("complaintId=====", complaintId,"employeeId======", employeeId);
        let reqData = {
            status : "0",
            updatedBy : employeeId
        };
        await ServiceRequest.where({_id : complaintId}).updateOne({
            $set : reqData
        }).then(async(assignedData)=>{
            // await EmployeeServiceRequest.deleteOne({serviceRequestId : req.body.complaintId})
            await ComplaintHistory.create({
                requestId : complaintId,
                status : "0"
            });
            
        }).catch((err)=>{
            console.log(err);
        })
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
    employeeInventoryList : employeeInventoryList,
    updateAdminMasterInventory : updateAdminMasterInventory
}