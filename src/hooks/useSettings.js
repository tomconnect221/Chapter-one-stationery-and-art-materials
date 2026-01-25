
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSettings } from '../store/settingsSlice';

const useSettings = () => {
  const dispatch = useDispatch();
  const { data: settings, status, error } = useSelector((state) => state.settings);

  useEffect(() => {
    // Fetch settings only if they haven't been fetched or if the fetch failed
    if (status === 'idle' || status === 'failed') {
      dispatch(fetchSettings());
    }
  }, [status, dispatch]);

  return {
    settings,
    isLoading: status === 'loading' || status === 'idle',
    error,
  };
};

export default useSettings;
