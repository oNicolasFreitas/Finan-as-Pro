export interface User {
  id: string;
  email: string;
}

const AUTH_KEY = 'financas_pro_auth';

export const auth = {
  getUser: (): User | null => {
    console.log('[Auth]', 'getSession:start');
    const stored = localStorage.getItem(AUTH_KEY);
    if (!stored) {
      console.log('[Auth]', 'getSession:done', { hasUser: false });
      return null;
    }
    try {
      const user = JSON.parse(stored);
      console.log('[Auth]', 'getSession:done', { hasUser: true, userId: user.id });
      return user;
    } catch (e) {
      console.error('[Auth]', 'getSession:error', e);
      return null;
    }
  },

  signIn: async (email: string, password: string): Promise<User> => {
    console.log('[Auth]', 'signIn:start', { email });
    
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (password.length < 6) {
          const err = new Error('A senha deve ter pelo menos 6 caracteres.');
          console.log('[Auth]', 'signIn:error', err.message);
          reject(err);
          return;
        }
        
        const user = { id: '1', email };
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        console.log('[Auth]', 'signIn:success', { userId: user.id });
        resolve(user);
      }, 1000);
    });
  },

  signOut: () => {
    console.log('[Auth]', 'signOut');
    localStorage.removeItem(AUTH_KEY);
    // We'll handle the redirect in the context to avoid hard page reloads if possible, 
    // but keeping this as fallback or for external calls
    window.location.href = '/login';
  }
};
