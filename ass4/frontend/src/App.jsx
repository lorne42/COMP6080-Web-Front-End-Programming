import Welcome from './pages/welcome';
import Login from './pages/login';
import Register from './pages/register';
import Dashboard from './pages/dashboard';
import EditPresentation from './pages/edit';
import PresentationPreview from './pages/preview'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/register" element={<Register />}></Route>
        <Route path="/dashboard" element={<Dashboard />}></Route>
        <Route path="/edit/:id/:slideNumber" element={<EditPresentation />} />
        <Route path="/preview/:id/:slideNumber" element={<PresentationPreview />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
