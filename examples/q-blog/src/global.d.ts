// src/global.d.ts
interface QortalRequestOptions {
    action: string;
    name?: string;
    service?: string;
    data64?: string;
    title?: string;
    description?: string;
    category?: string;
    tags?: string[];
    identifier?: string;
    address?: string;
    metaData?: string;
  }
  
  declare function qortalRequest(options: QortalRequestOptions): Promise<any>;
  