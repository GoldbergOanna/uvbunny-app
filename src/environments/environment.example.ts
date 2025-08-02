// This is an example environment configuration file.
// Copy this file to environment.ts and environment.prod.ts and replace the placeholder values
// with your actual Firebase configuration values from the Firebase Console.

// Firebase configuration interface
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

// Example Firebase configuration - REPLACE WITH YOUR ACTUAL VALUES
const firebaseConfig: FirebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.firebasestorage.app",
  messagingSenderId: "your-sender-id-here",
  appId: "your-app-id-here",
  measurementId: "your-measurement-id-here"
};

// Environment configuration
export const environment = {
  production: false, // Set to true for production environment
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