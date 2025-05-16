# OphthalmoScan-AI

A web application for ophthalmology diagnosis and patient management using AI technologies.

## Repository

- GitHub: https://github.com/Abdelbassetelab/OphthalmoScan_App.git

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Abdelbassetelab/OphthalmoScan_App.git
   cd OphthalmoScan_App
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Update the variables with your configuration

4. Run the development server:
   ```bash
   npm run dev
   ```

## Application Routes

### Main Routes

- `/` - Home page
- `/dashboard` - Main dashboard
- `/scan-analysis` - Eye scan analysis page
- `/settings` - Settings page (Role-adaptive)

### Settings Routes

The settings page (`/settings`) adapts its interface based on the user's role:

#### Common Settings (All Users)
- Profile settings
- Appearance preferences
- Notification settings
- Security settings

#### Administrator Settings
- System configuration
- User management
- AI model settings
- Audit logs

#### Doctor Settings
- Diagnosis preferences
- Patient management settings
- Report configuration

#### Patient Settings
- Privacy preferences
- Medical information
- Access control settings

Each role sees their relevant settings while maintaining access to common settings available to all users.