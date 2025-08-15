import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes, FaTimesCircle } from 'react-icons/fa';
import { useAuth, TOAST_TYPES } from '../../context/AuthContext';

export default function Toast({ toast }) {
  const { removeToast } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, removeToast]);

  const getToastStyles = () => {
    switch (toast.type) {
      case TOAST_TYPES.SUCCESS:
        return {
          bg: 'bg-green-500',
          icon: <FaCheckCircle className="text-green-500" />,
          border: 'border-green-200'
        };
      case TOAST_TYPES.ERROR:
        return {
          bg: 'bg-red-500',
          icon: <FaTimesCircle className="text-red-500" />,
          border: 'border-red-200'
        };
      case TOAST_TYPES.WARNING:
        return {
          bg: 'bg-yellow-500',
          icon: <FaExclamationTriangle className="text-yellow-500" />,
          border: 'border-yellow-200'
        };
      case TOAST_TYPES.INFO:
      default:
        return {
          bg: 'bg-blue-500',
          icon: <FaInfoCircle className="text-blue-500" />,
          border: 'border-blue-200'
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div className={`flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow border ${styles.border} animate-slide-in`}>
      <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${styles.bg} rounded-lg`}>
        {styles.icon}
      </div>
      <div className="ml-3 text-sm font-normal flex-1">{toast.message}</div>
      <button
        onClick={() => removeToast(toast.id)}
        className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
      >
        <FaTimes className="w-3 h-3" />
      </button>
    </div>
  );
}

// Toast Container Component
export function ToastContainer() {
  const { toasts } = useAuth();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
} 