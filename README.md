# Lala Motors Website

A modern website for Lala Motors showcasing motorcycles, auto parts, and various services.

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lalamotors-website
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory (optional):
```bash
PORT=3001
NODE_ENV=production
```

## Development

To run the website in development mode:

```bash
npm run dev
```

This will start the server with hot-reload enabled.

## Production Deployment

1. Install dependencies:
```bash
npm install --production
```

2. Start the server:
```bash
npm start
```

The website will be available at `http://localhost:3001` (or the port specified in your environment variables).

## Deployment Platforms

### Heroku

1. Create a new Heroku app
2. Connect your GitHub repository
3. Enable automatic deploys from main branch
4. Add the following buildpack:
   - heroku/nodejs

### Railway/Render/DigitalOcean App Platform

1. Connect your GitHub repository
2. Use the following settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Node.js version: 18 or higher

## Environment Variables

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment mode (development/production)

## Project Structure

- `/images` - Image assets
- `/services` - Service pages
- `/sql` - SQL files
- `server.js` - Express server
- `index.html` - Main entry point
- `style.css` - Global styles
- `script.js` - Client-side JavaScript

## Contributing

1. Create a new branch
2. Make your changes
3. Submit a pull request

## License

All rights reserved © Lala Motors 