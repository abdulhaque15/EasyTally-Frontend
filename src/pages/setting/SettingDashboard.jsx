import React, { useState, useEffect } from 'react';
import { FaCog, FaSave, FaUndo, FaInfoCircle } from 'react-icons/fa'; 
import Modal from '../../components/Modal';
import useModal from '../../components/useModal';
import uvCapitalApi from '../../api/uvCapitalApi';
import { loginUser } from '../../api/authApi';
import api from '../../config/axios-config';
import './Setting.css';

const Settings = () => {
  const { modalState, showSuccess, showError, hideModal } = useModal(); 
  const [settings, setSettings] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalSettings, setOriginalSettings] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchLedgers();
    fetchFinancialYears();
    fetchCompanies();
  }, []);

  const fetchSettings = async () => {
    try {
      //const response = await fetch(`${API_BASE_URL}/companies/settings/all`);
      const response = await uvCapitalApi.getAllSettings();
      if (response) {
        const result = await response;
        const settingsData = result.data; 
        setSettings(settingsData);
        
        // Create original settings object for comparison
        const original = {};
        settingsData.forEach(setting => {
          original[setting.setting_key] = setting.setting_value;
        });
        setOriginalSettings(original); 
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchLedgers = async () => {
    try { 
      const response = await uvCapitalApi.getListOfLedgers();
      if (response) {
        const result = await response;
        // Filter only Sales Accounts for the default sales ledger setting
        const salesLedgers = result.data.filter(ledger => 
          ledger.parent_group__c === 'Sales Accounts'
        );
        setLedgers(salesLedgers);
      }
    } catch (error) {
      console.error('Error fetching ledgers:', error);
    }
  };

  const fetchFinancialYears = async () => {
    try { 
      const response = await uvCapitalApi.getListOfFinancialYear();
      if (response) {
        const result = await response;
        setFinancialYears(result.data);
      }
    } catch (error) {
      console.error('Error fetching financial years:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
        const response = await uvCapitalApi.getAllCompanies();
        if (response) {
            const result = await response;
            setCompanies(result.data);
        }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => prev.map(setting => 
      setting.setting_key === key 
        ? { ...setting, setting_value: value }
        : setting
    ));

    // Check if there are changes
    const currentSettings = {};
    settings.forEach(setting => {
      if (setting.setting_key === key) {
        currentSettings[setting.setting_key] = value;
      } else {
        currentSettings[setting.setting_key] = setting.setting_value;
      }
    });

    const changed = Object.keys(currentSettings).some(key => 
      currentSettings[key] !== originalSettings[key]
    );
    setHasChanges(changed);
  };

  const handleSave = async () => {
    try {
        setSaving(true);
      
        // Prepare settings to update
        const settingsToUpdate = settings.map(setting => ({
            key: setting.setting_key,
            value: setting.setting_value
        }));

        console.log('settingsToUpdate ->', settingsToUpdate);

        const response = await uvCapitalApi.updateSettingRecord(12, {settingsToUpdate});
        //const userResponse = await api.post('/auth/login', data);
        //console.log('userResponse =>', userResponse);
        
        
        console.log('response =>', response);
        if (response) {
            showSuccess('Settings saved successfully!');
            // Update original settings
            const newOriginal = {};
            settings.forEach(setting => {
                newOriginal[setting.setting_key] = setting.setting_value;
            });
            setOriginalSettings(newOriginal);
            setHasChanges(false);
            
            // Refresh app settings to update header display
            //refreshSettings();
        } else {
            throw new Error('Failed to save settings');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        showError('Failed to save settings. Please try again.');
    } finally {
        setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(prev => prev.map(setting => ({
      ...setting,
      setting_value: originalSettings[setting.setting_key] || ''
    })));
    setHasChanges(false);
  };

  const renderSettingInput = (setting) => {
    const { setting_key, setting_value, setting_type, display_name, description } = setting;

    switch (setting_type) {
      case 'boolean':
        return (
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id={setting_key}
              checked={setting_value === 'true'}
              onChange={(e) => handleSettingChange(setting_key, e.target.checked ? 'true' : 'false')}
            />
            <label className="form-check-label" htmlFor={setting_key}>
              {display_name}
            </label>
          </div>
        );

      case 'number':
        return (
          <div className="form-group">
            <label htmlFor={setting_key}>{display_name}</label>
            <input
              type="number"
              className="form-control"
              id={setting_key}
              value={setting_value}
              onChange={(e) => handleSettingChange(setting_key, e.target.value)}
            />
          </div>
        );

      case 'array':
        // Special handling for allowed order types
        if (setting_key === 'allowed_order_types') {
          const orderTypes = [
            'Sales', 'Purchase', 'Payment', 'Receipt', 'Contra', 'Journal', 'Credit Note', 'Debit Note'
          ];
          const selectedTypes = setting_value ? setting_value.split(',').map(t => t.trim()) : [];
          
          return (
            <div className="form-group">
              <label htmlFor={setting_key}>{display_name}</label>
              <div className="order-types-checkboxes">
                {orderTypes.map(type => (
                  <div key={type} className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`${setting_key}_${type}`}
                      checked={selectedTypes.includes(type)}
                      onChange={(e) => {
                        let newSelectedTypes;
                        if (e.target.checked) {
                          newSelectedTypes = [...selectedTypes, type];
                        } else {
                          newSelectedTypes = selectedTypes.filter(t => t !== type);
                        }
                        handleSettingChange(setting_key, newSelectedTypes.join(', '));
                      }}
                    />
                    <label className="form-check-label" htmlFor={`${setting_key}_${type}`}>
                      {type}
                    </label>
                  </div>
                ))}
              </div>
              <small className="text-muted">{description}</small>
            </div>
          );
        }
        
        // Default array input (comma-separated)
        return (
          <div className="form-group">
            <label htmlFor={setting_key}>{display_name}</label>
            <input
              type="text"
              className="form-control"
              id={setting_key}
              value={setting_value}
              onChange={(e) => handleSettingChange(setting_key, e.target.value)}
              placeholder="Enter comma-separated values"
            />
            <small className="text-muted">{description}</small>
          </div>
        );

      case 'string':
                        // Special handling for current financial year
        if (setting_key === 'current_financial_year_name') {
          return (
            <div className="form-group">
              <label htmlFor={setting_key}>{display_name}</label>
              <select
                className="form-control"
                id={setting_key}
                value={setting_value}
                onChange={(e) => handleSettingChange(setting_key, e.target.value)}
              >
                                 <option value="">Select Financial Year</option>
                 {financialYears.map(year => (
                   <option key={year.financial_year__c} value={year.financial_year__c}>
                     {year.financial_year__c} {year.is_active__c ? '(Active)' : ''}
                   </option>
                 ))}
              </select>
                             {!setting_value && (
                 <small className="text-info">
                   <i className="fas fa-info-circle"></i> Will automatically use the active financial year if not set
                 </small>
               )}
            </div>
          );
        }

        // Special handling for current company
        if (setting_key === 'current_company_id') {
          return (
            <div className="form-group">
              <label htmlFor={setting_key}>{display_name}</label>
              <select
                className="form-control"
                id={setting_key}
                value={setting_value}
                onChange={(e) => handleSettingChange(setting_key, e.target.value)}
              >
                <option value="">Select Company</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              {!setting_value && (
                <small className="text-info">
                  <i className="fas fa-info-circle"></i> Will automatically use the parent company if not set
                </small>
              )}
            </div>
          );
        }

        // Special handling for default sales ledger
        if (setting_key === 'default_sales_ledger_id') {
          return (
            <div className="form-group">
              <label htmlFor={setting_key}>{display_name}</label>
              <select
                className="form-control"
                id={setting_key}
                value={setting_value}
                onChange={(e) => handleSettingChange(setting_key, e.target.value)}
              >
                <option value="">Select Sales Ledger</option>
                {ledgers.map(ledger => (
                  <option key={ledger.id} value={ledger.id}>
                    {ledger.name}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        // Special handling for order type
        if (setting_key === 'default_order_type') {
          return (
            <div className="form-group">
              <label htmlFor={setting_key}>{display_name}</label>
              <select
                className="form-control"
                id={setting_key}
                value={setting_value}
                onChange={(e) => handleSettingChange(setting_key, e.target.value)}
              >
                <option value="Sales">Sales</option>
                <option value="Purchase">Purchase</option>
                <option value="Invoice">Invoice</option>
              </select>
            </div>
          );
        }

        // Special handling for order status
        if (setting_key === 'default_order_status') {
          return (
            <div className="form-group">
              <label htmlFor={setting_key}>{display_name}</label>
              <select
                className="form-control"
                id={setting_key}
                value={setting_value}
                onChange={(e) => handleSettingChange(setting_key, e.target.value)}
              >
                <option value="Draft">Draft</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          );
        }

        // Default string input
        return (
          <div className="form-group">
            <label htmlFor={setting_key}>{display_name}</label>
            <input
              type="text"
              className="form-control"
              id={setting_key}
              value={setting_value}
              onChange={(e) => handleSettingChange(setting_key, e.target.value)}
            />
          </div>
        );

      default:
        return (
          <div className="form-group">
            <label htmlFor={setting_key}>{display_name}</label>
            <input
              type="text"
              className="form-control"
              id={setting_key}
              value={setting_value}
              onChange={(e) => handleSettingChange(setting_key, e.target.value)}
            />
          </div>
        );
    }
  };

  const groupSettingsByCategory = () => {
    const grouped = {};
    settings.forEach(setting => {
      if (!grouped[setting.category]) {
        grouped[setting.category] = [];
      }
      grouped[setting.category].push(setting);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const groupedSettings = groupSettingsByCategory();

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div className="header-content header-content-setting">
          <div className="header-text">
            <h2><FaCog /> Application Settings</h2>
            <p>Configure default values and application behavior</p>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
              disabled={!hasChanges}
            >
              <FaUndo /> Reset Changes
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSave}
              disabled={!hasChanges || saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave /> Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="settings-content">
        {Object.entries(groupedSettings).map(([category, categorySettings]) => (
          <div key={category} className={`settings-section ${category}`}>
            <h3 className="section-title">
              {category.charAt(0).toUpperCase() + category.slice(1)} Settings
            </h3>
            <div className="settings-grid">
              {categorySettings.map(setting => (
                <div key={setting.setting_key} className="setting-item">
                  {renderSettingInput(setting)}
                  {setting.description && (
                    <small className="form-text text-muted">
                      <FaInfoCircle /> {setting.description}
                    </small>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="settings-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleReset}
          disabled={!hasChanges}
        >
          <FaUndo /> Reset Changes
        </button>
        <button
          type="button"
          className="btn btn-success"
          onClick={handleSave}
          disabled={!hasChanges || saving}
        >
          {saving ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Saving...
            </>
          ) : (
            <>
              <FaSave /> Save Settings
            </>
          )}
        </button>
      </div>

      {/* Modal for notifications */}
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
    </div>
  );
};

export default Settings;