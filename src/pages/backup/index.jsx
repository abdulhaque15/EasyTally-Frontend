import WebLayout from "../layout/WebLayout";
import BackupDashboard from "./BackupDashboard";
const index = () => {
  return (
    <WebLayout isSideBar={true} isFooter={true} isHeader={true}>
      <BackupDashboard />
    </WebLayout>
  );
};

export default index;
