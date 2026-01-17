import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
// Placeholder imports for pages
import Home from './pages/Home';
import Departments from './pages/Departments';
import Doctors from './pages/Doctors';
import DoctorProfile from './pages/DoctorProfile';
import Appointments from './pages/Appointments';
import PatientProfile from './pages/PatientProfile';
import BookingConfirmation from './pages/BookingConfirmation';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="departments" element={<Departments />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="doctors/:id" element={<DoctorProfile />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="profile" element={<PatientProfile />} />
          <Route path="booking-confirmation" element={<BookingConfirmation />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
