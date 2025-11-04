import { useState, useEffect } from 'react'; 
import { FaArrowLeft, FaArrowRight, FaShoppingCart, FaShoppingBag, FaCreditCard, FaMoneyBillWave} from 'react-icons/fa';
import uvCapitalApi from '../../api/uvCapitalApi';
import './OrderTypeSelector.css';

const OrderTypeSelector = ({ onBackClick, onContinueClick  }) => {
    const [orderSettings, setOrderSettings] = useState({});
    const [selectedType, setSelectedType] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrderSettings();
    }, []);

    const loadOrderSettings = async () => {
        try {
            setLoading(true);
            const settings = await uvCapitalApi.getDefaultOrderSettings();
            console.log('settings =>', settings);
            setOrderSettings(settings);
            if (settings.data.default_order_type && settings.data.allowed_order_types?.includes(settings.data.default_order_type)) {
                setSelectedType(settings.data.default_order_type);
            }
        } catch (err) {
            console.error('Failed to load order settings:', err);
            setError('Failed to load order settings');
        } finally {
            setLoading(false);
        }
    };

    const handleTypeSelect = (type) => {
        setSelectedType(type);
    };

    const handleContinue = () => {
        onContinueClick(selectedType);  // Pass the selected type to the parent component (Index.js)
    };

    const getOrderTypeIcon = (type) => {
        switch (type) {
        case 'Sales':
            return <FaShoppingCart />;
        case 'Purchase':
            return <FaShoppingBag />;
        case 'Payment':
            return <FaCreditCard />;
        case 'Receipt':
            return <FaMoneyBillWave />;
        }
    };

    const getOrderTypeIconClass = (type) => {
        switch (type) {
        case 'Sales':
            return 'sales';
        case 'Purchase':
            return 'purchase';
        case 'Payment':
            return 'payment';
        case 'Receipt':
            return 'receipt';
        }
    };

    if (loading) {
        return (
        <div className="order-type-selector-container">
            <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            </div>
        </div>
        );
    }

    if (error) {
        return (
        <div className="order-type-selector-container">
            <div className="alert alert-danger" role="alert">
            {error}
            </div>
        </div>
        );
    }
    
    const allowedTypes = orderSettings?.data?.allowed_order_types || []; //['Sales', 'Purchase', 'Payment', 'Receipt']; 
    
    return (
        <div className="order-type-selector-container">
        <div className="container">
            <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
                <div className="card shadow-lg">
                <div className="card-header bg-primary text-white text-center py-4">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                    <FaShoppingCart className="me-3" size={24} />
                    <h4 className="mb-0">Create New Order</h4>
                    </div>
                    <p className="mb-0 text-light">Select the type of order you want to create</p>
                </div>
                
                <div className="card-body p-4">
                    <div className="row g-3">
                        {allowedTypes.map((type) => (
                            <div key={type} className="col-md-6">
                                <div  className={`order-type-card ${selectedType === type ? 'selected' : ''}`}
                                    onClick={() => handleTypeSelect(type)} >
                                    <div className={`order-type-icon ${getOrderTypeIconClass(type)}`}>
                                        {getOrderTypeIcon(type)}
                                    </div>
                                    <div className="order-type-label">
                                        {type}
                                    </div>
                                    {selectedType === type && (
                                        <div className="selected-indicator">
                                            <i className="fas fa-check"></i>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {allowedTypes.length === 0 && (
                        <div className="text-center py-4">
                            <i className="fas fa-exclamation-triangle text-warning mb-3" style={{ fontSize: '2rem' }}></i>
                            <p className="text-muted">No order types are currently allowed. Please contact your administrator.</p>
                        </div>
                    )}
                </div>

                <div className="card-footer bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                    <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={onBackClick}
                    >
                        <FaArrowLeft className="me-2" />
                        Back to Orders
                    </button>
                    
                    <button 
                        type="button" 
                        className="btn btn-primary"
                        onClick={handleContinue}
                        disabled={!selectedType}
                    >
                        Continue
                        <FaArrowRight className="ms-2" />
                    </button>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>
    );
};

export default OrderTypeSelector;