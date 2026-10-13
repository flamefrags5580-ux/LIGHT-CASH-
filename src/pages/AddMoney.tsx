import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AddMoney(){
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent){
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    const amt = Number(amount)
    if(!amt || amt<=0){ setMsg('Amount must be positive'); setLoading(false); return }
    try{
      const idempotencyKey = crypto.randomUUID()
      const user = (await supabase.auth.getUser()).data.user
      if(!user){ setMsg('Not authenticated'); setLoading(false); return }
      const { data, error } = await supabase.rpc('add_demo_funds', { target_user_id: user.id, amount: amt, idempotency_key: idempotencyKey })
      if(error) setMsg(error.message)
      else setMsg('Added demo funds: ' + data?.transaction_ref)
    }catch(err:any){ setMsg(err.message) }
    setLoading(false)
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Add Virtual Money (DEMO)</h2>
      <div className="text-sm text-gray-600 mb-2">Demo funds have no real monetary value and are for development/testing only.</div>
      <form onSubmit={handleAdd} className="bg-white p-4 rounded shadow">
        {msg && <div className="mb-2">{msg}</div>}
        <input className="w-full p-3 mb-3 rounded" placeholder="Amount in PHP" value={amount} onChange={e=>setAmount(e.target.value)} />
        <button disabled={loading} className="px-4 py-2 bg-lightyellow rounded">{loading ? 'Adding...' : 'Add Demo Funds'}</button>
      </form>
    </div>
  )
}
