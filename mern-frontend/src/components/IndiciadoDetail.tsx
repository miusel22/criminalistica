import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  ArrowLeft, 
  User, 
  Edit,
  GraduationCap,
  Eye,
  Shield,
  MessageSquare,
  Home
} from 'lucide-react';
import toast from 'react-hot-toast';
import { IndiciadoService } from '../services/indiciadoService';
import { IndiciadoForm } from './IndiciadoForm';
import { DocumentosIndiciado } from './DocumentosIndiciado';
import { useTheme } from '../contexts/ThemeContext';
import { getTheme } from '../theme/theme';
import { transformBackendDataToFormData } from '../utils/indiciadoTransforms';

// Tipos para props de tema
interface ThemeProps {
  $theme: 'light' | 'dark';
}

const Container = styled.div<ThemeProps>`
  min-height: 100vh;
  background: ${({ $theme }) => getTheme($theme).colors.background};
  padding: 2rem;
`;

const Header = styled.div<ThemeProps>`
  background: ${({ $theme }) => getTheme($theme).colors.backgroundCard};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: ${({ $theme }) => $theme === 'dark' ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderLeft = styled.div<ThemeProps>`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BackButton = styled.button<ThemeProps>`
  background: ${({ $theme }) => getTheme($theme).colors.backgroundSecondary};
  border: 1px solid ${({ $theme }) => getTheme($theme).colors.border};
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ $theme }) => getTheme($theme).colors.textSecondary};
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $theme }) => getTheme($theme).colors.hover};
    color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
  }
`;

const HeaderTitle = styled.div<ThemeProps>`
  h1 {
    margin: 0;
    color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
    font-size: 1.5rem;
    font-weight: 600;
  }
  
  p {
    margin: 0.25rem 0 0 0;
    color: ${({ $theme }) => getTheme($theme).colors.textSecondary};
    font-size: 0.9rem;
  }
`;

const Actions = styled.div<ThemeProps>`
  display: flex;
  gap: 0.75rem;
`;

const ActionButton = styled.button<ThemeProps>`
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &.edit {
    background: ${({ $theme }) => getTheme($theme).colors.primary};
    color: ${({ $theme }) => getTheme($theme).colors.textInverse};
    
    &:hover {
      background: ${({ $theme }) => getTheme($theme).colors.primaryHover};
    }
  }
`;

const Content = styled.div<ThemeProps>`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ProfileCard = styled.div<ThemeProps>`
  background: ${({ $theme }) => getTheme($theme).colors.backgroundCard};
  border-radius: 12px;
  padding: 2rem;
  box-shadow: ${({ $theme }) => $theme === 'dark' ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'};
  height: fit-content;
`;

const ProfileImageContainer = styled.div<ThemeProps>`
  text-align: center;
  margin-bottom: 2rem;
`;

const ProfileImage = styled.img<ThemeProps>`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid ${({ $theme }) => getTheme($theme).colors.border};
  margin-bottom: 1rem;
`;

const ProfileImagePlaceholder = styled.div<ThemeProps>`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: 600;
  margin: 0 auto 1rem auto;
`;

const ProfileName = styled.h2<ThemeProps>`
  margin: 0 0 0.5rem 0;
  color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
  font-size: 1.25rem;
  text-align: center;
`;

const ProfileMeta = styled.div<ThemeProps>`
  text-align: center;
  color: ${({ $theme }) => getTheme($theme).colors.textSecondary};
  font-size: 0.9rem;
`;

const StatusBadge = styled.span<ThemeProps>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 0.5rem;
  background: ${({ $theme }) => getTheme($theme).colors.success};
  color: ${({ $theme }) => getTheme($theme).colors.textInverse};
`;

const DetailsGrid = styled.div<ThemeProps>`
  background: ${({ $theme }) => getTheme($theme).colors.backgroundCard};
  border-radius: 12px;
  padding: 2rem;
  box-shadow: ${({ $theme }) => $theme === 'dark' ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'};
`;

const Section = styled.div<ThemeProps>`
  margin-bottom: 2.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3<ThemeProps>`
  margin: 0 0 1.5rem 0;
  color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
  font-size: 1.25rem;
  font-weight: 600;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid ${({ $theme }) => getTheme($theme).colors.border};
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const DetailRow = styled.div<ThemeProps>`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: start;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

const DetailLabel = styled.span<ThemeProps>`
  font-weight: 600;
  color: ${({ $theme }) => getTheme($theme).colors.textSecondary};
`;

const DetailValue = styled.span<ThemeProps>`
  color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
  word-wrap: break-word;
  
  &.empty {
    color: ${({ $theme }) => getTheme($theme).colors.textSecondary};
    font-style: italic;
  }
`;


const LoadingState = styled.div<ThemeProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: ${({ $theme }) => getTheme($theme).colors.textSecondary};
  font-size: 1.1rem;
`;

const ErrorState = styled.div<ThemeProps>`
  background: ${({ $theme }) => getTheme($theme).colors.backgroundCard};
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  color: ${({ $theme }) => getTheme($theme).colors.danger};
`;

const ModalOverlay = styled.div<ThemeProps>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ $theme }) => $theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)'};
  z-index: 1001;
  overflow: auto;
