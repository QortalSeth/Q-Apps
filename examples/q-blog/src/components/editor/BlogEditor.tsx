// src/components/BlogEditor.tsx
import React, { useMemo, useState, useCallback } from 'react';
import { createEditor, Descendant, Editor, Transforms, Range } from 'slate'
import {
  Slate,
  Editable,
  withReact,
  RenderElementProps,
  RenderLeafProps
} from 'slate-react'
import { CustomElement, CustomText, FormatMark } from './customTypes'
import './BlogEditor.css'
import { Button, Box } from '@mui/material'
import PostAddIcon from '@mui/icons-material/PostAdd'

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'Start writing your blog post...' }]
  }
]

interface MyComponentProps {
  addPostSection?: (value: any) => void
  editPostSection?: (value: any, section: any) => void
  defaultValue?: any
  section?: any
  value: any
  setValue: (value: any) => void
}

const BlogEditor: React.FC<MyComponentProps> = ({
  addPostSection,
  editPostSection,
  defaultValue,
  section,
  value,
  setValue
}) => {
  const editor = useMemo(() => withReact(createEditor()), [])
  // const [value, setValue] = useState(defaultValue || initialValue);

  const toggleMark = (editor: Editor, format: FormatMark) => {
    console.log(Editor.marks(editor))
    // Update the type here
    const isActive = Editor.marks(editor)?.[format] === true
    if (isActive) {
      Editor.removeMark(editor, format)
    } else {
      Editor.addMark(editor, format, true)
    }
  }
  const newValue = useMemo(
    () => [
      ...(value || initialValue),
      {
        type: 'paragraph',
        children: [{ text: '' }]
      }
    ],
    [value]
  )
  const ToolbarButton: React.FC<{
    format: FormatMark | string
    label: string
    editor: Editor
  }> = ({ format, label, editor }) => {
    let onClick = () => {
      console.log({ format })
      if (format === 'heading-2' || format === 'heading-3') {
        console.log('yes')
        toggleBlock(editor, format)
      }
      if (
        format === 'bold' ||
        format === 'italic' ||
        format === 'underline' ||
        format === ''
      ) {
        console.log('no')
        toggleMark(editor, format)
      }
    }
    let isActive = false
    if (format === 'heading-2' || format === 'heading-3') {
      isActive = isBlockActive(editor, format)
    }

    if (
      format === 'bold' ||
      format === 'italic' ||
      format === 'underline' ||
      format === ''
    ) {
      isActive = Editor.marks(editor)?.[format] === true
    }
    return (
      <button
        className={`toolbar-button ${isActive ? 'active' : ''}`}
        onMouseDown={(event) => {
          event.preventDefault()
          onClick()
        }}
      >
        {label}
      </button>
    )
  }

  const ToolbarButtonCodeBlock: React.FC<{
    format: FormatMark | string
    label: string
    editor: Editor
  }> = ({ format, label, editor }) => {
    let onClick = () => {
      console.log({ format })
      if (format === 'code-block') {
        console.log('yes')
        toggleBlock(editor, 'code-block')
      }
    }
    let isActive = false
    if (format === 'code-block') {
      isActive = isBlockActive(editor, format)
    }

    return (
      <button
        className={`toolbar-button ${isActive ? 'active' : ''}`}
        onMouseDown={(event) => {
          event.preventDefault()
          onClick()
        }}
      >
        {label}
      </button>
    )
  }

  // Create a toggleBlock function and an isBlockActive function to handle block elements
  const toggleBlock = (editor: Editor, format: string) => {
    const isActive = isBlockActive(editor, format)
    Transforms.unwrapNodes(editor, {
      match: (n) => Editor.isBlock(editor, n),
      split: true
    })

    if (isActive) {
      Transforms.setNodes(editor, { type: 'paragraph' })
    } else {
      Transforms.setNodes(editor, { type: format })
    }
  }

  const isBlockActive = (editor: Editor, format: string) => {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.type === format
    })
    return !!match
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && isBlockActive(editor, 'code-block')) {
      event.preventDefault()
      editor.insertText('\n')
    }

    if (event.key === 'ArrowDown' && isBlockActive(editor, 'code-block')) {
      event.preventDefault()
      Transforms.insertNodes(editor, {
        type: 'paragraph',
        children: [{ text: '' }]
      })
    }
  }

  const handleChange = (newValue: Descendant[]) => {
    if (newValue.length === 0) {
      setValue([
        {
          type: 'paragraph',
          children: [{ text: '' }]
        }
      ])
      return
    }
    setValue(newValue)
  }

  const toggleLink = (editor: Editor, url: string) => {
    const { selection } = editor

    if (selection && !Range.isCollapsed(selection)) {
      const isLink = Editor.marks(editor)?.link === true

      if (isLink) {
        Editor.removeMark(editor, 'link')
      } else if (url) {
        Editor.addMark(editor, 'link', url)
      }
    }
  }

  return (
    <Box
      sx={{
        width: '100%',
        border: '1px solid',
        borderRadius: '5px',
        marginTop: '20px',
        padding: '10px'
      }}
    >
      <Slate
        editor={editor}
        value={newValue}
        onChange={(newValue) => handleChange(newValue)}
      >
        <div className="toolbar">
          <ToolbarButton format="bold" label="B" editor={editor} />
          <ToolbarButton format="italic" label="I" editor={editor} />
          <ToolbarButton format="underline" label="U" editor={editor} />
          <ToolbarButton format="heading-2" label="H2" editor={editor} />
          <ToolbarButtonCodeBlock
            format="code-block"
            label="Code"
            editor={editor}
          />
          <button
            className="toolbar-button"
            onMouseDown={(event) => {
              event.preventDefault()
              const url = window.prompt('Enter the URL of the link:')
              toggleLink(editor, url)
            }}
          >
            Link
          </button>
          {/* <button
            className="toolbar-button"
            onMouseDown={(event) => {
              event.preventDefault()
              toggleBlock(editor, 'code-block')
            }}
          >
            Code
          </button> */}
        </div>
        <Editable
          className="blog-editor"
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={handleKeyDown}
        />
      </Slate>
      {editPostSection && (
        <Button onClick={() => editPostSection(value, section)}>
          Edit Section
        </Button>
      )}
    </Box>
  )
}

export default BlogEditor

export const renderElement = ({
  attributes,
  children,
  element
}: RenderElementProps) => {
  console.log({ element })
  switch (element.type) {
    case 'block-quote':
      return <blockquote {...attributes}>{children}</blockquote>
    case 'heading-2':
      return (
        <h2 className="h2" {...attributes}>
          {children}
        </h2>
      )
    case 'heading-3':
      return (
        <h3 className="h3" {...attributes}>
          {children}
        </h3>
      )
    case 'code-block':
      console.log('heelll code')
      return (
        <pre {...attributes} className="code-block">
          <code>{children}</code>
        </pre>
      )
    case 'code-line':
      return <div {...attributes}>{children}</div>
    case 'link':
      console.log('hello link')
      return (
        <a href={element.url} {...attributes}>
          {children}
        </a>
      )
    default:
      return (
        <p className="paragraph" {...attributes}>
          {children}
        </p>
      )
  }
}

export const renderLeaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  let el = children

  if (leaf.bold) {
    el = <strong>{el}</strong>
  }

  if (leaf.italic) {
    el = <em>{el}</em>
  }

  if (leaf.underline) {
    el = <u>{el}</u>
  }

  if (leaf.link) {
    el = (
      <a href={leaf.link} {...attributes}>
        {el}
      </a>
    )
  }

  return <span {...attributes}>{el}</span>
}