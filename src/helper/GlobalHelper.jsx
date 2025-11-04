import { useMemo, useState } from "react";
import AccountModal from "../pages/account/AccountModal"
import ContactModal from "../pages/contact/ContactModal"
import TaskModal from "../pages/task/TaskModal";
import UserModal from "../pages/users/UserModal";
import OpportunityModal from "../pages/opportunity/OpportunityModal";
import PermissionModal from "../pages/permission/PermissionModal";
//import SettingModal from "../pages/setting/SettingModal";
import moment from "moment";
import CategoryModal from "../pages/category/CategoryModal ";
import ProductModal from "../pages/product/ProductModal";
import LedgersModal from "../pages/ledgers/LedgersModal";
import OrderModal from "../pages/order/OrderModal";
import EditOrder from "../pages/order/EditOrder";
import LeadModal from "../pages/lead/LeadModal";
//import EmailTemplateModal from "../pages/setting/EmailTemplateModal";
import { data } from "react-router-dom";


let useSortableSearchableData = (data) => {

  const [searchText, setSearchText] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const toggleSort = (key) =>
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));

  const sortedData = useMemo(() => {
    
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const getValue = (item) =>
        sortConfig.key === "_index" ? data.indexOf(item) : item?.[sortConfig.key];

      let aVal = getValue(a);
      let bVal = getValue(b);

      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      return (
        (aVal > bVal ? 1 : aVal < bVal ? -1 : 0) *
        (sortConfig.direction === "asc" ? 1 : -1)
      );
    });
  }, [data, sortConfig]);

  const filteredData = useMemo(() => {
    if (!searchText) return sortedData;
    return sortedData.filter((row) =>
      Object.values(row).some((val) =>
        val?.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [sortedData, searchText]);
  return {
    searchText,
    setSearchText,
    sortConfig,
    toggleSort,
    sortedData,
    filteredData
  };
};

let GROUPALIAS = [
  { system: "SYS_ADMIN", label: "System Admin" },
  { system: "HR", label: "Human Resource" },
  { system: "Acccount", label: "Accounting" }
]

let GlobalEditModal = ({ type, show, onHide, rowData, setRefreshTable, mode }) => {
  switch (type) {
    case "Lead":
      return <LeadModal show={show} onHide={onHide} rowData={rowData} mode={mode ? mode : "edit"} setRefreshTable={setRefreshTable}/> 
    case "Account":
      return <AccountModal show={show} onHide={onHide} rowData={rowData} setRefreshTable={setRefreshTable} />;
    case "Contact":
      return <ContactModal show={show} onHide={onHide} rowData={rowData} setRefreshTable={setRefreshTable} />;
    case "Tasks":
      return <TaskModal show={show} onHide={onHide} rowData={rowData} setRefreshTable={setRefreshTable} />
    case "Users":
      return <UserModal show={show} onHide={onHide} rowData={rowData} setRefreshTable={setRefreshTable} />
    case "Permission":
      return <PermissionModal show={show} onHide={onHide} rowData={rowData} setRefreshTable={setRefreshTable} />
    case "Setting":
      return <SettingModal show={show} onHide={onHide} rowData={rowData} setRefreshTable={setRefreshTable} />
    case "Opportunity":
      return <OpportunityModal show={show} onHide={onHide} rowData={rowData} setRefreshTable={setRefreshTable} />
    case "Category":
      return <CategoryModal show={show} onHide={onHide} rowData={rowData} setRefreshTable={setRefreshTable} />
    case "Ledger":
      return <LedgersModal show={show} onHide={onHide} rowData={rowData} setRefreshTable={setRefreshTable} />
    case "Product":
      return <ProductModal show={show} onHide={onHide} rowData={rowData} setRefreshTable={setRefreshTable} />  
    case "EmailTemplate":
      return <EmailTemplateModal show={show} onHide={onHide} rowData={rowData} setRefreshTable={setRefreshTable} />  
    default:
      return null;
  }
};

/** 
   * @date : 03-march-2025
   * @description : Converts all "" (empty string) values in an object to null to prevent server errors caused by empty string fields. 
   */
const formateEmptyFields = (data) => {
  const formattedData = { ...data };
  Object.keys(formattedData).forEach((key) => {
    if (formattedData[key] === "") {
      formattedData[key] = null;
    }
  });
  return formattedData;
};

const detailFieldMap = {
  
  Lead: [
    { section: "Personal Details", label: "Reference Number", key: "reference_id" },
    { section: "Personal Details", label: "Salutation", key: "salutation" },
    { section: "Personal Details", label: "First Name", key: "first_name" },
    { section: "Personal Details", label: "Last Name", key: "last_name" },
    { section: "Personal Details", label: "Email", key: "email" },
    { section: "Personal Details", label: "Phone", key: "phone" },
    { section: "Personal Details", label: "Mobile", key: "mobile" },
    { section: "Personal Details", label: "Job Title", key: "title" },
    { section: "Personal Details", label: "Gender", key: "gender" },
    { section: "Personal Details", label: "Country / Region", key: "country" },
    { section: "Personal Details", label: "State / Province", key: "state" },
    { section: "Personal Details", label: "City", key: "city" },
    { section: "Personal Details", label: "Street", key: "street" },
    { section: "Personal Details", label: "Zip/Postal Code", key: "zip_code" },
    { section: "Basic Lead Information", label: "Lead Source", key: "lead_source" },
    { section: "Basic Lead Information", label: "Lead Interested In", key: "lead_interested_in" },
    { section: "Basic Lead Information", label: "Lead Status", key: "lead_status" },
    { section: "Basic Lead Information", label: "Rating", key: "rating" },
    { section: "Basic Lead Information", label: "Lead Owner", key: "owner_id", render: (data, owners) => owners?.find(o => o.id === data?.owner_id)?.name || "" },
    { section: "Basic Lead Information", label: "Description", key: "description" },
    { section: "Other Details", label: "Conpany Master", key: "conpany_master", render: (data, owners, groups, account) => account?.find(a => a.id === data?.account_id)?.name || ""   },
    { section: "Other Details", label: "Business Partner", key: "business_partner", render: (data, owners, groups, account, contact) => contact?.find(c => c.id === data?.contact_id)?.name || ""   },
    { section: "Other Details", label: "Website", key: "website" },
    { section: "Other Details", label: "Industry", key: "industry" },
  ],
  Account: [
    { section: "About", label: "Name", key: "name" },
    { section: "About", label: "Owner", key: "owner_id", render: (data, owners) => owners?.find(o => o.id === data?.owner_id)?.name || "" },
    { section: "About", label: "Organization Name", key: "organization_name" },
    { section: "About", label: "GST Details", key: "gst_details" },
    { section: "About", label: "CIN No.", key: "cin_no" },
    { section: "About", label: "Currency", key: "currency" },
    { section: "About", label: "Website", key: "website" },
    { section: "About", label: "Email", key: "email" },
    { section: "About", label: "Phone", key: "phone" },
    { section: "About", label: "Type", key: "type" },
    { section: "About", label: "Fax", key: "fax" },
    { section: "About", label: "Block", key: "block" },
    
    { section: "Address", label: "Country", key: "country" },
    { section: "Address", label: "State/Province", key: "state" },
    { section: "Address", label: "City", key: "city" },
    { section: "Address", label: "Area", key: "area" },
    { section: "Address", label: "Street", key: "street" },
    { section: "Address", label: "Landmark", key: "landmark" }, 
    { section: "Address", label: "Zip/Postal Code", key: "zip_code" },
    { section: "Address", label: "Description", key: "description" },
  ],
  Contact: [
    { section: "About", label: "Company Master", key: "account_id", render: (data, owners, groups, account) => account?.find(a => a.id === data?.account_id)?.name || ""  },
    { section: "About", label: "Type", key: "type" },
    { section: "About", label: "First Name", key: "first_name" },
    { section: "About", label: "Last Name", key: "last_name" },
    { section: "About", label: "Owner", key: "owner_id", render: (data, owners) => owners?.find(o => o.id === data?.owner_id)?.name || "" },
    { section: "About", label: "Email", key: "email" },
    { section: "About", label: "Mobile", key: "mobile" },
    { section: "About", label: "Phone", key: "phone" },
    { section: "About", label: "Birthday", key: "birthday", render: (data) => data?.birthday ? moment(data?.birthday).format("DD MMM YYYY") : "", },
    { section: "About", label: "Contact Person", key: "contact_person" },
    { section: "About", label: "Currency", key: "currency" },
    { section: "About", label: "Payment Term", key: "payment_term" },
    { section: "About", label: "EGCG Term", key: "egcg_term" },
    { section: "About", label: "Policy No.", key: "policy_no" },
    { section: "About", label: "Policy Expiry Date", key: "policy_expiry_date", render: (data) => data?.policy_expiry_date ? moment(data?.policy_expiry_date).format("DD MMM YYYY") :"", },
    { section: "About", label: "Buying Agent", key: "buying_agent" },
    { section: "About", label: "Status", key: "status" },

    { section: "Billing & Shipping Address", label: "Billing Street", key: "billing_street" },
    { section: "Billing & Shipping Address", label: "Shipping Street", key: "shipping_street" },
    { section: "Billing & Shipping Address", label: "Billing City", key: "billing_city" },
    { section: "Billing & Shipping Address", label: "Shipping City", key: "shipping_city" },
    { section: "Billing & Shipping Address", label: "Billing State", key: "billing_state" },
    { section: "Billing & Shipping Address", label: "Shipping State", key: "shipping_state" },
    { section: "Billing & Shipping Address", label: "Billing Country", key: "billing_country" },
    { section: "Billing & Shipping Address", label: "Shipping Country", key: "shipping_country" },

    { section: "Address", label: "City", key: "city" },
    { section: "Address", label: "State/Province", key: "state" },
    { section: "Address", label: "Country", key: "country" },
    { section: "Address", label: "Street", key: "street" },
    { section: "Address", label: "Zip/Postal Code", key: "zip" },
    { section: "Address", label: "Description", key: "description" },
  ],
  Opportunity: [
    { section: "Opportunity Details", label: "Opportunity ID", key: "referenced_id" },
    { section: "Opportunity Details", label: "Name", key: "name" },
    { section: "Opportunity Details", label: "Owner", key: "owner_id", render: (data, owners) => owners?.find(o => o.id === data?.owner_id)?.name || "" },
    { section: "Opportunity Details", label: "Buyer Name", key: "contact_id" , render: (data, owners, groups, account, contact) => contact?.find(c => c.id === data?.contact_id)?.name || "" },
    { section: "Opportunity Details", label: "Contact Person", key: "contact_person" },
    { section: "Opportunity Details", label: "Product", key: "product" },
    { section: "Opportunity Details", label: "Buying Agent", key: "buying_agent" },
    { section: "Opportunity Details", label: "Status", key: "status" },
    { section: "Opportunity Details", label: "Type", key: "type" },
    { section: "Opportunity Details", label: "Lead Source", key: "lead_source" },
    { section: "Opportunity Details", label: "Stage Duration", key: "stage_duration" },
    { section: "Opportunity Details", label: "Amount", key: "amount" },
    { section: "Opportunity Details", label: "Probability", key: "probability" },
    { section: "Opportunity Details", label: "Forecast Category", key: "forecast_category" },
    { section: "Opportunity Details", label: "Start Date", key: "start_date", render: (data) => data?.start_date ? moment(data?.start_date).format("DD MMM YYYY") : "", },
    { section: "Opportunity Details", label: "Close Date", key: "close_date", render: (data) => data?.close_date ? moment(data?.close_date).format("DD MMM YYYY") : "", },
    { section: "Opportunity Details", label: "Is Closed", key: "is_closed" },
    { section: "Opportunity Details", label: "Is Won", key: "is_won" },
    { section: "Opportunity Details", label: "Company Master", key: "account_id", render: (data, owners, groups, account) => account?.find(a => a.id === data?.account_id)?.name || "" },
    { section: "Opportunity Details", label: "Country", key: "country" },
    { section: "Opportunity Details", label: "Next Step", key: "next_step" },
    { section: "Opportunity Details", label: "Description", key: "description" },
  ],
  User: [
    { section: "Basic Info", label: "Name", key: "name" },
    { section: "Basic Info", label: "Email", key: "email" },
    { section: "Basic Info", label: "Password", key: "password" },
    { section: "Basic Info", label: "Status", key: "status" },
    { section: "Basic Info", label: "Role Name", key: "role_name" },
    { section: "Basic Info", label: "Group", key: "group_id", render: (data, owners, groups) => groups?.find(g => g.id === data?.group_id)?.name || "" },
    { section: "Basic Info", label: "Company", key: "compony_id" },
    { section: "Basic Info", label: "Description", key: "description" },
  ],
  Task: [
    { section: "Basic Info", label: "Name", key: "name" },
    {
      section: "Basic Info",
      label: "Owner",
      key: "owner_id",
      render: (data, owners) => owners?.find(o => o.id === data?.owner_id)?.name || ""
    },
    { section: "Basic Info", label: "Status", key: "status" },
    { section: "Basic Info", label: "Priority", key: "priority" },
    {
      section: "Basic Info",
      label: "Start Date",
      key: "start_date",
      render: (data) => data?.start_date ? moment(data?.start_date).format("DD MMM YYYY") : "",
    },
    {
      section: "Basic Info",
      label: "End Date",
      key: "end_date",
      render: (data) => data?.end_date ? moment(data?.end_date).format("DD MMM YYYY") : "",
    },
    { section: "Basic Info", label: "Amount", key: "task_amount" },
    { section: "Basic Info", label: "Estimated Time", key: "estimated_time" },
    { section: "Basic Info", label: "Description", key: "description" },
  ],
  Category: [
    { section: "Category Detail", label: "Name", key: "name" },
    { section: "Category Detail", label: "Status", key: "status" },
    { section: "Category Detail", label: "Description", key: "description" },
  ],
  Ledger: [
    { section: "Ledgers Detail", label: "Name", key: "name" },
    { section: "Ledgers Detail", label: "Company Name", key: "company_name" },
    { section: "Ledgers Detail", label: "State", key: "state__c" },
    { section: "Ledgers Detail", label: "Closing Balance", key: "closing_balance__c" },
    { section: "Ledgers Detail", label: "Legacy Alterid", key: "legacy_alterid__c" },
    { section: "Ledgers Detail", label: "Master Id", key: "master_id__c" }
  ],
  Order: [
    { section: "Order Detail", label: "Order Date", key: "order_date__c", render: (data) => data?.order_date__c ? moment(data?.order_date__c).format("DD MMM YYYY") : "", },
    { section: "Order Detail", label: "Order Number", key: "name" },
    { section: "Order Detail", label: "Type", key: "type__c" },
    { section: "Order Detail", label: "Status", key: "status__c" },
    { section: "Order Detail", label: "Party Ledger", key: "ledger_name" },
    { section: "Order Detail", label: "Purchase Ledger", key: "sales_ledger_name" },
    { section: "Order Detail", label: "Total Amount", key: "total_amount__c" },
  ],
  Product: [
    { section: "Product Detail", label: "Name", key: "name" },
    { section: "Product Detail", label: "Category", key: "category_id", render: (data, owners, groups, account, contact, categorys) => categorys?.find(c => c.id === data?.category_id)?.name || "" },
    { section: "Product Detail", label: "Size", key: "size" },
    { section: "Product Detail", label: "Unit", key: "unit" },
    { section: "Product Detail", label: "Description", key: "description" },
    { section: "Product Detail", label: "Is Featured", key: "is_featured" },
    { section: "Product Detail", label: "Status", key: "status" },
    { section: "Product Detail", label: "Product Code", key: "product_code" },
    { section: "Product Detail", label: "Expiry Date", key: "expiry_date", render: (data) => data?.expiry_date ? moment(data?.expiry_date).format("DD MMM YYYY") : "", },
    { section: "Product Appearance", label: "Image URL", key: "image_url" },
    { section: "Tax & Prices Detail", label: "Is Tax Inclusive", key: "is_tax_inclusive" },
    { section: "Tax & Prices Detail", label: "Tax", key: "tax" },
    { section: "Tax & Prices Detail", label: "Tax Type", key: "tax_type" },
    { section: "Tax & Prices Detail", label: "Actual Price", key: "actual_price" },
    { section: "Tax & Prices Detail", label: "Selling Price", key: "selling_price" },
  ],
  EmailTemplate: [
    { section: "Email Template Detail", label: "Name", key: "name" },
    { section: "Email Template Detail", label: "Subject", key: "subject" },
    { section: "Email Template Detail", label: "Status", key: "status" },
  ]

};

export { useSortableSearchableData, GlobalEditModal, formateEmptyFields, detailFieldMap, GROUPALIAS }