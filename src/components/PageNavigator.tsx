import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PageNavigator.css';

const PageNavigator: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isDorinexPage = location.pathname === '/dorinex';

  const handleNavigation = () => {
    if (isDorinexPage) {
      navigate('/');
    } else {
      navigate('/dorinex');
    }
  };

  return (
    <div className="page-navigator-container">
      <button className="page-navigator-btn" onClick={handleNavigation}>
        {isDorinexPage ? 'LPD3' : 'Dorinex'}
      </button>
    </div>
  );
};

export default PageNavigator;
