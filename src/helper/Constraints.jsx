import { FaHome, FaInfoCircle, FaBuilding, FaPhone, FaFileAlt, FaTasks, FaBan, FaCalendarAlt, FaUser, FaTachometerAlt, FaChartPie, FaCog } from "react-icons/fa";
import { FaCrown } from "react-icons/fa";
import { FaCompass } from "react-icons/fa";
import { HiBuildingOffice2 } from "react-icons/hi2";
import { BiSolidCategoryAlt, BiSolidPhoneCall, BiSolidBookContent, BiCopyAlt,BiShoppingBag, BiSolidCog } from "react-icons/bi";
import { FaProductHunt } from "react-icons/fa6";

const API_BASE_URL = 'http://localhost:8080/api/v1';

const JWT_SECRET_KEY = 'RATA$n2$tex3til$@e';
const MODULES_ALIAS = [
    {
        label : "Lead",
        value : "lead"
    },
    {
        label : "Account",
        value : "account"
    },
    {
        label : "Contact",
        value : "contact"
    },
    {
        label : "Category",
        value : "category"
    },
    {
        label : "Ledgers",
        value : "Ledgers"
    },
    {
        label : "StockItems",
        value : "StockItems"
    },
    {
        label : "Vouchers",
        value : "Vouchers"
    },
    {
        label : "Product",
        value : "product"
    },
    {
        label : "Opportunity",
        value : "opportunity"
    },
    {
        label : "User",
        value : "user"
    },
    {
        label : "Task",
        value : "task"
    }
]
const SIDEBAR_MENUS = [
    {
        title: "Dashboard",
        icon: <FaHome fontSize={18} className='mx-2 mb-1' />,
        redirect: "/",
        isActive: true,
        permissionKey: "dashboard",
        isKenBenViewPresent : false
    },
    {
        title: "Project Master",
        icon: <FaCompass fontSize={18} className='mx-2 mb-1' />,
        redirect: "/project_master",
        isActive: false,
        permissionKey: "project_master",
        isKenBenViewPresent : false
    },
    {
        title: "Lead Master",
        icon: <FaInfoCircle fontSize={18} className='mx-2 mb-1' />,
        redirect: "/lead",
        isActive: false,
        permissionKey: "lead",
        isKenBenViewPresent : false
    },
    {
        title: "Account Master",
        icon: <HiBuildingOffice2 fontSize={18} className='mx-2 mb-1' />,
        redirect: "/account",
        isActive: false,
        permissionKey: "account",
        isKenBenViewPresent : false
    },
    {
        title: "Contact Master",
        icon: <BiSolidPhoneCall fontSize={18} className='mx-2 mb-1' />,
        redirect: "/contact",
        isActive: false,
        permissionKey: "contact",
        isKenBenViewPresent : false
    },
    {
        title: "Email Template",
        icon: <BiSolidPhoneCall fontSize={18} className='mx-2 mb-1' />,
        redirect: "/email_template",
        isActive: false,
        permissionKey: "email_template",
        isKenBenViewPresent : false
    },
    {
        title: "Active Deals",
        icon: <FaCrown fontSize={18} className='mx-2 mb-1' />,
        redirect: "/opportunity",
        isActive: false,
        permissionKey: "opportunity",
        isKenBenViewPresent : false
    },
    {
        title: "Category Master",
        icon: <BiSolidCategoryAlt fontSize={18} className='mx-2 mb-1' />,
        redirect: "/category_master",
        isActive: false,
        permissionKey: "category",
        isKenBenViewPresent : false
    },
    {
        title: "Ledgers",
        icon: <BiSolidBookContent fontSize={18} className='mx-2 mb-1' />,
        redirect: "/ledgers",
        isActive: false,
        permissionKey: "ledgers",
        isKenBenViewPresent : false
    },
    {
        title: "Stock Items",
        icon: <BiSolidCategoryAlt fontSize={18} className='mx-2 mb-1' />,
        redirect: "/stockItem",
        isActive: false,
        permissionKey: "stock_items",
        isKenBenViewPresent : false
    },
    {
        title: "Vouchers",
        icon: <BiCopyAlt fontSize={18} className='mx-2 mb-1' />,
        redirect: "/vouchers",
        isActive: false,
        permissionKey: "vouchers",
        isKenBenViewPresent : false
    },
    {
        title: "Orders",
        icon: <BiShoppingBag fontSize={18} className='mx-2 mb-1' />,
        redirect: "/orders",
        isActive: false,
        permissionKey: "orders",
        isKenBenViewPresent : false
    },
    {
        title: "Settings",
        icon: <BiSolidCog fontSize={18} className='mx-2 mb-1' />,
        redirect: "/setting",
        isActive: false,
        permissionKey: "setting",
        isKenBenViewPresent : false
    },
    {
        title: "Product Master",
        icon: <FaProductHunt fontSize={18} className='mx-2 mb-1' />,
        redirect: "/product_master",
        isActive: false,
        permissionKey: "product",
        isKenBenViewPresent : false
    },
    {
        title: "Group Permissions",
        icon: <FaBan fontSize={18} className='mx-2 mb-1' />,
        redirect: "/permissions",
        isActive: false,
        permissionKey: "permissions",
        isKenBenViewPresent : false
    },
    {
        title: "User Management",
        icon: <FaUser fontSize={18} className='mx-2 mb-1' />,
        redirect: "/users",
        isActive: false,
        permissionKey: "user_management",
        isKenBenViewPresent : false
    },
    {
        title: "Tasks Management",
        icon: <FaTasks fontSize={18} className='mx-2 mb-1' />,
        redirect: "/tasks",
        isActive: false,
        permissionKey: "task",
        isKenBenViewPresent : false
    },
    {
        title: "Events & Calendar",
        icon: <FaCalendarAlt fontSize={18} className='mx-2 mb-1' />,
        redirect: "/events",
        isActive: false,
        permissionKey: "calendar",
        isKenBenViewPresent : false
    },
    {
        title: "System Settings",
        icon: <FaCog fontSize={18} className='mx-2 mb-1' />,
        redirect: "/settings",
        isActive: false,
        permissionKey: "settings",
        isKenBenViewPresent : false
    },
    {
        title: "Reports & Analytics",
        icon: <FaTachometerAlt fontSize={18} className='mx-2 mb-1' />,
        redirect: "/reports",
        isActive: false,
        permissionKey: "reports_and_dashboards",
        isKenBenViewPresent : false
    },
    {
        title: "Backup",
        icon: <FaTachometerAlt fontSize={18} className='mx-2 mb-1' />,
        redirect: "/backup",
        isActive: false,
        permissionKey: "backup",
        isKenBenViewPresent : false
    }
];

