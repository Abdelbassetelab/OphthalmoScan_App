# OphthalmoScan-AI

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