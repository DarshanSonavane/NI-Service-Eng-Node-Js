const nodemailer =  require('nodemailer');

let transporter = nodemailer.createTransport({
    host: 'mail.niserviceeng.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'admin@niserviceeng.com', // your domain email address
        pass: 'admin@12345' // your password
    }
});

const sendMail = ( customerName,customercode, complaintType , machineType , employeeEmail , customerCity)=>{
    let mailList = ['nilesh@niserviceeng.com','complaints@niserviceeng.com'];
    let subject = "New Service Request"
    if(employeeEmail){
        subject += "Assigned To You"
        mailList.push(employeeEmail);
    }else {
        subject += "Raised By Customer"
    }
    let mailOptions = {
        from: 'admin@niserviceeng.com',
        to: mailList,
        subject: 'New Service Request Raised',
        text: customerName + " with customer code "+ customercode + " " + customerCity + " has raised new service request of type "+ " " +complaintType + " for machine type " + machineType
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });
}

module.exports = {
    sendMail: sendMail
}



