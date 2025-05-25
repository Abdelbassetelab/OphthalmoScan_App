# OphthalmoScan AI

OphthalmoScan is a comprehensive medical application designed for ophthalmological diagnosis using AI. The platform enables doctors to analyze eye scans, manage patients, and provide remote diagnoses while allowing patients to access their medical records and request diagnoses.

## 🌟 Features

### Role-Based Access Control
- **Admin Dashboard**: System management, user administration, and analytics
- **Doctor Interface**: Patient management, scan analysis, and diagnosis tools
- **Patient Portal**: Medical history, appointments, and scan requests

### 2. Authentication Implementation

The application uses a modern, secure authentication architecture that combines Clerk for user authentication with Supabase Row Level Security (RLS) for data access control.

#### Authentication Architecture:

1. **Clerk + Supabase Integration**:
   - Clerk provides the primary authentication system (login, registration, session management)
   - JWT tokens from Clerk are passed to Supabase for Row Level Security enforcement
   - Custom integration to ensure both systems work seamlessly together

2. **Row Level Security (RLS) Policies**:
   - Database-level security enforced through Supabase RLS policies
   - Different access levels for patients, doctors, and administrators
   - Protected database operations requiring authenticated users
   - Clean data isolation between users where appropriate

3. **Authentication Flow**:
   - User authenticates with Clerk
   - Clerk issues JWT token with custom claims
   - Token is passed to Supabase using the `supabase` JWT template
   - Supabase uses the token to enforce RLS policies for database operations

#### UI Components (Simple Implementation)

UI components follow the shadcn/ui library approach with minimal customization:

   #### Authentication & Database Integration:

1. **Supabase-Clerk Client** (`lib/auth/supabase-clerk.ts`):
   - Creates authenticated Supabase clients using Clerk JWT tokens
   - Handles authentication headers for all Supabase requests
   - Provides React hooks for easy use in components
   - Example usage:
   ```typescript
   // Using the authenticated Supabase client
   const { supabase, isLoaded } = useSupabaseWithClerk();
   
   async function fetchData() {
     if (!isLoaded || !supabase) return;
     
     const { data, error } = await supabase
       .from('protected_table')
       .select('*');
     
     // RLS policies automatically enforce access restrictions
   }
   ```

### Core Functionalities
- 🔍 AI-Powered Scan Analysis
- 👥 Patient Management System
- 📊 Medical Records Database
- 🗓️ Appointment Scheduling
- 📱 Real-time Notifications
- 🔒 Secure Authentication

## 🏗️ Tech Stack

- **Frontend**: Next.js 13+ with App Router
- **UI Framework**: Tailwind CSS, shadcn/ui
- **Authentication**: Clerk
- **Database**: Supabase
- **AI Model**: TensorFlow.js
- **API**: Python FastAPI backend

#### Medical Color Palette

The application uses a clean, minimalist color palette inspired by Sprig and Minimals.cc but adapted for medical applications:

- **Primary Colors**:
  - Hospital Blue (`#0A84FF`): Clean, trustworthy blue for primary actions
  - Soft Teal (`#20C997`): Calming teal for success states and progress
  - Neutral Navy (`#2E374A`): Dark navy for headers and emphasis

- **Secondary Colors**:
  - Clean White (`#FFFFFF`): Primary background for content areas
  - Light Gray (`#F8F9FA`): Secondary backgrounds and hover states
  - Pale Blue (`#F0F7FF`): Subtle highlight for cards and containers

- **Accent Colors**:
  - Alert Red (`#FF3B30`): Simplified red for errors and critical alerts
  - Warning Amber (`#FF9500`): Clear amber for cautions and warnings
  - Success Green (`#34C759`): Bright green for confirmations

- **Neutral Colors**:
  - Text Dark (`#121926`): Primary text
  - Text Medium (`#697586`): Secondary text and labels
  - Border Light (`#E5E7EB`): Subtle borders and dividers

## 📁 Project Structure

