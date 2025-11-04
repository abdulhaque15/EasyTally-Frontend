import apiConfig from "../config/axios-config";
import { formateEmptyFields } from "../helper/GlobalHelper";

/**------------------------------------
 * @author : Mohd Sarfaraz
 * @Module : Contacts APIs Handling 
-------------------------------------*/

const getListOfLeads = async () => {
  try {
    const response = await apiConfig.get("/lead");
    return response?.data || [];
  } catch (error) { 
    throw error;
  }
};

const createLeadRecord = async (body) => {
  try {
    const response = await apiConfig.post(`/lead`, formateEmptyFields(body));
    return response.data;
  } catch (error) {
    console.error("Failed to create lead:", error);
    throw error;
  }
};

const updateLead = async (id, data) => {
  try {
    const response = await apiConfig.put(
      `/lead/${id}`,
      formateEmptyFields(data)
    );
    return response.data;
  } catch (error) { 
    throw error;
  }
};

const deleteLead = async (id) => {
  try {
    const response = await apiConfig.delete(`/lead/${id}`);
    return response.data;
  } catch (error) { 
    throw error;
  }
};

const getListOfContacts = async () => {
  try {
    const { data } = await apiConfig.get("/contact");
    return data || [];
  } catch (error) { 
    throw error;
  }
};

const getContactById = async (contactId) => {
  try {
    const response = await apiConfig.get(`/contact/${contactId}`);
    return response?.data || null;
  } catch (error) { 
    throw error;
  }
};

const updateContactById = async (body, Id) => {
  try {
    const { data } = await apiConfig.put(
      `/contact/${Id}`,
      formateEmptyFields(body)
    );
    return data || [];
  } catch (error) { 
    throw error;
  }
};

const createContact = async (payload) => {
  try {
    const response = await apiConfig.post("/contact", payload);
    return response?.data;
  } catch (error) { 
    throw error;
  }
};

const updateContact = async (id, payload) => {
  try {
    const response = await apiConfig.put(`/contact/${id}`, payload);
    return response?.data;
  } catch (error) { 
    throw error;
  }
};

const deleteContact = async (id) => {
  try {
    const response = await apiConfig.delete(`/contact/${id}`);
    return response?.data;
  } catch (error) { 
    throw error;
  }
};
/**-----    END ./  -----*/

const getListOfAccounts = async () => {
  try {
    const response = await apiConfig.get("/account");
    return response.data;
  } catch (error) { 
    throw error;
  }
};

const getAccountById = async (accountId) => {
  try {
    const response = await apiConfig.get(`/account/${accountId}`);
    return response?.data || null;
  } catch (error) { 
    throw error;
  }
};

const createAccount = async (payload) => {
  try {
    const response = await apiConfig.post(
      "/account",
      formateEmptyFields(payload)
    );
    return response.data;
  } catch (error) { 
    throw error;
  }
};

const updateAccount = async (id, data) => {
  try {
    const response = await apiConfig.put(
      `/account/${id}`,
      formateEmptyFields(data)
    );
    return response.data;
  } catch (error) { 
    throw error;
  }
};

const deleteAccount = async (id) => {
  try {
    const response = await apiConfig.delete(`/account/${id}`);
    return response.data;
  } catch (error) { 
    throw error;
  }
};

/**------------------------------------
 * @author : Mohd Sarfaraz
 * @Module : Proposals APIs Handling 
-------------------------------------*/
const getListOfProposal = async () => {
  try {
    const { data } = await apiConfig.get(`/proposal`);
    return data || [];
  } catch (error) { 
    throw error;
  }
};

const fetchProposalById = async (Id) => {
  try {
    const { data } = await apiConfig.get(`/proposal/${Id}`);
    return data || [];
    // const response = await apiConfig.get(`/contact/${contactId}`);
    // return response?.data || null;
  } catch (error) { 
    throw error;
  }
};

const createProposalRecord = async (body) => {
  try {
    const { data } = await apiConfig.post(
      `/proposal`,
      formateEmptyFields(body)
    );
    return data || [];
  } catch (error) { 
    throw error;
  }
};

const updateProposalById = async (body, Id) => {
  try {
    const { data } = await apiConfig.put(
      `/proposal/${Id}`,
      formateEmptyFields(body)
    );
    return data || [];
  } catch (error) { 
    throw error;
  }
};

