import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="text-success" size={20} />;
      case 'error':
        return <XCircle className="text-danger" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-warning" size={20} />;
      case 'info':
      default:
        return <Info className="text-info" size={20} />;
    }
  };

  return (
    <motion.div 
      className={`toast toast-${type}`}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 2000,
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '16px 20px',
        borderRadius: 12,
        borderLeft: '4px solid',
        minWidth: 320
      }}
    >
      {getIcon()}
      <div style={{ flex: 1, fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)' }}>
        {message}
      </div>
      <button 
        onClick={onClose} 
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

export default Toast;
