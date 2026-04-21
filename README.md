# AstralTask

> A beautiful task and study planner with glass morphism design and Material You theming.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

##  Features

-  **Task Management** - Create, organize, and track tasks with subtasks
-  **Calendar View** - Visualize your week and month at a glance
-  **Smart Reminders** - Browser notifications for important tasks
-  **Beautiful Themes** - 6 stunning themes with light/dark variants
-  **Cloud Sync** - Your tasks sync across all devices
-  **PWA Support** - Install as an app on mobile and desktop
-  **Secure** - Your data is encrypted and private

##  Themes

Choose from 6 beautiful Material You inspired themes:
-  **Lavender** - Soft purple tones
-  **Rose** - Warm pink hues
-  **Ocean** - Cool blue shades
-  **Forest** - Natural green colors
-  **Sunset** - Vibrant orange tones
-  **Midnight** - Deep dark blues

Each theme has both light and dark variants.

##  Quick Start

### For Users

1. **Visit the App**
   ```
   https://astraltask.pages.dev
   ```

2. **Create an Account**
   - Click "Sign up"
   - Enter your email and password (minimum 6 characters)
   - Start organizing your tasks!

3. **Install as PWA** (Optional)
   - On mobile: Tap "Add to Home Screen"
   - On desktop: Click install icon in address bar

### For Developers

Want to run AstralTask locally or contribute? See our [Developer Setup Guide](SETUP.md).

##  Usage

### Creating Tasks

1. Click the **+** button
2. Enter task title and details
3. Set date, time, and priority
4. Add tags and notes
5. Save!

### Organizing Tasks

- **Drag & Drop** - Reorder tasks (coming soon)
- **Subtasks** - Break down complex tasks
- **Tags** - Categorize and filter
- **Colors** - Visual organization
- **Pin** - Keep important tasks at top

### Calendar View

- **Week View** - See your week at a glance
- **Month View** - Plan ahead
- **Date Picker** - Jump to any date

### Notifications

- Set custom reminder times
- Browser notifications when app is open
- PWA background notifications (Android)

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Auth**: JWT tokens
- **State**: TanStack Query

##  Privacy & Security

- **End-to-end encryption** for sensitive data
- **Secure authentication** with JWT tokens
- **Password hashing** with industry standards
- **No tracking** - Your data is yours
- **GDPR compliant** - Delete your data anytime

##  Documentation

- [Developer Setup Guide](SETUP.md) - How to run locally
- [API Documentation](#api-endpoints) - API reference
- [Contributing Guidelines](#contributing) - How to contribute

##  API Endpoints

### Public Routes

```
POST /auth/signup          - Create account
POST /auth/login           - Sign in
POST /auth/reset-password  - Request password reset
POST /auth/update-password - Update password
```

### Protected Routes (Require Authentication)

```
GET    /api/tasks              - Get all tasks
GET    /api/tasks/range        - Get tasks by date range
POST   /api/tasks              - Create task
PATCH  /api/tasks/:id          - Update task
DELETE /api/tasks/:id          - Delete task
GET    /api/profile            - Get profile
PATCH  /api/profile            - Update profile
DELETE /api/profile/account    - Delete account
```

##  Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines

- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Keep PRs focused and small

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Browser/device info

##  Feature Requests

Have an idea? We'd love to hear it! Open an issue with:
- Clear description of the feature
- Use case and benefits
- Any implementation ideas

##  Roadmap

- [-] Drag and drop task reordering
- [-] Recurring tasks
- [ ] Task templates
- [ ] Collaboration features
- [ ] Calendar integrations (Google, Outlook)
- [ ] Mobile apps (iOS, Android)
- [ ] Desktop apps (Windows, Mac, Linux)
- [-] Import/Export functionality
- [ ] Dark mode improvements
- [ ] Accessibility enhancements

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- [Vite](https://vitejs.dev/) - Lightning fast build tool
- [React](https://react.dev/) - UI library
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Lucide](https://lucide.dev/) - Icon library
- [Cloudflare](https://cloudflare.com/) - Infrastructure
- [Hono](https://hono.dev/) - Web framework

##  Support

- **Issues**: [GitHub Issues](https://github.com/editinghero/astraltask/issues)
- **Discussions**: [GitHub Discussions](https://github.com/editinghero/astraltask/discussions)
- **Email**: support@astraltask.com (if applicable)

##  Star History

If you find AstralTask useful, please consider giving it a star! 

---

## Local Development

Want to run AstralTask on your machine? Check out our detailed [Developer Setup Guide](SETUP.md).

**Quick overview:**
1. Clone the repository
2. Install dependencies
3. Set up Cloudflare D1 database
4. Configure environment variables
5. Run development server

For complete instructions, see [SETUP.md](SETUP.md).

---

Made with ❤️ by the AstralQuarks team
