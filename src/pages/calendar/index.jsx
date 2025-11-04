import React from "react";
import WebLayout from "../layout/WebLayout";
import CalendarDashboard from "./CalendarDashboard";

const index = () => {
  return (
    <WebLayout isSideBar={true} isFooter={true} isHeader={true}>
      <CalendarDashboard/>
    </WebLayout>
  );
};

export default index;