let PIPELINE_DETAILS = [
    { title: "Lead - CSP", leadsCount: 50, chartPercentage: 50 },
    { title: "Lead - ATC", leadsCount: 50, chartPercentage: 50 },
    { title: "Lead - IWM", leadsCount: 50, chartPercentage: 50 },
    { title: "Lead - Others", leadsCount: 50, chartPercentage: 50 },
];

let KENBEN_VIEW_DATA = [
    {
        id: 1,
        lead_name: "Rahul Sharma",
        stage: "Interested",
        phone: "+91-9876543210",
        email: "rahul.sharma@example.com",
        zipcode: "110001"
    },
    {
        id: 2,
        lead_name: "Priya Verma",
        stage: "Contacted",
        phone: "+91-9123456789",
        email: "priya.verma@example.in",
        zipcode: "400001"
    },
    {
        id: 3,
        lead_name: "Amit Joshi",
        stage: "Negotiation",
        phone: "+91-9988776655",
        email: "amit.joshi@example.org",
        zipcode: "560001"
    },
    {
        id: 4,
        lead_name: "Sneha Kapoor",
        stage: "Converted",
        phone: "+91-9012345678",
        email: "sneha.kapoor@example.com",
        zipcode: "600001"
    },
    {
        id: 5,
        lead_name: "Vikram Mehta",
        stage: "Lost",
        phone: "+91-9345612780",
        email: "vikram.mehta@example.in",
        zipcode: "700001"
    },
    {
        id: 6,
        lead_name: "Anjali Singh",
        stage: "New",
        phone: "+91-9765432101",
        email: "anjali.singh@example.com",
        zipcode: "302001"
    },
    {
        id: 7,
        lead_name: "Rohan Desai",
        stage: "Interested",
        phone: "+91-9823456780",
        email: "rohan.desai@example.net",
        zipcode: "380001"
    },
    {
        id: 8,
        lead_name: "Neha Nair",
        stage: "Contacted",
        phone: "+91-9654321876",
        email: "neha.nair@example.in",
        zipcode: "682001"
    },
    {
        id: 9,
        lead_name: "Karan Malhotra",
        stage: "Negotiation",
        phone: "+91-9345098765",
        email: "karan.malhotra@example.com",
        zipcode: "500001"
    },
    {
        id: 10,
        lead_name: "Divya Iyer",
        stage: "Converted",
        phone: "+91-9012987654",
        email: "divya.iyer@example.org",
        zipcode: "641001"
    }
];

let LEAD_INDUSTRY = [
    {
        label: "none",
        value: "None"
    },
    {
        label: "trading",
        value: "Trading"
    },
    {
        label: "manufacturing",
        value: "Manufacturing"
    },
    {
        label: "construction",
        value: "Construction"
    },
    {
        label: "transports",
        value: "Transports"
    },
    {
        label: "it_and_networks",
        value: "IT & Networks"
    },
    {
        label: "it_and_networks",
        value: "IT & Networks"
    },
    {
        label: "service",
        value: "Service"
    },
    {
        label: "hardware_and_tools",
        value: "Hardware & Tools"
    },
    {
        label: "chemicals",
        value: "Chemicals"
    },
    {
        label: "jewellery",
        value: "Jewellery"
    },
    {
        label: "utilities",
        value: "Utilities"
    },
    {
        label: "government",
        value: "Government"
    },
    {
        label: "others",
        value: "Others"
    }

]

