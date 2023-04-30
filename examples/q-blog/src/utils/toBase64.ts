export const toBase64 = (file: File): Promise<string | ArrayBuffer | null> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => {
      reject(error)
    }
  })

  export function objectToBase64(obj: any) {
    // Step 1: Convert the object to a JSON string
    const jsonString = JSON.stringify(obj)

    // Step 2: Create a Blob from the JSON string
    const blob = new Blob([jsonString], { type: 'application/json' })

    // Step 3: Create a FileReader to read the Blob as a base64-encoded string
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Remove 'data:application/json;base64,' prefix
          const base64 = reader.result.replace(
            'data:application/json;base64,',
            ''
          )
          resolve(base64)
        } else {
          reject(
            new Error('Failed to read the Blob as a base64-encoded string')
          )
        }
      }
      reader.onerror = () => {
        reject(reader.error)
      }
      reader.readAsDataURL(blob)
    })
  }

  export function objectToUint8Array(obj: any) {
    // Convert the object to a JSON string
    const jsonString = JSON.stringify(obj)

    // Encode the JSON string as a byte array using TextEncoder
    const encoder = new TextEncoder()
    const byteArray = encoder.encode(jsonString)

    // Create a new Uint8Array and set its content to the encoded byte array
    const uint8Array = new Uint8Array(byteArray)

    return uint8Array
  }

  export function uint8ArrayToBase64(uint8Array: Uint8Array): string {
    console.log({ uint8Array })
    // Convert the Uint8Array to a regular array of numbers
    const numberArray: number[] = Array.from(uint8Array)

    // Convert the array of numbers to a binary string
    const binaryString: string = String.fromCharCode.apply(null, numberArray)

    // Convert the binary string to a base64-encoded string
    const base64String: string = btoa(binaryString)
    console.log({ base64String })
    return base64String
  }

  export function objectToUint8ArrayFromResponse(obj: any) {
    const len = Object.keys(obj).length
    const result = new Uint8Array(len)

    for (let i = 0; i < len; i++) {
      result[i] = obj[i]
    }

    return result
  }
  // export function uint8ArrayToBase64(arrayBuffer: Uint8Array): string {
  //   let binary = ''
  //   const bytes = new Uint8Array(arrayBuffer)
  //   const len = bytes.length

  //   for (let i = 0; i < len; i++) {
  //     binary += String.fromCharCode(bytes[i])
  //   }

  //   return btoa(binary)
  // }

  export function base64ToUint8Array(base64: string) {
    const binaryString = atob(base64)
    const len = binaryString.length
    const bytes = new Uint8Array(len)

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    return bytes
  }

  export function uint8ArrayToObject(uint8Array: Uint8Array) {
    // Decode the byte array using TextDecoder
    const decoder = new TextDecoder()
    const jsonString = decoder.decode(uint8Array)

    // Convert the JSON string back into an object
    const obj = JSON.parse(jsonString)

    return obj
  }