const deleteProposalById = async (Id) => {
  try {
    const { data } = await apiConfig.delete(`/proposal/${Id}`);
    return data || [];
  } catch (error) { 
    throw error;
  }
};
/**-----  Proposal apiConfig  END ./  -----*/

/**---------------------------------------------
 * @author : MOhd Sarfaraz
 * @Module : Dashboards charts & cards
----------------------------------------------*/
const handleDashboardsCardsData = async () => {
  try {
    const { data } = await apiConfig.get(`/report/dashboard-card`);
    return data || [];
  } catch (error) { 
    throw error;
  }
};

const handleDashboardsChartsData = async () => {
  try {
    const { data } = await apiConfig.get(`/report/dashboard-chart`);
    return data || [];
  } catch (error) { 
    throw error;
  }
};

const getListOfLeadsWithOwner = async () => {
  try {
    const { data } = await apiConfig.get("/report/lead-unassigned");
    return data || [];
  } catch (error) { 
    throw error;
  }
};

const leadGroupedByPipeline = async () => {
  try {
    const { data } = await apiConfig.get("/report/lead-group-by-pipeline");
    return data || [];
  } catch (error) { 
    throw error;
  }
};

const retriveTodayTaskAndEvent = async () => {
  try {
    const { data } = await apiConfig.get("/report/today-event-task");
    return data || [];
  } catch (error) { 
    throw error;
  }
};
/**-----  END ./  -----**/

// Lead Apis Started //



const getLeadById = async (leadId) => {
  try {
    const response = await apiConfig.get(`/lead/${leadId}`);
    return response?.data || null;
  } catch (error) { 
    throw error;
  }
};

const getLeadByStatusCount = async () => {
  try {
    const response = await apiConfig.get("/lead/pipeline-count");
    return response?.data || [];
  } catch (error) { 
    throw error;
  }
};

// Lead Apis Ended //

// Project Apis Started //

const getListOfProject = async () => {
  try {
    const response = await apiConfig.get("/project");
    return response?.data || [];
  } catch (error) { 
    throw error;
  }
};

const getProjectById = async (projectId) => {
  try {
    const response = await apiConfig.get(`/project/${projectId}`);
    return response?.data || null;
  } catch (error) { 
    throw error;
  }
};

const createProject = async (payload) => {
  try {
    const response = await apiConfig.post(
      "/project",
      formateEmptyFields(payload)
    );
    return response.data;
  } catch (error) { 
    throw error;
  }
};

const updateProject = async (id, data) => {
  try {
    const response = await apiConfig.put(
      `/project/${id}`,
      formateEmptyFields(data)
    );
    return response.data;
  } catch (error) { 
    throw error;
  }
};

const deleteProject = async (id) => {
  try {
    const response = await apiConfig.delete(`/project/${id}`);
    return response.data;
  } catch (error) { 
    throw error;
  }
};

// Project Apis Ended //

// Invoice Apis Started //

const getListOfInvoice = async () => {
  try {
    const response = await apiConfig.get("/invoice");
    return response?.data || [];
  } catch (error) { 
    throw error;
  }
};

// Invoice Apis Endeed //

// User Apis Started //

const getListOfUsers = async () => {
  try {
    const response = await apiConfig.get("/user");
    return response?.data || [];
  } catch (error) { 
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    const response = await apiConfig.get(`/user/${userId}`);
    return response?.data || null;
  } catch (error) { 
    throw error;
  }
};

const createUser = async (payload) => {
  try {
    const response = await apiConfig.post("/user/create", formateEmptyFields(payload));
    return response.data;
  } catch (error) { 
    throw error;
  }
};

const updateUser = async (Id, payload) => {
  try {
    const response = await apiConfig.put(
      `/user/update/${Id}`,
      formateEmptyFields(payload)
    );
    return response.data;
  } catch (error) { 
    throw error;
  }
};

const deleteUserById = async (id) => {
  try {
    const response = await apiConfig.delete(`/user/delete/${id}`);
    return response?.data || [];
  } catch (error) {    
    throw error;
  }
};
// User Apis Endeed //

// Task Apis Started //

