// Function to generate authentication headers for API requests
export default function authHeader() {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (user && user.token) {
    // Return authorization header with JWT token
    return { 
      'Authorization': `Bearer ${user.token}`,
      'Content-Type': 'application/json'
    };
  } else {
    // Return empty object if user is not logged in
    return { 'Content-Type': 'application/json' };
  }
} 