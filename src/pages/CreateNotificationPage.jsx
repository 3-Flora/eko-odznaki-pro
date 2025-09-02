import React from "react";
import { CreateNotification } from "../components/notifications";
import { useNavigate } from "react-router";

/**
 * Strona tworzenia powiadomień
 */
const CreateNotificationPage = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1);
  };

  return <CreateNotification onClose={handleClose} />;
};

export default CreateNotificationPage;
