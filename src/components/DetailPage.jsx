import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Accordion, Container, Row, Col, Tab, Nav, Button, Carousel } from "react-bootstrap";
import { MdEdit, MdDelete, MdMail } from "react-icons/md";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { detailFieldMap } from "../helper/GlobalHelper";
import uvCapitalApi from "../api/uvCapitalApi";

import ChangeOwnerModal from "./ChangeOwnerModal";
import EmailModal from "./EmailModal";
import ConfirmationModal from "./ConfirmationModal";
import Activities from "./Activities";
import RelatedContact from "./RelatedContact";
import RelatedAccount from "./RelatedAccount";

import LeadModal from "../pages/lead/LeadModal";
import AccountModal from "../pages/account/AccountModal";
import ContactModal from "../pages/contact/ContactModal";
import UserModal from "../pages/users/UserModal";
import TaskModal from "../pages/task/TaskModal";
import OpportunityModal from "../pages/opportunity/OpportunityModal";
import ProductModal from '../pages/product/ProductModal';
import CategoryModal from '../pages/category/CategoryModal ';

import LedgersModal from '../pages/ledgers/LedgersModal';
import OrderModal from '../pages/order/OrderModal';

//import EmailTemplateModal from "../pages/setting/EmailTemplateModal";
import SalesPath from "./SalesPath";
import {MODULES_ALIAS} from "../helper/Constraints";
import { useAuthWrapper } from "../helper/AuthWrapper";

const fetchApiMap = {
  Lead: uvCapitalApi.getLeadById,
  Account: uvCapitalApi.getAccountById,
  Contact: uvCapitalApi.getContactById,
  User: uvCapitalApi.getUserById,
  Task: uvCapitalApi.getListOfTasksById,
  Opportunity: uvCapitalApi.getOpportunityById,
  Category: uvCapitalApi.getCategoryById,
  Product: uvCapitalApi.getProductById,
  EmailTemplate: uvCapitalApi.getTemplateById,
  Ledger : uvCapitalApi.getLedgerRecordById,
  Order : uvCapitalApi.getListOfOrder,
};

const deleteApiMap = {
  Lead: uvCapitalApi.deleteLead,
  Account: uvCapitalApi.deleteAccount,
  Contact: uvCapitalApi.deleteContact,
  User: uvCapitalApi.deleteUserById,
  Task: uvCapitalApi.deleteTaskById,
  Opportunity: uvCapitalApi.deleteOpportunity,
  Category: uvCapitalApi.deleteCategory,
  Product: uvCapitalApi.deleteProduct,
  EmailTemplate: uvCapitalApi.deleteTemplate,
  Ledger : uvCapitalApi.deleteLedgers,
  Order : uvCapitalApi.deleteOrder,
};

const modalMap = {
  Lead: LeadModal,
  Account: AccountModal,
  Contact: ContactModal,
  User: UserModal,
  Task: TaskModal,
  Opportunity: OpportunityModal,
  Category: CategoryModal,
  Product: ProductModal, 
  //EmailTemplate: EmailTemplateModal,
  Ledger: LedgersModal,
  Order: OrderModal,
};

