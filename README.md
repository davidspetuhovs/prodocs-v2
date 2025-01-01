# ProDocs v2

A modern documentation platform built with Next.js 14, featuring multi-tenancy support through subdomains and custom domains.

## Features

- **Multi-tenant Architecture**
  - Subdomain support (e.g., company.qalileo.com)
  - Custom domain support
  - Company-specific workspaces
- **Authentication & Authorization**
  - Secure user authentication
  - Role-based access control
  - Protected API routes
- **Modern UI/UX**
  - Responsive design
  - Dark/light mode support
  - Interactive components
- **Performance**
  - Server-side rendering
  - Optimized routing
  - Fast page transitions

## Project Structure

```
├── app/                    # Next.js 14 app directory
│   ├── [companySlug]/     # Dynamic company routes
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── onboarding/       # Onboarding flow
│   └── create-docs/      # Documentation creation
├── components/            # React components
│   ├── business/         # Business logic components
│   ├── private/          # Protected components
│   └── ui/               # Reusable UI components
├── libs/                  # Utility functions
├── models/               # Database models
└── middleware.js         # Routing & auth middleware
```

## Key Components

### Middleware
- Handles subdomain routing
- Manages custom domain resolution
- Processes authentication state

### API Routes
- Company management
- User authentication
- Documentation CRUD operations

### Core Components
- `OnboardingForm`: Company creation and setup
- `Header`: Navigation and user controls
- `LayoutClient`: Client-side layout wrapper

## Getting Started

1. **Prerequisites**
   - Node.js 18+
   - MongoDB database
   - npm or yarn

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   Configure your environment variables.

3. **Installation**
   ```bash
   npm install
   # or
   yarn install
   ```

4. **Development**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Production**
   ```bash
   npm run build
   npm start
   # or
   yarn build
   yarn start
   ```

## Configuration

Key configuration options are available in `config/index.js`:
- Authentication settings
- API endpoints
- Feature flags
- Theme configuration

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is proprietary software. All rights reserved.
