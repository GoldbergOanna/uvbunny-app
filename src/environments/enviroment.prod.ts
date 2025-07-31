
const firebaseConfig = {
  apiKey: "AIzaSyDO96Ih6M8oLIsIeyQXkDkHBT1O_oyU5Yo",
  authDomain: "uvbunny-app.firebaseapp.com",
  projectId: "uvbunny-app",
  storageBucket: "uvbunny-app.firebasestorage.app",
  messagingSenderId: "79767470037",
  appId: "1:79767470037:web:fa0baee4f03a574964475c",
  measurementId: "G-PE3XW2S1RF"
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
