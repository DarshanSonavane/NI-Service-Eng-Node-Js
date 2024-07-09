const express = require('express');
// const authentication = require('../api/utility/authentication.js');
// const authenticate = authentication.authenticateToken;

const { createEmployee , getEmployeeList , login , createEmployeeRole , getEmployeeRole , createCustomer , getEmployeeDetails , deleteEmployee , updateCustomerDetails , getAllCustomers , createUpdateCustomerDetails , updateDetailsWithoutValidation , updateEmployeePassword , generateStateList , getStateList } = require('../api/controller/EmployeeController.js');
const { createServiceRequest , getMyComplaints , getAllComplaints , saveCustomerFeedback , getNatureOfComplaints , saveNatureOfComplaints , getAssignedComplaints , assignComplaint , closeServiceRequest , getDashboardDetails , getAdminDashboardDetails , updateServiceRequest , updateCustomerPassword , getCustomerServiceRequestCount , updateAppVersion , trackComplaint , reAssignComplaint } = require('../api/controller/ServiceRequestController.js');
const { generateCalibrationRequest , getCalibrationEmployeeList , getAllCalibrationList , getMyCalibrationRequestList , getCustomerCalibrationList , validateCalibration , updateCylinderDetails , generateAndSendCalibration , insertMachineModel } = require('../api/controller/CalibrationController.js');

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
routes.get("/get-all-customers", getAllCustomers);
routes.post("/create-update-customer-details",createUpdateCustomerDetails);
routes.post("/postman-customer-update",updateDetailsWithoutValidation);
routes.post("/update-employee-password" , updateEmployeePassword);
routes.post("/update-customer-password" , updateCustomerPassword);
routes.post("/get-customer-service-request-count",getCustomerServiceRequestCount);
routes.post("/update-application-version",updateAppVersion);
routes.post("/track-complaint",trackComplaint);
routes.post("/re-assign-complaint", reAssignComplaint);
routes.post("/request-calibration",generateCalibrationRequest);
routes.get("/calibration-employee-list" , getCalibrationEmployeeList);
routes.get("/get-calibration-request-list",getAllCalibrationList);
routes.post("/get-my-calibration-list",getMyCalibrationRequestList);
routes.post("/get-customer-calibration-list",getCustomerCalibrationList);
routes.post("/validate-calibration", validateCalibration);
routes.post("/update-cylinder-details" , updateCylinderDetails);
routes.post("/generate-send-calibration", generateAndSendCalibration);
routes.get("/generate-state-list", generateStateList);
routes.get("/state-list",getStateList);
routes.post("/insert-machine-model" , insertMachineModel);
module.exports = routes;