import { useState, useEffect, useRef } from 'react'; 
import { FaArrowLeft, FaPlus, FaTrash, FaSave, FaSearch, FaTimes } from 'react-icons/fa';
import Modal from '../../components/Modal';
import useModal from '../../components/useModal'; 
import uvCapitalApi from '../../api/uvCapitalApi'; 

const EditOrder = ({onBackClick, selectedOrder}) => { 
  const  orderId  = selectedOrder.id;
  const { modalState, showSuccess, showError, showWarning, hideModal } = useModal();
  const currentCompanyFinancialYear = '12'; 
  const [orderData, setOrderData] = useState({
    orderDate: '',
    partyLedgerId: '',
    partyLedgerName: '',
    salesLedgerId: '',
    salesLedgerName: '',
    purchaseLedgerId: '',
    purchaseLedgerName: '',
    status: 'Draft',
    type: 'Sales',
    name: '' // Order number/name field
  });
  
  const [lineItems, setLineItems] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);  
  const [showSalesLedgerDropdown, setShowSalesLedgerDropdown] = useState(false); 
  const [showPurchaseLedgerDropdown, setShowPurchaseLedgerDropdown] = useState(false); 
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedLineItemIndex, setSelectedLineItemIndex] = useState({}); 
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [orderSettings, setOrderSettings] = useState({});

  // New state for enhanced ledger selector
  const [showLedgerPanel, setShowLedgerPanel] = useState(false);
  const [ledgerPanelType, setLedgerPanelType] = useState('');
  const [ledgerPanelSearchTerm, setLedgerPanelSearchTerm] = useState('');
  const [ledgerPanelSelectedIndex, setLedgerPanelSelectedIndex] = useState(0);
  const [ledgerPanelFilteredLedgers, setLedgerPanelFilteredLedgers] = useState([]);
  const [ledgerPanelActiveField, setLedgerPanelActiveField] = useState(null);

  // New state for enhanced item selector
  const [showItemPanel, setShowItemPanel] = useState(false);
  const [itemPanelType, setItemPanelType] = useState('');
  const [itemPanelSearchTerm, setItemPanelSearchTerm] = useState('');
  const [itemPanelSelectedIndex, setItemPanelSelectedIndex] = useState(0);
  const [itemPanelFilteredItems, setItemPanelFilteredItems] = useState([]);
  const [itemPanelLineItemId, setItemPanelLineItemId] = useState(null);

  // Create refs for the ledger input fields 
  const salesLedgerInputRef = useRef(null);
  const purchaseLedgerInputRef = useRef(null);
  
  // Create refs for other form fields to manage focus flow
  const orderDateInputRef = useRef(null);
  const orderNumberInputRef = useRef(null);
  const typeSelectRef = useRef(null);
  const statusSelectRef = useRef(null);
  const totalAmountInputRef = useRef(null);
  
  // Create refs for line item fields to manage tab order
  const lineItemRefs = useRef({});

  useEffect(() => {
    if (currentCompanyFinancialYear) {
      fetchOrderDetails();
      fetchLedgers();
      fetchStockItems();
    }
  }, [orderId, currentCompanyFinancialYear]);
  function formatDateForInput(dateString) {
    if (!dateString) return '';
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch order details using orderApi 
      const response = await uvCapitalApi.getOrderRecordById(orderId); 
      const orderData = response?.data?.[0]; 
      console.log('orderData =>', orderData);
      
      setOrderData({
        orderDate: orderData.order_date__c ? formatDateForInput(orderData.order_date__c) : '',
        partyLedgerId: orderData.party_ledger__c || '',
        partyLedgerName: orderData.party_ledger_name || '',
        salesLedgerId: (orderData.type__c !== 'Purchase') ? (orderData.sales_purchase_ledger__c || '') : '',
        salesLedgerName: (orderData.type__c !== 'Purchase') ? (orderData.sales_ledger_name || '') : '',
        purchaseLedgerId: (orderData.type__c === 'Purchase') ? (orderData.sales_purchase_ledger__c || '') : '',
        purchaseLedgerName: (orderData.type__c === 'Purchase') ? (orderData.sales_ledger_name || '') : '',
        status: orderData.status__c || 'Draft',
        type: orderData.type__c || 'Sales',
        name: orderData.name || ''
      });

      // Fetch line items using orderApi
      const lineItemsData = await uvCapitalApi.getOrderOLIDetailById(orderId); 
      
      if (!Array.isArray(lineItemsData)) {
        console.log('called');
        setLineItems(lineItemsData.data.map(item => ({
          id: item.id,
          stockItemId: item.stock_item__c || '',
          ledgerId: item.ledger__c || '',
          itemName: item.stock_item_name || item.ledger_name || item.item_name || '',
          itemType: item.stock_item__c ? 'stock' : 'ledger',
          rate: item.rate__c || '',
          quantity: item.quantity__c || '',
          units: item.units || '',
          amount: item.amount__c ? item.amount__c.toString() : ''
        }))); 
      } else {
        console.warn('Line items data is not an array:', lineItemsData);
        setLineItems([]);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      showError('Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.item-search') && !event.target.closest('.party-ledger-search') && !event.target.closest('.sales-ledger-search') && !event.target.closest('.purchase-ledger-search')) {
        
        setSelectedLineItemIndex({}); 
        setShowSalesLedgerDropdown(false);
        setShowPurchaseLedgerDropdown(false);
        setSelectedIndex(-1);
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle escape key for panels
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        if (showLedgerPanel) {
          closeLedgerPanel();
        } else if (showItemPanel) {
          closeItemPanel();
        }
      }
    };

    if (showLedgerPanel || showItemPanel) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [showLedgerPanel, showItemPanel]);

  const fetchLedgers = async () => {
    try {
      const response = await uvCapitalApi.getListOfLedgers();
      const result = await response;
      
      // Filter ledgers to only show Sundry Debtors and Sundry Creditors
      let filteredLedgers = [];
      
       filteredLedgers = result.data.filter(ledger => 
        ledger.parent_group__c === 'Sundry Debtors' || 
        ledger.parent_group__c === 'Sundry Creditors' ||
        ledger.parent_group__c === 'Sales Accounts' ||
        ledger.parent_group__c === 'Purchase Accounts' ||
        ledger.parent_group__c === 'Duties & Taxes' ||
        ledger.parent_group__c === 'Indirect Expenses' ||
        ledger.parent_group__c === 'Indirect Incomes' ||
        ledger.parent_group__c === 'Bank Accounts' ||
        ledger.parent_group__c === 'Cash-in-Hand'
      );
     
        setLedgers(filteredLedgers);
    } catch (error) {
      console.error('Error fetching ledgers:', error);
    }
  };

  const fetchStockItems = async () => {
    try {
      const response = await uvCapitalApi.getListOfStockItems();
      const result = await response;
      setStockItems(result.data || result);
    } catch (error) {
      console.error('Error fetching stock items:', error);
    }
  };

  const addLineItem = () => {
    const newLineItem = {
      id: `temp-${Date.now()}`,
      itemType: 'stock', // 'stock' or 'ledger'
      stockItemId: '',
      ledgerId: '',
      itemName: '',
      rate: 0,
      quantity: 1,
      units: '',
      amount: 0
    };
    setLineItems([...lineItems, newLineItem]);
  };

  const removeLineItem = (id) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id, field, value) => { 
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
                     // Auto-calculate amount when rate or quantity changes
           if (field === 'rate' || field === 'quantity') {
             const rate = field === 'rate' ? value : item.rate;
             const quantity = field === 'quantity' ? value : item.quantity;
             if (rate && quantity) {
               // For stock items, always calculate amount
               if (item.itemType === 'stock' && item.stockItemId) {
                 updatedItem.amount = (parseFloat(rate) * parseFloat(quantity)).toFixed(2);
               } else {
                 // For ledger items or empty items, only calculate if amount is empty or matches previous calculation
                 const calculatedAmount = (parseFloat(rate) * parseFloat(quantity)).toFixed(2);
                 const currentAmount = item.amount || '';
                 const previousCalculatedAmount = item.rate && item.quantity ? 
                   (parseFloat(item.rate) * parseFloat(item.quantity)).toFixed(2) : '';
                 
                 // Auto-calculate if amount is empty or if it matches the previous calculation (meaning user hasn't manually overridden it)
                 if (!currentAmount || currentAmount === previousCalculatedAmount) {
                   updatedItem.amount = calculatedAmount;
                 }
               }
             }
           }
           
          return updatedItem;
        }
        return item;
    }));
  };

  // Helper function to check if there's an empty row
  const hasEmptyRow = (items) => {
    return items.some(item => 
      !item.itemName && !item.stockItemId && !item.ledgerId
    );
  };

  // Helper function to auto-add new row if needed
  const autoAddNewRow = () => {
    setTimeout(() => {
      setLineItems(prevLineItems => {
        if (!hasEmptyRow(prevLineItems)) {
          return [...prevLineItems, {
            id: `temp-${Date.now()}`,
            itemType: 'stock',
            stockItemId: '',
            ledgerId: '',
            itemName: '',
            rate: 0,
            quantity: 1,
            units: '',
            amount: 0
          }];
        }
        return prevLineItems;
      });
    }, 100);
  };

  const calculateTotalAmount = () => { 
    const total = lineItems.reduce((total, item) => total + (parseFloat(item.amount) || 0), 0); 
    return total;
  }; 

  // Enhanced ledger panel functions
  const getFilteredLedgersForPanel = () => {
    if (ledgerPanelType === 'party') {
      if(orderData.type === 'Payment') {
        return ledgers.filter(ledger => 
          (ledger.parent_group__c === 'Bank Accounts' || ledger.parent_group__c === 'Cash-in-Hand') &&
          ledger.name?.toLowerCase().includes(ledgerPanelSearchTerm.toLowerCase())
        );
      }else if(orderData.type === 'Receipt'){
        return ledgers.filter(ledger => 
          (ledger.parent_group__c === 'Sundry Debtors' || ledger.parent_group__c === 'Sundry Creditors' || ledger.parent_group__c === 'Indirect Incomes') &&
          ledger.name?.toLowerCase().includes(ledgerPanelSearchTerm.toLowerCase())
        );
      }else{
      return ledgers.filter(ledger => 
        (ledger.parent_group__c === 'Sundry Debtors' || ledger.parent_group__c === 'Sundry Creditors') &&
        ledger.name?.toLowerCase().includes(ledgerPanelSearchTerm.toLowerCase())
      );
    }
    } else if (ledgerPanelType === 'sales') {
      return ledgers.filter(ledger => 
        ledger.parent_group__c === 'Sales Accounts' &&
        ledger.name?.toLowerCase().includes(ledgerPanelSearchTerm.toLowerCase())
      );
    } else if (ledgerPanelType === 'purchase') {
      return ledgers.filter(ledger => 
        ledger.parent_group__c === 'Purchase Accounts' &&
        ledger.name?.toLowerCase().includes(ledgerPanelSearchTerm.toLowerCase())
      );
    }
    return [];
  };

  const closeLedgerPanel = () => {
    setShowLedgerPanel(false);
    setLedgerPanelType('');
    setLedgerPanelSearchTerm('');
    setLedgerPanelSelectedIndex(0);
    setLedgerPanelFilteredLedgers([]);
    
    // Focus on the next field instead of the same field
    setTimeout(() => {
      if (ledgerPanelType === 'party') {
        // After party ledger, focus on sales/purchase ledger or total amount
        if (orderData.type === 'Purchase' && purchaseLedgerInputRef.current) {
          purchaseLedgerInputRef.current.focus();
        } else if (orderData.type !== 'Payment' && orderData.type !== 'Receipt' && salesLedgerInputRef.current) {
          salesLedgerInputRef.current.focus();
        } else if (totalAmountInputRef.current) {
          totalAmountInputRef.current.focus();
        }
      } else if (ledgerPanelType === 'sales' || ledgerPanelType === 'purchase') {
        // After sales/purchase ledger, focus on total amount
        if (totalAmountInputRef.current) {
          totalAmountInputRef.current.focus();
        }
      }
    }, 100);
    setLedgerPanelActiveField(null);
  };  
 

  const handleLedgerPanelSearchChange = (e) => {
    const searchTerm = e.target.value;
    setLedgerPanelSearchTerm(searchTerm);
    setLedgerPanelSelectedIndex(0);
  };

  // Enhanced item panel functions
  const getFilteredItemsForPanel = () => {
    const searchTerm = itemPanelSearchTerm.toLowerCase();
    
    // Get filtered stock items
    
    let filteredStockItems = [];
    // Get filtered ledgers (Duties & Taxes, Indirect Expenses)
    let filteredLedgers = [];
        if(orderData.type === 'Payment'){
              filteredLedgers = ledgers.filter(ledger => 
                (ledger.parent_group__c === 'Sundry Creditors' || ledger.parent_group__c === 'Sundry Debtors' || ledger.parent_group__c === 'Indirect Expenses') &&
                ledger.name?.toLowerCase().includes(searchTerm)
              ).map(ledger => ({
                ...ledger,
                itemType: 'ledger',
                displayType: ledger.parent_group__c
              }));
        }else if(orderData.type === 'Receipt'){
          filteredLedgers = ledgers.filter(ledger => 
            (ledger.parent_group__c === 'Bank Accounts' || ledger.parent_group__c === 'Cash-in-Hand') &&
            ledger.name?.toLowerCase().includes(searchTerm)
          ).map(ledger => ({
            ...ledger,
            itemType: 'ledger',
            displayType: ledger.parent_group__c
          }));
      }else{
        filteredStockItems = stockItems.filter(item => 
          item.name?.toLowerCase().includes(searchTerm)
        ).map(item => ({
          ...item,
          itemType: 'stock',
          displayType: 'Stock Item'
        }));

        filteredLedgers = ledgers.filter(ledger => 
          (ledger.parent_group__c === 'Duties & Taxes' || ledger.parent_group__c === 'Indirect Expenses') &&
          ledger.name?.toLowerCase().includes(searchTerm)
        ).map(ledger => ({
          ...ledger,
          itemType: 'ledger',
          displayType: ledger.parent_group__c
        }));
      } 
    // Combine both lists
    return [...filteredStockItems, ...filteredLedgers];
  };

  const openItemPanel = (type, lineItemId) => {
    setItemPanelType(type);
    setItemPanelLineItemId(lineItemId);
    setShowItemPanel(true);
    setItemPanelSearchTerm('');
    setItemPanelSelectedIndex(0);
    // Update filtered items
    const filtered = getFilteredItemsForPanel();
    setItemPanelFilteredItems(filtered);
  };

  const closeItemPanel = () => {
    setShowItemPanel(false);
    setItemPanelType('');
    setItemPanelSearchTerm('');
    setItemPanelSelectedIndex(0);
    setItemPanelFilteredItems([]);
    
    // Focus on the next field in the line item row
    setTimeout(() => {
      if (itemPanelLineItemId) {
        const currentLineItem = lineItems.find(li => li.id === itemPanelLineItemId);
        if (currentLineItem) {
          const currentIndex = lineItems.findIndex(li => li.id === itemPanelLineItemId);
          
          // Check if the selected item was a ledger (any item that is not a stock item)
          
          if (currentLineItem.itemType === 'ledger') {
            // For ledger items, focus directly on the amount field
            const amountFieldRef = lineItemRefs.current[`${itemPanelLineItemId}-amount`];
            if (amountFieldRef && amountFieldRef.current) {
              amountFieldRef.current.focus();
            }
          } else {
            // For stock items, focus on the rate field
            const rateFieldRef = lineItemRefs.current[`${itemPanelLineItemId}-rate`];
            if (rateFieldRef && rateFieldRef.current) {
              rateFieldRef.current.focus();
            } else {
              // If rate field is not available, try the next line item's item field
              const nextLineItem = lineItems[currentIndex + 1];
              if (nextLineItem) {
                const nextItemFieldRef = lineItemRefs.current[`${nextLineItem.id}-item`];
                if (nextItemFieldRef && nextItemFieldRef.current) {
                  nextItemFieldRef.current.focus();
                }
              }
            }
          }
        }
      }
    }, 100);
    
    setItemPanelLineItemId(null);
  };


  const selectItemFromPanel = (item) => {
    if (!itemPanelLineItemId) return;

    const lineItem = lineItems.find(li => li.id === itemPanelLineItemId);
    if (!lineItem) return;

    // Update all fields at once to avoid race conditions
    setLineItems(prevLineItems => {
      const updatedLineItems = prevLineItems.map(li => {
        if (li.id === itemPanelLineItemId) {
          let updatedItem = { ...li };
          
          if (item.itemType === 'stock') {
            // Handle stock item selection
            updatedItem = {
              ...updatedItem,
              itemType: 'stock',
              stockItemId: item.id,
              itemName: item.name,
              rate: item.rate__c || 0,
              units: item.units__c || ''
        };
        
        // Always calculate amount for stock items when selected
            const calculatedAmount = ((item.rate__c || 0) * (li.quantity || 1)).toFixed(2);
            updatedItem.amount = calculatedAmount;
          } else if (item.itemType === 'ledger') {
            // Handle ledger item selection
            updatedItem = {
              ...updatedItem,
              itemType: 'ledger',
              ledgerId: item.id,
              itemName: item.name,
              rate: 0,
              units: ''
            };
            
            // Always calculate amount for ledger items when selected
          const calculatedAmount = (0 * (li.quantity || 1)).toFixed(2);
          updatedItem.amount = calculatedAmount;
        }
        
        return updatedItem;
      }
      return li;
      });
      
      return updatedLineItems;
    });

    // Auto-add new row after selection
    autoAddNewRow();
    closeItemPanel();
  };

  const handleItemPanelSearchChange = (e) => {
    const searchTerm = e.target.value;
    setItemPanelSearchTerm(searchTerm);
    setItemPanelSelectedIndex(0);
  };

  // Update filtered ledgers when search term changes
  useEffect(() => {
    if (showLedgerPanel) {
      const filtered = getFilteredLedgersForPanel();
      setLedgerPanelFilteredLedgers(filtered);
    }
  }, [ledgerPanelSearchTerm, showLedgerPanel, ledgerPanelType]);

  // Update filtered items when search term changes
  useEffect(() => {
    if (showItemPanel) {
      const filtered = getFilteredItemsForPanel();
      setItemPanelFilteredItems(filtered);
    }
  }, [itemPanelSearchTerm, showItemPanel, itemPanelType]);


 
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!orderData.orderDate) {
      showWarning('Please select an order date');
      return;
    }

    if (orderData.type === 'Purchase' && (!orderData.purchaseLedgerId || !orderData.purchaseLedgerName)) {
      showWarning('Please select a Purchase Ledger');
      return;
    }

    if (orderData.type !== 'Payment' && orderData.type !== 'Receipt' && orderData.type !== 'Purchase' && (!orderData.salesLedgerId || !orderData.salesLedgerName)) {
      showWarning('Please select a Sales Ledger');
      return;
    }
  
    const validLineItems = lineItems.filter(item => {
      const hasItem = item.stockItemId || item.ledgerId;
      const hasAmount = item.amount && parseFloat(item.amount) > 0;
      const isValid = hasItem && hasAmount; 
      
      if (!isValid) {
        console.log('Invalid line item:', {
          item,
          hasItem,
          hasAmount,
          reason: !hasItem ? 'No item selected' : 'Missing amount'
        });
      }
      
      return isValid;
    });
 

    if (validLineItems.length === 0) {
      showWarning('Please add at least one line item with item, rate, and quantity');
      return;
    }

    // Update order using orderApi
    await uvCapitalApi.updateOrder(orderId, {
      name: orderData.name,
      order_date__c: orderData.orderDate,
      party_ledger__c: orderData.partyLedgerId,
      sales_purchase_ledger__c: (orderData.type !== 'Payment' && orderData.type !== 'Receipt') ? 
        (orderData.type === 'Purchase' ? orderData.purchaseLedgerId : orderData.salesLedgerId) : null,
      status__c: orderData.status,
      type__c: orderData.type,
      total_amount__c: calculateTotalAmount().toFixed(2)
    });

    // Delete existing line items
    await uvCapitalApi.deleteAllLineItemsForOrder(orderId);

    try {
      setSaving(true);

      // Create new line items
      for (const lineItem of validLineItems) { 
        
        const lineItemData = {
          order__c: orderId,
          rate__c: lineItem.rate ? parseFloat(lineItem.rate) : 0,
          quantity__c: lineItem.quantity ? parseFloat(lineItem.quantity) : 0,
          amount__c: parseFloat(lineItem.amount) || 0
        };

        if (lineItem.stockItemId) {
          lineItemData.stock_item__c = lineItem.stockItemId;
        } else if (lineItem.ledgerId) {
          lineItemData.ledger__c = lineItem.ledgerId;
        }

        await uvCapitalApi.createOrderLineItem(lineItemData);
      } 

      showSuccess('Order updated successfully!'); 
    } catch (error) { 
      showError('Failed to update order. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="create-order-container">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-order-container">
      <div className="create-order-header">
        <button 
          className="btn btn-outline-secondary back-button"
          onClick={onBackClick}
        >
          <FaArrowLeft /> Back to Orders
        </button>
        <h2>Edit Order</h2>
      </div>

      <form onSubmit={handleSubmit} className="create-order-form">
        {/* Order Section */}
          <div className="order-section">
          <h3>Order Details</h3>
            <div className="row">
              <div className="col-md-3">
                <div className="form-group">
                 <label>Order Date</label>
                  <input
                   ref={orderDateInputRef}
                    type="date"
                    className="form-control"
                    value={orderData.orderDate}
                   onChange={(e) => setOrderData({...orderData, orderDate: e.target.value})}
                    required
                  />
                </div>
              </div>
             {orderSettings.manual_order_number_enabled ? (
              <div className="col-md-3">
                <div className="form-group">
                  <label>Order Number</label>
                  <input
                     ref={orderNumberInputRef}
                    type="text"
                    className="form-control"
                    value={orderData.name}
                     onChange={(e) => setOrderData({...orderData, name: e.target.value})}
                    placeholder="Enter order number"
                   />
                 </div>
               </div>
             ) : (
               <div className="col-md-3">
                 <div className="form-group">
                   <label>Order Number</label>
                   <div className="form-control" style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}>
                     {orderData.name || 'Auto-generated'}
                   </div>
                    <small className="text-muted">Order number is auto-generated</small>
                 </div>
               </div>
             )}
                         <div className="col-md-3">
               <div className="form-group">
                 <label>Type</label>
                 <select
                   ref={typeSelectRef}
                   className="form-control"
                   value={orderData.type}
                   disabled
                   style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                 >
                   <option value="Sales">Sales</option>
                   <option value="Purchase">Purchase</option>
                   <option value="Payment">Payment</option>
                   <option value="Receipt">Receipt</option>
                   <option value="Contra">Contra</option>
                   <option value="Journal">Journal</option>
                   <option value="Credit Note">Credit Note</option>
                   <option value="Debit Note">Debit Note</option>
                 </select>
                 <small className="text-muted">Type cannot be changed</small>
               </div>
             </div>
              <div className="col-md-3">
                <div className="form-group">
                 <label>Status</label>
                 <select
                   ref={statusSelectRef}
                   className="form-control"
                   value={orderData.status}
                   onChange={(e) => setOrderData({...orderData, status: e.target.value})}
                   required
                 >
                   <option value="Draft">Draft</option>
                   <option value="Completed">Completed</option>
                   <option value="Cancelled">Cancelled</option>
                 </select>
               </div>
             </div>
                         <div className="col-md-3">
               <div className="form-group">
                 <label>{orderData.type === 'Payment' ? 'Cash/Bank Account' : 'Party Ledger'}</label>
                 <input
                   type="text"
                   className="form-control"
                   value={orderData.partyLedgerName}
                   readOnly
                   style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                 />
               </div>
             </div>
             {(orderData.type !== 'Payment' && orderData.type !== 'Receipt' && orderData.type !== 'Purchase') && (
                         <div className="col-md-3">
               <div className="form-group">
                 <label>Sales Ledger</label>
                 <input
                   type="text"
                   className="form-control"
                   value={orderData.salesLedgerName}
                   readOnly
                   style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                 />
               </div>
             </div>
            )}

             {orderData.type === 'Purchase' && (
                         <div className="col-md-3">
               <div className="form-group">
                 <label>Purchase Ledger</label>
                 <input
                   type="text"
                   className="form-control"
                   value={orderData.purchaseLedgerName}
                   readOnly
                   style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                 />
               </div>
             </div>
            )}
              
            <div className="col-md-3">
               <div className="form-group">
                 <label>Total Amount</label>
                 <input
                   type="text"
                   className="form-control"
                   value={`₹${calculateTotalAmount().toFixed(2)}`}
                   readOnly
                   style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                 />
               </div>
             </div>
            </div>
      
          </div>

          {/* Line Items Section */}
          <div className="line-items-section">
          <div className="line-items-header">
              <h3>Line Items</h3>
              <button
                type="button"
              className="nav-button"
                onClick={addLineItem}
              >
                <FaPlus /> Add Line Item
              </button>
            </div>

            {lineItems.length === 0 ? (
              <div className="no-line-items">
              <p>No line items added yet. Click "Add Line Item" to get started.</p>
              </div>
            ) : (
            <div className="line-items-table">
              <table className="table table-bordered">
                  <thead>
                    <tr>
                    <th>{orderData.type === 'Payment' ? 'Party Ledger' : orderData.type === 'Receipt' ? 'Cash/Bank AC' : 'Item'}</th>
                    {orderData.type !== 'Payment' && <th>Rate</th>}
                    {orderData.type !== 'Payment' && <th>Quantity</th>}
                    {orderData.type !== 'Payment' && <th>Units</th>}
                    <th>Amount</th>
                    <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((lineItem, index) => (
                      <tr key={lineItem.id}>
                                             <td>
                         <div className="item-selection">
                           <div className="item-search">
                             <div className="input-group">
                               <input
                                 ref={(el) => {
                                   lineItemRefs.current[`${lineItem.id}-item`] = { current: el };
                                 }}
                                 type="text"
                                 className="form-control"
                                 placeholder={orderData.type === 'Payment' ? 'Search Party...' : orderData.type === 'Receipt' ? 'Search Cash/Bank AC...' : `Search ${lineItem.itemType === 'stock' ? 'Items' : 'Ledgers'}...`}
                                 value={lineItem.itemName}
                                 readOnly={!lineItem.id.startsWith('temp-')}
                                 style={!lineItem.id.startsWith('temp-') ? { backgroundColor: '#f8f9fa', cursor: 'not-allowed' } : {}}
                                 onChange={(e) => {
                                   if (lineItem.id.startsWith('temp-')) {
                                     updateLineItem(lineItem.id, 'itemName', e.target.value);
                                   }
                                 }}
                                 onFocus={() => {
                                   if (lineItem.id.startsWith('temp-')) {
                                     openItemPanel(lineItem.itemType, lineItem.id);
                                   }
                                 }}
                               />
                               {lineItem.id.startsWith('temp-') && (
                                 <button
                                   type="button"
                                   className="btn btn-outline-secondary search-button-lookup"
                                   onClick={() => openItemPanel(lineItem.itemType, lineItem.id)}
                                   style={{ borderLeft: 'none' }}
                                 >
                                   <FaSearch />
                                 </button>
                               )}
                             </div>
                           </div>
                         </div>
                       </td>
                                             {orderData.type !== 'Payment' && (
                        <td>
                          <input
                             ref={(el) => {
                               lineItemRefs.current[`${lineItem.id}-rate`] = { current: el };
                             }}
                            type="number"
                            className="form-control"
                            value={lineItem.rate}
                             onChange={(e) => updateLineItem(lineItem.id, 'rate', parseFloat(e.target.value) || 0)}
                             step="0.01"
                            disabled={lineItem.itemType === 'ledger' && lineItem.ledgerId}
                          />
                        </td>
                       )}
                                             {orderData.type !== 'Payment' && (
                        <td>
                          <input
                             ref={(el) => {
                               lineItemRefs.current[`${lineItem.id}-quantity`] = { current: el };
                             }}
                            type="number"
                            className="form-control"
                            value={lineItem.quantity}
                             onChange={(e) => updateLineItem(lineItem.id, 'quantity', parseFloat(e.target.value) || 0)}
                             step="0.01"
                            disabled={lineItem.itemType === 'ledger' && lineItem.ledgerId}
                          />
                        </td>
                       )}
                      {orderData.type !== 'Payment' && (
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            value={lineItem.units}
                            readOnly
                          />
                        </td>
                      )}
                        <td>
                          <input
                           ref={(el) => {
                             lineItemRefs.current[`${lineItem.id}-amount`] = { current: el };
                           }}
                            type="number"
                            className="form-control"
                           value={lineItem.amount || ''}
                           onChange={(e) => updateLineItem(lineItem.id, 'amount', parseFloat(e.target.value) || 0)}
                           step="0.01"
                            placeholder="0.00"
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => removeLineItem(lineItem.id)}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

       

        {/* Submit Section */}
        <div className="submit-section">
          <button
            type="submit"
            className="nav-button"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              <>
                <FaSave /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        showCancel={modalState.showCancel}
      />

      {/* Enhanced Ledger Selection Panel */}
      {showLedgerPanel && (
        <div className="ledger-panel-overlay" onClick={closeLedgerPanel}>
          <div className="ledger-panel" onClick={(e) => e.stopPropagation()}>
            <div className="ledger-panel-header">
              <h4>
                {ledgerPanelType === 'party' ? (orderData.type === 'Payment' ? 'Select Cash/Bank' : 'Select Party Ledger') : 
                 ledgerPanelType === 'sales' ? 'Select Sales Ledger' : 
                 ledgerPanelType === 'purchase' ? 'Select Purchase Ledger' : 'Select Ledger'}
              </h4>
              <button
                type="button"
                className="btn-close"
                onClick={closeLedgerPanel}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="ledger-panel-search">
              <div className="input-group">
                <span className="input-group-text">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder={`Search ${ledgerPanelType === 'party' ? 'party' : ledgerPanelType === 'sales' ? 'sales' : ledgerPanelType === 'purchase' ? 'purchase' : ''} ledgers...`}
                  value={ledgerPanelSearchTerm}
                  onChange={handleLedgerPanelSearchChange} 
                  autoFocus
                />
              </div>
            </div>

            <div className="ledger-panel-content">
              <div className="ledger-list">
                {ledgerPanelFilteredLedgers.map((ledger, index) => (
                  <div
                    key={ledger.id}
                    className={`ledger-item ${index === ledgerPanelSelectedIndex ? 'selected' : ''}`}
                    onClick={() => selectLedgerFromPanel(ledger)}
                    onMouseEnter={() => setLedgerPanelSelectedIndex(index)}
                  >
                    <div className="ledger-name">{ledger.name}</div>
                    <div className="ledger-group">{ledger.parent_group__c}</div>
                  </div>
                ))}
                {ledgerPanelFilteredLedgers.length === 0 && (
                  <div className="no-ledgers">
                    <p>No ledgers found</p>
                    <small>Try adjusting your search terms</small>
                  </div>
                )}
              </div>
            </div>

            <div className="ledger-panel-footer">
              <div className="keyboard-shortcuts">
                <small>
                  <strong>Keyboard Shortcuts:</strong><br />
                  ↑↓ Arrow keys to navigate • Enter to select • Esc to close
                </small>
              </div>
            </div>
                     </div>
         </div>
       )}

       {/* Enhanced Item Selection Panel */}
       {showItemPanel && (
         <div className="ledger-panel-overlay" onClick={closeItemPanel}>
           <div className="ledger-panel" onClick={(e) => e.stopPropagation()}>
                           <div className="ledger-panel-header">
                <h4>
                  {orderData.type === 'Payment' ? 'Select Party' : orderData.type === 'Receipt' ? 'Select Cash/Bank AC' : 'Select Item (Stock Items & Ledgers)'}
                </h4>
               <button
                 type="button"
                 className="btn-close"
                 onClick={closeItemPanel}
               >
                 <FaTimes />
               </button>
             </div>
             
             <div className="ledger-panel-search">
               <div className="input-group">
                 <span className="input-group-text">
                   <FaSearch />
                 </span>
                                   <input
                    type="text"
                    className="form-control"
                    placeholder="Search items and ledgers..."
                    value={itemPanelSearchTerm}
                    onChange={handleItemPanelSearchChange} 
                    autoFocus
                  />
               </div>
             </div>

             <div className="ledger-panel-content">
               <div className="ledger-list">
                 {itemPanelFilteredItems.map((item, index) => (
                   <div
                     key={item.id}
                     className={`ledger-item ${index === itemPanelSelectedIndex ? 'selected' : ''}`}
                     onClick={() => selectItemFromPanel(item)}
                     onMouseEnter={() => setItemPanelSelectedIndex(index)}
                   >
                                           <div className="ledger-name">{item.name}</div>
                      <div className="ledger-group">
                        {item.displayType}
                      </div>
                   </div>
                 ))}
                 {itemPanelFilteredItems.length === 0 && (
                   <div className="no-ledgers">
                     <p>No items found</p>
                     <small>Try adjusting your search terms</small>
                   </div>
                 )}
               </div>
             </div>

             <div className="ledger-panel-footer">
               <div className="keyboard-shortcuts">
                 <small>
                   <strong>Keyboard Shortcuts:</strong><br />
                   Enter to select • Esc to close
                 </small>
               </div>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default EditOrder;