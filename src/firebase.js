import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyCBk7WOIgtA3wdg3hEwkjtPv2fe3eDd2QM",
    authDomain: "ai-ers.firebaseapp.com",
    projectId: "ai-ers",
    storageBucket: "ai-ers.firebasestorage.app",
    messagingSenderId: "659379079974",
    appId: "1:659379079974:web:31260f248207db71d30fe7"
};

const app = initializeApp(firebaseConfig);

export default app;
