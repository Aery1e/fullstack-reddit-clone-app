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
                    className={`button ${currentPage === 'createPost' ? 'button-active' : 'newpost'}`}
                    type="button" 
                    value="Create Post" 
                    onClick={() => onPageChange('createPost')}
                /> 
            </form>
        </div>
    );
}