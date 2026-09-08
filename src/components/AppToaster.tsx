import React from 'react'
import { Toaster } from 'react-hot-toast'

export const AppToaster: React.FC = () => {
  return (
    <Toaster
      position="top-center"
      containerStyle={{
        top: '80px',
      }}
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1e293b',
          color: '#f8fafc',
          fontSize: '13px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          padding: '10px 16px',
          maxWidth: '450px',
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
        },
      }}
    />
  )
}
