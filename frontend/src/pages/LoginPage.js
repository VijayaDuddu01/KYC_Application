import React, { useState } from 'react';
import axios from 'axios';
import { Eye, EyeSlash, ShieldCheck } from '@phosphor-icons/react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LoginPage = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? `${API}/auth/register` : `${API}/auth/login`;
      const payload = isRegister
        ? { email: formData.email, password: formData.password, name: formData.name, role: 'reviewer' }
        : { email: formData.email, password: formData.password };

      const response = await axios.post(endpoint, payload);
      onLogin(response.data.token, response.data.user);
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck size={48} weight="duotone" className="text-[#002FA7]" />
              <h1 className="text-4xl font-bold tracking-tighter" style={{ fontFamily: 'Chivo' }}>
                ID Verify
              </h1>
            </div>
            <p className="text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans' }}>
              AI-Orchestrated Identity Verification System
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ fontFamily: 'Chivo' }}>
              {isRegister ? 'Create Account' : 'Sign In'}
            </h2>
            <p className="text-sm text-gray-500">
              {isRegister ? 'Register to start verifying documents' : 'Access the verification dashboard'}
            </p>
          </div>

          {error && (
            <div data-testid="login-error-message" className="mb-6 p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded-none">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
            {isRegister && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2" style={{ fontFamily: 'IBM Plex Sans' }}>
                  Full Name
                </label>
                <input
                  data-testid="register-name-input"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  style={{ fontFamily: 'IBM Plex Sans' }}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2" style={{ fontFamily: 'IBM Plex Sans' }}>
                Email Address
              </label>
              <input
                data-testid="login-email-input"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                style={{ fontFamily: 'IBM Plex Sans' }}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2" style={{ fontFamily: 'IBM Plex Sans' }}>
                Password
              </label>
              <div className="relative">
                <input
                  data-testid="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black pr-12"
                  style={{ fontFamily: 'IBM Plex Sans' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                  data-testid="toggle-password-visibility"
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="login-submit-button"
              className="w-full bg-black text-white py-3 rounded-none font-semibold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
              style={{ fontFamily: 'IBM Plex Sans' }}
            >
              {loading ? 'Processing...' : isRegister ? 'Register' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              data-testid="toggle-auth-mode"
              className="text-sm text-[#002FA7] hover:text-black font-medium"
              style={{ fontFamily: 'IBM Plex Sans' }}
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 bg-gray-100 border-l border-gray-200">
        <div className="h-full flex items-center justify-center p-12">
          <div className="text-center max-w-lg">
            <div className="mb-8">
              <div className="inline-block p-6 bg-white border border-gray-200">
                <ShieldCheck size={80} weight="duotone" className="text-[#002FA7]" />
              </div>
            </div>
            <h3 className="text-3xl font-bold tracking-tight mb-4" style={{ fontFamily: 'Chivo' }}>
              Secure Identity Verification
            </h3>
            <p className="text-gray-600 mb-6" style={{ fontFamily: 'IBM Plex Sans' }}>
              AI-powered OCR extraction, automated validation, and human-in-the-loop review for Aadhaar, PAN, and Passport documents.
            </p>
            <div className="grid grid-cols-3 gap-4 text-left">
              <div className="bg-white border border-gray-200 p-4">
                <div className="text-2xl font-bold text-[#002FA7] mb-1" style={{ fontFamily: 'Chivo' }}>OCR</div>
                <div className="text-xs text-gray-600">Extraction</div>
              </div>
              <div className="bg-white border border-gray-200 p-4">
                <div className="text-2xl font-bold text-[#00875A] mb-1" style={{ fontFamily: 'Chivo' }}>AI</div>
                <div className="text-xs text-gray-600">Validation</div>
              </div>
              <div className="bg-white border border-gray-200 p-4">
                <div className="text-2xl font-bold text-black mb-1" style={{ fontFamily: 'Chivo' }}>Review</div>
                <div className="text-xs text-gray-600">Human Check</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
