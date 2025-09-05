import React from 'react';
import { IndiciadosList } from '../components/IndiciadosList';

export const IndiciadosListPage: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <IndiciadosList />
    </div>
  );
};
