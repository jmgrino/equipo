import { ref } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/db/firebase/firebase'
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  addDoc,
  setDoc,
  deleteDoc,
  getDocs,
  orderBy,
  query,
  where,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore'

export const useRidesStore = defineStore('ridesStore', () => {
  let rides = ref([])
  let dates = ref([])
  let tracks = ref([])
  let photos = ref([])
  let users = ref([])
  let validRides = ref(false)
  let validDates = ref(false)
  let validTracks = ref(false)
  let validPhotos = ref(false)
  let validUsers = ref(false)
  let datesSeq = ref(0)

  async function validData() {
    let iter = 0
    const maxIter = 100
    while (iter < maxIter && (!validRides.value || !validDates.value || !validUsers.value)) {
      await wait(50)
      iter++
    }

    if (iter === maxIter) {
      return false
    } else {
      return true
    }
  }

  async function checkValidTracks() {
    let iter = 0
    const maxIter = 100
    while (iter < maxIter && !validTracks.value) {
      await wait(50)
      iter++
    }

    if (iter === maxIter) {
      return false
    } else {
      return true
    }
  }

  async function checkValidPhotos() {
    let iter = 0
    const maxIter = 100
    while (iter < maxIter && !validPhotos.value) {
      await wait(50)
      iter++
    }

    if (iter === maxIter) {
      return false
    } else {
      return true
    }
  }

  function getRides() {
    const q = collection(db, 'rides')
    const unsubRides = onSnapshot(q, querySnapshot => {
      rides.value = []
      querySnapshot.forEach(doc => {
        const ride = {
          id: doc.id,
          ...doc.data(),
        }
        rides.value.push(ride)
      })

      sortDates(rides.value)
      validRides.value = true

      // TEST
      // let dupRides = rides.value.slice()
      // rides.value = rides.value.concat(dupRides, dupRides, dupRides, dupRides, dupRides, dupRides, dupRides, dupRides)
      // END TEST
    })
  }

  function getDates() {
    const q = collection(db, 'dates')
    const unsubDates = onSnapshot(q, querySnapshot => {
      dates.value = []
      querySnapshot.forEach(doc => {
        const date = {
          id: doc.id,
          ...doc.data(),
        }
        dates.value.push(date)
      })

      sortDates(dates.value)
      validDates.value = true
      datesSeq.value++
    })
  }

  function getTracks() {
    const q = collection(db, 'tracks')
    const unsubTracks = onSnapshot(q, querySnapshot => {
      tracks.value = []
      querySnapshot.forEach(doc => {
        const track = {
          id: doc.id,
          ...doc.data(),
        }
        tracks.value.push(track)
      })

      validTracks.value = true
    })
  }

  function getPhotos() {
    const q = collection(db, 'photos')
    const unsubPhotos = onSnapshot(q, querySnapshot => {
      photos.value = []
      querySnapshot.forEach(doc => {
        const photo = {
          id: doc.id,
          ...doc.data(),
        }
        photos.value.push(photo)
      })

      validPhotos.value = true
    })
  }

  async function getUsers() {
    const q = collection(db, 'users')

    const unsubUsers = onSnapshot(q, querySnapshot => {
      users.value = []
      querySnapshot.forEach(doc => {
        const user = {
          id: doc.id,
          ...doc.data(),
        }
        users.value.push(user)
      })
      validUsers.value = true
    })
  }

  async function getRide(id) {
    try {
      const docRef = doc(db, 'rides', id)
      const docSnap = await getDoc(docRef)
      const ride = {
        id: docSnap.id,
        ...docSnap.data(),
      }

      return ride
    } catch (error) {
      console.error(error)
    }
  }

  async function getRideDates(id) {
    try {
      const dates = []

      const q = query(collection(db, 'dates'), where('ride', '==', id), orderBy('date'))
      const querySnapshot = await getDocs(q)
      querySnapshot.forEach(doc => {
        const date = {
          id: doc.id,
          ...doc.data(),
        }
        dates.push(date)
      })

      return dates
    } catch (error) {
      console.error(error)
    }
  }

  async function addRide(newRide) {
    const docRef = await addDoc(collection(db, 'rides'), newRide)
    return docRef.id
  }

  async function addRideDates(rideId, newDates) {
    await newDates.forEach(async date => {
      const { id: baseId, ...baseDate } = date
      baseDate.ride = rideId
      await addDoc(collection(db, 'dates'), baseDate)
    })
  }

  async function updateRide(ride) {
    try {
      const { id, ...baseRide } = ride
      const rideRef = doc(db, 'rides', id)
      await updateDoc(rideRef, baseRide)
    } catch (error) {
      console.error(error)
    }
  }

  async function updateRideDates(rideId, dates) {
    try {
      const q = query(collection(db, 'dates'), where('ride', '==', rideId), orderBy('date'))
      const querySnapshot = await getDocs(q)
      querySnapshot.forEach(async doc => {
        await deleteDoc(doc.ref)
      })

      await dates.forEach(async date => {
        const { id: baseId, ...baseDate } = date
        if (date.id === 'new') {
          await addDoc(collection(db, 'dates'), baseDate)
        } else {
          await setDoc(doc(db, 'dates', baseId), baseDate)
        }
      })
    } catch (error) {
      console.error(error)
    }
  }

  async function deleteRide(id) {
    try {
      const q = query(collection(db, 'dates'), where('ride', '==', id), orderBy('date'))
      const querySnapshot = await getDocs(q)
      querySnapshot.forEach(async doc => {
        await deleteDoc(doc.ref)
      })

      await deleteDoc(doc(db, 'rides', id))
    } catch (error) {
      console.error(error)
    }
  }

  async function duplicateRide(rideId, newOwner) {
    try {
      const ride = await getRide(rideId)
      const { id, ...baseRide } = ride
      baseRide.name = baseRide.name + ' (copia)'
      baseRide.date = ''
      baseRide.lastDate = ''
      baseRide.owner = newOwner

      const newRideId = await addRide(baseRide)

      // duplicate photos
      const ridePhotos = photos.value.filter(photo => photo.ride === rideId)
      ridePhotos.forEach(async photo => {
        const { id: photoId, ...basePhoto } = photo
        basePhoto.ride = newRideId
        await addPhoto(basePhoto)
      })

      // duplicate tracks
      const rideTracks = tracks.value.filter(track => track.ride === rideId)
      rideTracks.forEach(async track => {
        const { id: trackId, ...baseTrack } = track
        baseTrack.ride = newRideId
        await addTrack(baseTrack)
      })
    } catch (error) {
      console.error(error)
    }
  }

  async function addDate(date) {
    const docRef = await addDoc(collection(db, 'dates'), date)
    return docRef.id
  }

  async function deleteDate(dateId) {
    try {
      const dateRef = doc(db, 'dates', dateId)
      await deleteDoc(dateRef)
    } catch (error) {
      console.error(error)
    }
  }

  async function addDateUser(dateId, user) {
    try {
      const dateRef = doc(db, 'dates', dateId)
      await updateDoc(dateRef, {
        users: arrayUnion(user),
      })
    } catch (error) {
      console.error(error)
    }
  }

  async function removeDateUser(dateId, user) {
    try {
      const dateRef = doc(db, 'dates', dateId)
      await updateDoc(dateRef, {
        users: arrayRemove(user),
      })
    } catch (error) {
      console.error(error)
    }
  }

  function sortDates(items) {
    items.sort(function (a, b) {
      if (a.date === '') {
        return 1
      } else if (b.date === '') {
        return -1
      } else {
        return a.date < b.date ? -1 : a.date > b.date ? 1 : 0
      }
    })
  }

  async function addTrack(track) {
    const docRef = await addDoc(collection(db, 'tracks'), track)
    return docRef.id
  }

  async function deleteTrack(trackId) {
    try {
      const trackRef = doc(db, 'tracks', trackId)
      await deleteDoc(trackRef)
    } catch (error) {
      console.error(error)
    }
  }

  async function addPhoto(photo) {
    const docRef = await addDoc(collection(db, 'photos'), photo)
    return docRef.id
  }

  async function deletePhoto(photoId) {
    try {
      const photoRef = doc(db, 'photos', photoId)
      await deleteDoc(photoRef)
    } catch (error) {
      console.error(error)
    }
  }

  // Count number of photos with same path
  function countPhotosPath(path) {
    let count = 0
    photos.value.forEach((photo, index) => {
      if (photo.filePath === path) {
        const rideName = rides.value.find(ride => ride.id === photo.ride)?.name
        count++
      }
    })
    return count
  }

  // Deep copy of an object
  function deepCopy(object) {
    let newObject
    try {
      newObject = structuredClone(object)
    } catch (error) {
      newObject = JSON.parse(JSON.stringify(object))
    }
    return newObject
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  return {
    rides,
    dates,
    users,
    tracks,
    photos,
    datesSeq,
    getRides,
    getDates,
    getTracks,
    getPhotos,
    getUsers,
    validData,
    getRide,
    getRideDates,
    addRide,
    addRideDates,
    updateRide,
    updateRideDates,
    deleteRide,
    duplicateRide,
    addDate,
    deleteDate,
    addDateUser,
    removeDateUser,
    checkValidTracks,
    addTrack,
    deleteTrack,
    checkValidPhotos,
    addPhoto,
    deletePhoto,
    countPhotosPath,
    deepCopy,
    sortDates,
  }
})
