// Cadet verification and Firebase Auth integration
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

// Enhanced User interface with cadet verification fields
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
  // Cadet verification fields
  regimental_number?: string
  rank?: string
  company?: string
  enrollment_year?: string
  verified_cadet: boolean
  verification_status: 'pending' | 'verified' | 'rejected'
  verification_documents?: string[]
}

export interface CadetRegistrationRequest {
  name: string
  email: string
  password: string
  regimental_number: string
  unit: string
  company: string
  rank: string
  enrollment_year: string
  phone?: string
  role?: string
}

export interface GoogleCadetVerificationRequest {
  regimental_number: string
  unit: string
  company: string
  rank: string
  enrollment_year: string
  phone?: string
}

// Register cadet with full verification details
export async function registerCadetWithEmailPassword(data: CadetRegistrationRequest): Promise<User> {
  try {
    // Check if regimental number already exists
    const regQuery = query(
      collection(db, 'users'), 
      where('regimental_number', '==', data.regimental_number)
    )
    const regSnapshot = await getDocs(regQuery)
    
    if (!regSnapshot.empty) {
      throw new Error('Regimental number already registered. Please contact admin if this is an error.')
    }

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
    const firebaseUser = userCredential.user

    // Update Firebase Auth profile
    await updateProfile(firebaseUser, {
      displayName: data.name
    })

    // Create comprehensive cadet profile in Firestore
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
      // Cadet-specific verification fields
      regimental_number: data.regimental_number,
      rank: data.rank,
      company: data.company,
      enrollment_year: data.enrollment_year,
      verified_cadet: false, // Requires admin verification
      verification_status: 'pending'
    }

    // Save to Firestore
    await setDoc(doc(db, 'users', firebaseUser.uid), userData)

    // Also save to pending verifications for admin review
    await setDoc(doc(db, 'pending_verifications', firebaseUser.uid), {
      ...userData,
      submitted_at: new Date().toISOString(),
      verification_notes: `New cadet registration: ${data.regimental_number} from ${data.unit}`
    })

    return userData
  } catch (error: any) {
    throw new Error(error.message || 'Cadet registration failed')
  }
}

// Google Auth with cadet verification step

// Submit cadet verification for Google users
export async function submitCadetVerification(
  userId: string, 
  data: GoogleCadetVerificationRequest
): Promise<User> {
  try {
    // Check if regimental number already exists
    const regQuery = query(
      collection(db, 'users'), 
      where('regimental_number', '==', data.regimental_number)
    )
    const regSnapshot = await getDocs(regQuery)
    
    if (!regSnapshot.empty) {
      throw new Error('Regimental number already registered. Please contact admin if this is an error.')
    }

    const firebaseUser = auth.currentUser
    if (!firebaseUser || firebaseUser.uid !== userId) {
      throw new Error('Authentication error')
    }

    // Create complete cadet profile
    const userData: User = {
      id: userId,
      name: firebaseUser.displayName || 'Cadet',
      email: firebaseUser.email!,
      unit: data.unit,
      role: 'cadet',
      phone: data.phone,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      photoURL: firebaseUser.photoURL || undefined,
      // Cadet verification fields
      regimental_number: data.regimental_number,
      rank: data.rank,
      company: data.company,
      enrollment_year: data.enrollment_year,
      verified_cadet: false, // Requires admin verification
      verification_status: 'pending'
    }

    // Save to Firestore
    await setDoc(doc(db, 'users', userId), userData)

    // Save to pending verifications for admin review
    await setDoc(doc(db, 'pending_verifications', userId), {
      ...userData,
      submitted_at: new Date().toISOString(),
      verification_notes: `Google user verification: ${data.regimental_number} from ${data.unit}`,
      verification_method: 'google_oauth'
    })

    return userData
  } catch (error: any) {
    throw new Error(error.message || 'Cadet verification submission failed')
  }
}

// Check verification status
export async function checkVerificationStatus(userId: string): Promise<{
  verified: boolean
  status: 'pending' | 'verified' | 'rejected'
  message?: string
}> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    
    if (!userDoc.exists()) {
      return { verified: false, status: 'pending', message: 'User not found' }
    }

    const userData = userDoc.data() as User
    
    return {
      verified: userData.verified_cadet,
      status: userData.verification_status,
      message: userData.verification_status === 'rejected' 
        ? 'Verification rejected. Please contact admin.' 
        : userData.verification_status === 'pending'
        ? 'Verification pending admin approval.'
        : 'Cadet verified successfully!'
    }
  } catch (error) {
    return { verified: false, status: 'pending', message: 'Error checking status' }
  }
}

// Admin function to verify cadet
export async function verifyCadet(userId: string, approved: boolean, notes?: string): Promise<void> {
  try {
    const updateData = {
      verified_cadet: approved,
      verification_status: approved ? 'verified' : 'rejected',
      verified_at: new Date().toISOString(),
      verification_notes: notes || ''
    }

    // Update user document
    await updateDoc(doc(db, 'users', userId), updateData)

    // Update pending verification
    await updateDoc(doc(db, 'pending_verifications', userId), {
      ...updateData,
      reviewed_at: new Date().toISOString()
    })
  } catch (error: any) {
    throw new Error('Failed to update verification status')
  }
}

// Get all pending verifications (admin only)
export async function getPendingVerifications(): Promise<User[]> {
  try {
    const q = query(collection(db, 'pending_verifications'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User))
  } catch (error) {
    console.error('Error getting pending verifications:', error)
    return []
  }
}

// Original auth functions (updated to work with verification)
export async function loginWithEmailPassword(data: { email: string; password: string }): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password)
    const firebaseUser = userCredential.user

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
    
    if (!userDoc.exists()) {
      throw new Error('User profile not found')
    }

    const userData = userDoc.data() as User

    // Check if cadet is verified
    if (!userData.verified_cadet && userData.verification_status === 'rejected') {
      throw new Error('Account verification rejected. Please contact admin.')
    }

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

// Export other functions from previous implementation
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

export async function logout(): Promise<void> {
  await signOut(auth)
}

export function onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback)
}
