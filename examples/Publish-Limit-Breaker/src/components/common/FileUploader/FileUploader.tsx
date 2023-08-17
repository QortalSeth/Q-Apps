import {useState} from "react";
import FileUpload from "./FileUpload";

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
            <div style={mainDivStyle}>Upload files</div>
            <FileUpload files={files} setFiles={setFiles}
                        removeFile={removeFile} />
            <FileList files={files} removeFile={removeFile} />
            FileUploader
        </div>

    );
}

export default FileUploader;