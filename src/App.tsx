import { Routes, Route } from 'react-router-dom';
import Watch from './components/Watch';
import Durin from './components/Durin';
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
        </Routes>
      </div>
    </>
  );
}

export default App;
