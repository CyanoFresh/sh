import { useState, useEffect, useReducer } from 'react';
import core from './index';

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        error: false,
        data: action.payload,
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    default:
      throw new Error();
  }
};

const useFetch = (initialRequestData, initialData) => {
  const [requestData, setRequestData] = useState(initialRequestData);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: true,
    error: null,
    data: initialData,
  });

  useEffect(() => {
    let didCancel = false;

    const fetchData = async () => {
      dispatch({ type: 'FETCH_INIT' });

      try {
        const result = await core.authenticatedRequest(requestData);

        if (!didCancel) {
          if (result.data.ok) {
            dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
          } else {
            dispatch({ type: 'FETCH_FAILURE', payload: 'Wrong server response' });
          }
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: 'FETCH_FAILURE', payload: error.message });
        }
      }
    };

    fetchData();

    return () => {
      didCancel = true;
    };
  }, [requestData]);

  return [state, setRequestData];
};

export default useFetch;
