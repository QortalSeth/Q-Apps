import { checkStructure, checkStructureMailMessages } from './checkStructure'
import { extractTextFromSlate } from './extractTextFromSlate'
import {
  base64ToUint8Array,
  objectToUint8ArrayFromResponse,
  uint8ArrayToObject
} from './toBase64'

export const fetchAndEvaluateMail = async (data: any) => {
  const getBlogPost = async () => {
    const { user, messageIdentifier, content } = data
    console.log('2', user, messageIdentifier, content)
    let obj: any = {
      ...content,
      isValid: false
    }

    try {
      // throw new Error('hello')
      if (!user || !messageIdentifier) return obj
      const url = `/arbitrary/DOCUMENT/${user}/${messageIdentifier}`
      let res = await qortalRequest({
        action: 'FETCH_QDN_RESOURCE',
        name: user,
        service: 'DOCUMENT',
        identifier: messageIdentifier,
        encoding: 'base64'
      })
      const toUnit8Array = base64ToUint8Array(res)
      const resName = await qortalRequest({
        action: 'GET_NAME_DATA',
        name: user
      })
      if (!resName?.owner) return obj

      const recipientAddress = resName.owner
      const resAddress = await qortalRequest({
        action: 'GET_ACCOUNT_DATA',
        address: recipientAddress
      })
      if (!resAddress?.publicKey) return obj
      const recipientPublicKey = resAddress.publicKey
      let requestEncryptBody: any = {
        action: 'DECRYPT_DATA',
        encryptedData: toUnit8Array,
        senderPublicKey: recipientPublicKey
      }
      const resDecrypt = await qortalRequest(requestEncryptBody)

      if (!resDecrypt?.decryptedData) return obj
      const decryptToUnit8Array = objectToUint8ArrayFromResponse(
        resDecrypt.decryptedData
      )
      const responseData = uint8ArrayToObject(decryptToUnit8Array)
      console.log({ responseData })

      if (checkStructureMailMessages(responseData)) {
        obj = {
          ...content,
          ...responseData,
          user,
          title: responseData.title,
          createdAt: responseData.createdAt,
          id: messageIdentifier,
          isValid: true
        }
      }
      return obj
    } catch (error) {
      console.log({ error })
      //for testing purposes
      const mockObj = {
        ...obj,
        isValid: true,
        title: '',
        description: 'from tester',
        createdAt: 1682857404297,
        version: 1,
        attachments: [],
        textContent: [
          {
            type: 'paragraph',
            children: [
              {
                text: 'hello'
              }
            ]
          }
        ],
        generalData: {}
      }
      return mockObj
    }
  }

  const res = await getBlogPost()
  return res
}
