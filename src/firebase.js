import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { signInWithEmailAndPassword } from 'firebase/auth'

// Firebase config (web)
const firebaseConfig = {
  apiKey: "AIzaSyD6lfgqYMyJI7cTvRg127e-lyT0Jn4fuiI",
  authDomain: "vrproject-9eec7.firebaseapp.com",
  projectId: "vrproject-9eec7",
  storageBucket: "vrproject-9eec7.firebasestorage.app",
  messagingSenderId: "124593056860",
  appId: "1:124593056860:web:d794111fd1818daf690a99",
  measurementId: "G-MX4GD5RPSP"
}

// Initialize Firebase app (safe to call multiple times in dev)
const app = initializeApp(firebaseConfig)

// Exports
export const auth = getAuth(app)
export const db = getFirestore(app)

/**
 * Create a new user with email & password, set displayName, and create a Firestore user doc.
 * Note: Passwords MUST NOT be stored in Firestore — Firebase Auth handles that securely.
 * @param {{email:string,password:string,displayName?:string}} options
 */
export async function signUp({ email, password, displayName }) {
  console.log('signUp: starting', { email, displayName })
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const user = cred.user
    console.log('signUp: created auth user', { uid: user.uid, email: user.email })
    if (displayName) {
      // set displayName on the Auth user
      await updateProfile(user, { displayName })
      console.log('signUp: updated displayName')
    }
    // Create a minimal users doc (no password)
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName || null,
      createdAt: serverTimestamp()
    })
    console.log('signUp: wrote user doc')
    return user
  } catch (err) {
    console.error('signUp: error', err?.code || err?.message || err)
    throw err
  }
}

/**
 * Sign in an existing user with email & password.
 */
export async function signIn({ email, password }) {
  console.log('signIn: starting', { email })
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    console.log('signIn: success', { uid: cred.user.uid })
    return cred.user
  } catch (err) {
    console.error('signIn: error', err?.code || err?.message || err)
    throw err
  }
}

export default app
