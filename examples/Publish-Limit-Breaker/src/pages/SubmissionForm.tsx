import {useSelector} from "react-redux";
import {RootState} from "../globalState/store";
import FileUploader from "../components/common/FileUploader/FileUploader";

const SubmissionForm = () => {
    const username = useSelector((state: RootState) => state.auth?.user?.name)

    return (<div>
        <FileUploader/>
        SubmissionForm
    </div>)
}
export default SubmissionForm