import { checkStructure, checkStructureOrders } from './checkStructure'
import { base64ToObject } from './toBase64'

export const fetchAndEvaluateOrders = async (data: any) => {
  const getOrders = async () => {
    const { user, orderId, content } = data
    let obj: any = {
      ...content,
      isValid: false
    }

    if (!user || !orderId) return obj

    try {
      // const url = `http://62.141.38.192:62391/arbitrary/DOCUMENT_PRIVATE/${user}/${orderId}`
      // const response = await fetch(url, {
      //   method: 'GET',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   }
      // })

      // const responseData = await response.json()
      const data = await qortalRequest({
        action: 'FETCH_QDN_RESOURCE',
        name: user,
        service: 'DOCUMENT_PRIVATE',
        identifier: orderId,
        encoding: 'base64'
      })
      console.log({ data })
      const decryptedData = await qortalRequest({
        action: 'DECRYPT_DATA',
        encryptedData: data
      })
      console.log({ decryptedData })

      const dataToObject = await base64ToObject(decryptedData)
      console.log({ dataToObject }, checkStructureOrders(dataToObject))
      if (checkStructureOrders(dataToObject)) {
        obj = {
          ...dataToObject,
          ...content,
          user,
          id: orderId,
          isValid: true
        }
      }
      console.log({ obj })
      return obj
    } catch (error) {
      console.log({ error })
    }
  }

  const res = await getOrders()
  return res
}
