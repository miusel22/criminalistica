import React from 'react';
import styled from 'styled-components';
import { Users, UserCheck, UserX, Shield, Clock } from 'lucide-react';
import { UserStats } from '../services/userService';

interface UserStatsPanelProps {
  stats: UserStats;
}

const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h3`
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.25rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const StatCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1rem;
  border-radius: 8px;
  background: ${props => props.color || '#f8f9fa'};
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: white;
  line-height: 1;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
`;

const UserStatsPanel: React.FC<UserStatsPanelProps> = ({ stats }) => {
  const statCards = [
    {
      icon: <Users size={24} />,
      number: stats.total,
      label: 'Total de Usuarios',
      color: 'linear-gradient(45deg, #007bff, #0056b3)'
    },
    {
      icon: <UserCheck size={24} />,
      number: stats.active,
      label: 'Usuarios Activos',
      color: 'linear-gradient(45deg, #28a745, #1e7e34)'
    },
    {
      icon: <UserX size={24} />,
      number: stats.inactive,
      label: 'Usuarios Inactivos',
      color: 'linear-gradient(45deg, #6c757d, #495057)'
    },
    {
      icon: <Shield size={24} />,
      number: stats.admins,
      label: 'Administradores',
      color: 'linear-gradient(45deg, #dc3545, #c82333)'
    },
    {
      icon: <Clock size={24} />,
      number: stats.recent,
      label: 'Nuevos (30 días)',
      color: 'linear-gradient(45deg, #ffc107, #e0a800)'
    }
  ];

  return (
    <Container>
      <Title>Estadísticas de Usuarios</Title>
      <StatsGrid>
        {statCards.map((stat, index) => (
          <StatCard key={index} style={{ background: stat.color }}>
            <StatIcon>
              {stat.icon}
            </StatIcon>
            <StatContent>
              <StatNumber>{stat.number}</StatNumber>
              <StatLabel>{stat.label}</StatLabel>
            </StatContent>
          </StatCard>
        ))}
      </StatsGrid>
    </Container>
  );
};

export default UserStatsPanel;
