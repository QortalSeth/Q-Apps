import {useState} from "react";

const FileUploader = () =>{
    const [files, setFiles] = useState([])

    const removeFile = (filename) => {
        setFiles(files.filter(file => file.name !== filename))
    }
const mainDivStyle = {
        fontWeight: 'bold',
        fontSize: '1.2rem',
        marginBottom: '1em'
    }

    
    return (

        <div className="App">
            <div style={mainDivStyle}>Upload file</div>
            <FileUpload files={files} setFiles={setFiles}
                        removeFile={removeFile} />
            <FileList files={files} removeFile={removeFile} />
        </div>

    );
}

export default FileUploader;