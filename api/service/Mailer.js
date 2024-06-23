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

const sendMail = ( customerName,customercode, complaintType , machineType , employeeEmail , customerCity , customerMobile , requestType )=>{
    let mailList = ['nilesh@niserviceeng.com','complaints@niserviceeng.com']; 
    let subject = "New Service Request" 
    if(employeeEmail){
        subject += "Assigned To You"
        mailList.push(employeeEmail);
    }else {
        subject += "Raised By Customer"
    }
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

/* sendMailWithAttachment = (htmlEmailContents, toMail, subject) => {
  let path = `./assets/uploads/original/purchase_details${userId}.pdf`;
  console.log(path);
  var mailOptions = {
      from: 'admin@niserviceeng.com',
      to: toMail,
      subject: subject,
      html: htmlEmailContents,
      attachments : [{ path: path}]
  };
  transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
          console.log(error);
      } else {
          console.log("Email sent: " + info.response);
      }
  });
}
 */


module.exports = {
    sendMail: sendMail
}



