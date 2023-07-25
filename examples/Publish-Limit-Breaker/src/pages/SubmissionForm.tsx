import {useSelector} from "react-redux";
import {RootState} from "../globalState/store";

const SubmissionForm = () => {
    const username = useSelector((state: RootState) => state.auth?.user?.name)

    return (<div>
        asdl;fjdf
    </div>)
}
export default SubmissionForm