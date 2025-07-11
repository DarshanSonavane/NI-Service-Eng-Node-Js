const express = require('express');
// const authentication = require('../api/utility/authentication.js');
// const authenticate = authentication.authenticateToken;

const { createEmployee , getEmployeeList , login , createEmployeeRole , getEmployeeRole , createCustomer , getEmployeeDetails , deleteEmployee , updateCustomerDetails , getAllCustomers , createUpdateCustomerDetails , updateDetailsWithoutValidation , updateEmployeePassword , generateStateList , getStateList , getAllCustomersByPage , searchCustomerByNameOrCode , submitReward, getAllRewards, getLatestReward } = require('../api/controller/EmployeeController.js');
const { createServiceRequest , getMyComplaints , getAllComplaints , saveCustomerFeedback , getNatureOfComplaints , saveNatureOfComplaints , getAssignedComplaints , assignComplaint , closeServiceRequest , getDashboardDetails , getAdminDashboardDetails , updateServiceRequest , updateCustomerPassword , getCustomerServiceRequestCount , updateAppVersion , trackComplaint , reAssignComplaint , generateAndSendOTP , verifyOTP , getAllOpenComplaints , getAllCloseComplaints , deleteCustomerById , raiseAMCRequest , getCustomerDetails , genetrateAndSendAMCToCustomer , createUpdateGST , createUpdateAMCAmount , getAllOpenAMCRequest , getAllCloseAMCRequest , updateMachineDetails , getMachineDetailsByCustomerId } = require('../api/controller/ServiceRequestController.js');
const { generateCalibrationRequest , getCalibrationEmployeeList , getAllCalibrationList , getMyCalibrationRequestList , getCustomerCalibrationList , validateCalibration , updateCylinderDetails , generateAndSendCalibration , insertMachineModel , getCylinderDetails , insertNewMachineDetails , updateCalibrationStatusById , deletecalibrationRequestById , getAllOpenCalibrationList , getAllCloseCalibrationList } = require('../api/controller/CalibrationController.js');
const { saveNotification , fetchNotification , insertCustomerFCM , validateCustomerDeviceFCM } = require('../api/controller/NotificationController.js');
const { insertMasterInventory , fetchMasterInventoryList , assignInventoryToEmployee , createFSR , fsrList , employeeInventoryList , updateAdminMasterInventory, getLatestFSRS } = require('../api/controller/FSRController.js')
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
routes.get("/get-cylinder-details" , getCylinderDetails);
routes.post("/insert-machine-details" , insertNewMachineDetails);
routes.post("/save-notification" , saveNotification);
routes.get("/fetch-notification", fetchNotification);
routes.post("/insert-customer-fcm-details", insertCustomerFCM);
routes.post("/validate-customer-device-fcm" , validateCustomerDeviceFCM);
routes.post("/update-calibration-request-status" , updateCalibrationStatusById);
routes.post("/delete-calibration-request", deletecalibrationRequestById);
routes.post("/send-verification-code", generateAndSendOTP);
routes.post("/verify-otp", verifyOTP);
routes.get("/get-all-open-complaints" , getAllOpenComplaints);
routes.get("/get-all-close-complaints" , getAllCloseComplaints);
routes.post("/delete-customer-by-id" , deleteCustomerById);
routes.get("/get-open-calibration-request-list" , getAllOpenCalibrationList);
routes.get("/get-close-calibration-request-list" , getAllCloseCalibrationList);
routes.post("/raise-amc-request" ,  raiseAMCRequest);
routes.post("/get-customer-details" ,  getCustomerDetails);
routes.post("/generate-send-amc" , genetrateAndSendAMCToCustomer);
routes.post("/create-update-gst" , createUpdateGST);
routes.post("/create-update-amc-amount" , createUpdateAMCAmount);
routes.get("/get-all-open-amc-request" , getAllOpenAMCRequest);
routes.get("/get-all-close-amc-request" , getAllCloseAMCRequest);
routes.get("/get-all-customers-mobile", getAllCustomersByPage);
routes.get("/search-customer", searchCustomerByNameOrCode)

// FSR , Toolkit & Inventory API's
routes.post("/insert-master-inventory" , insertMasterInventory);
routes.get("/fetch-master-inventory" , fetchMasterInventoryList);
routes.post("/insert-update-employee-inventory" , assignInventoryToEmployee);
routes.post("/create-fsr" , createFSR);
routes.post("/fsr-list" , fsrList);
routes.post("/employee-inventory-list" , employeeInventoryList);
routes.post("/insert-update-master-inventory" , updateAdminMasterInventory);
routes.post("/fetch-latest-fsrs", getLatestFSRS);

// Machine Model API's
routes.post('/machine-list-by-customer-code', getMachineDetailsByCustomerId);
routes.post('/update-machine-list-by-customer-code', updateMachineDetails);

// Reward API's
routes.post('/save-reward',submitReward);
routes.get('/get-all-rewards',getAllRewards);
routes.get('/get-latest-reward',getLatestReward);

module.exports = routes;