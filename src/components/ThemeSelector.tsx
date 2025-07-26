import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './ThemeSelector.css';

const ThemeSelector: React.FC = () => {
  const { setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleThemeChange = (theme: any) => {
    setTheme(theme);
    setIsMenuOpen(false);
  };

  return (
    <div className="theme-selector-container">
      <div className="dropdown">
        <button className="main-theme-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          Thèmes
        </button>
        {isMenuOpen && (
          <div className="dropdown-content">
            <button onClick={() => handleThemeChange('native')}>Native</button>
            <button onClick={() => handleThemeChange('native-borderless')}>Native Borderless</button>

            <div className="submenu">
              <button>Coco »</button>
              <div className="submenu-content">
                <button onClick={() => handleThemeChange('destiny')}>Destiny 2</button>
                <button onClick={() => handleThemeChange('nier')}>Nier Automata</button>
                <button onClick={() => handleThemeChange('ff14')}>Final Fantasy 14 (ASKIP)</button>
              </div>
            </div>

            <div className="submenu">
              <button>Chance »</button>
              <div className="submenu-content">
                <button onClick={() => handleThemeChange('princier')}>Princier</button>
                <button onClick={() => handleThemeChange('princier-2')}>Princier FDP</button>
                <button onClick={() => handleThemeChange('siegfried')}>Siegfried</button>
                <button onClick={() => handleThemeChange('castlevania')}>Castlevania</button>
              </div>
            </div>

            <div className="submenu">
              <button>Fêtes »</button>
              <div className="submenu-content">
                <button onClick={() => handleThemeChange('halloween-2')}>Halloween</button>
              </div>
            </div>
            
            <button onClick={() => handleThemeChange('jojal')}>Jojal</button>

            <div className="submenu">
              <button>Jeux aimés de tous »</button>
              <div className="submenu-content">
                <button onClick={() => handleThemeChange('star-citizen')}>Star Citizen</button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default ThemeSelector; 