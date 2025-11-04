import { Fragment, useEffect, useState } from 'react'
import SidebarCard from '../../../components/SidebarCard';
import { SIDEBAR_MENUS } from '../../../helper/Constraints';
import CompanyLogo from '../../../components/CompanyLogo';
import { useLocation, useNavigate } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import './index.css';
import { useAuthWrapper } from "../../../helper/AuthWrapper"

const WebSideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { permissions } = useAuthWrapper();
  const [sidebarSubMenu, setSidebarSubMenu] = useState(SIDEBAR_MENUS);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const filteredMenus = SIDEBAR_MENUS.filter((menu) => {
      const key = menu.permissionKey?.toLowerCase(); 
      return permissions?.[key]?.tab_view;
    });
    
    const updatedMenus = filteredMenus.map(item => {
      const isExactMatch = location.pathname === item.redirect;
      const isSubRoute = location.pathname.startsWith(item.redirect + "/");
      const isActive = isExactMatch || isSubRoute;
      return { ...item, isActive };
    });

    setSidebarSubMenu(updatedMenus);
  }, [permissions]);

  const navigatePage = (destination, defaultHide) => {
    if (isMobile || defaultHide)
      hideSideBar();
    setTimeout(() => {
      navigate(destination);
    }, 100)
  }

  const hideSideBar = () => {
    document.querySelector("#sidebar").classList.toggle("hide");
    document.querySelector("#sidebar").classList.toggle("show");
  }

  return (
    <Fragment>
      <SidebarCard showModal={showModal} setShowModal={setShowModal} />
      <div className='sub-menus mt-3'>
        {sidebarSubMenu?.map((item, key) => (
          <ul className="list-unstyled components d-flex align-items-center  menu-list" key={key} onClick={(e) => navigatePage(item.redirect, false)} >
            <li to={item.redirect} className={`${item.isActive ? 'active-sidebar d-flex align-items-center' : "inactive-sidebar"}`}>
              <span className="custom-link-sidebar icon-default m-3" > <span style={{ color: "rgb(21, 163, 98)", marginRight: "6px" }}>{item.icon}</span> {item.title}</span>
            </li>
          </ul>
        ))}
      </div>
      <CompanyLogo />
    </Fragment>
  )
}

export default WebSideBar