# 🐰 UVbunny - Bunny Happiness Tracking Application

> A modern Angular 19 + TypeScript + Firebase application for monitoring and tracking bunny happiness levels with event sourcing architecture.

[![Firebase Deployment](https://github.com/goldberoanna/uvbunny-app/workflows/Deploy%20to%20Firebase%20Hosting%20on%20merge/badge.svg)](https://github.com/goldbergoanna/uvbunny-app/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue)](https://www.typescriptlang.org/)
[![Angular](https://img.shields.io/badge/Angular-19-red)](https://angular.io/)
[![Firebase](https://img.shields.io/badge/Firebase-10+-orange)](https://firebase.google.com/)

## 🌐 Live Demo

**Production Site:** https://uvbunny-app-2025.web.app  
**Firebase Console:** https://console.firebase.google.com/project/uvbunny-app-2025

## 📋 Project Overview

UVbunny is a happiness tracking application. The application demonstrates modern web development practices using Angular 19, TypeScript, Firebase, and event sourcing patterns.

### Key Features

- 🏠 **Main Dashboard** - Overview of all bunnies with average happiness statistics
- 🐰 **Individual Bunny Management** - Detailed view with feeding and playing interactions
- 🍽️ **Event-Driven Actions** - Feeding (lettuce +1, carrot +3) and playing (+2/+4) activities
- ⚙️ **Configuration Management** - Retroactive point system adjustments
- 📊 **Event Sourcing** - Complete audit trail of all bunny interactions
- 📱 **Responsive Design** - Modern minimalist UI that works on all devices
- 🔄 **Real-time Updates** - Live synchronization across multiple users
- ☁️ **Cloud Storage** - Avatar upload functionality with Firebase Storage

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework:** Angular 19 (Standalone Components)
- **Language:** TypeScript 5.2+ (Strict Mode)
- **Styling:** Bootstrap 5.3 + Custom SCSS
- **Build Tool:** Angular CLI with Webpack
- **Code Quality:** ESLint + TypeScript Strict Rules

### Backend Stack
- **Database:** Cloud Firestore (NoSQL)
- **Authentication:** Firebase Auth (Future Enhancement)
- **File Storage:** Firebase Storage
- **Functions:** Firebase Cloud Functions
- **Hosting:** Firebase Hosting

### DevOps & Deployment
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions
- **Deployment:** Automatic deployment on merge to main
- **Preview Deployments:** Automatic preview URLs for Pull Requests
- **Environment Management:** Firebase environment configuration

## 🗄️ Data Architecture

### Event Sourcing Pattern

The application implements event sourcing where bunny happiness is calculated from a series of immutable events rather than storing current state.

## 🏢 Project Structure

```
src/
├── app/
│   ├── core/                     # Core application logic
│   │   ├── models/               # TypeScript interfaces & types
│   │   │   ├── bunny.model.ts
│   │   │   ├── event.model.ts
│   │   │   └── config.model.ts
│   │   └── services/             # Business logic services
│   │       ├── bunny.service.ts
│   │       ├── event.service.ts
│   │       └── config.service.ts
│   ├── features/                
│   │   ├── main-page/
│   │   │   ├── main-page.component.ts
│   │   │   ├── main-page.component.html
│   │   │   └── main-page.component.scss
│   │   ├── bunny-details/
│   │   │   ├── bunny-details.component.ts
│   │   │   ├── bunny-details.component.html
│   │   │   └── bunny-details.component.scss
│   │   └── configuration/
│   │       ├── configuration.component.ts
│   │       ├── configuration.component.html
│   │       └── configuration.component.scss
│   ├── shared/                   # Reusable components
│   │   └── components/
│   │       ├── bunny-card/
│   │       ├── happiness-meter/
│   │       └── event-form/
│   ├── app.component.ts          
│   ├── app.config.ts            
│   └── app.routes.ts             
├── environments/                 
│   ├── environment.ts
│   └── environment.prod.ts
└── styles.scss                  
```

### Component Design Principles
- **Clean Lines:** Minimal visual noise with generous white space
- **Subtle Shadows:** Depth through elevation rather than borders
- **Smooth Animations:** 0.2s ease transitions for interactions
- **Responsive Grid:** Bootstrap-based layout system
- **Accessibility:** WCAG 2.1 AA compliant color contrasts

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or later
- **npm** 9.x or later  
- **Angular CLI** 19.x
- **Git** for version control
- **Firebase Account** for backend services

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/goldbergoanna/uvbunny-app.git
   cd uvbunny-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Firebase:**
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   
   # Set up local environment
   cp src/environments/environment.example.ts src/environments/environment.ts
   # Add your Firebase configuration to environment.ts
   ```

4. **Start development server:**
   ```bash
   ng serve
   ```

5. **Open application:**
   Navigate to `http://localhost:4200`

### Firebase Setup

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create new project: "UVbunny App"
   - Enable Google Analytics (optional)

2. **Enable Services:**
   ```bash
   # Firestore Database
   - Build → Firestore Database → Create database → Test mode
   
   # Firebase Storage  
   - Build → Storage → Get started → Test mode
   
   # Firebase Hosting
   - Build → Hosting → Get started
   ```

3. **Configure Web App:**
   - Project Settings → General → Add app → Web
   - Copy configuration to `src/environments/environment.ts`

## 🛠️ Development Workflow

### Branch Strategy
- **`main`** - Production branch (auto-deploys to live site)
- **`feature/*`** - Feature development branches
- **`hotfix/*`** - Emergency production fixes

### Commit Convention
```bash
# Types: ✨feat 🐛fix 📝docs 💄style ♻️refactor ⚡perf ✅test 🔧chore

git commit -m "✨ feat(bunny-details): Add feeding functionality with carrot/lettuce options"
git commit -m "🐛 fix(happiness): Resolve calculation error in event sourcing"
git commit -m "💄 style(main-page): Implement modern minimalist design theme"
```

### Development Commands

```bash
# Development server with hot reload
ng serve

# Production build
ng build --configuration production

# Run tests
ng test

# Run linting
ng lint

# Type checking
npx tsc --noEmit

# Firebase emulator (local development)
firebase emulators:start

# Deploy to Firebase
firebase deploy
```

## 🧪 Testing Strategy

### Unit Tests
- **Framework:** Jasmine + Karma
- **Coverage:** Aim for 80%+ code coverage
- **Focus:** Services, components, utilities

### Integration Tests
- **Firebase Rules:** Firestore security rules testing
- **API Integration:** Firebase service integration tests

### E2E Tests
- **Framework:** Cypress (Future Enhancement)
- **Scenarios:** Critical user journeys

## 📦 Deployment

### Automatic Deployment
- **Trigger:** Push/merge to `main` branch
- **Process:** GitHub Actions → Build → Test → Deploy
- **Target:** Firebase Hosting
- **Preview:** Pull requests get preview URLs

### Manual Deployment
```bash
# Build for production
ng build --configuration production

# Deploy to Firebase
firebase deploy

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only firestore:rules
```

## 📈 Performance Optimizations

### Angular Optimizations
- **OnPush Change Detection:** Reduce change detection cycles
- **Lazy Loading:** Feature modules loaded on demand
- **Tree Shaking:** Remove unused code in production builds
- **Service Workers:** Cache static assets (Future Enhancement)

### Firebase Optimizations
- **Firestore Indexes:** Optimized queries for large datasets
- **Image Compression:** Automatic image optimization for avatars
- **CDN Delivery:** Global content delivery through Firebase Hosting

## 🔐 Security Considerations

### Frontend Security
- **TypeScript Strict Mode:** Compile-time type safety
- **ESLint Rules:** Code quality and security linting
- **Environment Variables:** Sensitive data in environment files
- **HTTPS Only:** Secure communication enforced

### Backend Security  
- **Firestore Rules:** Database access control
- **Storage Rules:** File upload restrictions
- **CORS Configuration:** Cross-origin request handling
- **Input Validation:** Server-side data validation

## 🚦 Monitoring & Analytics

### Firebase Analytics
- **User Interactions:** Track bunny feeding and playing events
- **Performance:** Page load times and app performance
- **Errors:** Crash reporting and error tracking

### Custom Metrics
- **Happiness Trends:** Track average happiness over time
- **User Engagement:** Most active features and usage patterns
- **Event Distribution:** Popular activities and food preferences

## 🐛 Known Issues & Future Enhancements

### Current Limitations
- [ ] No user authentication (single-user app)
- [ ] Limited offline functionality
- [ ] No push notifications for sad bunnies
- [ ] Basic avatar upload (no image processing)

### Future Enhancements
- [ ] **Multi-user Support:** User authentication and private bunny families
- [ ] **Advanced Analytics:** Happiness trends and insights dashboard
- [ ] **Push Notifications:** Alerts for bunny care reminders
- [ ] **Image Processing:** Automatic avatar resizing and optimization
- [ ] **Dark Mode:** Alternative color scheme option
- [ ] **Mobile App:** React Native or Flutter mobile application
- [ ] **API Integration:** RESTful API for third-party integrations

## 📚 Learning Outcomes

This project demonstrates proficiency in:

### Frontend Development
- ✅ **Angular 19** - Latest framework features and standalone components
- ✅ **TypeScript** - Type safety and modern JavaScript features
- ✅ **Responsive Design** - Mobile-first, accessible user interfaces
- ✅ **State Management** - RxJS observables and reactive programming

### Backend Development  
- ✅ **NoSQL Databases** - Firestore document-based data modeling
- ✅ **Real-time Systems** - Live data synchronization
- ✅ **Event Sourcing** - Immutable event streams and state reconstruction
- ✅ **Cloud Services** - Firebase ecosystem integration

### DevOps & Best Practices
- ✅ **CI/CD Pipelines** - Automated testing and deployment
- ✅ **Version Control** - Git workflow and collaboration
- ✅ **Code Quality** - Linting, testing, and documentation
- ✅ **Performance** - Optimization and monitoring strategies

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test thoroughly
4. Commit using conventional commits
5. Push to branch: `git push origin feature/amazing-feature`
6. Create Pull Request

### Code Standards
- Follow Angular Style Guide
- Use TypeScript strict mode
- Write unit tests for new features
- Update documentation for public APIs
- Ensure accessibility compliance

## 📄 License

This project is created for the UVeye senior developer assignment and is intended for evaluation purposes.

## 📞 Contact & Support

**Developer:** Oana Goldberg  
**Email:**  goldbergoanna@gmail.com
**GitHub:** [@goldbergoanna](https://github.com/goldbergoanna)  
**LinkedIn:** 

**Project Repository:** https://github.com/goldbergoanna/uvbunny-app  
**Live Demo:** https://uvbunny-app-2025.web.app  
**Firebase Console:** https://console.firebase.google.com/project/uvbunny-app-2025

---

<div align="center">

**Built with ❤️ for UVeye using Angular 19 + TypeScript + Firebase**

*Demonstrating modern web development practices and event-driven architecture*

</div>
