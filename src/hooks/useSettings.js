
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSettings } from '../store/settingsSlice';

const useSettings = () => {
  const dispatch = useDispatch();
  const { data: settings, status, error } = useSelector((state) => state.settings);

  useEffect(() => {
    // Do not automatically retry a failed request; callers can dispatch fetchSettings explicitly.
    if (status === 'idle') {
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
