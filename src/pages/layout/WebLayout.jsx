import { Fragment } from "react";
import LayoutBinded from ".";
import Chat from "../../components/Chat";
import { useAuthWrapper } from "../../helper/AuthWrapper";

const WebLayout = ({ children, isFooter, isHeader, isSideBar }) => {
const { settingPermissions } = useAuthWrapper();
const isChatActive = settingPermissions?.["Chat Setting"]?.[0]?.is_activate;

  return (
    <Fragment>
      <LayoutBinded children={children} isFooter={isFooter} isHeader={isHeader} isSideBar={isSideBar} />
      {isChatActive && <Chat />}
    </Fragment>
  );
};

export default WebLayout;
