import React from 'react'
import FileItem from './FileItem'

const FileList = ({ files, removeFile }) => {
    return (
        <ul className="file-list">
            {
                files &&
                files.map(f => (<FileItem
                    key={f.name}
                    file={f}
                />))
            }
        </ul>
    )
}

export default FileList