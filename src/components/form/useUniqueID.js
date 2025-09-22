let UUID = 0

export function useUniqueID() {
  function getID() {
    UUID++
    return UUID
  }

  return {
    getID,
  }
}
