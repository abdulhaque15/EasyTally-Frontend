import React from "react";
import WebLayout from "../layout/WebLayout";
import ContactDashboard from "./ContactDashboard";

const index = () => {
  return (
    <WebLayout isSideBar={true} isFooter={true} isHeader={true}>
      <ContactDashboard />
    </WebLayout>
  );
};

export default index;
