'use client';

import { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/lib/redux/store';
import { fetchCurrentUser } from '@/lib/redux/slices/authSlice';

export default function ReduxProvider({ children }) {
  const storeRef = useRef();

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    storeRef.current.dispatch(fetchCurrentUser());
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}