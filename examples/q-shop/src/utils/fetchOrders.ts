import { checkStructure } from './checkStructure'

export const fetchAndEvaluateOrders = async (data: any) => {
  const getOrders = async () => {
    const { user, orderId, content } = data
    let obj: any = {
      ...content,
      isValid: false
    }

    if (!user || !orderId) return obj

    try {
      const url = `http://62.141.38.192:62391/arbitrary/DOCUMENT_PRIVATE/${user}/${orderId}`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const responseData = await response.json()
      console.log({ responseData })
      if (checkStructure(responseData)) {
        obj = {
          ...responseData,
          ...content,
          user,
          id: orderId,
          isValid: true
        }
      }
      console.log({ obj })
      return obj
    } catch (error) {}
  }

  const res = await getOrders()
  return res
}
