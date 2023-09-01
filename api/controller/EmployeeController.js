const Employee =  require('../model/Employee.js');
const { createEmployeeService } =  require('../helper/EmployeeHelper.js');
const UserRoles =  require('../model/UserRoles.js');
const CustomerDetails =  require("../model/CustomerDetails.js");

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
            if(req.body.type == "0"){
                await CustomerDetails.find({customerCode : customerCode.toString()}).then((data)=>{
                    if(data && data != null && data.length > 0){
                        return res.status(200).json({ code : "200",message: "Login Success!!", data: data });
                    }else {
                        return res.status(202).json({ message: "Login Success with no data found!!", data: data });
                    }
                }).catch((err)=>{
                    return res.status(500).json({
                        message: "Internal server error",
                        status: false,
                    });
                })
            }else if(req.body.type == "1"){
                await Employee.findOne({
                    employeeCode : req.body.id,
                    isActive : "1"
                }).then((data)=>{
                    if(data && data != null){
                        return res.status(200).json({ message: "Login Success!!", data: data });
                    }else {
                        return res.status(202).json({ message: "Login Success with no data found!!", data: data });
                    }
                }).catch((err)=>{
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

module.exports = {
    createEmployee: createEmployee,
    getEmployeeList: getEmployeeList,
    login: login,
    createEmployeeRole: createEmployeeRole,
    getEmployeeRole: getEmployeeRole,
    createCustomer: createCustomer,
    getEmployeeDetails : getEmployeeDetails,
    deleteEmployee : deleteEmployee
}