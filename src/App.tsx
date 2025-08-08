import { Routes, Route } from 'react-router-dom';
import Watch from './components/Watch';
import Durin from './components/Durin';
import Dorinex from './components/Dorinex'; // Importer le nouveau composant
import ThemeSelector from './components/ThemeSelector';
import './App.css';

function App() {
  return (
    <>
      <div className="background-container"></div>
      <div className="App">
        <ThemeSelector />
        <Routes>
          <Route path="/" element={<Watch />} />
          <Route path="/durin" element={<Durin />} />
          <Route path="/dorinex" element={<Dorinex />} /> {/* Ajouter la nouvelle route */}
        </Routes>
      </div>
    </>
  );
}

export default App;
