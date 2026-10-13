import React from 'react'

export default function Admin(){
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>
      <div className="bg-white p-4 rounded shadow">This area is protected by backend policies. Only admins may read/write here.</div>
    </div>
  )
}
