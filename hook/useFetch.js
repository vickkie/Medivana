import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import api from "../utils/api";

const useFetch = (endpoint, requiresAuth = false, token = null) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [statusCode, setStatusCode] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchData = useCallback(
    (skipCache = false) => {
      if (!endpoint) return;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setError(null);

      const url = `/api/${endpoint}`;
      const headers = {};

      if (requiresAuth && token) {
        headers.Authorization = `Bearer ${token}`;
      }

      if (skipCache) {
        headers["X-Skip-Cache"] = "true";
      }

      api
        .get(url, { headers, signal: controller.signal })
        .then((response) => {
          setData(response.data);
          setStatusCode(response?.status);
          setErrorMessage(null);
          setError(false);
        })
        .catch((err) => {
          if (axios.isCancel(err) || err.name === "CanceledError") return;
          const message = err.response?.data?.message || err.message || "An error occurred";
          setErrorMessage(message);
          setStatusCode(err.response?.status || null);
          setError(true);
          if (__DEV__) console.error("[useFetch]", endpoint, err.message);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [endpoint, requiresAuth, token],
  );

  const refetch = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    if (endpoint) {
      fetchData();
    }
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [endpoint, token, fetchData]);

  return { data, isLoading, error, errorMessage, statusCode, refetch };
};

export default useFetch;
