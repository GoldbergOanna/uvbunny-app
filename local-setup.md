# 🔧 Local Development Setup Guide

This guide provides step-by-step instructions for setting up the UVbunny application for local development with proper security practices.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** 18.x or later ([Download](https://nodejs.org/))
- **npm** 9.x or later (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Angular CLI** 19.x (`npm install -g @angular/cli`)
- **Firebase CLI** (`npm install -g firebase-tools`)

## 🚀 Step-by-Step Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/goldbergoanna/uvbunny-app.git
cd uvbunny-app

# Install project dependencies
npm install
```

### 2. Firebase Project Setup

#### Create a New Firebase Project

1. **Go to Firebase Console**
   - Visit [Firebase Console](https://console.firebase.google.com)
   - Click "Create a project" or "Add project"

2. **Configure Your Project**
   - **Project name**: Choose a unique name (e.g., "uvbunny-app-yourname")
   - **Google Analytics**: Optional (recommended for production)
   - Click "Create project"

3. **Enable Required Services**

   **Firestore Database:**
   ```
   1. Go to Build → Firestore Database
   2. Click "Create database"
   3. Select "Start in test mode" (for development)
   4. Choose your preferred location
   5. Click "Done"
   ```

   **Firebase Storage:**
   ```
   1. Go to Build → Storage  
   2. Click "Get started"
   3. Select "Start in test mode"
   4. Choose the same location as Firestore
   5. Click "Done"
   ```

   **Firebase Hosting:**
   ```
   1. Go to Build → Hosting
   2. Click "Get started"
   3. Follow the setup wizard (we'll configure this later)
   ```

### 3. Get Firebase Configuration

1. **Navigate to Project Settings**
   - Click the gear icon (⚙️) next to "Project Overview"
   - Select "Project settings"

2. **Add a Web App**
   - Scroll down to "Your apps" section
   - Click the web icon `</>`
   - **App nickname**: "uvbunny-web-app"
   - **Check** "Also set up Firebase Hosting" (optional)
   - Click "Register app"

3. **Copy Configuration**
   - Copy the entire `firebaseConfig` object that looks like:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.firebasestorage.app",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123...",
     measurementId: "G-ABC123..."
   };
   ```

### 4. Configure Environment Files

#### Copy Example Files

```bash
# Copy the example environment files
cp src/environments/environment.example.ts src/environments/environment.ts
cp src/environments/environment.example.ts src/environments/environment.prod.ts
```

#### Update Development Environment

1. **Open** `src/environments/environment.ts`
2. **Replace** the placeholder values with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

export const environment = {
  production: false, // Keep this as false for development
  firebase: {
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId,
    measurementId: firebaseConfig.measurementId,
  }
};
```

#### Update Production Environment

1. **Open** `src/environments/environment.prod.ts`
2. **Replace** the placeholder values with your actual Firebase configuration
3. **Ensure** `production: true` is set

### 5. Firebase CLI Setup

#### Login to Firebase

```bash
# Login to your Firebase account
firebase login

# This will open a browser window for authentication
# Follow the prompts to sign in with your Google account
```

#### Initialize Firebase in Your Project

```bash
# Initialize Firebase (run from project root)
firebase init

# Select the following options:
# ◉ Firestore: Configure security rules and indexes files
# ◉ Hosting: Configure files for Firebase Hosting and (optionally) GitHub Action deploys
# 
# Use existing project: Select your project from the list
# Firestore rules file: firestore.rules (default)
# Firestore indexes file: firestore.indexes.json (default)
# Public directory: dist/uvbunny-app (important!)
# Single-page app: Yes
# Set up automatic builds: No (for now)
```

### 6. Test Your Setup

#### Start Development Server

```bash
# Start the Angular development server
ng serve

# The application should open at http://localhost:4200
```

#### Verify Firebase Connection

1. **Check Console**: Look for any Firebase connection errors in the browser console
2. **Test Functionality**: Try creating a new bunny to test Firestore connection
3. **Check Storage**: Try uploading an avatar to test Firebase Storage

### 7. Common Issues & Troubleshooting

#### Issue: "Firebase configuration object is invalid"

**Solution:**
- Double-check that all Firebase config values are correctly copied
- Ensure no extra quotes or spaces in the configuration
- Verify the project ID matches your Firebase project

#### Issue: "Permission denied" errors

**Solution:**
- Ensure Firestore is in "test mode" for development
- Check that your Firebase project is active and billing is set up (if required)

#### Issue: "Module not found" errors

**Solution:**
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Angular CLI version mismatch

**Solution:**
```bash
# Update Angular CLI globally
npm uninstall -g @angular/cli
npm install -g @angular/cli@19

# Update project Angular CLI
ng update @angular/cli @angular/core
```

### 8. Development Workflow

#### Daily Development

```bash
# Start development server
ng serve

# Run tests
ng test

# Run linting
ng lint

# Type checking
npx tsc --noEmit
```

#### Firebase Emulators (Optional)

For local development without hitting live Firebase services:

```bash
# Install emulator suite
npm install -g firebase-tools

# Start emulators
firebase emulators:start

# Your app will connect to local emulators instead of live Firebase
```

### 9. GitHub Secrets Setup (For CI/CD)

If you plan to set up automated deployment:

1. **Go to your GitHub repository**
2. **Navigate to**: Settings → Secrets and variables → Actions
3. **Add the following repository secrets**:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
   - `FIREBASE_MEASUREMENT_ID`

### 10. Security Best Practices

#### Environment Files

- ✅ **Never commit** `environment.ts` or `environment.prod.ts` to git
- ✅ **Always use** placeholder values in committed files
- ✅ **Keep** `environment.example.ts` updated with the latest structure

#### Firebase Security

- ✅ **Use test mode** only for development
- ✅ **Configure proper Firestore rules** before going to production
- ✅ **Enable Firebase Security Rules** for Storage
- ✅ **Monitor usage** in Firebase Console

#### Local Development

- ✅ **Use different Firebase projects** for development and production
- ✅ **Regularly update** dependencies for security patches
- ✅ **Use environment variables** for CI/CD secrets

## 🆘 Getting Help

If you encounter issues not covered in this guide:

1. **Check the main README.md** for additional information
2. **Review Firebase Console** for any error messages
3. **Check browser developer tools** console for JavaScript errors
4. **Review Angular CLI documentation** for build issues

## 📞 Support

For project-specific questions:
- **Email**: goldbergoanna@gmail.com
- **GitHub Issues**: [Create an issue](https://github.com/goldbergoanna/uvbunny-app/issues)

---

**Happy coding! 🐰**