export function removePrefix(id: string): string {
  if (id.startsWith('q-blog-')) {
    return id.substring(7)
  } else {
    return id
  }
}

export function addPrefix(id: string): string {
  if (id.startsWith('q-blog-')) {
    return id
  } else {
    return `q-blog-${id}`
  }
}
