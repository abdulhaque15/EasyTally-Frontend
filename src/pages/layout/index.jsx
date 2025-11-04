import { isMobile } from "react-device-detect";
import WebFooter from "./common/WebFooter";
import WebHeader from "./common/WebHeader";
import WebSideBar from "./common/WebSideBar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const LayoutBinded = ({ children, isSideBar, isHeader, isFooter }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem('token');
    if (!accessToken) {
      navigate('/login');
    } else {
      setIsLogin(true);
    }
  },[]);

  return (
    <div className='content-wrapper'>
      <div className='wrapper-content d-flex'>
        <nav className={isMobile ? 'hide' : 'show'} id="sidebar">
          {isSideBar && <WebSideBar />}
        </nav>
        <div className="flex-column w-100">
          {isHeader && <WebHeader />}
          {children}
          {isFooter && <WebFooter />}
        </div>
      </div>
    </div>
  );
};

export default LayoutBinded;
