const Employee = require('../model/Employee.js');

const createEmployeeService = async (req,res,callback)=>{
    try{
        let empDobArr = req.body.dob.split("/");
        let yeardigit = String(empDobArr[2]);
        let lastDigits = yeardigit.substring(yeardigit.length-2);
        let empCode = empDobArr[0] + empDobArr[1] + lastDigits;
        await Employee.create({
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            dob : req.body.dob,
            email : req.body.email,
            phone : req.body.phone,
            gender : req.body.gender,
            employeeCode : "NI" + empCode,
            role : req.body.role,
            isActive : "1"
        }).then((data)=>{
            callback(null, true, data);
        }).catch((err)=>{
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
    createEmployeeService: createEmployeeService
}