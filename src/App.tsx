import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import Receitas from './pages/Receitas';
import Despesas from './pages/Despesas';
import Investimentos from './pages/Investimentos';
import Metas from './pages/Metas';
import Configuracoes from './pages/Configuracoes';
import Login from './pages/Login';
import { AuthProvider } from './components/auth/AuthContext';
import { AuthGuard } from './components/auth/AuthGuard';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/*" element={
            <AuthGuard>
              <AppShell>
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={
                      <motion.div 
                        key="dashboard"
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Dashboard />
                      </motion.div>
                    } />
                    <Route path="/receitas" element={
                      <motion.div 
                        key="receitas"
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Receitas />
                      </motion.div>
                    } />
                    <Route path="/despesas" element={
                      <motion.div 
                        key="despesas"
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Despesas />
                      </motion.div>
                    } />
                    <Route path="/investimentos" element={
                      <motion.div 
                        key="investimentos"
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Investimentos />
                      </motion.div>
                    } />
                    <Route path="/metas" element={
                      <motion.div 
                        key="metas"
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Metas />
                      </motion.div>
                    } />
                    <Route path="/configuracoes" element={
                      <motion.div 
                        key="configuracoes"
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Configuracoes />
                      </motion.div>
                    } />
                  </Routes>
                </AnimatePresence>
              </AppShell>
            </AuthGuard>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
