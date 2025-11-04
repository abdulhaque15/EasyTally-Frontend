import React from "react";
import WebLayout from "../layout/WebLayout";
import LeadDashboard from "./LeadDashboard";

const index = () => {
  return (
    <WebLayout isSideBar={true} isFooter={true} isHeader={true}>
      <LeadDashboard />
    </WebLayout>
  );
};

export default index;
