import React, { useState, useRef, useEffect } from 'react';
import { IoMdSettings } from 'react-icons/io';

const options = [
  { id: 'option1', label: 'Enable Notifications' },
  { id: 'option2', label: 'Dark Mode' },
  { id: 'option3', label: 'Auto Save' },
];

const SettingsDropdown = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState({});
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleCheckboxChange = (id) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="settings-dropdown" ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <IoMdSettings size={24} onClick={toggleDropdown} style={{ cursor: 'pointer' }} />
      {isOpen && (
        <div
          className="dropdown-menu"
          style={{
            position: 'absolute',
            top: '30px',
            right: '0',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            zIndex: 1000,
            minWidth: '200px'
          }}
        >
          {options.map((option) => (
            <label key={option.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <input
                type="checkbox"
                checked={!!selectedOptions[option.id]}
                onChange={() => handleCheckboxChange(option.id)}
                style={{ marginRight: '8px' }}
              />
              {option.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default SettingsDropdown;