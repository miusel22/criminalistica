const axios = require('axios');
require('dotenv').config();

// Configuración
const BASE_URL = 'http://localhost:5000/api';
let adminToken = '';
let testUserId = '';

// Helper function para hacer requests autenticados
const apiCall = async (method, endpoint, data = null, token = adminToken) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ Error en ${method} ${endpoint}:`, {
      status: error.response?.status,
      message: error.response?.data?.msg || error.message
    });
    throw error;
  }
};

// Test functions
const testLogin = async () => {
  console.log('🔐 Testing admin login...');
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@test.com', // Usar el email de tu admin
      password: 'admin123'      // Usar la contraseña de tu admin
    });
    
    adminToken = response.data.token;
    console.log('✅ Admin login successful');
    return true;
  } catch (error) {
    console.error('❌ Admin login failed:', error.response?.data?.msg || error.message);
    console.log('ℹ️  Asegúrate de tener un usuario admin con email: admin@test.com y password: admin123');
    return false;
  }
};

const testGetUsers = async () => {
  console.log('👥 Testing get all users...');
  
  try {
    const response = await apiCall('GET', '/users');
    console.log('✅ Users retrieved successfully:', {
      total: response.pagination?.total || response.users?.length || 0,
      users: response.users?.map(u => ({ 
        email: u.email, 
        role: u.role, 
        isActive: u.isActive 
      })) || []
    });
    return response;
  } catch (error) {
    console.error('❌ Failed to get users');
    return null;
  }
};

const testCreateUser = async () => {
  console.log('🆕 Testing create user...');
  
  const userData = {
    nombre: 'Usuario',
    apellidos: 'Prueba',
    email: `test.${Date.now()}@example.com`,
    password: 'TestPass123',
    role: 'user'
  };
  
  try {
    const response = await apiCall('POST', '/users', userData);
    testUserId = response.user._id;
    console.log('✅ User created successfully:', {
      id: response.user._id,
      email: response.user.email,
      role: response.user.role
    });
    return response;
  } catch (error) {
    console.error('❌ Failed to create user');
    return null;
  }
};

const testUpdateUser = async () => {
  if (!testUserId) {
    console.log('⚠️  Skipping update test - no test user ID');
    return null;
  }
  
  console.log('🔄 Testing update user...');
  
  const updateData = {
    nombre: 'Usuario Actualizado',
    apellidos: 'Prueba Modificada'
  };
  
  try {
    const response = await apiCall('PUT', `/users/${testUserId}`, updateData);
    console.log('✅ User updated successfully:', {
      id: response.user._id,
      fullName: `${response.user.nombre} ${response.user.apellidos}`,
      email: response.user.email
    });
    return response;
  } catch (error) {
    console.error('❌ Failed to update user');
    return null;
  }
};

const testToggleUserStatus = async () => {
  if (!testUserId) {
    console.log('⚠️  Skipping toggle status test - no test user ID');
    return null;
  }
  
  console.log('🔄 Testing toggle user status...');
  
  try {
    const response = await apiCall('PATCH', `/users/${testUserId}/toggle-status`);
    console.log('✅ User status toggled successfully:', {
      id: response.user._id,
      email: response.user.email,
      isActive: response.user.isActive
    });
    return response;
  } catch (error) {
    console.error('❌ Failed to toggle user status');
    return null;
  }
};

const testGetUserStats = async () => {
  console.log('📊 Testing get user stats...');
  
  try {
    const response = await apiCall('GET', '/users/stats');
    console.log('✅ User stats retrieved successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Failed to get user stats');
    return null;
  }
};

const testGetUserById = async () => {
  if (!testUserId) {
    console.log('⚠️  Skipping get user by ID test - no test user ID');
    return null;
  }
  
  console.log('🔍 Testing get user by ID...');
  
  try {
    const response = await apiCall('GET', `/users/${testUserId}`);
    console.log('✅ User retrieved by ID successfully:', {
      id: response._id,
      email: response.email,
      fullName: `${response.nombre} ${response.apellidos}`,
      role: response.role,
      isActive: response.isActive
    });
    return response;
  } catch (error) {
    console.error('❌ Failed to get user by ID');
    return null;
  }
};

const testDeleteUser = async () => {
  if (!testUserId) {
    console.log('⚠️  Skipping delete test - no test user ID');
    return null;
  }
  
  console.log('🗑️  Testing delete user...');
  
  try {
    const response = await apiCall('DELETE', `/users/${testUserId}`);
    console.log('✅ User deleted successfully:', response.msg);
    return response;
  } catch (error) {
    console.error('❌ Failed to delete user');
    return null;
  }
};

// Test unauthorized access
const testUnauthorizedAccess = async () => {
  console.log('🚫 Testing unauthorized access...');
  
  try {
    await axios.get(`${BASE_URL}/users`);
    console.error('❌ Unauthorized access should have been blocked!');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Unauthorized access properly blocked');
    } else {
      console.error('❌ Unexpected error:', error.response?.status, error.message);
    }
  }
};

// Main test function
const runTests = async () => {
  console.log('🧪 INICIANDO TESTS DE GESTIÓN DE USUARIOS\n');
  console.log('=' .repeat(50));
  
  try {
    // 1. Test unauthorized access first
    await testUnauthorizedAccess();
    console.log('');
    
    // 2. Login as admin
    const loginSuccess = await testLogin();
    if (!loginSuccess) {
      console.log('❌ Cannot continue tests without admin login');
      return;
    }
    console.log('');
    
    // 3. Get initial users list
    await testGetUsers();
    console.log('');
    
    // 4. Get user stats
    await testGetUserStats();
    console.log('');
    
    // 5. Create test user
    await testCreateUser();
    console.log('');
    
    // 6. Get user by ID
    await testGetUserById();
    console.log('');
    
    // 7. Update user
    await testUpdateUser();
    console.log('');
    
    // 8. Toggle user status
    await testToggleUserStatus();
    console.log('');
    
    // 9. Get updated users list
    await testGetUsers();
    console.log('');
    
    // 10. Delete test user
    await testDeleteUser();
    console.log('');
    
    console.log('=' .repeat(50));
    console.log('✅ TODOS LOS TESTS COMPLETADOS');
    
  } catch (error) {
    console.error('❌ Error general en los tests:', error.message);
  }
};

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
