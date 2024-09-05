const Employee =  require('../model/Employee.js');
const { createEmployeeService } =  require('../helper/EmployeeHelper.js');
const UserRoles =  require('../model/UserRoles.js');
const CustomerDetails =  require("../model/CustomerDetails.js");
const StateList = require("../model/StateList.js");
const MachineModel = require('../model/MachineModel.js');
// const authentication = require("../utility/authentication.js");

const createEmployee = async (req,res) =>{
    let body = req.body;

    if(!body.firstName || !body.lastName || !body.gender || !body.email || !body.dob || !body.phone  ){
        return res.status(400).json({
            message: "Required Fields are missing",
            status: false,
        });
    }else {
        await createEmployeeService(req, res, function (err, status, data) {
            if(status){
                return res.status(200).json({ message: "Employee Created Successfully!!", data: data });
            }
        })
    }
}

const getEmployeeList = async (req,res) =>{
    try{
        let data =  await Employee.find({isActive : "1"}).where({ "role": { "$ne": '0' }});
        return res.status(200).json({ message: "Employee List!!", data: data });
    }catch(err){
        console.log(err);
    }
}

const login = async(req,res) =>{
    try{
        if(!req.body.id || !req.body.type){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }else {
            let customerCode = req.body.id;
            let password  = req.body.password;
            if(req.body.type == "0"){
                if(req.body.password){
                    await CustomerDetails.find({customerCode : customerCode.toString() , password : password}).then(async(data)=>{
                        if(data && data != null && data.length > 0){
                            // const token = await authentication.createToken(customerCode);
                            const machineDetails = await MachineModel.find({ CUSTOMER_CODE  : customerCode})
                            data.push(machineDetails);
                            return res.status(200).json({ code : "200",message: "Login Success!!", data: data });
                        }else {
                            return res.status(202).json({ message: "Login Success with no data found!!", data: data });
                        }
                    }).catch((err)=>{
                        console.log(err)
                        return res.status(500).json({
                            message: "Internal server error",
                            status: false,
                        });
                    })
                }else {
                    await CustomerDetails.find({customerCode : customerCode.toString()}).then(async(data)=>{
                        if(data && data != null && data.length > 0){
                            const machineDetails = await MachineModel.find({ CUSTOMER_CODE  : customerCode})
                            data.push(machineDetails);
                            return res.status(200).json({ code : "200",message: "Login Success!!", data: data });
                        }else {
                            return res.status(202).json({ message: "Login Success with no data found!!", data: data });
                        }
                    }).catch((err)=>{
                        console.log(err)
                        return res.status(500).json({
                            message: "Internal server error",
                            status: false,
                        });
                    })
                }
            }else if(req.body.type == "1"){
                await Employee.findOne({
                    employeeCode : req.body.id,
                    password : req.body.password,
                    isActive : "1"
                }).then((data)=>{
                    if(data && data != null){
                        return res.status(200).json({ message: "Login Success!!", data: data });
                    }else {
                        return res.status(202).json({ message: "Login Success with no data found!!", data: data });
                    }
                }).catch((err)=>{
                    console.log(err)
                    return res.status(500).json({
                        message: "Internal server error",
                        status: false,
                    });
                })
            }
        }
    }catch(err){
        console.log(err);
    }
}

const createEmployeeRole = async (req,res)=>{
    try{
        await UserRoles.create({
            name : "Employee",
            role : "1"
        }).then((data)=>{
            return res.status(200).json({ message: "User Role Created Successfully!!", data: data });
        }).catch((err)=>{
            console.log(err);
        })
    }catch(err){
        console.log(err);
    }
}

const getEmployeeRole = async (req,res)=>{
    try{
        let data =  await UserRoles.find();
        return res.status(200).json({ message: "Employee List!!", data: data });
    }catch(err){
        console.log(err);
    }
}

const createCustomer = async(req,res)=>{
    try{
        let arr = [{
            "customerCode": 108012,
            "customerName": "Asian Petroleum Centre. Thane",
            "city": "CHAROTI",
            "amcDue": ""
        }];
        for(let i = 0 ; i < arr.length ; i++){
            await CustomerDetails.create({
                customerCode : arr[0]['customerCode'].toString(),
                customerName : arr[0]['customerName'],
                city : arr[0]['city'],
                amcDue : arr[0]['amcDue'].toString()
            }).then((data)=>{
                return res.status(200).json({ message: "Customer Created Successfully!!", data: data });
            }).catch((err)=>{
                console.log(err);
            })
        }
    }catch(err){
        console.log(err);
    }
}

