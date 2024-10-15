import { storage } from '@/db/firebase/firebase'
import { ref } from 'vue'
import { ref as stRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

const useStorage = folder => {
  const error = ref(null)
  const url = ref(null)
  const filePath = ref(null)
  const folderName = ref(folder)

  const uploadFile = async (rideId, file) => {
    filePath.value = `${folderName.value}/${rideId}/${file.name}`

    const storageRef = stRef(storage, filePath.value)

    try {
      const res = await uploadBytes(storageRef, file)
      url.value = await getDownloadURL(res.ref)
    } catch (err) {
      console.error(err.message)
      error.value = err.message
    }
  }

  const deleteFile = async path => {
    const storageRef = stRef(storage, path)

    try {
      await deleteObject(storageRef)
    } catch (err) {
      console.error(err.message)
      error.value = err.message
    }
  }

  return { url, filePath, error, uploadFile, deleteFile }
}

export default useStorage
