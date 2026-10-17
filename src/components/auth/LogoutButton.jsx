'use client';

import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { logoutUser } from '@/lib/redux/slices/authSlice';

export default function LogoutButton({ className = '', compact = false }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      router.replace('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      aria-label={compact ? 'Log out' : undefined}
      title={compact ? 'Log out' : undefined}
      className={`inline-flex items-center gap-2 text-xs font-semibold hover:opacity-80 transition-opacity disabled:opacity-60 ${className}`}
    >
      <LogOut size={15} />
      {!compact && (loading ? 'Signing out...' : 'Log out')}
    </button>
  );
}
