import { Route, Routes } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { Dashboard } from './pages/Dashboard';
import { RecordDelivery } from './pages/RecordDelivery';
import { ManageAgencies } from './pages/ManageAgencies';

function App() {
  return (
    <div className="min-h-[calc(100vh-28px)] rounded-[26px] border-[3px] border-brand-ink bg-brand-lavender">
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
