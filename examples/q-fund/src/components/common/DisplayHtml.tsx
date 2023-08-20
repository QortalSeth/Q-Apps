import React, { useMemo } from 'react'
import DOMPurify from "dompurify";
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.core.css';
import 'react-quill/dist/quill.bubble.css';
import { convertQortalLinks } from '../../utils/convertQortalAnchor';

export const DisplayHtml = ({html}) => {

    const cleanContent = useMemo(()=> {
        if(!html) return null

       

       const sanitize: string = DOMPurify.sanitize(html, {
            USE_PROFILES: { html: true },
          });
          const anchorQortal = convertQortalLinks(sanitize)
          return anchorQortal
    }, [html])
   
    if(!cleanContent) return null
  return (
    <div className='editor-container'>
    <div style={{
      width: '100%'
    }} className='ql-editor' dangerouslySetInnerHTML={{ __html: cleanContent }} />
    </div>
  )
}
