export default function parseLinks(text) {
    if (!text) return '';
    
    // Create a temporary div element
    const tempDiv = document.createElement('div');
    tempDiv.textContent = text;
    
    // Find all markdown links in the format [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    let result = text;
    
    // Replace each markdown link with an HTML link
    while ((match = linkRegex.exec(text)) !== null) {
      const fullMatch = match[0];  // The entire [text](url)
      const linkText = match[1];   // The text part
      const url = match[2];        // The URL part
      
      // Validate URL
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        continue; // Skip invalid URLs
      }
      
      // Create HTML link
      const htmlLink = `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      
      // Replace in result
      result = result.replace(fullMatch, htmlLink);
    }
    
    return result;
  }