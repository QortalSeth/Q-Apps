import { checkStructure } from './checkStructure'

export const fetchAndEvaluateCatalogues = async (data: any) => {
  const getCatalogues = async () => {
    const { user, catalogueId } = data
    let obj: any = {
      isValid: false
    }

    if (!user || !catalogueId) return obj

    try {
      const url = `/arbitrary/DOCUMENT/${user}/${catalogueId}`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const responseData = await response.json()
      if (!responseData.error) {
        obj = {
          ...responseData,
          user,
          id: catalogueId,
          isValid: true
        }
      }
      return obj
    } catch (error) {}
  }

  const res = await getCatalogues()
  return res
}
