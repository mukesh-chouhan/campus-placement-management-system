import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

const ErrorPage = ({ errorCode = '404', title = 'Page Not Found', description = 'The page you are looking for does not exist or has been moved.' }) => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      textAlign: 'center',
      padding: '40px 24px',
      color: 'var(--text-main)',
      backgroundColor: 'var(--bg-app)'
    }}>
      <div style={{
        maxWidth: 450,
        backgroundColor: 'var(--bg-card)',
        padding: '40px 32px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20
      }}>
        {/* Academic Illustrated SVG Alert Logo */}
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          backgroundColor: 'var(--danger-light)',
          color: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8
        }}>
          <AlertTriangle size={38} />
        </div>

        <div>
          <span style={{
            fontSize: '3rem',
            fontWeight: 800,
            color: 'var(--text-light)',
            display: 'block',
            lineHeight: 1,
            letterSpacing: '-0.03em',
            marginBottom: 8
          }}>{errorCode}</span>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            marginBottom: 8
          }}>{title}</h2>
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5
          }}>{description}</p>
        </div>

        <div style={{
          display: 'flex',
          gap: 12,
          marginTop: 8,
          width: '100%',
          justifyContent: 'center'
        }}>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' }}
          >
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' }}
          >
            <Home size={16} />
            <span>Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
