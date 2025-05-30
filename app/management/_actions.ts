'use server'

import { checkRole } from '@/utils/roles'
import { clerkClient } from '@clerk/nextjs/server'

export async function setRole(formData: FormData) {
  // Check that the user trying to set the role is an admin
  if (!await checkRole('admin')) {
    return { message: 'Not Authorized' }
  }
  
  try {
    const res = await clerkClient.users.updateUserMetadata(formData.get('id') as string, {
      publicMetadata: { role: formData.get('role') },
    })
    return { message: res.publicMetadata }
  } catch (err) {
    return { message: err }
  }
}

export async function removeRole(formData: FormData) {
  // Check that the user trying to remove the role is an admin
  if (!await checkRole('admin')) {
    return { message: 'Not Authorized' }
  }

  try {
    const res = await clerkClient.users.updateUserMetadata(formData.get('id') as string, {
      publicMetadata: { role: null },
    })
    return { message: res.publicMetadata }
  } catch (err) {
    return { message: err }
  }
}