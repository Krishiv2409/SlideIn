'use client'

import React from 'react'

export default function SpinnerLoader() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      minHeight: '200px',
      width: '100%'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '4px solid rgba(0, 0, 0, 0.1)',
        borderTopColor: '#3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      <p style={{
        marginTop: '16px',
        fontSize: '16px',
        fontWeight: '500'
      }}>Loading SlideIn...</p>
    </div>
  )
} 