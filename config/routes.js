import express from 'express';

import { createEmployee , getEmployeeList , login , createEmployeeRole , getEmployeeRole , createCustomer } from '../api/controller/EmployeeController.js';
import { createServiceRequest , getMyComplaints , getAllComplaints , saveCustomerFeedback , getNatureOfComplaints , saveNatureOfComplaints , getAssignedComplaints , assignComplaint , closeServiceRequest} from '../api/controller/ServiceRequestController.js';

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

export default routes;