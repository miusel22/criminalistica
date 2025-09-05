import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Camera, 
  Edit,
  Save,
  X,
  GraduationCap,
  Briefcase,
  Eye,
  Shield,
  MessageSquare,
  Home,
  Heart
} from 'lucide-react';
import toast from 'react-hot-toast';
import { IndiciadoService } from '../services/indiciadoService';
import { IndiciadoForm } from './IndiciadoForm';
import { transformBackendDataToFormData } from '../utils/indiciadoTransforms';

const Container = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem;
`;

const Header = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BackButton = styled.button`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
    color: #495057;
  }
`;

const HeaderTitle = styled.div`
  h1 {
    margin: 0;
    color: #333;
    font-size: 1.5rem;
    font-weight: 600;
  }
  
  p {
    margin: 0.25rem 0 0 0;
    color: #6c757d;
    font-size: 0.9rem;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ActionButton = styled.button`
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
    background: #007bff;
    color: white;
    
    &:hover {
      background: #0056b3;
    }
  }
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ProfileCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
`;

const ProfileImageContainer = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const ProfileImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #e9ecef;
  margin-bottom: 1rem;
`;

const ProfileImagePlaceholder = styled.div`
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

const ProfileName = styled.h2`
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.25rem;
  text-align: center;
`;

const ProfileMeta = styled.div`
  text-align: center;
  color: #6c757d;
  font-size: 0.9rem;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 0.5rem;
  background: #d4edda;
  color: #155724;
`;

const DetailsGrid = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Section = styled.div`
  margin-bottom: 2.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.25rem;
  font-weight: 600;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const DetailRow = styled.div`
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

const DetailLabel = styled.span`
  font-weight: 600;
  color: #495057;
`;

const DetailValue = styled.span`
  color: #333;
  word-wrap: break-word;
  
  &.empty {
    color: #6c757d;
    font-style: italic;
  }
`;

const ImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ImageCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
`;

const ImagePreview = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.02);
  }
`;

const ImageLabel = styled.div`
  padding: 0.75rem;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;
  color: #495057;
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: #6c757d;
  font-size: 1.1rem;
`;

const ErrorState = styled.div`
  background: white;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  color: #dc3545;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
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
      return <DetailValue className="empty">No especificado</DetailValue>;
    }
    return <DetailValue>{String(value)}</DetailValue>;
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>
          Cargando información del indiciado...
        </LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorState>
          <h3>Error</h3>
          <p>{error}</p>
          <ActionButton onClick={handleBack} style={{ marginTop: '1rem' }}>
            <ArrowLeft size={16} />
            Volver
          </ActionButton>
        </ErrorState>
      </Container>
    );
  }

  if (!indiciado) {
    return (
      <Container>
        <ErrorState>
          <h3>Indiciado no encontrado</h3>
          <p>No se pudo encontrar la información del indiciado solicitado.</p>
          <ActionButton onClick={handleBack} style={{ marginTop: '1rem' }}>
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
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton onClick={handleBack}>
            <ArrowLeft size={18} />
            Volver a Sectores
          </BackButton>
          <HeaderTitle>
            <h1>Detalles del Indiciado</h1>
            <p>Información completa y actualizada</p>
          </HeaderTitle>
        </HeaderLeft>
        
        <Actions>
          <ActionButton className="edit" onClick={handleEdit}>
            <Edit size={16} />
            Editar
          </ActionButton>
        </Actions>
      </Header>

      <Content>
        <ProfileCard>
          <ProfileImageContainer>
            {imageUrl ? (
              <ProfileImage 
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
              <ProfileImagePlaceholder>
                {initials}
              </ProfileImagePlaceholder>
            )}
          </ProfileImageContainer>
          
          <ProfileName>{indiciado.nombre}</ProfileName>
          <ProfileMeta>
            {indiciado.documentoTipo} {indiciado.documentoNumero}
            <br />
            {indiciado.edad} años
            <StatusBadge>Activo</StatusBadge>
          </ProfileMeta>
        </ProfileCard>

        <DetailsGrid>
          <Section>
            <SectionTitle>
              <User size={20} />
              Información Personal
            </SectionTitle>
            <DetailRow>
              <DetailLabel>Nombre completo:</DetailLabel>
              {renderDetailValue(indiciado.nombre)}
            </DetailRow>
            <DetailRow>
              <DetailLabel>Apellidos:</DetailLabel>
              {renderDetailValue(indiciado.apellidos)}
            </DetailRow>
            <DetailRow>
              <DetailLabel>Alias:</DetailLabel>
              {renderDetailValue(indiciado.alias)}
            </DetailRow>
            <DetailRow>
              <DetailLabel>Tipo de documento:</DetailLabel>
              {renderDetailValue(indiciado.documentoTipo)}
            </DetailRow>
            <DetailRow>
              <DetailLabel>Número de documento:</DetailLabel>
              {renderDetailValue(indiciado.documentoNumero)}
            </DetailRow>
            <DetailRow>
              <DetailLabel>Fecha de nacimiento:</DetailLabel>
              <DetailValue>{formatDate(indiciado.fechaNacimiento)}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Lugar de nacimiento:</DetailLabel>
              {renderDetailValue(indiciado.lugarNacimiento)}
            </DetailRow>
            <DetailRow>
              <DetailLabel>Edad:</DetailLabel>
              {renderDetailValue(indiciado.edad)}
            </DetailRow>
            <DetailRow>
              <DetailLabel>Hijo de:</DetailLabel>
              {renderDetailValue(indiciado.hijoDe)}
            </DetailRow>
            <DetailRow>
              <DetailLabel>Género:</DetailLabel>
              {renderDetailValue(indiciado.genero)}
            </DetailRow>
            <DetailRow>
              <DetailLabel>Estado civil:</DetailLabel>
              {renderDetailValue(indiciado.estadoCivil)}
            </DetailRow>
            <DetailRow>
              <DetailLabel>Nacionalidad:</DetailLabel>
              {renderDetailValue(indiciado.nacionalidad)}
            </DetailRow>
          </Section>

          <Section>
            <SectionTitle>
              <Home size={20} />
              Información de Contacto y Residencia
            </SectionTitle>
            <DetailRow>
              <DetailLabel>Residencia:</DetailLabel>
              {renderDetailValue(indiciado.residencia)}
            </DetailRow>
            <DetailRow>
              <DetailLabel>Dirección:</DetailLabel>
              {renderDetailValue(indiciado.direccion)}
            </DetailRow>
            <DetailRow>
              <DetailLabel>Teléfono:</DetailLabel>
              {renderDetailValue(indiciado.telefono)}
            </DetailRow>
            <DetailRow>
              <DetailLabel>Email:</DetailLabel>
              {renderDetailValue(indiciado.email)}
            </DetailRow>
            <DetailRow>
              <DetailLabel>Sector que opera:</DetailLabel>
              {renderDetailValue(indiciado.sectorQueOpera)}
            </DetailRow>
            <DetailRow>
              <DetailLabel>Documento expedido en:</DetailLabel>
              {renderDetailValue(indiciado.documentoExpedidoEn)}
            </DetailRow>
          </Section>

          <Section>
            <SectionTitle>
              <GraduationCap size={20} />
              Información Académica y Laboral
            </SectionTitle>
            <DetailRow>
              <DetailLabel>Estudios realizados:</DetailLabel>
              {renderDetailValue(indiciado.estudiosRealizados)}
            </DetailRow>
            <DetailRow>
              <DetailLabel>Profesión:</DetailLabel>
              {renderDetailValue(indiciado.profesion)}
            </DetailRow>
            <DetailRow>
              <DetailLabel>Oficio:</DetailLabel>
              {renderDetailValue(indiciado.oficio)}
            </DetailRow>
          </Section>

          <Section>
            <SectionTitle>
              <Shield size={20} />
              Información Delictiva
            </SectionTitle>
            <DetailRow>
              <DetailLabel>Banda delincuencial:</DetailLabel>
              {renderDetailValue(indiciado.bandaDelincuencial)}
            </DetailRow>
            <DetailRow>
              <DetailLabel>Delitos atribuidos:</DetailLabel>
              {renderDetailValue(indiciado.delitosAtribuidos)}
            </DetailRow>
            <DetailRow>
              <DetailLabel>Situación jurídica:</DetailLabel>
              {renderDetailValue(indiciado.situacionJuridica)}
            </DetailRow>
            <DetailRow>
              <DetailLabel>Antecedentes:</DetailLabel>
              {renderDetailValue(indiciado.antecedentes)}
            </DetailRow>
          </Section>

          {/* Sección de Señales Físicas */}
          <Section>
            <SectionTitle>
              <Eye size={20} />
              Señales Físicas
            </SectionTitle>
            
            {/* Obtener señales físicas del objeto senalesFisicas (con 's') */}
            {indiciado.senalesFisicas && (
              <>
                <DetailRow>
                  <DetailLabel>Estatura:</DetailLabel>
                  {renderDetailValue(indiciado.senalesFisicas.estatura)}
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Peso:</DetailLabel>
                  {renderDetailValue(indiciado.senalesFisicas.peso)}
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Contextura física:</DetailLabel>
                  {renderDetailValue(indiciado.senalesFisicas.contexturaFisica)}
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Color de piel:</DetailLabel>
                  {renderDetailValue(indiciado.senalesFisicas.colorPiel)}
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Color de ojos:</DetailLabel>
                  {renderDetailValue(indiciado.senalesFisicas.colorOjos)}
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Color de cabello:</DetailLabel>
                  {renderDetailValue(indiciado.senalesFisicas.colorCabello)}
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Marcas especiales:</DetailLabel>
                  {renderDetailValue(indiciado.senalesFisicas.marcasEspeciales)}
                </DetailRow>
              </>
            )}
            
            {/* Si también existen señales físicas detalladas del objeto señalesFisicas (con ñ) */}
            {indiciado.señalesFisicas && (
              <>
                <DetailRow>
                  <DetailLabel>Complexión (detallada):</DetailLabel>
                  {renderDetailValue(indiciado.señalesFisicas.complexion)}
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Forma de cara:</DetailLabel>
                  {renderDetailValue(indiciado.señalesFisicas.formaCara)}
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Tipo de cabello:</DetailLabel>
                  {renderDetailValue(indiciado.señalesFisicas.tipoCabello)}
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Largo de cabello:</DetailLabel>
                  {renderDetailValue(indiciado.señalesFisicas.largoCabello)}
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Forma de ojos:</DetailLabel>
                  {renderDetailValue(indiciado.señalesFisicas.formaOjos)}
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Forma de nariz:</DetailLabel>
                  {renderDetailValue(indiciado.señalesFisicas.formaNariz)}
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Forma de boca:</DetailLabel>
                  {renderDetailValue(indiciado.señalesFisicas.formaBoca)}
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Forma de labios:</DetailLabel>
                  {renderDetailValue(indiciado.señalesFisicas.formaLabios)}
                </DetailRow>
              </>
            )}
          </Section>
          
          <Section>
            <SectionTitle>
              <MessageSquare size={20} />
              Observaciones Adicionales
            </SectionTitle>
            <DetailRow>
              <DetailLabel>Observaciones:</DetailLabel>
              {renderDetailValue(indiciado.observaciones)}
            </DetailRow>
            <DetailRow>
              <DetailLabel>URL de Google Earth:</DetailLabel>
              {indiciado.googleEarthUrl ? (
                <DetailValue>
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
                <DetailValue className="empty">No especificado</DetailValue>
              )}
            </DetailRow>
            <DetailRow>
              <DetailLabel>Fecha de registro:</DetailLabel>
              <DetailValue>{formatDate(indiciado.fechaRegistro || indiciado.createdAt)}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Última actualización:</DetailLabel>
              <DetailValue>{formatDate(indiciado.updatedAt)}</DetailValue>
            </DetailRow>
          </Section>

          {/* Sección de Documentos/Imágenes */}
          {indiciado.documentos && indiciado.documentos.length > 0 && (
            <Section>
              <SectionTitle>
                <Camera size={20} />
                Documentos y Fotos
              </SectionTitle>
              <ImagesGrid>
                {indiciado.documentos.map((documento: any, index: number) => {
                  const imageUrl = getImageUrl(documento.archivo || documento.filename || documento.fileName);
                  
                  if (imageUrl) {
                    return (
                      <ImageCard key={index}>
                        <ImagePreview 
                          src={imageUrl}
                          alt={documento.tipo || `Documento ${index + 1}`}
                          onClick={() => window.open(imageUrl, '_blank')}
                        />
                        <ImageLabel>
                          {documento.tipo || documento.tipoDocumento || `Documento ${index + 1}`}
                        </ImageLabel>
                      </ImageCard>
                    );
                  }
                  return null;
                })}
              </ImagesGrid>
            </Section>
          )}
        </DetailsGrid>
      </Content>

      {/* Modal de edición */}
      {isEditing && (
        <ModalOverlay>
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
