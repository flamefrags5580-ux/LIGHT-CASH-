import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Profile(){
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    async function load(){
      const user = (await supabase.auth.getUser()).data.user
      if(!user){ setLoading(false); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
      setLoading(false)
    }
    load()
  },[])

  if(loading) return <div>Loading...</div>
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Profile</h2>
      <div className="bg-white p-4 rounded shadow">
        <div className="mb-2">Username: {profile?.username}</div>
        <div className="mb-2">Email: {profile?.email}</div>
        <div className="mb-2">Created: {profile?.created_at}</div>
      </div>
    </div>
  )
}
