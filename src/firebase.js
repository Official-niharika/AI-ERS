import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: //YOUR OWN API KEY,
    authDomain: "ai-ers.firebaseapp.com",
    projectId: "ai-ers",
    storageBucket: "ai-ers.firebasestorage.app",
    messagingSenderId: "659379079974",
    appId: "1:659379079974:web:31260f248207db71d30fe7"
};

const app = initializeApp(firebaseConfig);

export default app;
