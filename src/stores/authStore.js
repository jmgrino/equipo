import { ref } from 'vue'
import { defineStore } from 'pinia'
import { auth } from '@/db/firebase/firebase'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth'
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { db } from '@/db/firebase/firebase'

export const useAuthStore = defineStore('authStore', () => {
  let user = ref(null)
  let validUser = ref(false)
  let validUserData = ref(false)
  let errorMessage = ref(null)
  const showModSpace = ref(false)

  function init() {
    onAuthStateChanged(auth, userCredential => {
      if (userCredential) {
        user.value = {
          id: userCredential.uid,
          email: userCredential.email,
        }
        const docRef = doc(db, 'users', userCredential.uid)
        getDoc(docRef).then(docSnap => {
          if (docSnap) {
            Object.assign(user.value, docSnap.data())
          } else {
            console.error('User data does not exist')
          }
          validUserData.value = true
        })
      } else {
        user.value = null
      }
      validUser.value = true
    })
  }

  function login(credentials) {
    errorMessage.value = ''
    validUser.value = false
    signInWithEmailAndPassword(auth, credentials.email, credentials.password)
      .then()
      .catch(error => {
        let message = ''
        if (error.code === 'auth/invalid-credential') {
          message = 'Usuario o password invalido'
        } else {
          message = error.message
        }
        errorMessage.value = message
        validUser.value = true
      })
  }

  function logout() {
    errorMessage.value = ''
    validUser.value = false
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        user.value = null
      })
      .catch(error => {
        errorMessage.value = error.message
      })
  }

  function changePassword(credentials) {
    errorMessage.value = ''
    sendPasswordResetEmail(auth, credentials.email)
      .then(() => {
        // Password reset email sent!
        // ..
      })
      .catch(error => {
        console.error(error)
        errorMessage.value = error.message
      })
  }

  async function checkValidUser() {
    let iter = 0
    const maxIter = 100
    while (iter < maxIter && !validUser.value) {
      await wait(50)
      iter++
    }

    if (iter === maxIter) {
      return false
    } else {
      return true
    }
  }

  async function checkValidUserData() {
    const validUser = await checkValidUser()

    if (!validUser) return false
    if (!user.value) return true

    let iter = 0
    const maxIter = 100
    while (iter < maxIter && !validUserData.value) {
      await wait(50)
      iter++
    }

    if (iter === maxIter) {
      return false
    } else {
      return true
    }
  }

  async function getUser(id) {
    try {
      const docRef = doc(db, 'users', id)
      const docSnap = await getDoc(docRef)
      const user = {
        id: docSnap.id,
        ...docSnap.data(),
      }
      return user
    } catch (error) {
      console.error(error)
    }
  }

  async function updateUser(id, userData) {
    errorMessage.value = ''
    try {
      const userRef = doc(db, 'users', id)
      const docSnap = await getDoc(userRef)
      const existingData = docSnap.data()

      if (!existingData) {
        await setDoc(doc(db, 'users', id), userData)
      } else {
        await updateDoc(userRef, userData)
      }
    } catch (error) {
      console.error(error)
      errorMessage.value = error.message
    }
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms, false))
  }

  return {
    user,
    errorMessage,
    showModSpace,
    init,
    login,
    logout,
    checkValidUser,
    getUser,
    updateUser,
    changePassword,
    checkValidUserData,
  }
})
