import React, { useState } from 'react';
import axios from 'axios';
import { Eye, EyeSlash, ShieldCheck, Lightning, Cpu, ScanSmiley } from '@phosphor-icons/react';

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

  const quickDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API}/auth/login`, {
        email: 'admin@idverify.com',
        password: 'Admin@123'
      });
      onLogin(response.data.token, response.data.user);
    } catch (err) {
      setError('Demo login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* LEFT: Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none"></div>
        <div className="w-full max-w-md relative z-10">
          <div className="mb-12 fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <ShieldCheck size={56} weight="duotone" className="text-[#002FA7]" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full pulse-dot"></div>
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tighter leading-none" style={{ fontFamily: 'Chivo' }}>
                  ID Verify
                </h1>
                <div className="text-xs tracking-[0.3em] uppercase text-gray-500 font-bold mt-1" style={{ fontFamily: 'IBM Plex Mono' }}>
                  AI-ORCHESTRATED · v1.0
                </div>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Mono' }}>
              <div className="w-2 h-2 rounded-full live-indicator"></div>
              SYSTEM ONLINE
            </div>
          </div>

          <div className="mb-8 fade-in-up delay-100">
            <h2 className="text-3xl font-bold tracking-tight mb-2" style={{ fontFamily: 'Chivo' }}>
              {isRegister ? 'Create Account' : 'Sign In'}
            </h2>
            <p className="text-sm text-gray-500" style={{ fontFamily: 'IBM Plex Sans' }}>
              {isRegister ? 'Register to start verifying documents' : 'Access the verification dashboard'}
            </p>
          </div>

          {error && (
            <div data-testid="login-error-message" className="mb-6 p-3 bg-red-50 border-l-4 border-red-600 text-red-800 text-sm fade-in-up">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 fade-in-up delay-200" data-testid="login-form">
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
              className="w-full bg-black text-white py-3 rounded-none font-semibold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed relative overflow-hidden group"
              style={{ fontFamily: 'IBM Plex Sans' }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="dot-loader">
                      <span className="!bg-white"></span>
                      <span className="!bg-white"></span>
                      <span className="!bg-white"></span>
                    </div>
                    Processing
                  </>
                ) : (
                  <>
                    <Lightning size={18} weight="fill" />
                    {isRegister ? 'Create Account' : 'Sign In'}
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="mt-6 space-y-3 fade-in-up delay-300">
            {!isRegister && (
              <button
                onClick={quickDemoLogin}
                disabled={loading}
                data-testid="quick-demo-login-button"
                className="w-full border-2 border-black bg-white text-black py-3 rounded-none font-semibold hover:bg-black hover:text-white disabled:opacity-50 transition-all"
                style={{ fontFamily: 'IBM Plex Sans' }}
              >
                <span className="flex items-center justify-center gap-2">
                  <ScanSmiley size={18} />
                  ONE-CLICK DEMO LOGIN
                </span>
              </button>
            )}

            <div className="text-center">
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

            {!isRegister && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3" style={{ fontFamily: 'IBM Plex Sans' }}>
                  Test Credentials
                </div>
                <div className="bg-gray-50 border border-gray-200 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500" style={{ fontFamily: 'IBM Plex Mono' }}>Admin:</span>
                    <span className="text-xs font-semibold" style={{ fontFamily: 'IBM Plex Mono' }}>admin@idverify.com / Admin@123</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Hero Panel - Dramatic */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#111827] text-white relative overflow-hidden">
        <div className="absolute inset-0 grid-bg-dark"></div>

        {/* Floating neural nodes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] left-[20%] w-2 h-2 bg-[#002FA7] rounded-full neural-node"></div>
          <div className="absolute top-[30%] right-[25%] w-2 h-2 bg-[#00875A] rounded-full neural-node" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-[60%] left-[30%] w-2 h-2 bg-[#FFC300] rounded-full neural-node" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-[75%] right-[20%] w-2 h-2 bg-[#E63946] rounded-full neural-node" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-[45%] left-[70%] w-2 h-2 bg-white rounded-full neural-node" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-white/30 text-xs font-bold uppercase tracking-[0.2em] mb-8" style={{ fontFamily: 'IBM Plex Mono' }}>
              <Cpu size={14} />
              NEURAL VERIFICATION ENGINE
            </div>

            <h2 className="text-5xl font-bold tracking-tighter leading-tight mb-6" style={{ fontFamily: 'Chivo' }}>
              Identity, <br />
              <span className="text-[#00c477]">verified</span> in<br />
              <span className="inline-block border-b-4 border-[#E63946]">3.2 seconds.</span>
            </h2>

            <p className="text-lg text-gray-300 max-w-md leading-relaxed" style={{ fontFamily: 'IBM Plex Sans' }}>
              AI-orchestrated OCR extraction, automated tamper detection, and human-in-the-loop review — all in one pipeline.
            </p>
          </div>

          {/* Metrics Strip */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="border-l-2 border-[#00c477] pl-4">
                <div className="text-3xl font-bold" style={{ fontFamily: 'Chivo' }}>99.2%</div>
                <div className="text-xs uppercase tracking-wider text-gray-400" style={{ fontFamily: 'IBM Plex Mono' }}>Accuracy</div>
              </div>
              <div className="border-l-2 border-[#FFC300] pl-4">
                <div className="text-3xl font-bold" style={{ fontFamily: 'Chivo' }}>3.2s</div>
                <div className="text-xs uppercase tracking-wider text-gray-400" style={{ fontFamily: 'IBM Plex Mono' }}>Avg Time</div>
              </div>
              <div className="border-l-2 border-[#E63946] pl-4">
                <div className="text-3xl font-bold" style={{ fontFamily: 'Chivo' }}>24/7</div>
                <div className="text-xs uppercase tracking-wider text-gray-400" style={{ fontFamily: 'IBM Plex Mono' }}>Active</div>
              </div>
            </div>

            {/* Terminal preview */}
            <div className="bg-black/60 border border-white/10 p-4 font-mono text-xs space-y-1" style={{ fontFamily: 'IBM Plex Mono' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <span className="text-gray-500">ai-agent-console</span>
              </div>
              <div className="text-green-400">$ agent.ocr_extract(doc=aadhaar.jpg)</div>
              <div className="text-gray-400">→ document_number: xxxx-xxxx-1234</div>
              <div className="text-gray-400">→ confidence: 0.97</div>
              <div className="text-blue-400">$ agent.validate(extracted_data)</div>
              <div className="text-gray-400">→ tamper_detected: <span className="text-green-400">false</span></div>
              <div className="text-gray-400">→ status: <span className="text-green-400">VALIDATED</span></div>
              <div className="text-green-400 terminal-cursor">_</div>
            </div>

            {/* Supported documents */}
            <div className="flex items-center gap-6 pt-4 border-t border-white/10">
              <span className="text-xs uppercase tracking-wider text-gray-500 font-bold" style={{ fontFamily: 'IBM Plex Mono' }}>Supports:</span>
              <span className="text-sm" style={{ fontFamily: 'IBM Plex Mono' }}>AADHAAR</span>
              <span className="text-gray-600">·</span>
              <span className="text-sm" style={{ fontFamily: 'IBM Plex Mono' }}>PAN</span>
              <span className="text-gray-600">·</span>
              <span className="text-sm" style={{ fontFamily: 'IBM Plex Mono' }}>PASSPORT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
