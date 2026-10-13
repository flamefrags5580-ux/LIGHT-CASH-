import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard(){
  const [profile, setProfile] = useState<any>(null)
  const [wallet, setWallet] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let mounted = true
    async function load(){
      const user = supabase.auth.getUser().then(r=>r.data.user)
      const { data: u } = await supabase.auth.getUser()
      if(!u) return setLoading(false)
      const uid = u.id
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', uid).single()
      const { data: wallet } = await supabase.from('wallets').select('*').eq('owner', uid).single()
      if(mounted){ setProfile(profile); setWallet(wallet); setLoading(false)}
    }
    load()
    return ()=>{ mounted=false }
  },[])

  if(loading) return <div className="p-6">Loading...</div>
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Wallet dashboard (Virtual demo)</h2>
      <div className="p-4 rounded-lg bg-white shadow mb-4">
        <div className="text-sm text-gray-600">Balance</div>
        <div className="text-3xl font-bold">₱ {wallet?.balance?.toFixed(2) ?? '0.00'}</div>
        <div className="mt-3 flex gap-2">
          <a href="/send" className="px-4 py-2 bg-brightcyan rounded">Send</a>
          <a href="/add" className="px-4 py-2 bg-lightyellow rounded">Add Money (Demo)</a>
          <a href="/history" className="px-4 py-2 border rounded">History</a>
        </div>
      </div>
      <div className="p-4 rounded-lg bg-white shadow">
        <h3 className="font-semibold mb-2">Recent transactions</h3>
        {/* Minimal recent transactions listing */}
      </div>
    </div>
  )
}
