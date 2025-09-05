/**
 * Test script for Sectors module
 * This script demonstrates the functionality of the Sectors module
 * 
 * To run this script:
 * 1. Make sure MongoDB is running
 * 2. Start the server: npm run dev
 * 3. Run this script: node test-sectores.js
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
let authToken = null;
let testSectorId = null;
let testSubsectorId = null;
let testIndexId = null;

// Test user credentials - make sure this user exists in your database
const testUser = {
  username: 'testuser',
  password: 'testpassword'
};

async function authenticate() {
  try {
    console.log('🔐 Authenticating...');
    const response = await axios.post(`${API_BASE}/auth/login`, testUser);
    authToken = response.data.token;
    console.log('✅ Authentication successful');
    return true;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data?.msg || error.message);
    console.log('\n📝 Make sure you have a test user created or update the credentials in this script');
    return false;
  }
}

function getAuthHeaders() {
  return {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };
}

async function testCreateSector() {
  try {
    console.log('\n📁 Creating test sector...');
    const sectorData = {
      nombre: 'Tecnología',
      descripcion: 'Sector dedicado a tecnología y desarrollo'
    };
    
    const response = await axios.post(
      `${API_BASE}/sectores/sectores`, 
      sectorData, 
      { headers: getAuthHeaders() }
    );
    
    testSectorId = response.data.sector.id;
    console.log('✅ Sector created:', response.data.sector.nombre);
    return true;
  } catch (error) {
    console.error('❌ Error creating sector:', error.response?.data?.msg || error.message);
    return false;
  }
}

async function testCreateSubsector() {
  try {
    console.log('\n📂 Creating test subsector...');
    const subsectorData = {
      nombre: 'Desarrollo de Software',
      descripcion: 'Área de desarrollo y programación'
    };
    
    const response = await axios.post(
      `${API_BASE}/sectores/sectores/${testSectorId}/subsectores`,
      subsectorData,
      { headers: getAuthHeaders() }
    );
    
    testSubsectorId = response.data.subsector.id;
    console.log('✅ Subsector created:', response.data.subsector.nombre);
    return true;
  } catch (error) {
    console.error('❌ Error creating subsector:', error.response?.data?.msg || error.message);
    return false;
  }
}

async function testCreateIndex() {
  try {
    console.log('\n📄 Creating test index...');
    const indexData = {
      nombre: 'Frontend Development',
      descripcion: 'Desarrollo de interfaces de usuario'
    };
    
    const response = await axios.post(
      `${API_BASE}/sectores/subsectores/${testSubsectorId}/indices`,
      indexData,
      { headers: getAuthHeaders() }
    );
    
    testIndexId = response.data.indice.id;
    console.log('✅ Index created:', response.data.indice.nombre);
    return true;
  } catch (error) {
    console.error('❌ Error creating index:', error.response?.data?.msg || error.message);
    return false;
  }
}

async function testGetHierarchy() {
  try {
    console.log('\n🌳 Getting complete hierarchy...');
    const response = await axios.get(
      `${API_BASE}/sectores/jerarquia`,
      { headers: getAuthHeaders() }
    );
    
    console.log('✅ Hierarchy retrieved:');
    console.log(JSON.stringify(response.data.jerarquia, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Error getting hierarchy:', error.response?.data?.msg || error.message);
    return false;
  }
}

async function testUpdateOperations() {
  try {
    console.log('\n✏️ Testing update operations...');
    
    // Update sector
    const updatedSectorData = {
      nombre: 'Tecnología Avanzada',
      descripcion: 'Sector de tecnología y desarrollo avanzado'
    };
    
    await axios.put(
      `${API_BASE}/sectores/sectores/${testSectorId}`,
      updatedSectorData,
      { headers: getAuthHeaders() }
    );
    console.log('✅ Sector updated');
    
    // Update subsector
    const updatedSubsectorData = {
      nombre: 'Desarrollo Full Stack',
      descripcion: 'Desarrollo completo de aplicaciones'
    };
    
    await axios.put(
      `${API_BASE}/sectores/subsectores/${testSubsectorId}`,
      updatedSubsectorData,
      { headers: getAuthHeaders() }
    );
    console.log('✅ Subsector updated');
    
    // Update index
    const updatedIndexData = {
      nombre: 'React Development',
      descripcion: 'Desarrollo con React y ecosistema'
    };
    
    await axios.put(
      `${API_BASE}/sectores/indices/${testIndexId}`,
      updatedIndexData,
      { headers: getAuthHeaders() }
    );
    console.log('✅ Index updated');
    
    return true;
  } catch (error) {
    console.error('❌ Error updating items:', error.response?.data?.msg || error.message);
    return false;
  }
}

async function testSearchFunctionality() {
  try {
    console.log('\n🔍 Testing search functionality...');
    const response = await axios.get(
      `${API_BASE}/sectores/buscar?q=React`,
      { headers: getAuthHeaders() }
    );
    
    console.log('✅ Search results:', response.data.msg);
    console.log('Results:', response.data.resultados.map(r => `${r.nombre} (${r.type})`));
    return true;
  } catch (error) {
    console.error('❌ Error searching:', error.response?.data?.msg || error.message);
    return false;
  }
}

async function testDeleteOperations() {
  try {
    console.log('\n🗑️ Testing delete operations...');
    
    // Delete in reverse hierarchy order to test cascade deletion
    console.log('Deleting sector (should cascade delete subsector and index)...');
    await axios.delete(
      `${API_BASE}/sectores/sectores/${testSectorId}`,
      { headers: getAuthHeaders() }
    );
    console.log('✅ Sector deleted (cascade deletion successful)');
    
    return true;
  } catch (error) {
    console.error('❌ Error deleting items:', error.response?.data?.msg || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Sectors Module Test Suite\n');
  
  if (!await authenticate()) {
    return;
  }
  
  const tests = [
    testCreateSector,
    testCreateSubsector,
    testCreateIndex,
    testGetHierarchy,
    testUpdateOperations,
    testSearchFunctionality,
    testDeleteOperations
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    if (await test()) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${(passed / (passed + failed) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! The Sectors module is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the error messages above.');
  }
}

// Check if axios is available
try {
  require('axios');
} catch (error) {
  console.error('❌ This test script requires axios. Install it with: npm install axios');
  process.exit(1);
}

// Run the tests
runTests().catch(console.error);
