import { useState } from "react";
import api from "../utils/api";



const useDelete = (baseEndpoint) => {
  const [deleteStatus, setDeleteStatus] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);

  // In useDelete.js
  const deleteData = async (id, onSuccessCallback) => {
    setIsDeleting(true);
    setErrorStatus(null); // Reset error state before updating data

    try {
      // console.log(`${baseEndpoint}/${id}`);
      const response = await api.delete(`/api/${baseEndpoint}/${id}`); // Use the environment variable

      setDeleteStatus(response.status);
      if (onSuccessCallback) {
        onSuccessCallback(); // Call the callback function
      }
    } catch (error) {
      setErrorStatus(error.message);
      setDeleteStatus(null); // Reset deleteStatus in case of error
    } finally {
      setIsDeleting(false);
    }
  };

  const redelete = (id) => {
    deleteData(id);
  };

  return { deleteStatus, isDeleting, errorStatus, redelete };
};

export default useDelete;
