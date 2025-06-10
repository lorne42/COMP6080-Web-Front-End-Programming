
import Dashboard from './pages/dashboard.jsx';
import Wordcolour from './pages/wordcolour.jsx';
import Aimlabs from './pages/aimlabs.jsx';
import Tower from './pages/towerofhanoi.jsx';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';


import "./App.css";
const Footer = () => {
  return (
    <nav className="footer">
      
      {/* Links */}
      <div className="nav-item">
        <Link to="/dashboard" className="nav-link">
          Dashboard
        </Link>
        <Link to="/dashboard" className="nav-link-s">
          Da
        </Link>
      </div>
      <div className="nav-item">
        <Link to="/game/wordcolour" className="nav-link">
          WordColour
        </Link>
        <Link to="/game/wordcolour" className="nav-link-s">
          Wc
        </Link>
      </div>
      <div className="nav-item">
        <img
          src="https://www.zhipin.com/favicon.ico" // Placeholder logo
          alt="App Logo"
          className="nav-logo"
        />
      </div>
      <div className="nav-item">
        <Link to="/game/aimlabs" className="nav-link">
          Aimlabs
        </Link>
        <Link to="/game/aimlabs" className="nav-link-s">
          Al
        </Link>
      </div>
      <div className="nav-item">
        <Link to="/game/tower" className="nav-link">
          Tower of Hanoi
        </Link>
        <Link to="/game/tower" className="nav-link-s">
          T
        </Link>
      </div>
    </nav>
  );
};

function App() {
  

  
  return (
    <BrowserRouter>
      <main className="main-body">
      <Routes>
        <Route path="/dashboard" element={<Dashboard />}></Route>
        <Route path="/game/wordcolour" element={<Wordcolour />}></Route>
        <Route path="/game/aimlabs" element={<Aimlabs />}></Route>
        <Route path="/game/tower" element={<Tower />}></Route>
      </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}

export default App