let LEAD_RATING = [
    {
        label: "none",
        value: "None"
    },
    {
        label: "acquired",
        value: "Acquired"
    },
    {
        label: "active",
        value: "Active"
    },
    {
        label: "market_failed",
        value: "Market Failed"
    },
    {
        label: "project_cancelled",
        value: "Project Cancelled"
    },
    {
        label: "shut_down",
        value: "Shut Down"
    }
]

let OTHER_INTERESTS = [
    {
        label: "none",
        value: "None"
    },
    {
        label: "investment",
        value: "Investment"
    },
    {
        label: "m_and_a",
        value: "M & A"
    },
    {
        label: "recruitment",
        value: "Recruitment"
    },
    {
        label: "real_estate",
        value: "Real Estate"
    },
    {
        label: "atc",
        value: "ATC"
    },
    {
        label: "others",
        value: "Others"
    }
]

let LEAD_SOURCE = [
    { label: "Website", value: "Website" },
    { label: "Referral", value: "Referral" },
    { label: "Social Media", value: "Social Media" },
    { label: "Email Campaign", value: "Email Campaign" },
    { label: "Advertisement", value: "Advertisement" },
    { label: "Trade Show", value: "Trade Show" },
    { label: "Cold Call", value: "Cold Call" },
    { label: "Inbound Call", value: "Inbound Call" },
    { label: "Partner", value: "Partner" },
    { label: "Direct Traffic", value: "Direct Traffic" },
    { label: "Organic Search", value: "Organic Search" },
    { label: "Paid Search", value: "Paid Search" },
    { label: "Other", value: "Other" }
];

const tableHeaders = [
    { key: "name", show: true, label: "Name", sortable: true, kenben: true },
    { key: "phone", show: true, label: "Phone", kenben: true },
    { key: "email", show: true, label: "Email", kenben: true },
    { key: "lead_status", show: true, label: "Status" },
    { key: "createddate", show: true, label: "Created Date" },
    { key: "account_email", show: false, label: "Account Email" },
    { key: "account_name", show: false, label: "Account Name" },
    { key: "account_phone", show: false, label: "Account Phone" },
    { key: "advanced_amount", show: false, label: "Advanced Amount" },
    { key: "amount", show: false, label: "Amount" },
    { key: "annual_revenue", show: false, label: "Annual Revenue" },
    { key: "city", show: false, label: "City" },
    { key: "converted_contact_id", show: false, label: "Converted Contact Id" },
    { key: "country", show: false, label: "Country" },
    { key: "createdby", show: false, label: "Created by" },
    { key: "currency", show: false, label: "Currency" },
    { key: "description", show: false, label: "Description" },
    { key: "email_opt_out", show: false, label: "Email Opt Out" },
    { key: "exchange_rate", show: false, label: "Exchange Rate" },
    { key: "fax", show: false, label: "Fax" },
    // { key: "form_id", show: false, label: "Form Id" },
    { key: "gender", show: false, label: "Gender" },
    { key: "industry", show: false, label: "Industry" },
    // { key: "is_won", show: false, label: "Is Won" },
    { key: "lastmodifiedby", show: false, label: "Last Modified by" },
    { key: "lastmodifieddate", show: false, label: "Last Modified Date" },
    { key: "lead_source", show: false, label: "Lead Source" },
    { key: "lead_source_name", show: false, label: "Lead Source Name" },
    { key: "lost_reason", show: false, label: "Lost Reason" },
    { key: "mobile", show: false, label: "Mobile" },
    { key: "no_of_employee", show: false, label: "No Of Employee" },
    { key: "other_intrests", show: false, label: "Other Intrests" },
    { key: "owner_name", show: true, label: "Owner" },
    // { key: "page_id", show: false, label: "Page Id" },
    { key: "payment_model", show: false, label: "Payment Model" },
    { key: "payment_terms", show: false, label: "Payment Terms" },
    { key: "rating", show: false, label: "Rating" },
    { key: "salutation", show: false, label: "Salutation" },
    {
        key: "specific_intrests_details",
        show: false,
        label: "Specific Intrests Details",
    },
    { key: "state", show: false, label: "State" },
    { key: "street", show: false, label: "Street" },
    { key: "title", show: false, label: "Title" },
    { key: "website", show: false, label: "Website" },
    { key: "zip_code", show: false, label: "Zip Code" },
];

let LEAD_INTERESTED_IN = [
     { label: "Equity Capital Markets", value: "Equity Capital Markets" },
    { label: "Debt Capital Markets", value: "Debt Capital Markets" },
    { label: "Mergers & Acquisitions", value: "Mergers & Acquisitions" },
]

export { API_BASE_URL, SIDEBAR_MENUS, PIPELINE_DETAILS, KENBEN_VIEW_DATA, LEAD_INDUSTRY, LEAD_RATING, OTHER_INTERESTS, LEAD_SOURCE, tableHeaders, MODULES_ALIAS, JWT_SECRET_KEY, LEAD_INTERESTED_IN }
