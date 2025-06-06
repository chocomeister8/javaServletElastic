import './App.css'
import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import Login from './pages/Login';
import Homepage from './pages/Homepage';
import UserManagement from './pages/UserManagement';
import 'bootstrap/dist/css/bootstrap.min.css';
import ProtectedRoutes from './components/ProtectedRoutes';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={localStorage.getItem("token") ? <Navigate to="/home" /> : <Login />}/>
        <Route element={<ProtectedRoutes />}>
          <Route path="/home" element={<Homepage />} />
          <Route path="/users" element={<UserManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;
