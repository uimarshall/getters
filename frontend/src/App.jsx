// import reactLogo from './assets/react.svg';

import Home from './components/pages/Home';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
