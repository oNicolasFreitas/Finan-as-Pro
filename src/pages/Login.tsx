import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Lock, Mail } from 'lucide-react';
import { Card, Button, Input } from '../components/UI';
import { useAuth } from '../components/auth/AuthContext';
import { motion } from 'motion/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, signIn } = useAuth();

  useEffect(() => {
    if (user) {
      console.log('[Login]', 'Already logged in, redirecting to /dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    console.log('[Login]', 'submit');
    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
      console.log('[Login]', 'redirect:/dashboard');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('[Login]', 'error', err.message);
      setError(err.message || 'Erro ao entrar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gold rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-gold/20">
            <TrendingUp size={32} />
          </div>
          <h1 className="text-3xl font-bold text-text">Finance Manager</h1>
          <p className="text-muted">Sua gestão financeira premium</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text flex items-center gap-2">
                <Mail size={16} className="text-gold" />
                Email
              </label>
              <Input 
                type="email" 
                placeholder="seu@email.com" 
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text flex items-center gap-2">
                <Lock size={16} className="text-gold" />
                Senha
              </label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 animate-fade-in">
                {error}
              </p>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
              size="lg"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="flex flex-col gap-2 text-center pt-2">
              <button type="button" className="text-sm text-gold hover:text-gold-strong font-medium transition-colors">
                Esqueci minha senha
              </button>
              <button type="button" className="text-sm text-muted hover:text-text transition-colors">
                Não tem uma conta? <span className="text-gold font-medium">Criar conta</span>
              </button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
