import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function History(){
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    async function load(){
      const user = (await supabase.auth.getUser()).data.user
      if(!user){ setLoading(false); return }
      const { data } = await supabase.from('transactions').select('*').or(`sender.eq.${user.id},recipient.eq.${user.id}`).order('created_at',{ascending:false}).limit(50)
      setItems(data ?? [])
      setLoading(false)
    }
    load()
  },[])

  if(loading) return <div>Loading...</div>
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
      <div className="space-y-2">
        {items.map(tx=> (
          <div key={tx.id} className="bg-white p-3 rounded shadow">
            <div className="text-sm text-gray-500">{new Date(tx.created_at).toLocaleString()}</div>
            <div className="flex justify-between items-center">
              <div>{tx.description}</div>
              <div className={`font-semibold ${tx.amount>0 ? 'text-green-600' : 'text-red-600'}`}>₱ {Math.abs(tx.amount).toFixed(2)}</div>
            </div>
            <div className="text-xs text-gray-400">Ref: {tx.transaction_ref}</div>
          </div>
        ))}
        {items.length===0 && <div className="text-gray-500">No transactions yet.</div>}
      </div>
    </div>
  )
}
