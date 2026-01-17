# Frontend - React with Next.js

## Purpose
User interface layer providing:
- Citizen Portal: For end users accessing services
- Admin Dashboard: For government officials monitoring system
- Service Provider Interface: For healthcare providers, agriculture experts

## Technology Stack
- **Framework**: React with Next.js for SEO and SSR
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui component library
- **State Management**: React Context API or Zustand
- **Internationalization**: i18next (English, Hindi, Gujarati)
- **Charts**: Recharts or Chart.js

## Characteristics
- Responsive design for mobile and desktop
- Progressive Web App (PWA) capabilities
- Multi-language support
- Accessibility compliant (WCAG 2.1)

## Structure
```
frontend/
├── public/                 # Static assets
│   ├── icons/
│   ├── images/
│   └── locales/           # i18n translation files
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── (auth)/        # Auth pages (login, register)
│   │   ├── (citizen)/     # Citizen portal pages
│   │   ├── (admin)/       # Admin dashboard pages
│   │   └── (provider)/    # Service provider pages
│   ├── components/        # Reusable UI components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── common/        # Shared components (Header, Footer, etc.)
│   │   ├── forms/         # Form components
│   │   ├── healthcare/    # Healthcare-specific components
│   │   ├── agriculture/   # Agriculture-specific components
│   │   ├── urban/         # Urban-specific components
│   │   └── dashboard/     # Dashboard/monitoring components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   ├── services/          # API service layer
│   ├── store/             # State management (Zustand/Context)
│   ├── styles/            # Global styles and Tailwind config
│   └── types/             # TypeScript type definitions
├── Dockerfile
└── package.json
```

## Key Interfaces
1. Landing Page - Service discovery
2. Citizen Dashboard - Unified view
3. Healthcare Appointment Booking
4. Agriculture Advisory Portal
5. Urban Complaint Management
6. Admin Monitoring Dashboard