`;

export const IndiciadoDetail: React.FC = () => {
  const { sectorId, subsectorId, indiciadoId } = useParams<{
    sectorId: string;
    subsectorId: string;
    indiciadoId: string;
  }>();
  const navigate = useNavigate();
  
  const [indiciado, setIndiciado] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Theme hook
  const { theme } = useTheme();

  useEffect(() => {
    loadIndiciadoData();
  }, [indiciadoId]);

  const loadIndiciadoData = async () => {
    if (!indiciadoId) {
      setError('ID de indiciado no válido');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Cargando datos del indiciado:', indiciadoId);
      
      const data = await IndiciadoService.getIndiciado(indiciadoId);
      console.log('✅ Datos del indiciado cargados:', data);
      
      setIndiciado(data);
    } catch (error: any) {
      console.error('❌ Error al cargar indiciado:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      setError(`Error al cargar los datos del indiciado: ${errorMessage}`);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard/sectores');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };
  const handleEditSuccess = (updatedIndiciado: any) => {
    toast.success('Indiciado actualizado exitosamente');
    setIsEditing(false);
    setIndiciado(updatedIndiciado);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const getImageUrl = (foto: any) => {
    if (!foto) return null;
    
    // Si foto es un objeto con filename (como en la base de datos)
    if (typeof foto === 'object' && foto.filename) {
      return IndiciadoService.obtenerUrlFoto(foto.filename);
    }
    
    // Si foto es un string directo (filename)
    if (typeof foto === 'string') {
      return IndiciadoService.obtenerUrlFoto(foto);
    }
    
    return null;
  };

  const getInitials = (nombre: string) => {
    if (!nombre) return '?';
    return nombre.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'No especificada';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const renderDetailValue = (value: any) => {
    if (value === null || value === undefined || value === '') {
      return <DetailValue $theme={theme} className="empty">No especificado</DetailValue>;
    }
    return <DetailValue $theme={theme}>{String(value)}</DetailValue>;
  };

  if (loading) {
    return (
      <Container $theme={theme}>
        <LoadingState $theme={theme}>
          Cargando información del indiciado...
        </LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
      <Container $theme={theme}>
        <ErrorState $theme={theme}>
          <h3>Error</h3>
          <p>{error}</p>
          <ActionButton $theme={theme} onClick={handleBack} style={{ marginTop: '1rem' }}>
            <ArrowLeft size={16} />
            Volver
          </ActionButton>
        </ErrorState>
      </Container>
    );
  }

  if (!indiciado) {
    return (
      <Container $theme={theme}>
        <ErrorState $theme={theme}>
          <h3>Indiciado no encontrado</h3>
          <p>No se pudo encontrar la información del indiciado solicitado.</p>
          <ActionButton $theme={theme} onClick={handleBack} style={{ marginTop: '1rem' }}>
            <ArrowLeft size={16} />
            Volver
          </ActionButton>
        </ErrorState>
      </Container>
    );
  }

  // Debug: Log para ver cómo está estructurada la foto
  console.log('🖼️ Datos de foto del indiciado:', indiciado.foto);
  
  const imageUrl = getImageUrl(indiciado.foto);
  const initials = getInitials(indiciado.nombre);
  
  console.log('🔗 URL de imagen generada:', imageUrl);
  console.log('Dios mio el indiciado', indiciado);

  return (
    <Container $theme={theme}>
      <Header $theme={theme}>
        <HeaderLeft $theme={theme}>
          <BackButton $theme={theme} onClick={handleBack}>
            <ArrowLeft size={18} />
            Volver a Sectores
          </BackButton>
          <HeaderTitle $theme={theme}>
            <h1>Detalles del Indiciado</h1>
            <p>Información completa y actualizada</p>
          </HeaderTitle>
        </HeaderLeft>
        
        <Actions $theme={theme}>
          <ActionButton $theme={theme} className="edit" onClick={handleEdit}>
            <Edit size={16} />
            Editar
          </ActionButton>
        </Actions>
      </Header>

      <Content $theme={theme}>
        <ProfileCard $theme={theme}>
          <ProfileImageContainer $theme={theme}>
            {imageUrl ? (
              <ProfileImage $theme={theme} 
                src={imageUrl} 
                alt={indiciado.nombre}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                  if (nextElement) {
                    nextElement.style.display = 'flex';
                  }
                }}
              />
            ) : (
              <ProfileImagePlaceholder $theme={theme}>
                {initials}
              </ProfileImagePlaceholder>
            )}
          </ProfileImageContainer>
          
          <ProfileName $theme={theme}>{indiciado.nombre}</ProfileName>
          <ProfileMeta $theme={theme}>
            {indiciado.edad} años
          </ProfileMeta>
        </ProfileCard>

        <DetailsGrid $theme={theme}>
          <Section $theme={theme}>
            <SectionTitle $theme={theme}>
              <User size={20} />
              Información Personal
            </SectionTitle>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>Nombre completo:</DetailLabel>
              {renderDetailValue(indiciado.nombre)}
            </DetailRow>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>Apellidos:</DetailLabel>
              {renderDetailValue(indiciado.apellidos)}
            </DetailRow>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>Alias:</DetailLabel>
              {renderDetailValue(indiciado.alias)}
            </DetailRow>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>Tipo de documento:</DetailLabel>
              {renderDetailValue(indiciado.documentoIdentidad.tipo)}
            </DetailRow>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>Número de documento:</DetailLabel>
              {renderDetailValue(indiciado.documentoIdentidad.numero)}
            </DetailRow>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>Fecha de nacimiento:</DetailLabel>
              <DetailValue $theme={theme}>{formatDate(indiciado.fechaNacimiento.fecha)}</DetailValue>
            </DetailRow>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>Lugar de nacimiento:</DetailLabel>
              {renderDetailValue(indiciado.fechaNacimiento.lugar)}
            </DetailRow>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>Edad:</DetailLabel>
              {renderDetailValue(indiciado.edad)}
            </DetailRow>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>Hijo de:</DetailLabel>
              {renderDetailValue(indiciado.hijoDe)}
            </DetailRow>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>Género:</DetailLabel>
              {renderDetailValue(indiciado.genero)}
            </DetailRow>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>Estado civil:</DetailLabel>
              {renderDetailValue(indiciado.estadoCivil)}
            </DetailRow>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>Nacionalidad:</DetailLabel>
              {renderDetailValue(indiciado.nacionalidad)}
            </DetailRow>
          </Section>

          <Section $theme={theme}>
            <SectionTitle $theme={theme}>
              <Home size={20} />
              Información de Contacto y Residencia
            </SectionTitle>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>Residencia:</DetailLabel>
              {renderDetailValue(indiciado.residencia)}
            </DetailRow>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>Dirección:</DetailLabel>
              {renderDetailValue(indiciado.direccion)}
            </DetailRow>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>Teléfono:</DetailLabel>
              {renderDetailValue(indiciado.telefono)}
            </DetailRow>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>Email:</DetailLabel>
              {renderDetailValue(indiciado.email)}
            </DetailRow>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>Sector que opera:</DetailLabel>
              {renderDetailValue(indiciado.sectorQueOpera)}
            </DetailRow>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>Documento expedido en:</DetailLabel>
              {renderDetailValue(indiciado.documentoIdentidad.expedidoEn)}
            </DetailRow>
          </Section>

          <Section $theme={theme}>
            <SectionTitle $theme={theme}>
              <GraduationCap size={20} />
              Información Académica y Laboral
            </SectionTitle>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>Estudios realizados:</DetailLabel>
              {renderDetailValue(indiciado.estudiosRealizados)}
            </DetailRow>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>Profesión:</DetailLabel>
              {renderDetailValue(indiciado.profesion)}
            </DetailRow>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>Oficio:</DetailLabel>
              {renderDetailValue(indiciado.oficio)}
            </DetailRow>
          </Section>

          <Section $theme={theme}>
            <SectionTitle $theme={theme}>
              <Shield size={20} />
              Información Delictiva
            </SectionTitle>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>Banda delincuencial:</DetailLabel>
              {renderDetailValue(indiciado.bandaDelincuencial)}
            </DetailRow>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>Delitos atribuidos:</DetailLabel>
              {renderDetailValue(indiciado.delitosAtribuidos)}
            </DetailRow>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>Situación jurídica:</DetailLabel>
              {renderDetailValue(indiciado.situacionJuridica)}
            </DetailRow>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>Antecedentes:</DetailLabel>
              {renderDetailValue(indiciado.antecedentes)}
            </DetailRow>
          </Section>

          {/* Sección de Señales Físicas */}
          <Section $theme={theme}>
            <SectionTitle $theme={theme}>
              <Eye size={20} />
              Señales Físicas
            </SectionTitle>
            
            {/* Obtener señales físicas del objeto senalesFisicas (con 's') */}
            {indiciado.senalesFisicas && (
              <>
                <DetailRow $theme={theme}>
                  <DetailLabel $theme={theme}>Estatura:</DetailLabel>
                  {renderDetailValue(indiciado.senalesFisicas.estatura)}
                </DetailRow>
                <DetailRow $theme={theme}>
                  <DetailLabel $theme={theme}>Peso:</DetailLabel>
                  {renderDetailValue(indiciado.senalesFisicas.peso)}
                </DetailRow>
                <DetailRow $theme={theme}>
                  <DetailLabel $theme={theme}>Contextura física:</DetailLabel>
                  {renderDetailValue(indiciado.senalesFisicas.contexturaFisica)}
                </DetailRow>
                <DetailRow $theme={theme}>
                  <DetailLabel $theme={theme}>Color de piel:</DetailLabel>
                  {renderDetailValue(indiciado.senalesFisicas.colorPiel)}
                </DetailRow>
                <DetailRow $theme={theme}>
                  <DetailLabel $theme={theme}>Color de ojos:</DetailLabel>
                  {renderDetailValue(indiciado.senalesFisicas.colorOjos)}
                </DetailRow>
                <DetailRow $theme={theme}>
                  <DetailLabel $theme={theme}>Color de cabello:</DetailLabel>
                  {renderDetailValue(indiciado.senalesFisicas.colorCabello)}
                </DetailRow>
                <DetailRow $theme={theme}>
                  <DetailLabel $theme={theme}>Marcas especiales:</DetailLabel>
                  {renderDetailValue(indiciado.senalesFisicas.marcasEspeciales)}
                </DetailRow>
              </>
            )}
            
            {/* Si también existen señales físicas detalladas del objeto señalesFisicas (con ñ) */}
            {indiciado.señalesFisicas && (
              <>
                <DetailRow $theme={theme}>
                  <DetailLabel $theme={theme}>Complexión (detallada):</DetailLabel>
                  {renderDetailValue(indiciado.señalesFisicas.complexion)}
                </DetailRow>
                <DetailRow $theme={theme}>
                  <DetailLabel $theme={theme}>Forma de cara:</DetailLabel>
                  {renderDetailValue(indiciado.señalesFisicas.formaCara)}
                </DetailRow>
                <DetailRow $theme={theme}>
                  <DetailLabel $theme={theme}>Tipo de cabello:</DetailLabel>
                  {renderDetailValue(indiciado.señalesFisicas.tipoCabello)}
                </DetailRow>
                <DetailRow $theme={theme}>
                  <DetailLabel $theme={theme}>Largo de cabello:</DetailLabel>
                  {renderDetailValue(indiciado.señalesFisicas.largoCabello)}
                </DetailRow>
                <DetailRow $theme={theme}>
                  <DetailLabel $theme={theme}>Forma de ojos:</DetailLabel>
                  {renderDetailValue(indiciado.señalesFisicas.formaOjos)}
                </DetailRow>
                <DetailRow $theme={theme}>
                  <DetailLabel $theme={theme}>Forma de nariz:</DetailLabel>
                  {renderDetailValue(indiciado.señalesFisicas.formaNariz)}
                </DetailRow>
                <DetailRow $theme={theme}>
                  <DetailLabel $theme={theme}>Forma de boca:</DetailLabel>
                  {renderDetailValue(indiciado.señalesFisicas.formaBoca)}
                </DetailRow>
                <DetailRow $theme={theme}>
                  <DetailLabel $theme={theme}>Forma de labios:</DetailLabel>
                  {renderDetailValue(indiciado.señalesFisicas.formaLabios)}
                </DetailRow>
              </>
            )}
          </Section>
          
          <Section $theme={theme}>
            <SectionTitle $theme={theme}>
              <MessageSquare size={20} />
              Observaciones Adicionales
            </SectionTitle>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>Observaciones:</DetailLabel>
              {renderDetailValue(indiciado.observaciones)}
            </DetailRow>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>URL de Google Earth:</DetailLabel>
              {indiciado.googleEarthUrl ? (
                <DetailValue $theme={theme}>
                  <a 
                    href={indiciado.googleEarthUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#007bff', textDecoration: 'underline' }}
                  >
                    Ver en Google Earth
                  </a>
                </DetailValue>
              ) : (
                <DetailValue $theme={theme} className="empty">No especificado</DetailValue>
              )}
            </DetailRow>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>Fecha de registro:</DetailLabel>
              <DetailValue $theme={theme}>{formatDate(indiciado.fechaRegistro || indiciado.createdAt)}</DetailValue>
            </DetailRow>
            <DetailRow $theme={theme}>
              <DetailLabel $theme={theme}>Última actualización:</DetailLabel>
              <DetailValue $theme={theme}>{formatDate(indiciado.updatedAt)}</DetailValue>
            </DetailRow>
          </Section>

          {/* Sección de Documentos Relacionados */}
          <DocumentosIndiciado 
            indiciadoId={indiciado.id || indiciado._id}
            readOnly={false}
          />
        </DetailsGrid>
      </Content>

      {/* Modal de edición */}
      {isEditing && (
        <ModalOverlay $theme={theme}>
          <IndiciadoForm
            initialData={{
              id: indiciado.id || indiciado._id,
              _id: indiciado.id || indiciado._id,
              subsectorId: indiciado.subsectorId,
              ...transformBackendDataToFormData(indiciado)
            }}
            isEdit={true}
            onSuccess={handleEditSuccess}
            onCancel={handleEditCancel}
          />
        </ModalOverlay>
      )}
    </Container>
  );
};

export default IndiciadoDetail;
