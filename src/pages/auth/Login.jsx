import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaEnvelope, FaLock, FaSignInAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Auth.css';
import authService from '../../services/authService'; // Import direct authService

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Validation
      if (!formData.email || !formData.password) {
        setError('Email and password are required');
        setIsLoading(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      console.log("Attempting login with:", { email: formData.email });

      // Try direct API call first
      try {
        const directResponse = await authService.login(formData.email, formData.password);
        console.log("Direct login response:", directResponse);
        
        if (directResponse && directResponse.data) {
          setSuccess('Login successful! Redirecting...');
          
          // Get user role from token or response
          const userRole = directResponse.data.role || localStorage.getItem('userRole');
          
          // Redirect based on role
          setTimeout(() => {
            if (userRole === 'ADMIN') {
              navigate('/admin/dashboard');
            } else if (userRole === 'LANDLORD') {
              navigate('/landlord/dashboard');
            } else {
              navigate('/tenant/dashboard');
            }
          }, 1000);
          return;
        }
      } catch (directError) {
        console.error("Direct login failed, trying context method:", directError);
      }
      
      // If direct call fails, use context method
      const result = await login(formData.email, formData.password);

      if (result.success) {
        setSuccess('Login successful! Redirecting...');
        
        // Get user role from local storage
        const userRole = localStorage.getItem('userRole');
        
        // Redirect based on role
        setTimeout(() => {
          if (userRole === 'ADMIN') {
            navigate('/admin/dashboard');
          } else if (userRole === 'LANDLORD') {
            navigate('/landlord/dashboard');
          } else {
            navigate('/tenant/dashboard');
          }
        }, 1000);
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 
               error.message || 
               'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2><FaSignInAlt /> Login</h2>
          <p>Welcome back! Please login to your account</p>
        </div>

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}
        
        {success && (
          <div className="alert alert-success">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <FaEnvelope /> Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <FaLock /> Password
            </label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="form-control"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-group forgot-password">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <div className="form-group">
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>

          <div className="auth-footer">
            <p>
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 