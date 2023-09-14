const express = require('express');

const { createEmployee , getEmployeeList , login , createEmployeeRole , getEmployeeRole , createCustomer , getEmployeeDetails , deleteEmployee , updateCustomerDetails} = require('../api/controller/EmployeeController.js');
const { createServiceRequest , getMyComplaints , getAllComplaints , saveCustomerFeedback , getNatureOfComplaints , saveNatureOfComplaints , getAssignedComplaints , assignComplaint , closeServiceRequest , getDashboardDetails , getAdminDashboardDetails , updateServiceRequest} = require('../api/controller/ServiceRequestController.js');

const routes = express.Router();

routes.get("/test", (req, res) => {
    res.status(200).json({ message: "Connected!" });
});

routes.post("/create-employee",createEmployee);
routes.get("/fetch-employee",getEmployeeList);
routes.post("/create-service-request",createServiceRequest);
routes.get("/get-my-complaints",getMyComplaints);
routes.post("/login",login);
routes.get("/get-all-complaints",getAllComplaints);
routes.post("/save-feedback",saveCustomerFeedback);
routes.get("/complaint-type-list",getNatureOfComplaints);
routes.post("/save-complaint-type",saveNatureOfComplaints);
routes.post("/create-user-role",createEmployeeRole);
routes.get("/get-user-role",getEmployeeRole);
routes.get("/get-my-complaints",getMyComplaints);
routes.post("/create-customer",createCustomer);
routes.get("/get-assigned-complaints",getAssignedComplaints);
routes.post("/assign-complaint",assignComplaint);
routes.post("/close-service-request",closeServiceRequest);
routes.get("/get-dashboard-details",getDashboardDetails);
routes.get("/get-admin-dashboard-details",getAdminDashboardDetails);
routes.get("/get-employee-details",getEmployeeDetails);
routes.get("/delete-employee",deleteEmployee);
routes.post("/update-service-request", updateServiceRequest);
routes.post("/update-customer-details", updateCustomerDetails);

module.exports = routes;