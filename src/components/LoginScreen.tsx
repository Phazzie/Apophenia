// #TODO DEPRECATED: Migrate to src/ui and use src/core/state.
import React, { useState } from 'react';
import { useUserStore } from '../stores/userStore';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp, signIn } = useUserStore();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await signUp(email, password);
      // User will be logged in automatically after sign up and email confirmation
      // You might want to show a message to check their email
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred during sign up';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred during sign in';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-screen">
      <h2>Enter the Abyss</h2>
      <form>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.soul@example.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your deepest secret"
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="button-group">
          <button onClick={handleSignIn} disabled={isSubmitting}>
            {isSubmitting ? 'Descending...' : 'Sign In'}
          </button>
          <button onClick={handleSignUp} disabled={isSubmitting}>
            {isSubmitting ? 'Binding...' : 'Sign Up'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginScreen;