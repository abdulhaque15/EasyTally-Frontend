// import { useState } from 'react';

const TwoStageToggle = ({ currentState, setCurrentState }) => {
  const views = [
    { id: 0, label: "List view", color: "var(--primary-color)" },
    { id: 1, label: "Board view", color: "var(--secondary-color)" }
  ];

  const handleToggle = () => {
    setCurrentState((prevState) => (prevState + 1) % 2);
  };

  const getHandlePosition = () => {
    return currentState === 0 ? '2px' : 'calc(100% - 28px)';
  };

  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: '10px' }}>
      <div
        onClick={handleToggle}
        style={{
          width: '60px',
          height: '30px',
          backgroundColor: '#eee',
          borderRadius: '15px',
          position: 'relative',
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: '26px',
            height: '26px',
            backgroundColor: views[currentState]?.color,
            borderRadius: '50%',
            position: 'absolute',
            top: '2px',
            left: getHandlePosition(),
            transition: 'left 0.3s ease',
          }}
        />
      </div>
      <div
        style={{
          fontSize: '15px',
          fontFamily: 'Arial, sans-serif',
          color: views[currentState]?.color,
        }}
      >
        {/* {views[currentState].label} */}
      </div>
    </div>
  );
};

export default TwoStageToggle;
