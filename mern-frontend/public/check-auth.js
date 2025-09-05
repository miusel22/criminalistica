// Helper script to check authentication status
// Run this in browser console: copy and paste the entire content

function checkAuthStatus() {
  console.log('🔍 Checking authentication status...');
  
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    console.log('❌ No access token found');
    console.log('👉 Solution: Go to /login and sign in');
    return false;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp < currentTime;
    
    console.log('✅ Token found');
    console.log('📅 Expires:', new Date(payload.exp * 1000));
    console.log('⏰ Current time:', new Date());
    console.log('⚠️ Expired:', isExpired ? 'YES' : 'NO');
    
    if (isExpired) {
      console.log('❌ Token is expired');
      console.log('👉 Solution: Go to /login and sign in again');
      return false;
    }
    
    console.log('✅ Token is valid');
    return true;
    
  } catch (error) {
    console.log('❌ Invalid token format');
    console.log('👉 Solution: Clear storage and login again');
    console.log('   Run: localStorage.removeItem("access_token")');
    return false;
  }
}

// Also provide a function to clear auth
function clearAuth() {
  localStorage.removeItem('access_token');
  console.log('🧹 Authentication cleared');
  console.log('👉 Now go to /login to sign in');
}

// Run the check
console.log('=== AUTHENTICATION DEBUG ===');
const isAuthenticated = checkAuthStatus();
console.log('=== END DEBUG ===');

if (!isAuthenticated) {
  console.log('\n🔧 Available commands:');
  console.log('- clearAuth() - Clear expired/invalid token');
  console.log('- checkAuthStatus() - Run this check again');
}
