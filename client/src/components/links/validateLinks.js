export default function validateLinks(text) {
    if (!text) return { valid: true };
    
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = linkRegex.exec(text)) !== null) {
      const linkText = match[1];
      const url = match[2];
      
      // Check if link text is empty
      if (linkText.trim() === '') {
        return { 
          valid: false, 
          error: "Link text cannot be empty. Please fix the format: [link text](url)" 
        };
      }
      
      // Check if URL is empty
      if (url.trim() === '') {
        return { 
          valid: false, 
          error: "URL cannot be empty. Please fix the format: [link text](url)" 
        };
      }
      
      // Check if protocol is included
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return { 
          valid: false, 
          error: "URLs must start with http:// or https://" 
        };
      }
    }
    
    return { valid: true };
  }