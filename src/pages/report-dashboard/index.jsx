import React from "react";
import WebLayout from "../layout/WebLayout";
import ReportDashboard from "./ReportDashboard";

const index = () => {
  return (
    <WebLayout isSideBar={true} isFooter={true} isHeader={true}>
      <ReportDashboard />
    </WebLayout>
  );
};

export default index;
