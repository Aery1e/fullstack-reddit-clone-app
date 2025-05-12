// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import { useState, useEffect } from 'react';
import './stylesheets/App.css';
import Phreddit from './components/phreddit.js';
import WelcomePage from './components/auth/WelcomePage';
import RegisterPage from './components/auth/RegisterPage';
import LoginPage from './components/auth/LoginPage';

function App() {
  // State to track the current page
  const [currentPage, setCurrentPage] = useState('welcome');
  
  // State to track user data
  const [userData, setUserData] = useState(null);
  
  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    const token = localStorage.getItem('token');
    
    if (storedUserData && token) {
      try {
        setUserData(JSON.parse(storedUserData));
        setCurrentPage('home'); // Auto-navigate to home if already logged in
      } catch (e) {
        // If parsing fails, clear the invalid data
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
      }
    }
  }, []);
  
  // Function to handle page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  // Function to handle logout
  const handleLogout = () => {
    // Clear user data from state and storage
    setUserData(null);
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    setCurrentPage('welcome');
  };
  
  // Render different components based on current page
  const renderPage = () => {
    switch (currentPage) {
      case 'welcome':
        return <WelcomePage onPageChange={handlePageChange} />;
      case 'register':
        return <RegisterPage onPageChange={handlePageChange} />;
      case 'login':
        return <LoginPage onPageChange={handlePageChange} setUserData={setUserData} />;
      case 'home':
      default:
        return (
          <Phreddit 
            userData={userData} 
            isLoggedIn={!!userData} 
            onLogout={handleLogout} 
            onPageChange={handlePageChange}
          />
        );
    }
  };
  
  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

export default App;