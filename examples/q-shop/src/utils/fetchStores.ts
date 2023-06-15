import { checkStructure, checkStructureStore } from './checkStructure'

export const fetchAndEvaluateStores = async (data: any) => {
  const getStoreStores = async () => {
    const { owner, storeId, content } = data
    let obj: any = {
      ...content,
      isValid: false
    }

    if (!owner || !storeId) return obj

    try {
      const url = `/arbitrary/STORE/${owner}/${storeId}`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const responseData = await response.json()
      console.log({ responseData })
      if (checkStructureStore(responseData)) {
        obj = {
          ...responseData,
          ...content,
          owner,
          title: responseData.title,
          created: responseData.created,
          id: storeId,
          isValid: true
        }
      }
      console.log({ obj })
      return obj
    } catch (error) { }
  }

  const res = await getStoreStores()
  return res
}
