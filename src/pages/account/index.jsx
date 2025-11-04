import WebLayout from "../layout/WebLayout";
import AccountDashboard from "./AccountDashboard";

const index = () => {
  return (
    <WebLayout isSideBar={true} isFooter={true} isHeader={true}>
      <AccountDashboard />
    </WebLayout>
  );
};

export default index;
