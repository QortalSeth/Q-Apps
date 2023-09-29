// src/global.d.ts
import { QortalRequestOptions } from "./utils/Library/Utility_Functions/Core_API/Interfaces";

declare function qortalRequest(options: QortalRequestOptions): Promise<any>;
declare function qortalRequestWithTimeout(
  options: QortalRequestOptions,
  time: number
): Promise<any>;

declare global {
  interface Window {
    _qdnBase: any; // Replace 'any' with the appropriate type if you know it
    _qdnTheme: string;
  }
}

declare global {
  interface Window {
    showSaveFilePicker: (
      options?: SaveFilePickerOptions
    ) => Promise<FileSystemFileHandle>;
  }
}
