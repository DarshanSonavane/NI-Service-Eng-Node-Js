const Notification = require('../model/Notification');
const CustomerFCM = require('../model/CustomerFCMMapping');

const saveNotification = async(req,res)=>{
    try{
        if(!req.body.file || !req.body.extension){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }
        await Notification.create({
            file : req.body.file,
            extension : req.body.extension,
            notes : req.body.notes
        }).then((data)=>{
            return res.status(200).json({ code : "200" , message: "Notification Created Successfully!", data: data });
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

const fetchNotification = async(req,res)=>{
    try{
        const data = await Notification.find();
        return res.status(200).json({ code : "200" , message: "Notification List!", data: data });
    }catch(err){
        console.log(err);
    }
}

const insertCustomerFCM = async(req,res)=>{
    try{
        if(!req.body.customerId || !req.body.fcmKey || !req.body.deviceId){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }
    
        await CustomerFCM.create({
            fcmKey : req.body.fcmKey,
            deviceId : req.body.deviceId,
            customerId : req.body.customerId
        }).then((data)=>{
            return res.status(200).json({ code : "200" , message: "Customer FCM Mapping Saved Successfully!", data: data });
        }).catch((err)=>{
            console.log(err);
        })
    }catch(err){
        console.log(err);
    }
}

const validateCustomerDeviceFCM = async(req,res)=>{
    try{
        if(!req.body.customerId || !req.body.deviceId){
            return res.status(400).json({
                message: "Required Fields are missing",
                status: false,
            });
        }

        const data = await CustomerFCM.findOne({customerId : req.body.customerId , deviceId : req.body.deviceId});
        if(data){
            return res.status(200).json({ code : "200" , message: "Customer FCM Mapping Available In DB!", isFCMMappingAvailable: true });
        }else {
            return res.status(200).json({ code : "200" , message: "Customer FCM Mapping Saved Successfully!", isFCMMappingAvailable: false });
        }
    }catch(err){
        console.log(err);
    }
}

module.exports = {
    saveNotification : saveNotification,
    fetchNotification : fetchNotification,
    insertCustomerFCM : insertCustomerFCM,
    validateCustomerDeviceFCM : validateCustomerDeviceFCM
}