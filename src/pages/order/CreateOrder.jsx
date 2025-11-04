import React, { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaPlus, FaTrash, FaSearch, FaTimes } from 'react-icons/fa';
import Modal from '../../components/Modal';
import useModal from '../../components/useModal';
import uvCapitalApi from '../../api/uvCapitalApi';
import './CreateOrder.css';

const CreateOrder = ({ onBackClick, selectedType  }) => {    
    const { modalState, showSuccess, showError, showWarning, hideModal } = useModal(); 
    
    const [orderData, setOrderData] = useState({
        orderDate: new Date().toISOString().split('T')[0],
        partyLedgerId: '',
        partyLedgerName: '',
        salesLedgerId: '',
        salesLedgerName: '',
        purchaseLedgerId: '',
        purchaseLedgerName: '',
        status: 'Draft',
        type: selectedType || 'Sales',
        name: ''
    });
    
    const [lineItems, setLineItems] = useState([]);
    const [ledgers, setLedgers] = useState([]);
    const [stockItems, setStockItems] = useState([]); 
    const [loading, setLoading] = useState(false); 
    const [partyLedgerSearchTerm, setPartyLedgerSearchTerm] = useState(''); 
    const [salesLedgerSearchTerm, setSalesLedgerSearchTerm] = useState(''); 
    const [purchaseLedgerSearchTerm, setPurchaseLedgerSearchTerm] = useState(''); 
    const [orderSettings, setOrderSettings] = useState({}); 

    // New state for enhanced ledger selector
    const [showLedgerPanel, setShowLedgerPanel] = useState(false);
    const [ledgerPanelType, setLedgerPanelType] = useState('');
    const [ledgerPanelSearchTerm, setLedgerPanelSearchTerm] = useState('');
    const [ledgerPanelSelectedIndex, setLedgerPanelSelectedIndex] = useState(0);
    const [ledgerPanelFilteredLedgers, setLedgerPanelFilteredLedgers] = useState([]); 

    // New state for enhanced item selector
    const [showItemPanel, setShowItemPanel] = useState(false);
    const [itemPanelType, setItemPanelType] = useState(''); // 'stock' or 'ledger'
    const [itemPanelSearchTerm, setItemPanelSearchTerm] = useState('');
    const [itemPanelSelectedIndex, setItemPanelSelectedIndex] = useState(0);
    const [itemPanelFilteredItems, setItemPanelFilteredItems] = useState([]);
    const [itemPanelLineItemId, setItemPanelLineItemId] = useState(null);
    const [ledgerPanelActiveField, setLedgerPanelActiveField] = useState(null);

    // Create refs for the ledger input fields
    const partyLedgerInputRef = useRef(null);
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
        fetchLedgers();
        fetchStockItems();
        // Add one blank stock item row by default
        addLineItem();
    },  []);

    // Fetch default settings after ledgers are loaded
    useEffect(() => {
        if (ledgers.length > 0) {
            fetchDefaultSettings();
        }
    }, [ledgers]);

    // Update party ledger search term when orderData changes
    useEffect(() => {
        if (orderData.partyLedgerName && !partyLedgerSearchTerm) {
        setPartyLedgerSearchTerm(orderData.partyLedgerName);
        }
    }, [orderData.partyLedgerName]);

    // Update sales ledger search term when orderData changes
    useEffect(() => {
        if (orderData.salesLedgerName && !salesLedgerSearchTerm) {
        setSalesLedgerSearchTerm(orderData.salesLedgerName);
        }
    }, [orderData.salesLedgerName]);

    // Update purchase ledger search term when orderData changes
    useEffect(() => {
        if (orderData.purchaseLedgerName && !purchaseLedgerSearchTerm) {
        setPurchaseLedgerSearchTerm(orderData.purchaseLedgerName);
        }
    }, [orderData.purchaseLedgerName]);

    // Fetch Leadger Records
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

    // Fetch Stock Items Records
    const fetchStockItems = async () => {
        try {
            const response = await uvCapitalApi.getListOfStockItems();
            const result = await response;
            setStockItems(result.data || result);
        } catch (error) {
            console.error('Error fetching stock items:', error);
        }
    };

    // Fetch Default Setting (Company finalcial Year )
    const fetchDefaultSettings = async () => {
        try {
            const response = await uvCapitalApi.getDefaultOrderSettings();
            if (response) {
                const result = await response;
                const settings = result.data;
                
                // Store order settings for type options
                setOrderSettings(settings);
                
                // Generate order number if manual entry is not enabled
                let orderNumber = '';
                if (!settings.manual_order_number_enabled) {
                    try { 
                        const nextNumberResponse = await uvCapitalApi.getNextOrderNumber();
                        if (nextNumberResponse) {
                            const nextNumberResult = await nextNumberResponse;
                            orderNumber = nextNumberResult.data;
                        } else {
                            // Fallback to static generation if API fails
                            const prefix = settings.order_number_prefix || 'ORD';
                            const startNumber = settings.order_number_start || 1000;
                            orderNumber = `${prefix}-${startNumber}`;
                        }
                    } catch (error) {
                        console.error('Error fetching next order number:', error);
                        // Fallback to static generation
                        const prefix = settings.order_number_prefix || 'ORD';
                        const startNumber = settings.order_number_start || 1000;
                        orderNumber = `${prefix}-${startNumber}`;
                    }
                }
                
                // Apply default settings (but don't override selected type)
                setOrderData(prev => ({
                    ...prev,
                    status: settings.default_order_status || 'Draft',
                    type: selectedType || settings.default_order_type || 'Sales',
                    salesLedgerId: settings.default_sales_ledger_id || '',
                    salesLedgerName: settings.default_sales_ledger_id ? 
                        ledgers.find(l => l.Id === settings.default_sales_ledger_id)?.Name || '' : '',
                    name: orderNumber
                }));
                
                // Update sales ledger search term if default is set
                if (settings.default_sales_ledger_id) {
                    const defaultLedger = ledgers.find(l => l.id === settings.default_sales_ledger_id);
                    if (defaultLedger) {
                        setSalesLedgerSearchTerm(defaultLedger.name);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching default settings:', error);
        }
    };

    const addLineItem = () => {
        const newLineItem = {
            id: Date.now(),
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
                id: Date.now(),
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
        return lineItems.reduce((total, item) => total + (parseFloat(item.amount) || 0), 0);
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

    const openLedgerPanel = (type, fieldRef = null) => {
        setLedgerPanelType(type);
        setShowLedgerPanel(true);
        setLedgerPanelSearchTerm('');
        setLedgerPanelSelectedIndex(0);
        setLedgerPanelActiveField(fieldRef);
        // Update filtered ledgers
        const filtered = getFilteredLedgersForPanel();
        setLedgerPanelFilteredLedgers(filtered);
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

    // This method is used to handle the selected ledger panel
    const selectLedgerFromPanel = (ledger) => {
        if (ledgerPanelType === 'party') {
                setOrderData({
                ...orderData,
                partyLedgerId: ledger.id,
                partyLedgerName: ledger.name
            });
            setPartyLedgerSearchTerm(ledger.name);
        } else if (ledgerPanelType === 'sales') {
            setOrderData({
                ...orderData,
                salesLedgerId: ledger.id,
                salesLedgerName: ledger.name
            });
            setSalesLedgerSearchTerm(ledger.name);
        } else if (ledgerPanelType === 'purchase') {
            setOrderData({
                ...orderData,
                purchaseLedgerId: ledger.id,
                purchaseLedgerName: ledger.name
            });
            setPurchaseLedgerSearchTerm(ledger.name);
        }
        closeLedgerPanel();
    };

    // This method handles the Ledger Panel search change
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

    //This method switches focus from Party Ledger to Sales Ledger
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

    // This method is used to focus from Party Ledger to Sales Ledger and from Sales Ledger to Amount
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

    // Method used for selecting line items
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

    // This method is used when the line item is changed
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


    // Create Order And Line Items 
    const handleSubmit = async (e) => {
        e.preventDefault();         
        if (!orderData.partyLedgerId || !orderData.partyLedgerName) { 
            showWarning('Please select a Party Ledger');
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
        if (lineItems.length === 0) {
            showWarning('Please add at least one line item');
            return;
        }
        setLoading(true);
        try {      

            // Create line items (only for non-empty entries)
            const validLineItems = lineItems.filter(lineItem => {
                const hasItem = lineItem.stockItemId || lineItem.ledgerId;
                const hasAmount = lineItem.amount && parseFloat(lineItem.amount) > 0;
                const isValid = hasItem && hasAmount;
                
                if (!isValid) {
                    console.log('Invalid line item:', {
                        lineItem,
                        hasItem,
                        hasAmount,
                        reason: !hasItem ? 'No item selected' : 'Missing amount'
                    });
                }
                
                return isValid;
            });

            if (validLineItems.length === 0) {
                showWarning('Please add at least one line item with item and amount');
                return;
                
                //throw new Error('Please add at least one line item with item and amount');
            }

            // Create the order first
            const orderResult = await uvCapitalApi.createOrder({
                name: orderData.name,
                order_date__c: orderData.orderDate,
                party_ledger__c: orderData.partyLedgerId,
                sales_purchase_ledger__c: (orderData.type !== 'Payment' && orderData.type !== 'Receipt') ? 
                (orderData.type === 'Purchase' ? orderData.purchaseLedgerId : orderData.salesLedgerId) : null,
                total_amount__c: calculateTotalAmount().toFixed(2),
                status__c: orderData.status,
                type__c: orderData.type
            });  

            const lineItemPromises = validLineItems.map(async (lineItem) => {
                const lineItemData = {
                order__c: orderResult.data.id,
                rate__c: lineItem.rate ? parseFloat(lineItem.rate) : 0,
                quantity__c: lineItem.quantity ? parseFloat(lineItem.quantity) : 0,
                amount__c: parseFloat(lineItem.amount) || 0
                };

                if (lineItem.itemType === 'stock') {
                    lineItemData.stock_item__c = lineItem.stockItemId;
                } else {
                    lineItemData.ledger__c = lineItem.ledgerId;
                }

                return await uvCapitalApi.createOrderLineItem(lineItemData);
            });

            await Promise.all(lineItemPromises); 

            showSuccess('Order created successfully!');
        } catch (error) {
            console.error('Error creating order:', error);
            showError('Error creating order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-order-container">
            <div className="create-order-header">
                <button 
                className="btn btn-outline-secondary back-button"
                onClick={onBackClick}
                >
                <FaArrowLeft /> Back to Orders
                </button>
                <h5>Create New Order</h5>
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
                                onChange={(e) => setOrderData({...orderData, type: e.target.value})}
                                required
                                disabled
                                style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                                >
                                {orderSettings.allowed_order_types?.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                )) || (
                                    <>
                                    <option value="Sales">Sales</option>
                                    <option value="Purchase">Purchase</option>
                                    <option value="Payment">Payment</option>
                                    <option value="Receipt">Receipt</option>
                                    <option value="Contra">Contra</option>
                                    <option value="Journal">Journal</option>
                                    <option value="Credit Note">Credit Note</option>
                                    <option value="Debit Note">Debit Note</option>
                                    </>
                                )}
                                </select>
                                <small className="text-muted">Type cannot be changed after selection</small>
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
                                <div className="party-ledger-search">
                                <input
                                    ref={partyLedgerInputRef}
                                    type="text"
                                    className="form-control"
                                    placeholder={orderData.type === 'Payment' ? 'Search Cash/Bank Account...' : 'Search Party Ledger...'}
                                    value={partyLedgerSearchTerm}
                                    onChange={(e) => {
                                    setPartyLedgerSearchTerm(e.target.value);
                                    }}
                                    onFocus={() => {
                                    openLedgerPanel('party', partyLedgerInputRef);
                                    }}
                                    readOnly
                                    required
                                />
                                <div className="input-group-append">
                                    <button
                                    type="button"
                                    className="btn btn-outline-secondary search-button-lookup"
                                    onClick={() => openLedgerPanel('party', partyLedgerInputRef)}
                                    style={{ borderLeft: 'none' }}
                                    >
                                    <FaSearch />
                                    </button>
                                </div>
                                </div>
                            </div>
                        </div>
                        {(orderData.type !== 'Payment' && orderData.type !== 'Receipt' && orderData.type !== 'Purchase') && (
                            <div className="col-md-3"> 
                                <div className="form-group">
                                
                                    <label>Sales Ledger</label>
                                    <div className="sales-ledger-search">
                                        <input
                                            ref={salesLedgerInputRef}
                                            type="text"
                                            className="form-control"
                                            placeholder="Search Sales Ledger..."
                                            value={salesLedgerSearchTerm}
                                            onChange={(e) => {
                                            setSalesLedgerSearchTerm(e.target.value);
                                            }}
                                            onFocus={() => {
                                            openLedgerPanel('sales', salesLedgerInputRef);
                                            }}
                                            readOnly
                                                required
                                            />
                                        <div className="input-group-append">
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary search-button-lookup"
                                                onClick={() => openLedgerPanel('sales', salesLedgerInputRef)}
                                                style={{ borderLeft: 'none' }}
                                            >
                                                <FaSearch />
                                            </button>
                                        </div>
                                    </div>
                                </div> 
                            </div>
                        )}    

                        {orderData.type === 'Purchase' && (
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>Purchase Ledger</label>
                                    <div className="purchase-ledger-search">
                                        <input
                                            ref={purchaseLedgerInputRef}
                                            type="text"
                                            className="form-control"
                                            placeholder="Search Purchase Ledger..."
                                            value={purchaseLedgerSearchTerm}
                                            onChange={(e) => {
                                            setPurchaseLedgerSearchTerm(e.target.value);
                                            }}
                                            onFocus={() => {
                                            openLedgerPanel('purchase', purchaseLedgerInputRef);
                                            }}
                                            readOnly
                                            required
                                        />
                                        <div className="input-group-append">
                                            <button
                                            type="button"
                                            className="btn btn-outline-secondary search-button-lookup"
                                            onClick={() => openLedgerPanel('purchase', purchaseLedgerInputRef)}
                                            style={{ borderLeft: 'none' }}
                                            >
                                            <FaSearch />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                            </div>
                        )}    
                                
                        <div className="col-md-3">
                            <div className="form-group">
                                <label>Total Amount</label>
                                <input
                                ref={totalAmountInputRef}
                                type="number"
                                className="form-control"
                                value={calculateTotalAmount().toFixed(2)}
                                readOnly
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
                        className="btn btn-success"
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
                                    <th>
                                        {orderData.type === 'Payment' ? 'Party Ledger' : orderData.type === 'Receipt' ? 'Cash/Bank AC' : 'Item'}
                                    </th>
                                    {(orderData.type !== 'Payment' && orderData.type !== 'Receipt') && <th>Rate</th>}
                                    {(orderData.type !== 'Payment' && orderData.type !== 'Receipt') && <th>Quantity</th>}
                                    {(orderData.type !== 'Payment' && orderData.type !== 'Receipt') && <th>Units</th>}
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
                                                    <input
                                                        ref={(el) => {
                                                            lineItemRefs.current[`${lineItem.id}-item`] = { current: el };
                                                        }}
                                                        type="text"
                                                        className="form-control"
                                                        placeholder={orderData.type === 'Payment' ? 'Search Party...' : orderData.type === 'Receipt' ? 'Search Cash/Bank AC...' : `Search ${lineItem.itemType === 'stock' ? 'Items' : 'Ledgers'}...`}
                                                        value={lineItem.itemName}
                                                        onChange={(e) => {
                                                            updateLineItem(lineItem.id, 'itemName', e.target.value);
                                                        }}
                                                        onFocus={() => {
                                                            openItemPanel(lineItem.itemType, lineItem.id);
                                                        }}
                                                        readOnly
                                                    />
                                                    <div className="input-group-append">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary search-button-lookup"
                                                        onClick={() => openItemPanel(lineItem.itemType, lineItem.id)}
                                                        style={{ borderLeft: 'none' }}
                                                    >
                                                        <FaSearch />
                                                    </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        {orderData.type !== 'Payment' && orderData.type !== 'Receipt' && (
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
                                        {orderData.type !== 'Payment' && orderData.type !== 'Receipt' && (
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
                                        {orderData.type !== 'Payment' && orderData.type !== 'Receipt' && (
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
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : <>Create Order</>}
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
                            <h5>
                                {orderData.type === 'Payment' ? 'Select Party' : orderData.type === 'Receipt' ? 'Select Cash/Bank AC' : 'Select Item (Stock Items & Ledgers)'}
                            </h5>
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
export default CreateOrder;