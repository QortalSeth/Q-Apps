import { Status } from '../state/features/orderSlice'
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
      // const url = `/arbitrary/DOCUMENT_PRIVATE/${user}/${orderId}`
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
      const decryptedData = await qortalRequest({
        action: 'DECRYPT_DATA',
        encryptedData: data
      })

      let statusDocument: any = {
        status: 'Received',
        note: ''
      }

      if (decryptedData) {
        try {
          const string = orderId

          const identifier = string.replace(/(q-store)(-order)/, "$1-status$2");
          const dataStatus = await qortalRequest({
            action: 'FETCH_QDN_RESOURCE',
            name: user,
            service: 'DOCUMENT_PRIVATE',
            identifier,
            encoding: 'base64'
          })
          if (dataStatus && !dataStatus.error) {
            const decryptedDataStatus = await qortalRequest({
              action: 'DECRYPT_DATA',
              encryptedData: dataStatus
            })

            if (decryptedDataStatus) {
              statusDocument = await base64ToObject(decryptedDataStatus)
            }
          }
        } catch (error) { }
      }

      const dataToObject = await base64ToObject(decryptedData)
      if (checkStructureOrders(dataToObject)) {
        obj = {
          ...dataToObject,
          ...content,
          ...statusDocument,
          user,
          id: orderId,
          isValid: true
        }
      }
      return obj
    } catch (error) {
      console.log({ error })
    }
  }

  const res = await getOrders()
  return res
}
