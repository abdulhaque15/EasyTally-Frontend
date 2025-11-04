import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiConfig';

const AppSettingsContext = createContext();

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
};

export const AppSettingsProvider = ({ children }) => {
  const [currentCompany, setCurrentCompany] = useState(null);
  const [currentFinancialYear, setCurrentFinancialYear] = useState(null);
  const [currentCompanyFinancialYear, setCurrentCompanyFinancialYear] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderSettings, setOrderSettings] = useState(null);
  const [permissionSettings, setPermissionSettings] = useState(null);

  // Fetch current settings on mount
  useEffect(() => {
    fetchCurrentSettings();
  }, []);

  const fetchCurrentSettings = async () => {
    try {
      // First, try to load from session storage
      const storedCompanyFinancialYear = localStorage.getItem('currentCompanyFinancialYear');
      
      if (storedCompanyFinancialYear) {
        try {
          const parsed = JSON.parse(storedCompanyFinancialYear);
          setCurrentCompanyFinancialYear(parsed);
        } catch (e) {
          console.error('Error parsing stored company financial year:', e);
        }
      }

      const response = await fetch(`${API_BASE_URL}/companies/settings/all`);
      if (response.ok) {
        const result = await response.json();
        const settings = result.data;
        
        // Find current company and financial year settings
        const companySetting = settings.find(s => s.setting_key === 'current_company_id');
        const yearSetting = settings.find(s => s.setting_key === 'current_financial_year_name');
        
        let companyId = companySetting?.setting_value;
        let yearName = yearSetting?.setting_value;
        
        // If no company is set, get default company
        if (!companyId) {
          const defaultCompany = await fetchDefaultCompany();
          if (defaultCompany) {
            companyId = defaultCompany.id;
            // Auto-save default company to settings
            await updateCurrentCompany(companyId);
          }
        }
        
        // If no financial year is set, get default financial year
        if (!yearName) {
          const defaultYear = await fetchDefaultFinancialYear();
          if (defaultYear) {
            yearName = defaultYear.name;
            // Auto-save default financial year to settings
            await updateCurrentFinancialYear(yearName);
          }
        }
        
        // Fetch company and year details
        if (companyId) {
          await fetchCompanyDetails(companyId);
        }
        
        if (yearName) {
          await fetchFinancialYearDetails(yearName);
        }
        
        // If both company and year are available, fetch company financial year record
        if (companyId && yearName) {
          await fetchCompanyFinancialYearRecord(companyId, yearName);
        }
        
        // Fetch order settings
        await fetchOrderSettings();
        
        // Fetch permission settings
        await fetchPermissionSettings();
      }
    } catch (error) {
      console.error('Error fetching current settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/settings/orders`);
      if (response.ok) {
        const result = await response.json();
        setOrderSettings(result.data);
      }
    } catch (error) {
      console.error('Error fetching order settings:', error);
    }
  };

  const fetchPermissionSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/settings/permissions`);
      if (response.ok) {
        const result = await response.json();
        setPermissionSettings(result.data);
      }
    } catch (error) {
      console.error('Error fetching permission settings:', error);
    }
  };

  const fetchDefaultCompany = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies`);
      if (response.ok) {
        const result = await response.json();
        return result.data[0]; // Get first company as default
      }
    } catch (error) {
      console.error('Error fetching default company:', error);
    }
    return null;
  };

  const fetchDefaultFinancialYear = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/financial-years/all`);
      if (response.ok) {
        const result = await response.json();
        // Get the active financial year as default
        return result.data.find(year => year.is_active__c) || result.data[0];
      }
    } catch (error) {
      console.error('Error fetching default financial year:', error);
    }
    return null;
  };

  const fetchCompanyDetails = async (companyId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies`);
      if (response.ok) {
        const result = await response.json();
        const company = result.data.find(c => c.id === companyId);
        if (company) {
          setCurrentCompany(company);
        }
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
    }
  };

  const fetchFinancialYearDetails = async (yearName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/financial-years/all`);
      if (response.ok) {
        const result = await response.json();
        const year = result.data.find(y => y.name === yearName);
        if (year) {
          setCurrentFinancialYear(year);
        }
      }
    } catch (error) {
      console.error('Error fetching financial year details:', error);
    }
  };

  const fetchCompanyFinancialYearRecord = async (companyId, yearName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tally-data/company-financial-year?company_id=${companyId}&financial_year=${yearName}`);
      
      if (response.ok) {
        const result = await response.json();
        const record = result.data;
        if (record) {
          setCurrentCompanyFinancialYear(record);
          // Store in session storage
          localStorage.setItem('currentCompanyFinancialYear', JSON.stringify(record));
        } else {
          // Clear from session storage if no record found
          localStorage.removeItem('currentCompanyFinancialYear');
          setCurrentCompanyFinancialYear(null);
        }
      }
    } catch (error) {
      console.error('Error fetching company financial year record:', error);
    }
  };

  const updateCurrentCompany = async (companyId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/settings/batch-update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          settings: [{ key: 'current_company_id', value: companyId }] 
        }),
      });
      
      if (response.ok) {
        await fetchCompanyDetails(companyId);
        // If financial year is also set, fetch company financial year record
        if (currentFinancialYear) {
          await fetchCompanyFinancialYearRecord(companyId, currentFinancialYear.name);
        }
      }
    } catch (error) {
      console.error('Error updating current company:', error);
    }
  };

  const updateCurrentFinancialYear = async (yearName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/settings/batch-update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          settings: [{ key: 'current_financial_year_name', value: yearName }] 
        }),
      });
      
      if (response.ok) {
        await fetchFinancialYearDetails(yearName);
        // If company is also set, fetch company financial year record
        if (currentCompany) {
          await fetchCompanyFinancialYearRecord(currentCompany.id, yearName);
        }
      }
    } catch (error) {
      console.error('Error updating current financial year:', error);
    }
  };

  const value = {
    currentCompany,
    currentFinancialYear,
    currentCompanyFinancialYear,
    loading,
    updateCurrentCompany,
    updateCurrentFinancialYear,
    refreshSettings: fetchCurrentSettings,
    orderSettings,
    permissionSettings
  };

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
};
