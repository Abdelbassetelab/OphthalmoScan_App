'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { setRole, removeRole } from '@/app/management/_actions'

export default function UsersManagement() {
  const { getToken } = useAuth()
  const [message, setMessage] = useState('')

  const handleSetRole = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const result = await setRole(formData)
    setMessage(JSON.stringify(result.message))
  }

  const handleRemoveRole = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const result = await removeRole(formData)
    setMessage(JSON.stringify(result.message))
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">User Role Management</h1>
      
      {/* Set Role Form */}
      <form onSubmit={handleSetRole} className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Set User Role</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="id" className="block text-sm font-medium text-gray-700">
              User ID
            </label>
            <input
              type="text"
              name="id"
              id="id"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              name="role"
              id="role"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Set Role
          </button>
        </div>
      </form>

      {/* Remove Role Form */}
      <form onSubmit={handleRemoveRole}>
        <h2 className="text-xl font-semibold mb-4">Remove User Role</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="remove-id" className="block text-sm font-medium text-gray-700">
              User ID
            </label>
            <input
              type="text"
              name="id"
              id="remove-id"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Remove Role
          </button>
        </div>
      </form>

      {message && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <pre>{message}</pre>
        </div>
      )}
    </div>
  )
}