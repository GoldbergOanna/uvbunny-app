# 🔥 Firebase Connection Troubleshooting Guide

This guide helps you fix Firebase connection errors in the UVbunny application.

## 🚨 Common Connection Errors

### Error: "FirebaseError: Firebase: No Firebase App '[DEFAULT]' has been created"

**Cause:** Environment configuration file contains placeholder values instead of real Firebase configuration.

**Solution:**
1. Run the setup script: `./setup-firebase-config.sh`
2. Follow the instructions to update your environment files

### Error: "FirebaseError: Firebase: Invalid API key provided"

**Cause:** The API key in your environment file is incorrect or still set to placeholder value.

**Solution:**
1. Go to [Firebase Console](https://console.firebase.google.com/project/uvbunny-app/settings/general/)
2. Copy the correct `apiKey` value
3. Update `src/environments/environment.ts`

### Error: "FirebaseError: Firebase: Invalid project ID"

**Cause:** Project ID doesn't match your Firebase project.

**Solution:**
1. Verify project ID is exactly: `uvbunny-app`
2. Update `projectId` in your environment file

## 🔧 Quick Fix Steps

### Step 1: Check Environment Files

```bash
# Check if environment files have placeholder values
grep -n "your-api-key-here" src/environments/environment.ts
```

If this returns results, you need to update your configuration.

### Step 2: Get Firebase Configuration

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/project/uvbunny-app
   - Or create your own project if you don't have access

2. **Access Project Settings:**
   - Click the gear icon (⚙️) next to "Project Overview"
   - Select "Project settings"

3. **Find Your Web App Config:**
   - Scroll down to "Your apps" section
   - Click on the web app icon `</>`
   - Copy the `firebaseConfig` object

4. **Update Environment Files:**
   ```typescript
   const firebaseConfig = {
     apiKey: "AIzaSy...", // Your actual API key
     authDomain: "uvbunny-app.firebaseapp.com",
     projectId: "uvbunny-app",
     storageBucket: "uvbunny-app.firebasestorage.app",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123...",
     measurementId: "G-ABC123DEF"
   };
   ```

### Step 3: Update Both Environment Files

**Development (src/environments/environment.ts):**
- Set `production: false`
- Use your Firebase configuration

**Production (src/environments/environment.prod.ts):**
- Set `production: true`
- Use the same Firebase configuration

### Step 4: Verify Setup

```bash
# Test the build
ng build --configuration development --dry-run

# Start development server
ng serve
```

## 🐛 Debugging Connection Issues

### Check Browser Console

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for Firebase-related errors
4. Common error patterns:
   ```
   Firebase: No Firebase App '[DEFAULT]' has been created
   Firebase: Invalid API key provided
   Firebase: Firebase App named '[DEFAULT]' already exists
   ```

### Check Network Tab

1. Open Network tab in Developer Tools
2. Look for failed requests to:
   - `firestore.googleapis.com`
   - `firebase.googleapis.com`
   - `firebasestorage.googleapis.com`

### Verify Firebase Project Access

1. **Check Project Permissions:**
   - Make sure you have access to the Firebase project
   - Verify project is active and not suspended

2. **Check Firestore Database:**
   - Go to Firebase Console → Firestore Database
   - Ensure database is created and rules allow access

3. **Check Authentication (if using):**
   - Go to Firebase Console → Authentication
   - Verify authentication methods are enabled

## 🛠️ Environment File Templates

### Correct Environment Structure

```typescript
// src/environments/environment.ts
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "uvbunny-app.firebaseapp.com",
  projectId: "uvbunny-app",
  storageBucket: "uvbunny-app.firebasestorage.app",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id",
  measurementId: "your-actual-measurement-id"
};

export const environment = {
  production: false,
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

## 🔍 Advanced Troubleshooting

### Check Firebase SDK Version

```bash
# Check installed Firebase version
npm list @angular/fire firebase
```

### Clear Browser Data

1. Clear browser cache and cookies
2. Try incognito/private browsing mode
3. Disable browser extensions

### Check Firestore Rules

```javascript
// Default rules for development (Firebase Console → Firestore → Rules)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // WARNING: Only for development
    }
  }
}
```

### Verify Storage Rules

```javascript
// Default rules for development (Firebase Console → Storage → Rules)
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true; // WARNING: Only for development
    }
  }
}
```

## 📞 Getting Additional Help

### Check Logs

```bash
# Angular development server logs
ng serve --verbose

# Firebase emulator logs (if using)
firebase emulators:start --debug
```

### Community Resources

- **Firebase Documentation:** https://firebase.google.com/docs/web/setup
- **Angular Fire Documentation:** https://github.com/angular/angularfire
- **Stack Overflow:** Search for "Firebase Angular connection error"

### Project-Specific Help

- **GitHub Issues:** https://github.com/goldbergoanna/uvbunny-app/issues
- **Local Setup Guide:** See `local-setup.md` in the project root

## ✅ Success Checklist

- [ ] Environment files have real Firebase configuration (not placeholders)
- [ ] Both `environment.ts` and `environment.prod.ts` are updated
- [ ] Firebase project exists and is accessible
- [ ] Firestore database is created
- [ ] Storage bucket is set up
- [ ] `ng serve` starts without Firebase errors
- [ ] Browser console shows no Firebase connection errors
- [ ] Application can read/write to Firestore (test by creating a bunny)

---

**Quick Fix Command:**
```bash
./setup-firebase-config.sh
```

This script will guide you through the setup process and check for common issues.
