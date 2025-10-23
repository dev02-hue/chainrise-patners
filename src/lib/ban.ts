"use server"

import { BanRecord, BanUserInput, DeleteUserInput, User, UserManagementResponse } from "@/types/businesses"
import { getSession } from "./auth"
import { supabase } from "./supabaseClient"
import { createClient } from "@supabase/supabase-js"

// Get environment variables with proper error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not defined')
}

if (!supabaseServiceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not defined')
}

export async function banUser({
  userId,
  reason = "Violation of terms of service",
  duration
}: BanUserInput): Promise<UserManagementResponse> {
  console.log('🚀 banUser function called', { userId, reason, duration });
  
  try {
    // 1. Verify admin privileges
    console.log('🔐 Step 1: Verifying admin privileges');
    const { session } = await getSession()
    console.log('📋 Session data:', session);
    
    if (!session?.user) {
      console.log('❌ No session user found');
      return { success: false, message: 'Authentication required' }
    }
    console.log('✅ User authenticated:', session.user.id);

    const { data: adminProfile, error: adminError } = await supabase
      .from('chainrise_profile')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    console.log('👮 Admin profile query result:', { adminProfile, adminError });

    if (!adminProfile?.is_admin) {
      console.log('❌ User is not admin');
      return { success: false, message: 'Admin privileges required' }
    }
    console.log('✅ User has admin privileges');

    // 2. Verify target user exists
    console.log('👤 Step 2: Verifying target user exists', { userId });
    const { data: targetUser, error: userError } = await supabase
      .from('chainrise_profile')
      .select('id, email, username')
      .eq('id', userId)
      .single()

    console.log('🎯 Target user query result:', { targetUser, userError });

    if (userError || !targetUser) {
      console.log('❌ Target user not found or error:', userError);
      return { success: false, message: 'User not found' }
    }
    console.log('✅ Target user found:', targetUser);

    // 3. Calculate expiration date if duration provided
    console.log('⏰ Step 3: Calculating expiration date');
    const expiresAt = duration 
      ? new Date(Date.now() + duration * 60 * 60 * 1000).toISOString()
      : null; // null = permanent ban
    console.log('📅 Expires at:', expiresAt);

    // 4. Create ban record
    console.log('📝 Step 4: Creating ban record');
    const banRecordData = {
      user_id: userId,
      banned_by: session.user.id,
      reason: reason,
      banned_at: new Date().toISOString(),
      expires_at: expiresAt,
      is_active: true
    };
    console.log('💾 Inserting ban record:', banRecordData);

    const { error: banError } = await supabase
      .from('chainrise_user_bans')
      .insert(banRecordData)

    console.log('📋 Ban record insertion result:', { banError });

    if (banError) {
      console.error('❌ Failed to create ban record:', banError)
      return { success: false, message: 'Failed to ban user' }
    }
    console.log('✅ Ban record created successfully');

    // 5. Update user profile to reflect ban status
    console.log('👤 Step 5: Updating user profile ban status');
    const profileUpdateData = { 
      is_banned: true,
      banned_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    console.log('💾 Updating profile with:', profileUpdateData);

    const { error: profileUpdateError } = await supabase
      .from('chainrise_profile')
      .update(profileUpdateData)
      .eq('id', userId)

    console.log('📋 Profile update result:', { profileUpdateError });

    if (profileUpdateError) {
      console.error('⚠️ Failed to update user profile:', profileUpdateError)
      // Continue anyway as the ban record was created
    } else {
      console.log('✅ User profile updated successfully');
    }

    // 6. Sign out the banned user from all sessions using Admin API
    console.log('🚪 Step 6: Signing out banned user');
    console.log('🔑 Creating admin client with URL:', supabaseUrl);
    console.log('🔑 Service role key available:', !!supabaseServiceRoleKey);

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('❌ Missing Supabase environment variables');
      // Continue without signing out - the ban is still recorded
    } else {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

      const { error: signOutError } = await supabaseAdmin.auth.admin.signOut(userId)
      
      console.log('📋 Sign out result:', { signOutError });

      if (signOutError) {
        console.error('⚠️ Failed to sign out banned user:', signOutError)
        // Continue anyway as the ban was recorded
      } else {
        console.log('✅ User signed out successfully');
      }
    }

    const successMessage = `User ${targetUser.username || targetUser.email} has been banned${duration ? ` for ${duration} hours` : ' permanently'}`;
    console.log('✅ banUser completed successfully:', successMessage);
    
    return {
      success: true,
      message: successMessage,
      userId: userId,
      action: 'banned'
    }
  } catch (err) {
    console.error('💥 Unexpected error in banUser:', err)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export async function unbanUser(userId: string): Promise<UserManagementResponse> {
  console.log('🔓 unbanUser function called', { userId });
  
  try {
    // 1. Verify admin privileges
    console.log('🔐 Step 1: Verifying admin privileges');
    const { session } = await getSession()
    console.log('📋 Session data:', session);
    
    if (!session?.user) {
      console.log('❌ No session user found');
      return { success: false, message: 'Authentication required' }
    }
    console.log('✅ User authenticated:', session.user.id);

    const { data: adminProfile, error: adminError } = await supabase
      .from('chainrise_profile')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    console.log('👮 Admin profile query result:', { adminProfile, adminError });

    if (!adminProfile?.is_admin) {
      console.log('❌ User is not admin');
      return { success: false, message: 'Admin privileges required' }
    }
    console.log('✅ User has admin privileges');

    // 2. Verify user exists and is banned
    console.log('👤 Step 2: Verifying user exists and is banned', { userId });
    const { data: targetUser, error: userError } = await supabase
      .from('chainrise_profile')
      .select('id, email, username, is_banned')
      .eq('id', userId)
      .single()

    console.log('🎯 Target user query result:', { targetUser, userError });

    if (userError || !targetUser) {
      console.log('❌ Target user not found or error:', userError);
      return { success: false, message: 'User not found' }
    }

    if (!targetUser.is_banned) {
      console.log('❌ User is not currently banned');
      return { success: false, message: 'User is not currently banned' }
    }
    console.log('✅ User is currently banned');

    // 3. Deactivate all active ban records for this user
    console.log('📝 Step 3: Deactivating ban records');
    const banUpdateData = { 
      is_active: false,
      unbanned_at: new Date().toISOString(),
      unbanned_by: session.user.id
    };
    console.log('💾 Updating ban records with:', banUpdateData);

    const { error: banUpdateError } = await supabase
      .from('chainrise_user_bans')
      .update(banUpdateData)
      .eq('user_id', userId)
      .eq('is_active', true)

    console.log('📋 Ban records update result:', { banUpdateError });

    if (banUpdateError) {
      console.error('❌ Failed to update ban records:', banUpdateError)
      return { success: false, message: 'Failed to unban user' }
    }
    console.log('✅ Ban records updated successfully');

    // 4. Update user profile to remove ban status
    console.log('👤 Step 4: Updating user profile');
    const profileUpdateData = { 
      is_banned: false,
      banned_at: null,
      updated_at: new Date().toISOString()
    };
    console.log('💾 Updating profile with:', profileUpdateData);

    const { error: profileUpdateError } = await supabase
      .from('chainrise_profile')
      .update(profileUpdateData)
      .eq('id', userId)

    console.log('📋 Profile update result:', { profileUpdateError });

    if (profileUpdateError) {
      console.error('⚠️ Failed to update user profile:', profileUpdateError)
      // Continue anyway as the ban records were updated
    } else {
      console.log('✅ User profile updated successfully');
    }

    const successMessage = `User ${targetUser.username || targetUser.email} has been unbanned`;
    console.log('✅ unbanUser completed successfully:', successMessage);
    
    return {
      success: true,
      message: successMessage,
      userId: userId,
      action: 'unbanned'
    }
  } catch (err) {
    console.error('💥 Unexpected error in unbanUser:', err)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export async function deleteUser({
  userId,
  confirm = false
}: DeleteUserInput): Promise<UserManagementResponse> {
  console.log('🗑️ deleteUser function called', { userId, confirm });
  
  try {
    if (!confirm) {
      console.log('❌ Deletion not confirmed');
      return { success: false, message: 'Please confirm user deletion' }
    }
    console.log('✅ Deletion confirmed');

    // 1. Verify admin privileges
    console.log('🔐 Step 1: Verifying admin privileges');
    const { session } = await getSession()
    console.log('📋 Session data:', session);
    
    if (!session?.user) {
      console.log('❌ No session user found');
      return { success: false, message: 'Authentication required' }
    }
    console.log('✅ User authenticated:', session.user.id);

    const { data: adminProfile, error: adminError } = await supabase
      .from('chainrise_profile')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    console.log('👮 Admin profile query result:', { adminProfile, adminError });

    if (!adminProfile?.is_admin) {
      console.log('❌ User is not admin');
      return { success: false, message: 'Admin privileges required' }
    }
    console.log('✅ User has admin privileges');

    // 2. Verify target user exists
    console.log('👤 Step 2: Verifying target user exists', { userId });
    const { data: targetUser, error: userError } = await supabase
      .from('chainrise_profile')
      .select('id, email, username')
      .eq('id', userId)
      .single()

    console.log('🎯 Target user query result:', { targetUser, userError });

    if (userError || !targetUser) {
      console.log('❌ Target user not found or error:', userError);
      return { success: false, message: 'User not found' }
    }
    console.log('✅ Target user found:', targetUser);

    // 3. Use admin client to delete user from Auth
    console.log('🔑 Step 3: Creating admin client for auth deletion');
    console.log('🔑 Supabase URL:', supabaseUrl);
    console.log('🔑 Service role key available:', !!supabaseServiceRoleKey);

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('❌ Missing Supabase environment variables - attempting soft deletion only');
      
      // Soft delete as fallback
      const softDeleteData = { 
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: session.user.id
      };
      console.log('💾 Soft deleting profile with:', softDeleteData);

      const { error: softDeleteError } = await supabase
        .from('chainrise_profile')
        .update(softDeleteData)
        .eq('id', userId)

      console.log('📋 Soft deletion result:', { softDeleteError });

      if (softDeleteError) {
        console.error('❌ Failed to soft delete user:', softDeleteError);
        return { success: false, message: 'Failed to delete user completely' }
      }

      const fallbackMessage = `User ${targetUser.username || targetUser.email} has been soft deleted (auth deletion unavailable)`;
      console.log('✅ Soft deletion completed:', fallbackMessage);
      
      return { 
        success: true, 
        message: fallbackMessage,
        userId: userId,
        action: 'deleted'
      }
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    console.log('🗑️ Attempting to delete user from auth:', userId);
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    console.log('📋 Auth deletion result:', { authDeleteError });

    if (authDeleteError) {
      console.error('❌ Failed to delete user from auth:', authDeleteError)
      
      // If auth deletion fails, we might still want to soft delete from our database
      console.log('🔄 Attempting soft deletion as fallback');
      const softDeleteData = { 
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: session.user.id
      };
      console.log('💾 Soft deleting profile with:', softDeleteData);

      const { error: softDeleteError } = await supabase
        .from('chainrise_profile')
        .update(softDeleteData)
        .eq('id', userId)

      console.log('📋 Soft deletion result:', { softDeleteError });

      if (softDeleteError) {
        console.error('❌ Failed to soft delete user:', softDeleteError);
        return { success: false, message: 'Failed to delete user completely' }
      }

      const fallbackMessage = `User ${targetUser.username || targetUser.email} has been soft deleted (auth deletion failed)`;
      console.log('✅ Soft deletion completed:', fallbackMessage);
      
      return { 
        success: true, 
        message: fallbackMessage,
        userId: userId,
        action: 'deleted'
      }
    }

    console.log('✅ User successfully deleted from auth');

    // 4. Delete user profile and related data
    console.log('🗑️ Step 4: Deleting user profile data');
    const { error: profileDeleteError } = await supabase
      .from('chainrise_profile')
      .delete()
      .eq('id', userId)

    console.log('📋 Profile deletion result:', { profileDeleteError });

    if (profileDeleteError) {
      console.error('⚠️ Failed to delete user profile:', profileDeleteError)
      // User is already deleted from auth, so we consider this successful
      console.log('⚠️ Continuing despite profile deletion error (auth deletion succeeded)');
    } else {
      console.log('✅ User profile deleted successfully');
    }

    const successMessage = `User ${targetUser.username || targetUser.email} has been permanently deleted`;
    console.log('✅ deleteUser completed successfully:', successMessage);
    
    return {
      success: true,
      message: successMessage,
      userId: userId,
      action: 'deleted'
    }
  } catch (err) {
    console.error('💥 Unexpected error in deleteUser:', err)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export async function getBannedUsers(): Promise<{ data: BanRecord[] | null; error: string | null }> {
  console.log('📋 getBannedUsers function called');
  
  try {
    // 1. Verify admin privileges
    console.log('🔐 Step 1: Verifying admin privileges');
    const { session } = await getSession()
    console.log('📋 Session data:', session);
    
    if (!session?.user) {
      console.log('❌ No session user found');
      return { data: null, error: 'Authentication required' }
    }
    console.log('✅ User authenticated:', session.user.id);

    const { data: adminProfile, error: adminError } = await supabase
      .from('chainrise_profile')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    console.log('👮 Admin profile query result:', { adminProfile, adminError });

    if (!adminProfile?.is_admin) {
      console.log('❌ User is not admin');
      return { data: null, error: 'Admin privileges required' }
    }
    console.log('✅ User has admin privileges');

    // 2. Get active bans with user and admin info
    console.log('📋 Step 2: Fetching banned users');
    const { data: bans, error } = await supabase
      .from('chainrise_user_bans')
      .select(`
        *,
        user:chainrise_profile!user_id(username, email),
        admin:chainrise_profile!banned_by(username)
      `)
      .eq('is_active', true)
      .order('banned_at', { ascending: false })

    console.log('📋 Banned users query result:', { data: bans, error });

    if (error) {
      console.error('❌ Failed to fetch banned users:', error)
      return { data: null, error: 'Failed to fetch banned users' }
    }

    console.log('✅ getBannedUsers completed successfully, found', bans?.length || 0, 'banned users');
    return { data: bans, error: null }
  } catch (err) {
    console.error('💥 Unexpected error in getBannedUsers:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

export async function getAllUsers(): Promise<{ data: User[] | null; error: string | null }> {
  console.log('👥 getAllUsers function called');
  
  try {
    const { session } = await getSession()
    console.log('📋 Session data:', session);
    
    if (!session?.user) {
      console.log('❌ No session user found');
      return { data: null, error: 'Authentication required' }
    }
    console.log('✅ User authenticated:', session.user.id);

    const { data: adminProfile, error: adminError } = await supabase
      .from('chainrise_profile')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    console.log('👮 Admin profile query result:', { adminProfile, adminError });

    if (!adminProfile?.is_admin) {
      console.log('❌ User is not admin');
      return { data: null, error: 'Admin privileges required' }
    }
    console.log('✅ User has admin privileges');

    console.log('📋 Fetching all users');
    const { data: users, error } = await supabase
      .from('chainrise_profile')
      .select('id, username, email, is_banned, banned_at')
      .order('created_at', { ascending: false })

    console.log('📋 All users query result:', { data: users, error });

    if (error) {
      console.error('❌ Failed to fetch users:', error)
      return { data: null, error: 'Failed to fetch users' }
    }

    console.log('✅ getAllUsers completed successfully, found', users?.length || 0, 'users');
    return { data: users, error: null }
  } catch (err) {
    console.error('💥 Unexpected error in getAllUsers:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}