import React, { useState } from 'react';
// import search from "./search/search";
import modelService from './pages/model-service';

export default function Header({onPageChange,currentPage, setSearchResults, isLoggedIn}) {
    const [input, setInput] = useState('');
    
    const submit = async (e) => {
        e.preventDefault(); // prevent page refresh
        try {
            // Use axios to query the server instead of local search
            const results = await modelService.searchPosts(input);
            setSearchResults(results);
            // Navigate to search page
            onPageChange('searchPage');
        } catch (error) {
            console.error("Search error:", error);
            setSearchResults([]);
            onPageChange('searchPage');
        }
    };
    
    return (
        <div id="header" className="header">
            <div className="title">
                <a href='/' onClick={(e) => {
                    e.preventDefault();
                    if (isLoggedIn){
                        onPageChange('home');
                    }
                    else{
                        onPageChange('welcome')
                    }
                }}>
                    phreddit
                </a>
            </div>
            <div id="search-form">
                <form onSubmit={submit}>
                    <input 
                        id="search-bar" 
                        className="search" 
                        type="text" 
                        size="60" 
                        placeholder="Search Phreddit..." 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)}
                    /> 
                </form>
            </div>
            <form>
                <input 
                    id="create-post" 
                    className={`${currentPage === 'createPost' ? 'button-active' : 'newpost'} ${isLoggedIn === true ? 'newpost' : 'newpostGuest'}`}
                    type="button" 
                    value="Create Post" 
                    onClick={() => {
                        if (isLoggedIn){
                            onPageChange('createPost');
                        }
                        }}
                /> 
                <input 
                    id="profile" 
                    className={`${currentPage === 'createPost' ? 'button-active' : 'newpost'} ${isLoggedIn === true ? 'newpost' : 'newpostGuest'}`}
                    type="button" 
                    value={`${isLoggedIn === true ? JSON.parse(localStorage.getItem("userData")).displayName : 'Guest'}`}
                    onClick={() => {
                        if (isLoggedIn){
                            onPageChange('createPost');
                        }
                        }}
                />
                <input 
                    id="profile" 
                    className={`${currentPage === 'profile' ? 'button-active' : 'newpost'} ${isLoggedIn === true ? 'newpost' : 'logoutGuest'}`}
                    type="button" 
                    value="Logout"
                    onClick={() => {
                        if (isLoggedIn){
                            onPageChange('welcome');
                            localStorage.clear();
                        }
                        }}
                /> 
            </form>
        </div>
    );
}