const getListOfTasks = async () => {
  try {
    const response = await apiConfig.get("/task");
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const getListOfTasksById = async (id) => {
  try {
    const response = await apiConfig.get(`/task/${id}`);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const createTask = async (payload) => {
  try {
    const response = await apiConfig.post("/task", formateEmptyFields(payload));
    return response.data;
  } catch (error) {
    
    throw error;
  }
};

const updateTask = async (payload, Id) => {
  try {
    const response = await apiConfig.put(
      `/task/${Id}`,
      formateEmptyFields(payload)
    );
    return response.data;
  } catch (error) {
    
    throw error;
  }
};

const deleteTaskById = async (id) => {
  try {
    const response = await apiConfig.delete(`/task/${id}`);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

// Task Apis Ended //

// Permissions Apis Started //

const getListOfPermissions = async () => {
  try {
    const response = await apiConfig.get("/group");
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const getListOfUsersWithPermissions = async () => {
  try {
    const response = await apiConfig.get("/global/group-permission");
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const getListOfGroupsPermissionsById = async (id) => {
  try {
    const response = await apiConfig.get(`/global/group-permission/${id}`);
    return response?.data || [];
  } catch (error) {
    
  }
};

const createGroupsAndPermissions = async (payload) => {
  try {
    const response = await apiConfig.post(`/global/group-permission`, payload);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const updateGroupsAndPermissions = async (record_id, payload) => {
  try {
    const response = await apiConfig.put(
      `/global/group-permission/${record_id}`,
      payload
    );
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const deletePermissions = async (id) => {
  try {
    const response = await apiConfig.delete(`/group/${id}`);
    return response.data;
  } catch (error) {
    
    throw error;
  }
};

// Permission Apis Ended //

// Send Email To Client For Confirmation Started //

const sendMailToClientForConfirmation = async (data) => {
  try {
    const response = await apiConfig.post("/global/send-confirmation", data);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

// Send Email To Client For Confirmation Ended //

// Client Confirmation Started //

const confirmClientIntoProject = async (data) => {
  try {
    const response = await apiConfig.post("/global/client-confirm", data);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

// Client Confimration Ended //

// Global Started

const getLeadKenbenViewData = async (moduleId) => {
  try {
    const response = await apiConfig.get(`/global/leads-by-status/${moduleId}`);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const getRelatedRecordByRelatedToId = async (recordId) => {
  try {
    const response = await apiConfig.get(`/global/lead-related/${recordId}`);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const getrelatedRecordByAccountId = async (recordId) => {
  try {
    const response = await apiConfig.get(`/global/account-related/${recordId}`);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const getrelatedRecordByContactId = async (recordId) => {
  try {
    const response = await apiConfig.get(`/global/contact-related/${recordId}`);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const getrelatedRecordByProjectId = async (recordId) => {
  try {
    const response = await apiConfig.get(`/global/project-related/${recordId}`);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const getrelatedRecordByTaskId = async (recordId) => {
  try {
    const response = await apiConfig.get(`/global/task-related/${recordId}`);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const getRelatedTaskEventNotes = async (record_id) => {
  try {
    const response = await apiConfig.get(
      `/global/modules-related-records/${record_id}`
    );
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const updateModuleOwners = async (objectType, newOwnerId, recordIds) => {
  try {
    const response = await apiConfig.post(`/global/update-owners`, {
      objectType,
      newOwnerId,
      recordIds,
    });
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};
// Global Ended

// moduleStatus Apis Started
const getListOfModuleStatus = async (id) => {
  try {
    const response = await apiConfig.get(`/module-status/${id}`);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const createModuleStatus = async (payload) => {
  try {
    const response = await apiConfig.post("/module-status", payload);
    return response?.data;
  } catch (error) {
    console.error("Failed to create module-status:", error);
    throw error;
  }
};

const updateListOfModuleStatus = async (id, payload) => {
  try {
    const response = await apiConfig.put(`/module-status/${id}`, payload);
    return response?.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// moduleStatus Apis Ended

// Pipeline Apis Started
const getListOfPipeline = async () => {
  try {
    const response = await apiConfig.get("/pipeline");
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};
// Pipeline Apis Emded

const getListOfProposalMinimal = async () => {
  try {
    const response = await apiConfig.get("/global/proposal-minimal");
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

// Notifications Started

const getNotificationsList = async () => {
  try {
    const response = await apiConfig.get(`/notification/`);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const getNotificationOfChatterMessages = async (name, userid) => {
  try {
    const params = {};
    if (name) params.name = name;
    if (userid) params.userid = userid;

    const response = await apiConfig.get('/notification/chatter', { params });
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const createNotifications = async (payload) => {
  try {
    const response = await apiConfig.post("/notification", payload);
    return response?.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const updateNotification = async (Id, body) => {
  try {
    const { data } = await apiConfig.put(
      `/notification/${Id}`,
      formateEmptyFields(body)
    );
    return data || [];
  } catch (error) {
    
    throw error;
  }
};

// Notifications Ended

const getLeadsStatusByPipeline = async (id) => {
  try {
    const response = await apiConfig.get(
      `/pipeline/module-status-by-pipeline/${id}`
    );
    return response.data || [];
  } catch (error) {
    
    throw error;
  }
};

const getLeadAndStatusByPipeline = async (id) => {
  try {
    const response = await apiConfig.get(
      `/global/leads-by-pipeline-status/${id}`
    );
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

/**
 * @Addedby : Mohd Sarfraj
 * @createdddate : 23-june-2025
 * @Description : Callled Attachemnt Create API with related_to id
 */
const createRelatedAttachment = async (body) => {
  try {
    const response = await apiConfig.post(`/attachment`, body, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const updateRelatedAttachment = async (payload, record_id) => {
  try {
    const response = await apiConfig.put(`/attachment/${record_id}`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const deleteAttachmentById = async (id) => {
  try {
    const response = await apiConfig.delete(`/attachment/${id}`);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

/**
 * @Addedby : Mohd Sarfraj
 * @createdddate : 23-june-2025
 */
const retriveAllRelatedActivities = async (module_record_id) => {
  try {
    const response = await apiConfig.get(
      `/global/modules-related-records/${module_record_id}`
    );
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const getAllModuleStatus = async () => {
  try {
    const response = await apiConfig.get(`/global/module-status/`);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

//    Eevent API   //
const createEevnt = async (payload) => {
  try {
    const response = await apiConfig.post(`/event`, payload);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const updateEvent = async (payload, record_id) => {
  try {
    const response = await apiConfig.put(`/event/${record_id}`, payload);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const deletEeventById = async (id) => {
  try {
    const response = await apiConfig.delete(`/event/${id}`);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};
// Event API  END ./  //

const createNote = async (payload) => {
  try {
    const response = await apiConfig.post(`/notes`, payload);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const updateNote = async (payload, record_id) => {
  try {
    const response = await apiConfig.put(`/notes/${record_id}`, payload);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const deleteNoteById = async (id) => {
  try {
    const response = await apiConfig.delete(`/notes/${id}`);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

/**
 * @Description : This method return BLOB {} object in data key of response for download file
 */
const downloadFile = async (filename) => {
  try {
    const response = await apiConfig.get(`/attachment/download/${filename}`, {
      responseType: "blob",
    });
    return response;
  } catch (error) {
    
    throw error;
  }
};

const getPipelineById = async (id) => {
  try {
    const response = await apiConfig.get(`/pipeline/${id}`);
    return response?.data || [];
  } catch (error) {
    
  }
};

const getAllModule = async () => {
  try {
    const response = await apiConfig.get(`/global/modules-list`);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const sendEmail = async (payload) => {
  try {
    const isFormData = payload instanceof FormData;

    const response = await apiConfig.post("/global/send-email", payload, {
      headers: isFormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
    });

    return response.data;
  } catch (error) {
    
    throw error;
  }
};


export const generateBackup = async () => {
  try {
    const response = await apiConfig.get("/global/download", {
      responseType: "blob",
    });
    return response;
  } catch (error) {
    console.error("Error generating backup:", error);
    throw error;
  }
};


const getListOfBackup = async () => {
  try {
    const response = await apiConfig.get("/global/backup");
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

// Chat api
const getInternalChat = async (id) => {
  try {
    const response = await apiConfig.get(`/global/user-chatter-message/${id}`);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const createInternalChat = async (payload) => {
  try {
    const response = await apiConfig.post(`/global/chatter-message`, payload);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

// Added by sarfaraz | 23 july 2025
const loginAsUser = async (user_id) => {
  try {
    const response = await apiConfig.post(`/user/login-as-user/${user_id}`);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
}

const upsertProfile = async (payload) => {
  try {
    const response = await apiConfig.post(`/user/user-profile`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const getListOfDbTableNameWithModuleId = async (recordid) => {
  try {
    const response = await apiConfig.get(`/global/with-status-fields/${recordid}`);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const getListOfModuleGroupByStatus = async (module_id) => {
  try {
    const response = await apiConfig.get(`/global/module-list-group-by-status/${module_id}`);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const getListOfSystemSetting = async () => {
  try {
    const response = await apiConfig.get("/global/system-settings");
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const getListOfSystemSettingById = async (id) => {
  try {
    const response = await apiConfig.get(`/global/system-settings/${id}`);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const getKenbenViewDetails = async (moduleId) => {
  try {
    const response = await apiConfig.get(`/global/module-list-group-by-status/${moduleId}`);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
}

// Opportunity Apis Start

const getListOfOpportunity = async () => {
  try {
    const response = await apiConfig.get("/deal");
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const getOpportunityById = async (opportunityId) => {
  try {
    const response = await apiConfig.get(`/deal/${opportunityId}`);
    return response?.data || null;
  } catch (error) {
    
    throw error;
  }
};

const createOpportunityRecord = async (body) => {
  try {
    const response = await apiConfig.post(`/deal`, formateEmptyFields(body));
    return response.data;
  } catch (error) {
    console.error("Failed to create opportunity:", error);
    throw error;
  }
};

const updateOpportunity = async (id, data) => {
  try {
    const response = await apiConfig.put(
      `/deal/${id}`,
      formateEmptyFields(data)
    );
    return response.data;
  } catch (error) {
    
    throw error;
  }
};

const deleteOpportunity = async (id) => {
  try {
    const response = await apiConfig.delete(`/deal/${id}`);
    return response.data;
  } catch (error) {
    
    throw error;
  }
};

// Opportunity Apis End


// Category Apis Started 

const getListOfCategories = async () => {
  try {
    const response = await apiConfig.get(`/category`);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
}


const createCategory = async (data) => {
  try {
    const response = await apiConfig.post('/category', data);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

const updateCategory = async (id, data) => {
  try {
    const response = await apiConfig.put(`/category/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

const deleteCategory = async (id) => {
  try {
    const response = await apiConfig.delete(`/category/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

const getCategoryById = async (id) => {
  try {
    const response = await apiConfig.get(`/category/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};


// Category Apis Ended 


// Product Apis Started

const getListOfProducts = async () => {
  try {
    const response = await apiConfig.get(`/product`);
    return response?.data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

const createProduct = async (data) => {
  try {
    const response = await apiConfig.post('/product', data);
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

const updateProduct = async (id, data) => {
  try {
    const response = await apiConfig.put(`/product/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

const deleteProduct = async (id) => {
  try {
    const response = await apiConfig.delete(`/product/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

const getProductById = async (id) => {
  try {
    const response = await apiConfig.get(`/product/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

// Product Apis Ended

//Settting Permission Api

const getAllSeetingPermissions = async () => {
    try {
    const response = await apiConfig.get(`/global/setting-permission`);
    return response?.data || [];
  } catch (error) {
    console.error("Error fetching seeting permissions:", error);
    throw error;
  }
}

const updateSetttingPermission = async (data) => {
  try {
    const response = await apiConfig.post(`/global/upsert-setting-permission`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating seeting permission:", error);
    throw error;
  }
};


// Email Apis Started
const fetchTemplates = async () => {
  try {   
    const response = await apiConfig.get("/emailtemplate");
    return response.data;
  } catch (error) {
    console.error("Error fetching templates:", error);
    throw error;
  }
};

const getTemplateById = async (id) => {
  try {
    const response = await apiConfig.get(`/emailtemplate/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching template by id:", error);
    throw error;
  }
};
const saveTemplate = async (payload) => {
  try {
    const response = await apiConfig.post("/emailtemplate", payload);
    return response.data;
  } catch (error) {
    console.error("Error saving template:", error);
    throw error;
  }
};

const deleteTemplate = async (id) => {
  try {
    const response = await apiConfig.delete(`/emailtemplate/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting template:", error);
    throw error;
  }
};

const statusChange = async (id, currentStatus) => {
  try {
    const response = await apiConfig.put(`/emailtemplate/${id}/status`, { currentStatus });
    return response.data;
  } catch (error) {
    console.error("Error changing status:", error);
    throw error;
  }
};

const fetchFieldsByObjectName = async (objectName) => {
  try {
    const response = await apiConfig.get(`/emailtemplate/${objectName}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching fields by object name:", error);
    throw error;
  }
};
const fetchTableindb = async () => {
  try {
    const response = await apiConfig.get(`/emailtemplate/tables`);
    return response.data;
  } catch (error) {
    console.error("Error fetching fields by object name:", error);
    throw error;
  }
};
// Product Apis Ended

const getListOfModuleFieldHistory = async (module_id, record_id) => {
  try {
    const response = await apiConfig.get(`/global/module-field-history/${module_id}/${record_id}`);
    return response?.data || [];
  } catch (error) {
    
    throw error;
  }
};

const laedConvertlead = async (payload) => {
  try {
    const response = await apiConfig.post('/global/convertlead', payload);
    return response.data;
  } catch (error) {
    
    throw error;
  }
};

const getRelatedRecord = async (record_id, module_name, relationship) => {
  try {
    const payload = {
      parentTable: "account",
      recordId: record_id,
      relatedModules: [
        { "name": module_name, "type": relationship }
      ]
    }
    const response = await apiConfig.post('/global/related-record', payload);
    return response?.data || [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Ledgers API
const getListOfLedgers = async () => {
  try {
    const response = await apiConfig.get(`/ledger`);
    return response?.data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

const getLedgerRecordById = async (id) => {
  try {
    const response = await apiConfig.get(`/ledger/${id}`);
    return response?.data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

const createLedger = async (data) => {
  try {
    const response = await apiConfig.post('/ledger', data);
    return response.data;
  } catch (error) {
    console.error("Error creating ledger:", error);
    throw error;
  }
};

const updateLedger = async (id, data) => {
  try {

    const response = await apiConfig.put(`/ledger/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating ledger:", error);
    throw error;
  }
};

const deleteLedgers = async (id,) => {
  try {

    const response = await apiConfig.delete(`/ledger/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

// Stock Item 
const getListOfStockItems = async () => {
  try {
    const response = await apiConfig.get(`/stock-items`);
    return response?.data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

const getInventoryHistory = async (stockItemId) => { 
  try {
    const response = await apiConfig.get(`/stock-items/${stockItemId}/inventory-history`);
    return response?.data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

// Voucher 
const getListOfVoucher = async () => {
  try {
    const response = await apiConfig.get(`/voucher`);
    return response?.data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

//Order
const getListOfOrder = async () => {
  try {
    const response = await apiConfig.get(`/order`);
    return response?.data || [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

const getOrderDetailDataById = async (id) => {
  try {
    const response = await apiConfig.get(`/order/${id}`);
    return response?.data || [];
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};

const getOrderRecordById = async (id) => {
  try {
    const response = await apiConfig.get(`/order/editData/${id}`);
    return response?.data || [];
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};

const getOrderOLIDetailById = async (id) => {
  try {
    const response = await apiConfig.get(`/order/order_line_item/${id}`);
    return response?.data || [];
  } catch (error) {
    console.error("Error fetching OLI:", error);
    throw error;
  }
};

const getDefaultOrderSettings = async () => {
  try {
    const response = await apiConfig.get(`/order/settings/defaults`);
    return response.data || {};
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw error;
  }
};

const deleteOrder = async (id) => {
  try { 
    const response = await apiConfig.delete(`/order/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error delete order:", error);
    throw error;
  }
};

const getNextOrderNumber = async () => {
  try {
    const response = await apiConfig.get(`/order/settings/next-number`);
    return response.data;
  } catch (error) {
    console.error("Error delete order:", error);
    throw error;
  }
};

const createOrder = async (data) => {
  try {
    const response = await apiConfig.post('/order', data);
    return response.data;
  } catch (error) {
    console.error("Error creating ledger:", error);
    throw error;
  }
};

const updateOrder = async (id, data) => {
  try {

    const response = await apiConfig.put(`/order/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating ledger:", error);
    throw error;
  }
};

const createOrderLineItem = async (data) => {
  try {
    const response = await apiConfig.post('/order/line-items', data);
    return response.data;
  } catch (error) {
    console.error("Error creating ledger:", error);
    throw error;
  }
};

const deleteAllLineItemsForOrder = async (orderId) => {
  try {
    const response = await apiConfig.delete(`/order/${orderId}/line-items`);
    return response.data;
  } catch (error) {
    console.error("Error delete order:", error);
    throw error;
  }
};

// setting

const getAllSettings = async () => {
  try {
    const response = await apiConfig.get(`/setting`);
    return response.data || {};
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw error;
  }
};

const getAllCompanies = async () => {
  try {
    const response = await apiConfig.get(`/setting/companies`);
    return response.data || {};
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw error;
  }
};

const getListOfFinancialYear = async () => {
  try {
    const response = await apiConfig.get(`/setting/financial-year`);
    return response.data || {};
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw error;
  }
};

const updateSettingRecord = async (id, data) => {
  try { 
    const response = await apiConfig.put(`/setting/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating settings:", error);
    throw error;
  }
}; 

export default {
  laedConvertlead,getRelatedRecord,
  getListOfModuleFieldHistory,
  fetchTableindb,
  fetchTemplates,
  fetchFieldsByObjectName,
  deleteTemplate,
  statusChange,
  saveTemplate,
  getTemplateById,
  getCategoryById,updateSetttingPermission,getAllSeetingPermissions,getListOfLeads, createLeadRecord, updateLead, deleteLead,
  getListOfProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  updateCategory, createCategory,
  deleteCategory,
  getListOfCategories,
  getOpportunityById,
  createModuleStatus,
  getListOfSystemSettingById,
  getInternalChat,
  createInternalChat,
  upsertProfile,
  getNotificationOfChatterMessages,
  getListOfDbTableNameWithModuleId,
  getListOfModuleGroupByStatus,
  getListOfSystemSetting,
  getListOfContacts,
  getContactById,
  updateContactById,
  createContact,
  updateContact,
  deleteContact,
  getListOfAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  getListOfProposal,
  fetchProposalById,
  createProposalRecord,
  updateProposalById,
  deleteProposalById,
  handleDashboardsCardsData,
  handleDashboardsChartsData,
  getListOfLeadsWithOwner,
  leadGroupedByPipeline,
  getListOfOpportunity,
  getLeadById,
  getListOfProject,
  getListOfInvoice,
  getListOfUsers,
  getListOfTasks,
  getListOfTasksById,
  getListOfPermissions,
  sendMailToClientForConfirmation,
  confirmClientIntoProject,
  getLeadKenbenViewData,
  getLeadByStatusCount,
  getListOfModuleStatus,
  createOpportunityRecord,
  updateOpportunity,
  getRelatedRecordByRelatedToId,
  getRelatedTaskEventNotes,
  getListOfPipeline,
  updateModuleOwners,
  retriveTodayTaskAndEvent,
  getListOfProposalMinimal,
  deleteOpportunity,
  getNotificationsList,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getLeadsStatusByPipeline,
  getLeadAndStatusByPipeline,
  retriveAllRelatedActivities,
  createRelatedAttachment,
  updateRelatedAttachment,
  deleteAttachmentById,
  createTask,
  updateTask,
  deleteTaskById,
  createEevnt,
  updateEvent,
  deletEeventById,
  createNote,
  updateNote,
  deleteNoteById,
  downloadFile,
  getPipelineById,
  getrelatedRecordByAccountId,
  getrelatedRecordByContactId,
  getrelatedRecordByProjectId,
  getrelatedRecordByTaskId,
  getAllModuleStatus,
  createGroupsAndPermissions,
  updateGroupsAndPermissions,
  createNotifications,
  updateNotification,
  getListOfGroupsPermissionsById,
  getAllModule,
  getUserById,
  createUser,
  updateUser,
  deleteUserById,
  getListOfUsersWithPermissions,
  deletePermissions,
  updateListOfModuleStatus,
  sendEmail,
  generateBackup, getListOfBackup,
  loginAsUser,getKenbenViewDetails,
  getListOfLedgers, getLedgerRecordById, createLedger, updateLedger,deleteLedgers,
  getListOfStockItems,getInventoryHistory,
  getListOfVoucher,
  getListOfOrder,getOrderDetailDataById, getOrderOLIDetailById,getDefaultOrderSettings, getNextOrderNumber, 
  createOrder,createOrderLineItem, deleteOrder,getOrderRecordById, updateOrder, deleteAllLineItemsForOrder,

  getAllSettings,getAllCompanies,getListOfFinancialYear,updateSettingRecord,
};
