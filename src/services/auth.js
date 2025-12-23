/**
 * Auth Service
 * 
 * All authentication operations live here.
 */

import { supabase } from '../api/supabase';

/**
 * Get the current user
 * @returns {Promise<Object|null>} User object or null
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Get the current session
 * @returns {Promise<Object|null>} Session object or null
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Sign in with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} Auth response
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Sign up with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} Auth response
 */
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Subscribe to auth state changes
 * @param {Function} callback - Called with (event, session) on auth changes
 * @returns {Object} Subscription object with unsubscribe method
 */
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription;
}
