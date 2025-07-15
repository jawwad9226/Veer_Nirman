// Firebase configuration and initialization
import { initializeApp } from 'firebase/app'
import { getAuth, EmailAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyCGF400LFHdwP2uY0hjLMaqFswCzYAjeak",
  authDomain: "ncc-abyas.firebaseapp.com",
  databaseURL: "https://ncc-abyas-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ncc-abyas",
  storageBucket: "ncc-abyas.appspot.com",
  messagingSenderId: "59512645011",
  appId: "1:59512645011:web:2be7910fdca72a66707466",
  measurementId: "G-GTC6T9RG29"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app)

// Configure providers
export const emailProvider = new EmailAuthProvider()

export default app