const getEmployeeDetails = async(req,res)=>{
    try{
        if(!req.query.employeeId){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }
        let data = await EmployeeServiceRequest.find({employeeId : req.query.employeeId}).populate("employeeId",{firstName : 1 , lastName : 1 , dob : 1 , employeeCode : 1, email : 1 , phone : 1 , gender : 1 }).populate("serviceRequestId" , { status : 1 });
        return res.status(200).json({ message: "Employee Details!!", data: data });
    }catch(err){
        console.log(err);
    }
}

const deleteEmployee = async(req,res)=>{
    try{
        if(!req.query.id){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }
        let data = await Employee.deleteOne({_id : req.query.id});
        return res.status(200).json({ message: "Employee Deleted Successfully!!", data: data });
    }catch(err){
        console.log(err);
    }
}

const updateCustomerDetails = async(req,res)=>{
    try{
        if(!req.body.mobile || !req.body.email || !req.body.customerId){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }
        let reqData = {
            mobile : req.body.mobile,
            email : req.body.email,
            gstNo : req.body.gstNo
        };
        await CustomerDetails.where({
            _id : req.body.customerId
        }).updateOne({
            $set : reqData
        }).then(async(assignedData)=>{
            // await EmployeeServiceRequest.deleteOne({serviceRequestId : req.body.complaintId})
            return res.status(200).json({ code : "200" , message: "Customer Details Updated Successfully!!", data: assignedData });
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

const getAllCustomers = async(req,res)=>{
    try{
        let data = await CustomerDetails.find();
        return res.status(200).json({ code : "200" , message: "Customer List!!", data: data });
    }catch(err){
        console.log(err)
    }
}

const createUpdateCustomerDetails = async(req,res)=>{
    try{
        if(!req.body.customerId){
            if( !req.body.customerCode || !req.body.customerName || !req.body.city || !req.body.amcDue || !req.body.stateCode){
                return res.status(400).json({
                    message: "Required Fields are missing",
                    status: false,
                });
            }

            await CustomerDetails.create({
                customerCode : req.body.customerCode,
                customerName : req.body.customerName,
                city : req.body.city,
                amcDue : req.body.amcDue,
                mobile : req.body.mobile,
                email : req.body.email,
                gstNo : req.body.gstNo,
                petrolMachineNumber : req.body.petrolMachineNumber,
                dieselMachineNumber : req.body.dieselMachineNumber,
                comboMachineNumber : req.body.comboMachineNumber,
                stateCode : req.body.stateCode,
                machineModel : req.body.machineModel
            }).then((data)=>{
                return res.status(200).json({ code : "200" , message: "Customer Created Successfully!!", data: data });
            }).catch((err)=>{
                console.log(err);
                return res.status(500).json({
                    message: "Internal server error",
                    status: false,
                });
            })
        }else {
            if( !req.body.customerCode || !req.body.customerName || !req.body.city || !req.body.customerId || !req.body.amcDue || !req.body.stateCode){
                return res.status(400).json({
                    message: "Required Fields are missing",
                    status: false,
                });
            }
            let reqData = {
                customerCode : req.body.customerCode,
                customerName : req.body.customerName,
                city : req.body.city,
                amcDue : req.body.amcDue,
                mobile : req.body.mobile,
                email : req.body.email,
                gstNo : req.body.gstNo,
                petrolMachineNumber : req.body.petrolMachineNumber,
                dieselMachineNumber : req.body.dieselMachineNumber,
                comboMachineNumber : req.body.comboMachineNumber,
                stateCode : req.body.stateCode,
                machineModel : req.body.machineModel
            };
            await CustomerDetails.where({
                _id : req.body.customerId
            }).updateOne({
                $set : reqData
            }).then(async(data)=>{
                // await EmployeeServiceRequest.deleteOne({serviceRequestId : req.body.complaintId})
                return res.status(200).json({ code : "200" , message: "Customer Details Updated Successfully!!", data: data });
            }).catch((err)=>{
                console.log(err);
                return res.status(500).json({
                    message: "Internal server error",
                    status: false,
                });
            })
        }
    }catch(err){
        consol.log(err);
    }
}

const updateDetailsWithoutValidation = async(req,res)=>{
    try{
        let reqData = {
            amcDue : req.body.amcDue,
            mobile : req.body.mobile,
            email : req.body.email,
            gstNo : req.body.gstNo
        };
        await CustomerDetails.where({
            _id : req.body.customerId
        }).updateOne({
            $set : reqData
        }).then(async(data)=>{
            // await EmployeeServiceRequest.deleteOne({serviceRequestId : req.body.complaintId})
            return res.status(200).json({ code : "200" , message: "Customer Details Updated Successfully!!", data: data });
        }).catch((err)=>{
            console.log(err);
            return res.status(500).json({
                message: "Internal server error",
                status: false,
            });
        })
    }catch(err){
        consol.log(err);
    }
}

const updateEmployeePassword = async(req,res) => {
    try{
        if( !req.body.employeeCode || !req.body.password){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }
        let reqData = {
            password : req.body.password
        };
        let count  = await Employee.count({employeeCode : req.body.employeeCode});
        if(count > 0) {
            await Employee.where({
                employeeCode : req.body.employeeCode
            }).updateOne({
                $set : reqData
            }).then(async(data)=>{
                // await EmployeeServiceRequest.deleteOne({serviceRequestId : req.body.complaintId})
                return res.status(200).json({ code : "200" , message: "Employee Password Updated Successfully!!", data: data });
            }).catch((err)=>{
                console.log(err);
                return res.status(500).json({
                    message: "Internal server error",
                    status: false,
                });
            })
        }else {
            return res.status(500).json({
                message: "Internal server error",
                status: false,
                displayMessage : "Employee not found!"
            });
        }
    }catch(err){
        console.log(err);
    }
}

const generateStateList = async(req,res)=>{
    try{
        const stateList = [{"code": "AN","name": "Andaman and Nicobar Islands"}, {"code": "AP","name": "Andhra Pradesh"}, {"code": "AR","name": "Arunachal Pradesh"}, {"code": "AS","name": "Assam"}, {"code": "BR","name": "Bihar"}, {"code": "CG","name": "Chandigarh"}, {"code": "CH","name": "Chhattisgarh"}, {"code": "DH","name": "Dadra and Nagar Haveli"}, {"code": "DD","name": "Daman and Diu"}, {"code": "DL","name": "Delhi"}, {"code": "GA","name": "Goa"}, {"code": "GJ","name": "Gujarat"}, {"code": "HR","name": "Haryana"}, {"code": "HP","name": "Himachal Pradesh"}, {"code": "JK","name": "Jammu and Kashmir"}, {"code": "JH","name": "Jharkhand"}, {"code": "KA","name": "Karnataka"}, {"code": "KL","name": "Kerala"}, {"code": "LD","name": "Lakshadweep"}, {"code": "MP","name": "Madhya Pradesh"}, {"code": "MH","name": "Maharashtra"}, {"code": "MN","name": "Manipur"}, {"code": "ML","name": "Meghalaya"}, {"code": "MZ","name": "Mizoram"}, {"code": "NL","name": "Nagaland"}, {"code": "OR","name": "Odisha"}, {"code": "PY","name": "Puducherry"}, {"code": "PB","name": "Punjab"}, {"code": "RJ","name": "Rajasthan"}, {"code": "SK","name": "Sikkim"}, {"code": "TN","name": "Tamil Nadu"}, {"code": "TS","name": "Telangana"}, {"code": "TR","name": "Tripura"}, {"code": "UK","name": "Uttarakhand"}, {"code": "UP","name": "Uttar Pradesh"}, {"code": "WB","name": "West Bengal"}];
        await StateList.insertMany(stateList).then(data=>{
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

const getStateList = async(req,res)=>{
    try{
        const stateList = await StateList.find();
        return res.status(200).json({ code : "200" , message: "State List!!", data: stateList });
    }catch(err){
        console.log(err);
    }
}

module.exports = {
    createEmployee: createEmployee,
    getEmployeeList: getEmployeeList,
    login: login,
    createEmployeeRole: createEmployeeRole,
    getEmployeeRole: getEmployeeRole,
    createCustomer: createCustomer,
    getEmployeeDetails : getEmployeeDetails,
    deleteEmployee : deleteEmployee,
    updateCustomerDetails : updateCustomerDetails,
    getAllCustomers : getAllCustomers,
    createUpdateCustomerDetails : createUpdateCustomerDetails,
    updateDetailsWithoutValidation : updateDetailsWithoutValidation,
    updateEmployeePassword : updateEmployeePassword,
    generateStateList : generateStateList,
    getStateList : getStateList
}