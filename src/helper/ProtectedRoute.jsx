import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthWrapper } from "./AuthWrapper";

const ProtectedRoute = ({ moduleName, children }) => {
  const { permissions, loading } = useAuthWrapper();

  const moduleKey = moduleName?.toLowerCase();
  const canView = permissions?.[moduleKey]?.tab_view;
  if (loading) return null;

  if (!canView) {
    return <Navigate to="*" />;
  }

  return children;
};

export default ProtectedRoute;
