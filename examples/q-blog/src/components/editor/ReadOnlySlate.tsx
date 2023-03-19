import React, { useMemo } from 'react';
import { createEditor, Descendant, Editor } from 'slate';
import { withReact, Slate, Editable, RenderElementProps, RenderLeafProps  } from 'slate-react';
import { renderElement, renderLeaf } from './BlogEditor';

interface ReadOnlySlateProps {
  content: any;
}

const ReadOnlySlate: React.FC<ReadOnlySlateProps> = ({ content }) => {
  const editor = useMemo(() => withReact(createEditor()), []);
  const value = useMemo(() => content, [content]);

  return (
    <Slate editor={editor} value={value} onChange={() => {}}>
      <Editable readOnly renderElement={renderElement} renderLeaf={renderLeaf} />
    </Slate>
  );
};

export default ReadOnlySlate;