const DetailPage = ({ refreshTable, setRefreshTable, permission = {}, type, refreshDetail }) => {

  const { id } = useParams();
  const navigate = useNavigate();
  // const type = window.location.pathname.split("/")[1];
  const [data, setData] = useState();
  const [owners, setOwners] = useState([]);
  const [groups, setGroups] = useState([]);
  const [account, setAccount] = useState([]);
  const [contact, setContact] = useState([]);
  const [category, setCategory] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [showEmailModal, setShowOEmailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [salesPath, setSalesPath] = useState([]);
  const [selectedStage, setSelectedStage] = useState();
  const [carouselIndex, setCarouselIndex] = useState(0);
  const { settingPermissions } = useAuthWrapper();
  const [systemSetting, setSystemSetting] = useState();
  const [relatedData, setRelatedData] = useState([]);
  const [ownerType, setOwnerType] = useState();
  const [accRelated, setAccRelated] = useState([]);

  useEffect(() => {
    
  if (settingPermissions) {
      const kenbanSettings = settingPermissions["Path Setting"];
      const setting = kenbanSettings?.find(
      item => item.module_id === permission?.id
      );
      setSystemSetting(setting?.is_activate);
  }
  }, [settingPermissions, permission?.id]);
    
  useEffect(() => {
    fetchAccountRlated(id);
    if (!id || !type) return;
    const fetchData = async () => {
      try {
        const fetchFunc = fetchApiMap[type];
        if (fetchFunc) {
          const res = await fetchFunc(id);
          if (res?.success) {
            if(type === "Lead" || type === "Opportunity"){
              const responseData = Array.isArray(res?.data) ? res?.data[0]?.related_data : res?.data?.related_data;
              setRelatedData(responseData)
              if(type === "Lead" ){
                setData(responseData?.lead);
              }else if(type === "Opportunity"){
                setData(responseData?.deal);
              }  
            }else{
              const responseData = Array.isArray(res?.data) ? res?.data[0] : res?.data;
              
              setData(responseData);      
            }
            setRefreshTable(false);
          }
        }
        const [ownersRes, groupsRes, accountRes, contactRes, categoryRec] = await Promise.all([
          uvCapitalApi.getListOfUsers(),
          uvCapitalApi.getListOfPermissions(),
          uvCapitalApi.getListOfAccounts(),
          uvCapitalApi.getListOfContacts(),
          uvCapitalApi.getListOfCategories(),
        ]);

        if (ownersRes.success) setOwners(ownersRes.data);
        if (groupsRes.success) setGroups(groupsRes.data);
        if (accountRes.success) setAccount(accountRes.data);
        if (contactRes.success) setContact(contactRes.data);
        if (categoryRec.success) setCategory(categoryRec.data);
      } catch (e) {
        console.error("Error loading detail:", e);
      }
    };

    fetchData();
  }, [id, type, refreshTable, refreshDetail]);

  const handleDelete = async () => {
    const deleteFunc = deleteApiMap[type];
    if (deleteFunc) {
      const res = await deleteFunc(id);
      if (res?.success) navigate(`/${type}`);
    }
  };

  const groupedFields = useMemo(() => {
    const fields = detailFieldMap[type] || [];
    return fields.reduce((acc, field) => {
      acc[field.section] = acc[field.section] || [];
      acc[field.section].push(field);
      
      return acc;
    }, {});
  }, [type]);

  const ModalComponent = modalMap[type];

  useEffect(() => {
    fetchModuleStatus();
  }, []);
  
  const fetchModuleStatus = async () => {
    const response = await uvCapitalApi.getListOfModuleStatus(permission?.id);
    if (response.success) {
      const formatted = response?.data
        .filter((item) => item.isactive)
        .map((item) => ({
          title: item.status,
          isActive: item.isactive,
          id: item.id,
        }));
      setSalesPath(formatted);
    }
  };

  const chunkedSlides = useMemo(() => {
    if (!salesPath || salesPath.length === 0) return [];
    const size = 6;
    const chunks = [];
    for (let i = 0; i < salesPath.length; i += size) {
      chunks.push(salesPath.slice(i, i + size));
    }
    return chunks;
  }, [salesPath]);

  const normalizeStatus = (str = "") =>
  str?.toLowerCase()?.replace(/[\s-/]+/g, "").trim();

const handleOwnerClick = (label) => {
  const found = MODULES_ALIAS.find(item => item.label === label);
  if (found) {
    setOwnerType(found.value);
    setShowOwnerModal(true);
  }
};

  const fetchAccountRlated = async (id) => {
        try {
          const response = await uvCapitalApi.getRelatedRecord(id, "contact", "child"); 
          setAccRelated(response?.data?.related_records?.contact_data)
        } catch (error) {
          console.log('Account related server error :', error);
        }
      }

  return (
    <Container style={{ position: "relative" }}>
      <div className="container px-md-4 mb-5 mt-5">
         {systemSetting && (
         chunkedSlides.length <= 1 ? (
            <Row className="px-5 justify-content-center mb-3">
              {salesPath?.map((item, j) => (
                <Col key={j} lg={2} className="d-flex justify-content-center">
                  <div onClick={() => setSelectedStage(item.title)} style={{ cursor: "pointer" }}>
                    <SalesPath
                      title={item?.title}
                      isActive={ normalizeStatus(item.title) === normalizeStatus(selectedStage || data?.lead_status || data?.status)}
                      salesPath={salesPath}
                      setSalesPath={setSalesPath}
                      index={j}
                      className="custom-carousel"
                    />
                  </div>
                </Col>
              ))}
            </Row>
          ) : (
            <Carousel
              data-bs-theme="dark"
              interval={null}
              indicators={false}
              activeIndex={carouselIndex}
              onSelect={(selectedIndex) => setCarouselIndex(selectedIndex)}
              className="mb-3"
            >
              {chunkedSlides?.map((group, i) => (
                <Carousel.Item key={i}>
                  <Row className="px-5 justify-content-center">
                    {group?.map((item, j) => (
                      <Col key={j} lg={2} className="d-flex justify-content-center">
                        <div
                          onClick={() => setSelectedStage(item.title)}
                          style={{ cursor: "pointer" }}
                        >
                          <SalesPath
                            title={item.title}
                            isActive={
                          normalizeStatus(item.title) ===
                          normalizeStatus(selectedStage || data?.lead_status)
                        }
                            salesPath={salesPath}
                            setSalesPath={setSalesPath}
                            index={j}
                            className="custom-carousel"
                          />
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Carousel.Item>
              ))}
            </Carousel>
          ))}
        <Tab.Container defaultActiveKey="details">
          <div className="d-flex justify-content-between align-items-center tabStyle rounded-top">
            <Nav variant="tabs">
              <Nav.Item><Nav.Link eventKey="details">Details</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="related">Related</Nav.Link></Nav.Item>
            </Nav>
            <div>
              {permission.update && (
                <Button className="btn btn-sm btn-light rounded-3 me-2 px-1" onClick={() => setShowEditModal(true)} title="Edit">
                  <MdEdit className="fs-5" />
                </Button>
              )}
              {permission.delete && (
                <Button className="btn btn-sm btn-light rounded-3 me-2 px-1" onClick={() => setShowDeleteModal(true)} title="Delete">
                  <MdDelete className="fs-5" />
                </Button>
              )}
              {permission.owner && (
                <Button className="btn btn-sm btn-light rounded-3 me-2 px-1" onClick={() => handleOwnerClick(type)} title="Change Owner">
                  <AiOutlineUsergroupAdd className="fs-5" />
                </Button>
              )}
              {permission.update && (
                <Button className="btn btn-sm btn-light rounded-3 me-2 px-1" onClick={() => setShowOEmailModal(true)} title="Change Owner">
                  <MdMail  className="fs-5" />
                </Button>
              )}
            </div>
          </div>
          <Tab.Content>
            <Tab.Pane eventKey="details">
              <Accordion defaultActiveKey={type?.includes('Product') ? ["0", "1"] : ['0']} alwaysOpen className="detail-h2 detail-h3">
                {Object.entries(groupedFields).map(([section, sectionFields], index) => (
                  <Accordion.Item eventKey={String(index)} key={section}>
                    <Accordion.Header className="border border-2">{section}:</Accordion.Header>
                    <Accordion.Body>
                      <Container>
                        {sectionFields.reduce((acc, curr, i) => {
                          if (i % 2 === 0) acc.push([curr]);
                          else acc[acc.length - 1].push(curr);
                          return acc;
                        }, []).map((pair, idx) => (
                          <Row className="my-3" key={idx}>
                            {pair.map((f, i) => (
                              <Col key={i} className={`border-bottom ${i === 0 ? "me-5" : "ms-5"}`}>
                                <Row>
                                  <Col><strong>{f.label}:</strong></Col>
                                  <Col>{f.render ? f.render(data, owners, groups, account, contact, category) : (f.label.includes('Image') ? <img src={data?.[f.key]} alt="Not Found" height={"100px"} />: data?.[f.key]  || "")}</Col>
                                </Row>
                              </Col>
                            ))}
                            {pair.length === 1 && <Col className="border-bottom ms-5" />}
                          </Row>
                        ))}
                      </Container>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Tab.Pane>
            
            {/* Related */}
            {(location.pathname.includes("/lead/view/") || location.pathname.includes("/opportunity/view/")) &&
            <Tab.Pane eventKey="related">
                <Accordion
                  defaultActiveKey={["0", "1"]}
                  alwaysOpen
                  className="detail-h2 detail-h3"
                >
                  <Accordion.Item eventKey="0">
                    <Accordion.Header className="border border-2 ">
                      Account:
                    </Accordion.Header>
                    <Accordion.Body>
                      <RelatedAccount accountList={relatedData?.account ? [relatedData?.account] : []} />
                    </Accordion.Body>
                  </Accordion.Item>
                  <Accordion.Item eventKey="1">
                    <Accordion.Header className="border border-2 ">
                      Contact:
                    </Accordion.Header>
                    <Accordion.Body>
                      <RelatedContact contactList={relatedData?.contact ? [relatedData?.contact] : []} />
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
            </Tab.Pane>}
            {location.pathname.includes("/account/view/") &&
            <Tab.Pane eventKey="related">
                <Accordion
                  defaultActiveKey={["0"]}
                  alwaysOpen
                  className="detail-h2 detail-h3"
                >
                  <Accordion.Item eventKey="0">
                    <Accordion.Header className="border border-2 ">
                      Contact:
                    </Accordion.Header>
                    <Accordion.Body>
                      <RelatedContact contactList={accRelated ? accRelated : []} />
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
            </Tab.Pane>}
          </Tab.Content>
        </Tab.Container>

        {/* Modals */}
        {ModalComponent && (
          <ModalComponent
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
            rowData={data}
            setRefreshTable={setRefreshTable}
            mode={data?.id ? "edit" : "create"}
          />
        )}

        <ChangeOwnerModal
          show={showOwnerModal}
          onHide={() => setShowOwnerModal(false)}
          selectedRows={[data]}
          type={ownerType}
          setRefreshTable={setRefreshTable}
        />

        <EmailModal show={showEmailModal} onHide={() => setShowOEmailModal(false)} />

        <ConfirmationModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title={`Delete ${type}`}
          message={`Are you sure you want to delete this ${type}?`}
          confirmText="Delete"
          cancelText="Cancel"
        />

        {/* Activity Logs */}
        <Activities relatedToId={id} permission={permission} refreshTable={refreshTable} />
      </div>
    </Container>
  );
};

export default DetailPage;