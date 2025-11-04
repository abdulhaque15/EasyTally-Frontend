import { useState } from 'react';
import WebLayout from '../layout/WebLayout';
import OrderDashboard from './OrderDashboard';
import OrderTypeSelector from './OrderTypeSelector';
import CreateOrder from './CreateOrder';
import EditOrder from './EditOrder';

const Index = () => { 
  const [showOrderTypeSelector, setShowOrderTypeSelector] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [showEditOrder, setShowEditOrder] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleNewOrderClick = () => {
    setShowOrderTypeSelector(true);
  };
 
  const handleBackClick = () => {
    setShowOrderTypeSelector(false);
    setShowCreateOrder(false);
    setShowEditOrder(false);
  };

  const handleContinueClick = (type) => {
    setSelectedType(type);
    setShowCreateOrder(true);
    setShowOrderTypeSelector(false);
    
  };

  const handleEditClick = (order) => {
    setSelectedOrder(order);
    setShowEditOrder(true);
  };

  return (
  <WebLayout isSideBar={true} isFooter={true} isHeader={true}>
    {!showOrderTypeSelector && !showCreateOrder && !showEditOrder ? (
      <OrderDashboard onNewOrderClick={handleNewOrderClick} onEditClick={handleEditClick} />
    ) : showOrderTypeSelector ? (
      <OrderTypeSelector onBackClick={handleBackClick} onContinueClick={handleContinueClick} />
    ) : showCreateOrder ? (
      <CreateOrder onBackClick={handleBackClick} selectedType={selectedType} />
    ) : showEditOrder ? (
      <EditOrder onBackClick={handleBackClick} selectedOrder={selectedOrder} />
    ) : null}
  </WebLayout>
);
};

export default Index;