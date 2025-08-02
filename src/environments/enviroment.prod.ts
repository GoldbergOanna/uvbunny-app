
// IMPORTANT: Replace these placeholder values with your actual Firebase configuration
// Get your Firebase config from: https://console.firebase.google.com/project/your-project/settings/general/

const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.firebasestorage.app",
  messagingSenderId: "your-sender-id-here",
  appId: "your-app-id-here",
  measurementId: "your-measurement-id-here"
};

export const environment = {
  production: true,
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
