import { Button, Col, Container, Row } from "react-bootstrap";
import { GiHamburgerMenu } from "react-icons/gi"; 
import { useNavigate } from "react-router-dom";
import { useAuthWrapper } from "../../../helper/AuthWrapper";
import JWTService from "../../../config/jwt.config"; 
import { BiSolidCategoryAlt,BiShoppingBag, BiSolidCopyAlt, BiSolidBookContent } from "react-icons/bi";

const WebHeader = () => {
  const { user } = useAuthWrapper();
  const navigate = useNavigate();
  // const [open, setOpen] = useState(false);
  // let companyName = "";
  let groupName = "";
  const path = window.location.pathname.replace("/", "");  

  if (JWTService.getTokenDetails()) {
    try {
      const decoded = JWTService.decodeTokenDetails(
        JWTService.getTokenDetails()
      );
      // companyName = decoded?.user?.company_name;
      groupName = decoded?.user?.group_name;
    } catch (err) {
      console.error("Invalid token", err);
    }
  }

  const toggleSidebar = () => {
    document.querySelector("#sidebar").classList.toggle("hide");
    document.querySelector("#sidebar").classList.toggle("show");
  };
  const handleLogout = () => {
    JWTService.clearTokenDetails();
    navigate("/login");
  };

  const handleClick = () => {
    navigate(`/${path}`);
  };
  let buttonText = '';
  if (path.toLowerCase().includes("ledgers")) {
    buttonText = "Ledgers";
  } else if (path.toLowerCase().includes("stockitem")) {
    buttonText = "Stock Items";
  } else if (path.toLowerCase().includes("vouchers")) {
    buttonText = "Vouchers";
  }else if (path.toLowerCase().includes("orders")) {
    buttonText = "Orders";
  }else if (path.toLowerCase().includes("setting")) {
    buttonText = "Settings";
  }else if (path.toLowerCase().includes("")) {
    buttonText = "Dashboard";
  }
  
  return (
    <div fluid className="header-content d-flex align-items-center" >
      <Row className="section-first w-100 p-0 m-0 d-flex justify-content-between align-items-center">
        <Col
          xs={3}
          sm={4}
          md={3}
          lg={5}
          className="d-flex justify-content-between align-items-center"
        >
          <Row className="d-flex align-items-center justify-content-center">
          <Col md="auto">
            <div className="hamburger-icon">
              <Button
                type="button"
                id="sidebarCollapse"
                className="btn custom-btn-secondary"
                onClick={toggleSidebar}
              >
                <GiHamburgerMenu fontSize={13} className="icon-default" />
              </Button>
            </div>
          </Col>
          
           <Col md="auto">
              <Button className={`btn ${buttonText === "Ledgers" || buttonText === "Orders" || buttonText === "Settings" ? "btn-success" : ""} px-4 py-2 rounded-3`} style={{color: "white", background: buttonText === "Stock Items"? "linear-gradient(135deg,#17a2b8,#138496)" : buttonText === "Vouchers"? "linear-gradient(135deg, rgb(255, 193, 7), rgb(224, 168, 0))" : ""}} onClick={handleClick}>
                {buttonText === "Ledgers" ? (
                  <BiSolidBookContent className="me-2" />
                ) : buttonText === "Orders" ? (
                  <BiSolidCategoryAlt className="me-2" />
                ) : buttonText === "Stock Items" ? (
                  <BiSolidCopyAlt className="me-2" />
                ) : (
                  <BiShoppingBag className="me-2" />
                )}
                {buttonText}
              </Button>
            </Col>
          </Row>
        </Col>
        <Col
          xs={9}
          sm={8}
          md={9}
          lg={7}
          className="d-flex justify-content-end"
        >
          <Row className="d-flex align-items-center justify-content-center">
            <Col md="auto">
              {/* <div className="d-flex align-items-center bg-light rounded-3 px-3 py-2">
                <HiBuildingOffice2 className="text-success me-2" />
                <div>
                  <small className="text-muted d-block">Company</small>
                  <strong>{user?.company_name}</strong>
                </div>
              </div> */}
                <div className="info-item">
                  <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" class="info-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M475.115 163.781L336 252.309v-68.28c0-18.916-20.931-30.399-36.885-20.248L160 252.309V56c0-13.255-10.745-24-24-24H24C10.745 32 0 42.745 0 56v400c0 13.255 10.745 24 24 24h464c13.255 0 24-10.745 24-24V184.029c0-18.917-20.931-30.399-36.885-20.248z"></path></svg>
                  <div className="info-content">
                    <div className="info-label">Company</div>
                    <span class="info-text">{user?.company_name}</span>
                  </div>
                </div>

            </Col>
            <Col md="auto">
              {/* <div className="d-flex align-items-center bg-light rounded-3 px-3 py-2">
                <HiCalendar className="text-success me-2" />
                <div>
                  <small className="text-muted d-block">Financial Year</small>
                  <strong>2025-2026 <span className="badge bg-success ms-1">ACTIVE</span></strong>
                </div>
              </div> */}
              <div className="info-item"> 
                  <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" class="info-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M0 464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V192H0v272zm320-196c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM192 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM64 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zM400 64h-48V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H160V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H48C21.5 64 0 85.5 0 112v48h448v-48c0-26.5-21.5-48-48-48z"></path></svg>
                  <div className="info-content">
                    <div className="info-label">Financial Year</div>
                    <span class="info-text">{user?.financial_year__c} <span className="badge bg-success ms-1">ACTIVE</span></span>
                  </div>
                </div>
            </Col>
            <Col md="auto">
              {/* <div className="d-flex align-items-center bg-light rounded-3 px-3 py-2">
                <HiUser className="text-success me-2" />
                <div>
                  <small className="text-muted d-block">User Profile</small>
                  <strong>{user?.name}</strong>
                </div>
              </div> */}
              <div class="user-info">
                <span class="user-name">{user?.name}</span>
                <div class="user-avatar">
                  <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"></path></svg>
                </div>
              </div>
            </Col>
            {/* <Col>
              <NotificationBox />
            </Col> */}
            <Col>
              {/* <IoLogOutOutline
                fontSize={25}
                className="icon-default"
                onClick={handleLogout}
              /> */}

              <button class="user-menu-btn" onClick={handleLogout}>
                <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"></path>
                </svg>
              </button>
            </Col>
          </Row>
        </Col>
        <Col></Col>
      </Row>
      <Row></Row>
    </div>
  );
};

export default WebHeader;
