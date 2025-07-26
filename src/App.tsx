import { Routes, Route } from 'react-router-dom';
import Watch from './components/Watch';
import Durin from './components/Durin';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Watch />} />
        <Route path="/durin" element={<Durin />} />
      </Routes>
    </div>
  );
}

export default App;
