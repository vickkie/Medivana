import { useState, useEffect } from "react";
import api from "../utils/api";

const usePost = (endpoint) => {
  const [updateStatus, setUpdateStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [data, setData] = useState(null);

  const updateData = async () => {
    if (!data) return;

    setIsLoading(true);
    setError(null); // Reset error state before updating data

    try {
      const response = await api.post(`/api/${endpoint}`, data);
      setUpdateStatus(response.status);
    } catch (error) {
      if (__DEV__) console.log(error);
      setError(true);
      setErrorMessage(error.message);
      setUpdateStatus(null); // Reset updateStatus in case of error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (endpoint && data) {
      updateData();
    }
  }, [endpoint, data]);

  const addCart = (data) => {
    setData(data);
    updateData();
  };
  const postData = (data) => {
    setData(data);
    updateData();
  };

  return { updateStatus, isLoading, error, errorMessage, addCart, postData, data };
};

export default usePost;
