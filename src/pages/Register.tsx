import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nav = useNavigate()

  async function handleRegister(e: React.FormEvent){
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { user, error } = await supabase.auth.signUp({ email, password, options: { data: { username }}})
    setLoading(false)
    if(error) setError(error.message)
    else nav('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <form onSubmit={handleRegister} className="w-full max-w-md p-6 bg-lightyellow rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Create an account</h1>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <input className="w-full p-3 mb-3 rounded" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input className="w-full p-3 mb-3 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full p-3 mb-3 rounded" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full p-3 bg-brightcyan text-black rounded" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
      </form>
    </div>
  )
}
