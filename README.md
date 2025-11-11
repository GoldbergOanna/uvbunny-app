<div align="center">

# 🐰 UVbunny

### Bunny Happiness Tracking Application

*A modern web application for managing virtual bunnies and tracking their happiness levels*

[![Angular](https://img.shields.io/badge/Angular-19.2-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.0-orange.svg)](https://firebase.google.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple.svg)](https://getbootstrap.com/)

[Live Demo](https://uvbunny-app-2025.web.app) • [Report Bug](https://github.com/goldbergoanna/uvbunny-app/issues)

</div>

---

## 📖 Table of Contents

- [About The Project](#about-the-project)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Firebase Configuration](#firebase-configuration)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [License](#license)
- [Contact](#contact)

---

## 🎯 About The Project

**UVbunny** is a Single Page Application (SPA) that allows users to manage a collection of virtual bunnies and track their happiness levels through various activities. Built with Angular 19 and Firebase, this application demonstrates modern web development practices with real-time data synchronization, responsive design, and a clean component-based architecture.

### What It Does

- **Bunny Management**: Create, view, and manage multiple virtual bunnies with custom avatars
- **Happiness Tracking**: Monitor bunny happiness levels (0-100 scale) based on their activities
- **Event Recording**: Log feeding events (lettuce/carrots) and play sessions with other bunnies
- **Points System**: Configure point values for different activities with first-time bonuses
- **Real-time Updates**: See changes instantly across all users with Firebase Firestore
- **Statistics Dashboard**: View analytics and metrics across your bunny collection
- **Avatar Management**: Upload and store bunny images using Firebase Storage

---

## ✨ Features

- **Real-time Data Synchronization** using Firebase Firestore
- **Responsive Design** with Bootstrap 5 for mobile and desktop
- **Modern Angular Architecture** with standalone components
- **Happiness Calculation System** with configurable points
- **Avatar Upload & Management** with Firebase Storage
- **Statistics & Analytics Dashboard**
- **Type-safe Development** with TypeScript
- **Automated CI/CD** with GitHub Actions
- **Progressive Web App** capabilities
- **Clean Code Architecture** with path aliases and service-based state management

---

## 🛠 Technology Stack

### Frontend
- **Angular 19.2** - Modern web framework with standalone components
- **TypeScript 5.7** - Strongly typed JavaScript
- **RxJS 7.8** - Reactive programming with observables
- **Bootstrap 5.3** - CSS framework for responsive design
- **Bootstrap Icons** - Icon library
- **SCSS** - CSS preprocessor

### Backend & Database
- **Firebase 12.0** - Backend-as-a-Service
- **Cloud Firestore** - NoSQL real-time database
- **Firebase Storage** - File storage for avatars
- **Firebase Hosting** - Static web hosting
- **AngularFire 19.2** - Official Angular Firebase library

### Development Tools
- **Angular CLI 19.2** - Command-line interface for Angular
- **ESLint 9.29** - Code linting with Angular ESLint
- **Prettier 3.6** - Code formatting
- **Karma & Jasmine** - Testing framework
- **GitHub Actions** - CI/CD automation

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **Angular CLI** 19.x
  ```bash
  npm install -g @angular/cli@19
  ```
- **Firebase CLI** (optional, for deployment)
  ```bash
  npm install -g firebase-tools
  ```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/goldbergoanna/uvbunny-app.git
   cd uvbunny-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase configuration**

   Create a local environment file at `src/environments/environment.local.ts`:

   ```typescript
   export const environment = {
     production: false,
     firebase: {
       apiKey: "your-api-key",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "your-sender-id",
       appId: "your-app-id"
     }
   };
   ```

   See [local-setup.md](local-setup.md) for detailed Firebase setup instructions.

### Running Locally

1. **Start the development server**
   ```bash
   npm start
   ```

   The application will be available at `http://localhost:4200/`

2. **The app will automatically reload** when you make changes to the source files

3. **Access the application**
   - Navigate to `http://localhost:4200/` in your browser
   - Start creating bunnies and tracking their happiness!

---

## 📁 Project Structure

```
uvbunny-app/
├── src/
│   ├── app/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── add-bunny-form/  # Form for creating bunnies
│   │   │   ├── bunny-card/      # Bunny display card
│   │   │   ├── happiness-meter/ # Happiness visualization
│   │   │   ├── header/          # App header
│   │   │   └── stats-section/   # Statistics display
│   │   ├── pages/               # Route-level page components
│   │   │   ├── main-page/       # Dashboard/home page
│   │   │   ├── bunny-details/   # Individual bunny view
│   │   │   └── configuration/   # Settings page
│   │   ├── core/
│   │   │   ├── models/          # TypeScript interfaces
│   │   │   └── services/        # Business logic services
│   │   ├── shared/              # Shared utilities
│   │   ├── app.component.*      # Root component
│   │   ├── app.config.ts        # App configuration
│   │   └── app.routes.ts        # Routing configuration
│   ├── environments/            # Environment configurations
│   ├── index.html               # HTML entry point
│   ├── main.ts                  # Application bootstrap
│   └── styles.scss              # Global styles
├── functions/                   # Firebase Cloud Functions
├── public/                      # Static assets
├── .github/workflows/           # CI/CD workflows
├── firebase.json                # Firebase configuration
├── firestore.rules              # Firestore security rules
├── angular.json                 # Angular CLI configuration
└── package.json                 # Dependencies
```

### Path Aliases

The project uses TypeScript path aliases for cleaner imports:

```typescript
@/*           → src/*
@core/*       → src/app/core/*
@shared/*     → src/app/shared/*
@features/*   → src/app/pages/*
@components/* → src/app/components/*
```

---

## 📜 Available Scripts

Run these commands from the project root:

| Command | Description |
|---------|-------------|
| `npm start` | Start development server at http://localhost:4200 |
| `npm run build` | Build for production (output in `dist/`) |
| `npm run watch` | Build in watch mode for development |
| `npm test` | Run unit tests with Karma |
| `npm run lint` | Run ESLint code linting |

---

## 🔥 Firebase Configuration

### Firestore Collections

- **bunnies/** - Stores bunny documents with name, happiness, avatar URL
- **events/** - Stores event documents (eating, playing activities)
- **config/** - Stores configuration documents (point values)

### Data Models

**Bunny:**
```typescript
{
  id: string
  name: string
  avatarUrl?: string
  happiness: number      // 0-100
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Event:**
```typescript
{
  id: string
  bunnyId: string
  type: 'eating' | 'playing'
  details: { foodType: string } | { playedWithBunny: string, isFirstTime: boolean }
  timestamp: Timestamp
  pointsEarned: number
}
```

**Points Configuration:**
```typescript
{
  lettuce: number
  carrot: number
  playing: number
  repeatPlaying: number
}
```

### Firebase Services

- **Firebase Hosting** - Serves the Angular application
- **Cloud Firestore** - Real-time NoSQL database
- **Firebase Storage** - Stores bunny avatar images
- **Firebase Functions** - Serverless backend (Node.js 22)

---

## 🚢 Deployment

The application is configured for automated deployment to Firebase Hosting via GitHub Actions.

### Automated Deployment (CI/CD)

- **On Pull Request**: Creates preview deployment
- **On Merge to Main**: Deploys to production

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

The live application is available at: [https://uvbunny-app-2025.web.app](https://uvbunny-app-2025.web.app)

---

## 📚 Documentation

Additional documentation is available:

- **[local-setup.md](local-setup.md)** - Comprehensive local development setup guide
- **[FIREBASE_TROUBLESHOOTING.md](FIREBASE_TROUBLESHOOTING.md)** - Firebase connection troubleshooting
- **[.github/secrets-setup.md](.github/secrets-setup.md)** - GitHub secrets configuration for CI/CD

---

## 📄 License

This project is proprietary software developed for demonstration purposes. All rights reserved.

### Usage Restrictions

- This code is provided for portfolio and reference purposes only
- No commercial use, distribution, or modification is permitted without explicit written consent
- Educational use is permitted for learning and evaluation purposes

**Copyright © 2025 Oana Goldberg. All rights reserved.**

---

## 📞 Contact & Support

**Developer:** Oana Goldberg

- **GitHub:** [@goldbergoanna](https://github.com/goldbergoanna)
- **Project Repository:** [github.com/goldbergoanna/uvbunny-app](https://github.com/goldbergoanna/uvbunny-app)

---

<div align="center">
Made with ❤️ using Angular, TypeScript, and Firebase
</div>
