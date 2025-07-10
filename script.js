document.addEventListener('DOMContentLoaded', () => {
    const iconsGrid = document.getElementById('icons-grid');
    const searchInput = document.getElementById('search-input');
    let allIcons = [];
    let toastTimeout;

    // GitHub API URL for the Umbraco icons directory
    const githubApiUrl = 'https://api.github.com/repos/umbraco/Umbraco-CMS/contents/src/Umbraco.Web.UI.Client/src/packages/core/icon-registry/icons';
    
    // Local storage key
    const ICONS_STORAGE_KEY = 'umbracoIcons';
    const ICONS_TIMESTAMP_KEY = 'umbracoIconsTimestamp';

    // Save icons to local storage
    function saveIconsToLocalStorage(icons) {
        try {
            localStorage.setItem(ICONS_STORAGE_KEY, JSON.stringify(icons));
            localStorage.setItem(ICONS_TIMESTAMP_KEY, Date.now());
            console.log('Icons saved to local storage');
        } catch (error) {
            console.error('Error saving to local storage:', error);
        }
    }

    // Get icons from local storage
    function getIconsFromLocalStorage() {
        try {
            const icons = localStorage.getItem(ICONS_STORAGE_KEY);
            return icons ? JSON.parse(icons) : null;
        } catch (error) {
            console.error('Error retrieving from local storage:', error);
            return null;
        }
    }

    // Fetch icons from GitHub
    async function fetchIcons() {
        // First try to load from local storage for immediate display
        const cachedIcons = getIconsFromLocalStorage();
        if (cachedIcons && cachedIcons.length > 0) {
            console.log('Loading icons from local storage');
            allIcons = cachedIcons;
            displayIcons(allIcons);
        }

        // Then fetch fresh icons from GitHub
        try {
            const response = await fetch(githubApiUrl);
            
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Filter only TypeScript files
            const tsFiles = data.filter(file => file.name.endsWith('.ts'));
            
            // Fetch content of each TypeScript file
            const iconPromises = tsFiles.map(async file => {
                const tsResponse = await fetch(file.download_url);
                if (!tsResponse.ok) {
                    throw new Error(`Failed to fetch TypeScript file: ${file.name}`);
                }
                const tsContent = await tsResponse.text();
                
                // Extract SVG content from TypeScript file
                const svgContent = extractSvgFromTypeScript(tsContent);
                
                return {
                    name: file.name.replace('.ts', ''),
                    content: svgContent
                };
            });
            
            allIcons = await Promise.all(iconPromises);
            
            // Save to local storage for offline use
            saveIconsToLocalStorage(allIcons);
            
            // Update display with fresh icons
            displayIcons(allIcons);
            
            // Show toast notification if we initially loaded from cache
            if (cachedIcons && cachedIcons.length > 0) {
                showToast('Icons updated from GitHub');
            }
        } catch (error) {
            console.error('Error fetching icons:', error);
            
            // If we have cached icons, keep using them
            if (!(cachedIcons && cachedIcons.length > 0)) {
                iconsGrid.innerHTML = `<div class="error">Error loading icons: ${error.message}</div>`;
            } else {
                showToast('Using cached icons - couldn\'t connect to GitHub', 'warning');
            }
        }
    }
    
    // Function to extract SVG content from TypeScript file
    function extractSvgFromTypeScript(tsContent) {
        // Pattern to match exported SVG string in TypeScript files
        const svgPattern = /export default `([\s\S]*?)`/;
        const match = tsContent.match(svgPattern);
        
        if (match && match[1]) {
            console.log(match);
            return match[1];
        }
        
        return '<svg viewBox="0 0 24 24"><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">?</text></svg>';
    }

    // Display icons in the grid
    function displayIcons(icons) {
        if (icons.length === 0) {
            iconsGrid.innerHTML = '<div class="no-results">No icons found</div>';
            return;
        }

        // Remove loading indicator if it exists
        const loadingElement = document.querySelector('.loading');
        if (loadingElement) {
            loadingElement.remove();
        }

        iconsGrid.innerHTML = icons.map(icon => `
            <div class="icon-item" data-icon-name="${icon.name}">
                <div class="icon-container">${icon.content}</div>
                <div class="icon-name">${icon.name}</div>
            </div>
        `).join('');
        
        // Add click event listeners to each icon item
        attachIconClickHandlers();
    }
    
    // Attach click handlers to icon items
    function attachIconClickHandlers() {
        const iconItems = document.querySelectorAll('.icon-item');
        iconItems.forEach(item => {
            item.addEventListener('click', () => {
                const iconName = item.getAttribute('data-icon-name');
                copyToClipboard(iconName);
                showToast(`Copied '${iconName}' to clipboard!`);
            });
        });
    }
    
    // Copy text to clipboard
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .catch(err => {
                console.error('Failed to copy text: ', err);
                showToast('Failed to copy to clipboard', 'error');
            });
    }
    
    // Show toast notification
    function showToast(message, type = 'success') {
        // Clear any existing toast timeout
        if (toastTimeout) {
            clearTimeout(toastTimeout);
        }
        
        // Remove existing toast if any
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Add toast to document
        document.body.appendChild(toast);
        
        // Show the toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Hide the toast after 3 seconds
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300); // Wait for fade out animation
        }, 3000);
    }

    // Filter icons based on search input
    function filterIcons(query) {
        const filteredIcons = allIcons.filter(icon => 
            icon.name.toLowerCase().includes(query.toLowerCase())
        );
        displayIcons(filteredIcons);
    }

    // Event listener for search input
    searchInput.addEventListener('input', (e) => {
        filterIcons(e.target.value);
    });

    // Initial fetch
    fetchIcons();
});