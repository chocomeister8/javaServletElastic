import './App.css'
import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import Login from './pages/Login';
import Homepage from './pages/Homepage';
import UserManagement from './pages/UserManagement';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/home" element={<Homepage/>} />
        <Route path="/users" element={<UserManagement/>}/>
      </Routes>
    </BrowserRouter>
  );
}
export default App;
