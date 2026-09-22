import { Route, Routes } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { Dashboard } from './pages/Dashboard';
import { RecordDelivery } from './pages/RecordDelivery';
import { ManageAgencies } from './pages/ManageAgencies';

function App() {
  return (
    <div className="min-h-screen bg-brand-lavender">
      <NavBar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/record" element={<RecordDelivery />} />
        <Route path="/agencies" element={<ManageAgencies />} />
      </Routes>
    </div>
  );
}

export default App;