```
OphthalmoScan-AI/
├── app/                    # Next.js 13 app directory
│   ├── (auth)/            # Authentication routes
│   │   ├── login/        # Login page
│   │   ├── register/     # Registration page
│   │   ├── verify/       # Email verification
│   │   └── reset-password/ # Password reset
│   ├── (dashboard)/       # Role-specific dashboards
│   ├── api/               # API routes
│   └── management/        # Admin management features
├── backend/               # Python FastAPI server
│   ├── api.py            # Main API implementation
│   └── create_model.py    # AI model training
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── layouts/          # Layout components
│   ├── scans/           # Scan-related components
│   └── ui/              # Reusable UI components
├── lib/                  # Utility libraries
│   ├── auth/            # Authentication utilities
│   ├── ai/              # AI model integration
│   └── db/              # Database utilities
└── public/              # Static assets
    └── models/          # AI model files
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.8+
- Docker (optional)

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/OphthalmoScan-AI.git
cd OphthalmoScan-AI
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
cd backend && pip install -r requirements.txt
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Configure your environment variables:
\`\`\`env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
\`\`\`

5. Start the development servers:
\`\`\`bash
# Frontend
npm run dev

# Backend
cd backend && python api.py
\`\`\`

## 🔑 Authentication & Authorization

### Clerk Authentication
The application uses Clerk for robust authentication with features:
- Social login providers (Google, GitHub)
- Email/password authentication
- Two-factor authentication (2FA)
- Email verification
- Password recovery
- Session management
- User metadata for roles

### Role-Based Access Control (RBAC)
Roles are managed through Clerk's user metadata and enforced at multiple levels:

#### Admin Role
- Full system access
- User management capabilities
- Analytics and system monitoring
- Model testing and validation

#### Doctor Role
- Patient management dashboard
- Scan analysis tools
- Diagnosis management
- Appointment scheduling
- Patient record access

#### Patient Role
- Personal health dashboard
- Medical record access
- Appointment booking
- Scan request submission

### Implementation
- Middleware protection (`middleware.ts`)
- Role-based routing
- Protected API routes
- Component-level access control
- Session persistence
- Secure token management

### Auth Flow
1. User signs in via Clerk
2. Role is fetched from user metadata
3. Custom hooks (`useUserRole`) provide role context
4. Protected routes check role permissions
5. UI adapts based on user role

# Authentication Architecture

## Overview

The application uses a modern, secure authentication architecture that combines Clerk for user authentication with Supabase Row Level Security (RLS) for data access control.

### Core Components

1. **Clerk Integration**
   - Handles user authentication (login, registration, session management)
   - Manages user roles through publicMetadata
   - Provides JWT tokens for secure API access
   - Supports role-based UI components and routing

2. **Supabase RLS Integration**
   - Database-level security through Row Level Security policies
   - Uses Clerk JWT tokens for secure database operations
   - Enforces role-based data access control
   - Ensures data isolation between users

### Authentication Flow

1. User authenticates with Clerk (login/register)
2. Clerk issues JWT token with role claims
3. Token passed to Supabase using custom JWT template
4. Supabase enforces RLS policies based on token claims

### Role-Based Access Control

Three primary user roles are supported:

1. **Admin**
   - Full system access
   - Can manage user roles
   - Access to admin dashboard

2. **Doctor**
   - Access to patient records
   - Medical data management
   - Limited administrative functions

3. **Patient**
   - Access to own medical records only
   - Basic profile management
   - Appointment scheduling

### Security Features

- **Route Protection**: Next.js middleware guards routes based on user roles
- **API Security**: Role-based API endpoint protection
- **Data Isolation**: RLS policies ensure users only access authorized data
- **Session Management**: Secure session handling via Clerk
- **JWT Security**: Custom claims for role-based access

### Implementation Details

#### 1. Clerk Setup

```env
# Required Clerk Environment Variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

#### 2. Supabase Integration

```env
# Required Supabase Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 3. JWT Template

Configure a "supabase" JWT template in Clerk dashboard with appropriate claims:

```json
{
  "role": "{{user.publicMetadata.role}}"
}
```

### Usage Example

```typescript
import { useSupabaseWithClerk } from '@/lib/auth/supabase-clerk';
import { useRole } from '@/lib/auth/use-role';

export default function ProtectedComponent() {
  const { supabase, isLoaded } = useSupabaseWithClerk();
  const { role } = useRole();
  
  // Component logic using authenticated Supabase client
  // Role-based UI rendering
}
```

### Security Best Practices

1. Always use the `withRoleProtection` HOC for API routes
2. Implement proper error handling for auth failures
3. Use RLS policies for all database tables
4. Validate roles on both client and server
5. Regularly audit access logs
6. Keep JWT expiry times reasonable

### Error Handling

The system includes comprehensive error handling:
- Authentication failures
- Role validation errors
- JWT token issues
- Database access violations

## 📊 Database Schema

Key tables in Supabase:

- \`users\`: User profiles and roles
- \`scans\`: Eye scan records
- \`diagnoses\`: Medical diagnoses
- \`appointments\`: Patient appointments

## 🤖 AI Model

The application uses a custom-trained model for eye scan analysis:

- Based on EfficientNet architecture
- Converted to TensorFlow.js for browser execution
- Handles multiple eye condition classifications

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Data encryption at rest
- Secure file uploads
- Rate limiting
- CORS protection

## 📱 API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout

### Users
- GET /api/users
- POST /api/users
- PUT /api/users/{id}

### Scans
- GET /api/scans
- POST /api/scans/upload
- GET /api/scans/{id}/analysis

### Diagnoses
- GET /api/diagnoses
- POST /api/diagnoses
- PUT /api/diagnoses/{id}

## 🛠️ Development

### Code Style
- TypeScript strict mode enabled
- ESLint configuration
- Prettier for code formatting

### Testing
- Jest for unit tests
- Cypress for E2E testing
- API testing with Postman

### CI/CD
- GitHub Actions workflows
- Automated testing
- Deployment pipelines

## 📦 Deployment

The application can be deployed using:

1. Vercel (Frontend)
2. Docker (Backend)
3. Supabase (Database)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- Frontend Development: [Your Name]
- Backend Development: [Your Name]
- AI Model Development: [Your Name]
- UI/UX Design: [Your Name]

## 📞 Support

For support, please contact [your-email@example.com]
