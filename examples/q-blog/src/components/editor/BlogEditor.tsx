// src/components/BlogEditor.tsx
import React, { useMemo, useState, useCallback } from 'react';
import { createEditor, Descendant, Editor, Transforms } from 'slate';
import { Slate, Editable, withReact, RenderElementProps, RenderLeafProps } from 'slate-react';
import { CustomElement, CustomText , FormatMark } from './customTypes';
import './BlogEditor.css';
import { Button } from '@mui/material';

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'Start writing your blog post...' }],
  },
];

interface MyComponentProps {
  addPostSection?: (value: any)=> void;
  editPostSection?: (value: any, section: any)=> void;
  defaultValue?: any;
  section?: any
}


const BlogEditor: React.FC<MyComponentProps> = ({addPostSection, editPostSection, defaultValue, section}) => {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState(defaultValue || initialValue);

 

  const addSection = ()=> {
    if(!addPostSection) return
    addPostSection(value)
  }

  const toggleMark = (editor: Editor, format: FormatMark) => { // Update the type here
    const isActive = Editor.marks(editor)?.[format] === true;
    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  };
  const ToolbarButton: React.FC<{ format: FormatMark; label: string; editor: Editor }> = ({ // Update the type here
    format,
    label,
    editor,
  }) => {

   
  return (
    <button
      className="toolbar-button"
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      {label}
    </button>
  );
};


  return (
    <>
    
    <Slate editor={editor} value={value} onChange={(newValue) => setValue(newValue)}>
      <div className="toolbar">
        <ToolbarButton format="bold" label="B" editor={editor} />
        <ToolbarButton format="italic" label="I" editor={editor} />
        <ToolbarButton format="underline" label="U" editor={editor} />
      </div>
      <Editable className="blog-editor" renderElement={renderElement} renderLeaf={renderLeaf} />
    </Slate>
    {editPostSection && (
          <Button onClick={()=> editPostSection(value, section)}>Edit Section</Button>
    )}

    {addPostSection && (
          <Button onClick={addSection}>Add section</Button>
    )}

   
    </>
   
  );
};

export default BlogEditor;


export const renderElement = ({ attributes, children, element }: RenderElementProps) => {
    switch (element.type) {
      case 'block-quote':
        return <blockquote {...attributes}>{children}</blockquote>;
      case 'heading':
        return <h2 {...attributes}>{children}</h2>;
      default:
        return <p {...attributes}>{children}</p>;
    }
  };
  
  export const renderLeaf = ({ attributes, children, leaf }: RenderLeafProps) => {
    let el = children;
  
    if (leaf.bold) {
      el = <strong>{el}</strong>;
    }
  
    if (leaf.italic) {
      el = <em>{el}</em>;
    }
  
    if (leaf.underline) {
      el = <u>{el}</u>;
    }
  
    return <span {...attributes}>{el}</span>;
  };