# Umbraco Icons Gallery

A searchable gallery of Umbraco icons with copy-to-clipboard functionality.

## Features

- Displays all icons from the Umbraco CMS repository
- Search functionality to filter icons by name
- Click on any icon to copy its name to clipboard
- Toast notifications for user feedback
- Responsive design with dark mode support
- Installable as a Progressive Web App (PWA)
- Works offline after initial load

## Development

This project is a static website that fetches icon data from the Umbraco CMS GitHub repository.

### Local Development

To run this project locally:

1. Clone the repository
2. Open `index.html` in your browser

Or use a simple HTTP server:

```bash
# Using Node.js
npx http-server

# Using Python
python -m http.server
```

## Credits

- Icon data from [Umbraco-CMS repository](https://github.com/umbraco/Umbraco-CMS/tree/main/src/Umbraco.Web.UI.Client/src/packages/core/icon-registry/icons)
- Created by [Søren Kottal](https://github.com/skttl)
