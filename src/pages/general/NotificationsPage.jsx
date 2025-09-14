import { NotificationCenter } from "../../components/notifications";
import { useNavigate } from "react-router";

/**
 * Strona centrum powiadomień
 */
const NotificationsPage = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1);
  };

  return <NotificationCenter onClose={handleClose} />;
};

export default NotificationsPage;
