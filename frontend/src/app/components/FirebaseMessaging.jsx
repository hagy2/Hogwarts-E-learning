import { useEffect, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
    apiKey: "AIzaSyDe9udBO7hEmmRqwGQbQCsjhpLkG9rYUyc",
    authDomain: "hogwarts-c7c45.firebaseapp.com",
    projectId: "hogwarts-c7c45",
    storageBucket: "hogwarts-c7c45.firebasestorage.app",
    messagingSenderId: "230088672401",
    appId: "1:230088672401:web:2307df0163d06d6cc5eb30"
};

const vapidKey = 'YOUR_VAPID_KEY'; // Your VAPID key from Firebase

function FirebaseMessaging() {
    const [token, setToken] = useState < string | null > (null); // Store the FCM token

    useEffect(() => {
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);

        // Initialize Firebase Cloud Messaging and get the registration token
        const messaging = getMessaging(app);

        // Check for service worker support
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/firebase-messaging-sw.js').then((registration) => {
                getToken(messaging, { vapidKey, serviceWorkerRegistration: registration }).then((currentToken) => {
                    if (currentToken) {
                        console.log("FCM registration token:", currentToken);
                        setToken(currentToken); // Set the token state in the component

                        // Send the token to your server to store (if needed for targeted messages)
                        // ... your logic to send token to server

                    } else {
                        console.log('No registration token available. Request permission to generate one.');
                        // ... display UI to request permission ...
                    }
                }).catch((err) => {
                    console.error('An error occurred while retrieving token. ', err);
                });
            }).catch((err) => {
                console.error('Service worker registration failed, error:', err);
            });
        }

        // Handle incoming messages
        onMessage(messaging, (payload) => {
            console.log('Message received. ', payload);
            // Customize notification here
            // ... your logic to handle incoming messages
        });
    }, []);

    return (
        <div>
            <h1>Firebase Cloud Messaging</h1>
            {token ? <p>FCM Token: {token}</p> : <p>No token available</p>}
        </div>
    );
}

export default FirebaseMessaging;