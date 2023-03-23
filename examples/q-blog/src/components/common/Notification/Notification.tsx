import { useDispatch, useSelector } from "react-redux";
import {  toast, ToastContainer, Zoom } from "react-toastify";
import { removeNotification } from "../../../state/features/notificationsSlice";
import "react-toastify/dist/ReactToastify.css";
import { RootState } from "../../../state/store";

const Notification = () => {
  const dispatch = useDispatch();

  const { alertTypes } = useSelector((state: RootState) => state.notifications);
  console.log({ alertTypes });

  if (alertTypes.alertError) {
    toast.error(`❌ ${alertTypes?.alertError}`, {
      position: "bottom-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      icon: false
    });
    dispatch(removeNotification());
  }
  if (alertTypes.alertSuccess) {
    toast.success(`✔️ ${alertTypes?.alertSuccess}`, {
      position: "bottom-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      icon: false
    });
    dispatch(removeNotification());
  }

  return (
    <ToastContainer
      transition={Zoom}
      position="bottom-right"
      autoClose={false}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      draggable
      pauseOnHover
    />
  );
};

export default Notification;
