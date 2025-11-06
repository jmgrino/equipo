import { storage } from '@/db/firebase/firebase'
import { ref } from 'vue'
import { ref as stRef, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage'

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

  const removeOrphanedFiles = async photoPaths => {
    // List all files in the folder
    const fullPathArray = []
    const findFolder = folderName.value + '/'
    const listRef = stRef(storage, findFolder)
    const res = await listAll(listRef)

    for (const itemRef of res.prefixes) {
      const res = await listAll(itemRef)
      res.items.forEach(itemRef => {
        fullPathArray.push(itemRef.fullPath)
      })
    }

    // Identify orphaned files

    const orphanedFiles = fullPathArray.filter(path => !photoPaths.includes(path))

    for (const path of orphanedFiles) {
      await deleteFile(path)
      // console.warn(`Deleted: ${path}`)
    }

    return orphanedFiles
  }

  return { url, filePath, error, uploadFile, deleteFile, removeOrphanedFiles }
}

export default useStorage
