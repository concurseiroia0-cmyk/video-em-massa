import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Collector from './pages/Collector';
import Queue from './pages/Queue';
import Templates from './pages/Templates';
import Library from './pages/Library';
import Campaigns from './pages/Campaigns';
import Scheduler from './pages/Scheduler';
import Accounts from './pages/Accounts';
import Publications from './pages/Publications';
import ImportProfile from './pages/ImportProfile';
import Landing from './pages/Landing';

export default function App() {
  return (
    <HashRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#e2e8f0',
            border: '1px solid #334155',
            borderRadius: '10px',
            fontSize: '13px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Layout>
        <Routes>
          <Route path="/landing" element={<Landing />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/coletar" element={<Collector />} />
          <Route path="/fila" element={<Queue />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/biblioteca" element={<Library />} />
          <Route path="/campanhas" element={<Campaigns />} />
          <Route path="/agenda" element={<Scheduler />} />
          <Route path="/contas" element={<Accounts />} />
          <Route path="/publicacoes" element={<Publications />} />
          <Route path="/importar-perfil" element={<ImportProfile />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
