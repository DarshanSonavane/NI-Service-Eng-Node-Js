const nodemailer =  require('nodemailer');
const constants = require("../utility/constant")

let transporter = nodemailer.createTransport({
    host: 'mail.niserviceeng.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'admin@niserviceeng.com', // your domain email address
        pass: 'admin@12345' // your password
    }
});

/* const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,  // or 587 if using TLS
  secure: false, // true for 465, false for 587
  auth: {
    user: 'info.niservice88@gmail.com',
    pass: 'frtg cdpx pgmy hmyx',
  },
}); */

const sendMail = ( customerName,customercode, complaintType , machineType , employeeEmail , customerCity , customerMobile , requestType )=>{
  console.log('Employee Email------',employeeEmail);
    let mailList = ['nilesh@niserviceeng.com','complaints@niserviceeng.com']; 
    let subject = "New Service Request" 
    if(employeeEmail){
        subject += "Assigned To You"
        mailList.push(employeeEmail);
    }else {
        subject += "Raised By Customer"
    }
    console.log('mailList', mailList)
    let typeOfRequest = requestType === 'service' ? 'Service' : 'Calibration';
    let mailOptions = {
        from: 'admin@niserviceeng.com',
        to: mailList,
        subject: `New ${typeOfRequest} Request Raised`,
        html : `<html>
        <head>
        <style>
        table {
          font-family: arial, sans-serif;
          border-collapse: collapse;
          width: 100%;
        }
        
        td, th {
          border: 1px solid #dddddd;
          text-align: left;
          padding: 8px;
        }
        
        tr:nth-child(even) {
          background-color: #dddddd;
        }
        </style>
        </head>
        <body>
        <h5>${customerName} with customer code ${customercode} , ${customerCity} has raised new ${requestType} request. Request Details are as follows : </h5>
        <br/>
        <table>
          <tr>
            <th colspan="2">Customer Details</th>
          </tr>
          <tr>
            <td>Customer Name</td>
            <td>${customerName}</td>
          </tr>
          <tr>
            <td>Customer Code</td>
            <td>${customercode}</td>
          </tr>
          <tr>
            <td>Customer City</td>
            <td>${customerCity}</td>
          </tr>
          <tr>
            <td>Customer Contact</td>
            <td>${customerMobile}</td>
          </tr>
          <tr>
            <td>Request Type</td>
            <td>${complaintType}</td>
          </tr>
          <tr>
            <td>Machine Type</td>
            <td>${machineType}</td>
          </tr>
        </table>
        
        <footer style="margin-top: 20px; font-size: 12px; color: green; text-align: left;">
          <p><b>Best Regards</b></p>
	        <img src="${constants.SERVER_FILE_PATH}NI-SERVICE-LOGO-GIF.gif" alt="Company Logo" style="width: 100px; margin-top: 10px;" />
          <p><b>Office No.18,2nd Floor, GNP Gallaria  MIDC Road , Dombivali (E) 421202</b></p>
          <p><b>Contact Us : 9892151843</b></p>
          <p><b>Email : <a href="mailto:service@niserviceeng.com">service@niserviceeng.com</a></b></p>
          <p><b><a href="http://www.niserviceeng.com" style="color: green;">Website</a></b></p>
          
        </footer>

        </body>
        </html>`

    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });
}

sendMailWithAttachment = (htmlEmailContents, toMail, subject , path) => {
  console.log(path);
  let mailList = ['nilesh@niserviceeng.com', toMail]; 
  var mailOptions = {
      from: 'admin@niserviceeng.com',
      to: mailList,
      subject: subject,
      html: htmlEmailContents,
      attachments : [{ path: path}]
  };
  console.log('mailList', mailList)
  transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
          console.log(error);
      } else {
          console.log("Email sent: " + info.response);
      }
  });
}

sendOneTimeVerificationEmail = (subject , data , otp , text) =>{
  console.log('data', data);
  var mailOptions = {
    from: 'admin@niserviceeng.com',
    to: data.email.trim(),
    subject: subject,
    html: `<html><body>
    <p>Dear Customer,</p>
    <p>${data.customerName} - ${data.customerCode}</p>
    <p>${data.city} , ${data.stateCode}</p>
    <p>${text}<b>${otp}</b></p>
    <footer style="margin-top: 20px; font-size: 12px; color: green; text-align: left;">
          <p><b>Best Regards</b></p>
	        <img src="${constants.SERVER_FILE_PATH}NI-SERVICE-LOGO-GIF.gif" alt="Company Logo" style="width: 100px; margin-top: 10px;" />
          <p><b>Office No.18,2nd Floor, GNP Gallaria  MIDC Road , Dombivali (E) 421202</b></p>
          <p><b>Contact Us : 9892151843</b></p>
          <p><b>Email : <a href="mailto:service@niserviceeng.com">service@niserviceeng.com</a></b></p>
          <p><b><a href="http://www.niserviceeng.com" style="color: green;">Website</a></b></p>
        </footer>
    </body></html>`
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
    sendMail: sendMail,
    sendMailWithAttachment : sendMailWithAttachment,
    sendOneTimeVerificationEmail : sendOneTimeVerificationEmail
}



