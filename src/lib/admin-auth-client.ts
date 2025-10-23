// lib/admin-auth-client.ts
'use client';

import { adminSignUp, adminSignIn, adminSignOut, getAdminSession } from '@/lib/adminauth';

// Client-side wrapper functions
export const clientAdminSignUp = async (formData: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  try {
    const result = await adminSignUp(formData);
    return result;
  } catch (error) {
    console.error('Sign up error:', error);
    return { error: 'An unexpected error occurred' };
  }
};

export const clientAdminSignIn = async (formData: {
  emailOrUsername: string;
  password: string;
}) => {
  try {
    const result = await adminSignIn(formData);
    return result;
  } catch (error) {
    console.error('Sign in error:', error);
    return { error: 'An unexpected error occurred' };
  }
};

export const clientAdminSignOut = async () => {
  try {
    await adminSignOut();
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: 'An unexpected error occurred' };
  }
};

export const clientGetAdminSession = async () => {
  try {
    const session = await getAdminSession();
    return session;
  } catch (error) {
    console.error('Session error:', error);
    return { isAuthenticated: false, admin: null };
  }
};