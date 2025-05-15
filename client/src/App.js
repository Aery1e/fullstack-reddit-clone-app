// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import { useState, useEffect } from "react";
import "./stylesheets/App.css";
import Phreddit from "./components/phreddit.js";
import WelcomePage from "./components/auth/WelcomePage";
import RegisterPage from "./components/auth/RegisterPage";
import LoginPage from "./components/auth/LoginPage";
import UserProfilePage from "./components/pages/UserProfilePage.js";
import EditCommunityPage from "./components/pages/EditCommunityPage";
import EditPostPage from "./components/pages/EditPostPage";
import EditCommentPage from "./components/pages/EditCommentPage";
function App() {
  // State to track the current page
  const [currentPage, setCurrentPage] = useState("welcome");

  // State to track user data
  const [userData, setUserData] = useState(null);

  const [additionalData, setAdditionalData] = useState(null);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    const token = localStorage.getItem("token");

    if (storedUserData && token) {
      try {
        setUserData(JSON.parse(storedUserData));
        setCurrentPage("home"); // Auto-navigate to home if already logged in
      } catch (e) {
        // If parsing fails, clear the invalid data
        localStorage.removeItem("userData");
        localStorage.removeItem("token");
      }
    }
  }, []);

  // Function to handle page changes
  const handlePageChange = (page, data = null) => {
    setCurrentPage(page);
    if (data !== null) {
      setAdditionalData(data);
    } else {
      setAdditionalData(null);
    }
  };

  // Function to handle logout
  const handleLogout = () => {
    // Clear user data from state and storage
    setUserData(null);
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    setCurrentPage("welcome");
  };

  // Render different components based on current page
  const renderPage = () => {
    switch (currentPage) {
      case "welcome":
        return (
          <WelcomePage
            onPageChange={handlePageChange}
            setUserData={setUserData}
          />
        );
      case "register":
        return <RegisterPage onPageChange={handlePageChange} />;
      case "login":
        return (
          <LoginPage
            onPageChange={handlePageChange}
            setUserData={setUserData}
          />
        );
      case "profile":
        return userData ? (
          <UserProfilePage onPageChange={handlePageChange} />
        ) : (
          <WelcomePage
            onPageChange={handlePageChange}
            setUserData={setUserData}
          />
        );
      case "editCommunity":
        return userData ? (
          <EditCommunityPage
            onPageChange={handlePageChange}
            communityId={additionalData}
          />
        ) : (
          <WelcomePage
            onPageChange={handlePageChange}
            setUserData={setUserData}
          />
        );
      case "editPost":
        return userData ? (
          <EditPostPage
            onPageChange={handlePageChange}
            postId={additionalData}
          />
        ) : (
          <WelcomePage
            onPageChange={handlePageChange}
            setUserData={setUserData}
          />
        );
      case "editComment":
        return userData ? (
          <EditCommentPage
            onPageChange={handlePageChange}
            commentId={additionalData}
          />
        ) : (
          <WelcomePage
            onPageChange={handlePageChange}
            setUserData={setUserData}
          />
        );
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

  return <div className="App">{renderPage()}</div>;
}

export default App;
