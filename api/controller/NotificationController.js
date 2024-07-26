const Notification = require('../model/Notification');

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

module.exports = {
    saveNotification : saveNotification,
    fetchNotification : fetchNotification
}