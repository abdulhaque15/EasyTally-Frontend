import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setNavigator } from "./navigate.helper";

const NavigationInitializer = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);

  return null; // No UI needed
};

export default NavigationInitializer;
