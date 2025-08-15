import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 mb-4 rounded">{error}</div>
        )}

        <label className="block mb-2 font-semibold">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="you@example.com"
        />

        <label className="block mb-2 font-semibold">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Your password"
        />

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded font-semibold transition"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
}
