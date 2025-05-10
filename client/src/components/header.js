import React, { useState } from 'react';
import search from "./search/search";

export default function Header({onPageChange,currentPage, setSearchResults}) {
    const [input, setInput] = useState('');
    
    const submit = (e) => {
        e.preventDefault(); // prevent page refresh
        const results = search(input);
        setSearchResults(results);
        // Navigate to search page
        onPageChange('searchPage');
    };
    
    return (
        <div id="header" className="header">
            <div className="title">
                <a href='/' onClick={(e) => {
                    e.preventDefault();
                    onPageChange('home');
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