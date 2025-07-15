// Firebase Authentication Service
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs 
} from 'firebase/firestore'
import { auth, db } from './firebase'

// User interface matching your system
export interface User {
  id: string
  name: string
  email: string
  unit: string
  role: string
  phone?: string
  created_at: string
  last_login?: string
  photoURL?: string
  regimentalNumber?: string
  nccState?: string
  nccDivision?: string
  nccWing?: string
  nccYear?: string
  isVerifiedCadet?: boolean
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  unit: string
  role?: string
  phone?: string
  regimentalNumber?: string
  nccState?: string
  nccDivision?: string
  nccWing?: string
  nccYear?: string
  isVerifiedCadet?: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

// Register with email and password
export async function registerWithEmailPassword(data: RegisterRequest): Promise<User> {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
    const firebaseUser = userCredential.user

    // Update Firebase Auth profile
    await updateProfile(firebaseUser, {
      displayName: data.name
    })

    // Create user document in Firestore
    const userData: User = {
      id: firebaseUser.uid,
      name: data.name,
      email: data.email,
      unit: data.unit,
      role: data.role || 'cadet',
      phone: data.phone,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      photoURL: firebaseUser.photoURL || undefined,
      regimentalNumber: data.regimentalNumber,
      nccState: data.nccState,
      nccDivision: data.nccDivision,
      nccWing: data.nccWing,
      nccYear: data.nccYear,
      isVerifiedCadet: data.isVerifiedCadet
    }

    // Save to Firestore
    await setDoc(doc(db, 'users', firebaseUser.uid), userData)

    return userData
  } catch (error: any) {
    throw new Error(error.message || 'Registration failed')
  }
}

// Login with email and password
export async function loginWithEmailPassword(data: LoginRequest): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password)
    const firebaseUser = userCredential.user

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
    
    if (!userDoc.exists()) {
      throw new Error('User profile not found')
    }

    const userData = userDoc.data() as User

    // Update last login
    await updateDoc(doc(db, 'users', firebaseUser.uid), {
      last_login: new Date().toISOString()
    })

    return {
      ...userData,
      last_login: new Date().toISOString()
    }
  } catch (error: any) {
    throw new Error(error.message || 'Login failed')
  }
}

// Get current user profile
export async function getCurrentUserProfile(): Promise<User | null> {
  try {
    const firebaseUser = auth.currentUser
    if (!firebaseUser) return null

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
    if (!userDoc.exists()) return null

    return userDoc.data() as User
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

// Update user profile
export async function updateUserProfile(updates: Partial<User>): Promise<User> {
  try {
    const firebaseUser = auth.currentUser
    if (!firebaseUser) throw new Error('Not authenticated')

    // Update Firebase Auth profile if name or photo changed
    if (updates.name || updates.photoURL) {
      await updateProfile(firebaseUser, {
        displayName: updates.name,
        photoURL: updates.photoURL
      })
    }

    // Update Firestore document
    await updateDoc(doc(db, 'users', firebaseUser.uid), updates)

    // Get updated user data
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
    return userDoc.data() as User
  } catch (error: any) {
    throw new Error(error.message || 'Profile update failed')
  }
}

// Logout
export async function logout(): Promise<void> {
  await signOut(auth)
}

// Auth state observer
export function onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback)
}

// Check if user has specific role
export async function checkUserRole(requiredRole: string): Promise<boolean> {
  try {
    const user = await getCurrentUserProfile()
    return user?.role === requiredRole
  } catch (error) {
    return false
  }
}

// Get all users (admin only)
export async function getAllUsers(): Promise<User[]> {
  try {
    const q = query(collection(db, 'users'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => doc.data() as User)
  } catch (error) {
    console.error('Error getting all users:', error)
    return []
  }
}
