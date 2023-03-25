// src/global.d.ts
interface QortalRequestOptions {
  action: string
  name?: string
  service?: string
  data64?: string
  title?: string
  description?: string
  category?: string
  tags?: string[]
  identifier?: string
  address?: string
  metaData?: string
  encoding?: string
  includeMetadata?: boolean
  limit?: numebr
  offset?: number
  reverse?: boolean
  resources?: any[]
  filename?: string
}

declare function qortalRequest(options: QortalRequestOptions): Promise<any>
declare function qortalRequestWithTimeout(
  options: QortalRequestOptions,
  time: number
): Promise<any>