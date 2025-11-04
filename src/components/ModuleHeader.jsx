import { Col, Container, Row } from 'react-bootstrap'
import { Fragment, useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
import LeadConvertModal from './LeadConvertModal';
import uvCapitalApi from '../api/uvCapitalApi';

const ModuleHeader = ({ header, header2, isDetail = true, icon, refreshDetail, setRefreshDetail }) => {
  let location = useLocation();
  const { id } = useParams();
  const [showConvertModal, setShowConvertModal] = useState(false);
  const handleConvertOpen = () => setShowConvertModal(true);
  const handleConvertClose = () => setShowConvertModal(false);
  const [isLeadConverted, setIsLeadConverted] = useState();

useEffect(() => {
  if(location?.pathname?.includes('view')){fetchLead();}
}, [id, location, refreshDetail]); 

 const fetchLead = async () => {
  try {
    const leadResponse = await uvCapitalApi.getLeadById(id);
    const leadStatus = leadResponse?.data?.[0]?.related_data?.lead?.lead_status;
    setIsLeadConverted(leadStatus === "Converted");
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

  return (
    <Fragment>
      <Container>
        <Row className='d-flex m-2 align-items-center justify-content-between'>
          <Col className="d-flex align-items-center" lg={(location.pathname.includes('/lead') && !location.pathname.includes('/lead')) && 10}>
            <div className='d-flex'>
              <div className='mx-2 fs-4 mb-1'>{icon}</div>
              <div className='d-block'>
                <div className='fs-4 heading-1'>{header}</div>
                <div className='heading-2'><span className={`ps-1 ${!location.pathname.includes('view') && !location.pathname.includes('module') && 'fw-bold'}`}>{header}</span>{header2 && <span className={`ps-1 ${!location.pathname.includes('view') && location.pathname.includes('module') && 'fw-bold'}`}> / {header2}</span>} {isDetail && <span className={`ps-1 ${location.pathname.includes("view") && 'fw-bold'} `} > / Details</span>} </div>
              </div>
            </div>
          </Col>
          {location.pathname.includes('/lead/view') && !isLeadConverted && <Col xs="auto"><button className='py-2 px-4 w-150 system-setting-btn-active' onClick={handleConvertOpen}>Lead Convert</button></Col>}
        </Row>
      </Container>

      {/* <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      /> */}

      <Toaster
        position="top-right"
        reverseOrder={false}
      />

      <LeadConvertModal
        show={showConvertModal}
        onHide={handleConvertClose}
        refreshDetail={refreshDetail}
        setRefreshDetail={setRefreshDetail}
      />

    </Fragment>
  )
}

export default ModuleHeader