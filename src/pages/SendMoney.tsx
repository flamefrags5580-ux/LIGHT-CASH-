import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function SendMoney(){
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSend(e: React.FormEvent){
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    const amt = Number(amount)
    if(!recipient){ setMessage('Enter recipient username or id'); setLoading(false); return }
    if(!amt || amt <=0 ){ setMessage('Enter a positive amount'); setLoading(false); return }

    try{
      // Call Supabase RPC transfer function. Server enforces checks and idempotency.
      const idempotencyKey = crypto.randomUUID()
      const { data, error } = await supabase.rpc('transfer_virtual', { 
        sender_id: (await supabase.auth.getUser()).data.user?.id,
        recipient_identifier: recipient,
        amount: amt,
        idempotency_key: idempotencyKey
      })
      if(error) setMessage(error.message)
      else setMessage('Transfer successful: ' + data?.transaction_ref)
    }catch(err:any){
      setMessage(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Send Money</h2>
      <form onSubmit={handleSend} className="bg-white p-4 rounded shadow">
        {message && <div className="mb-2">{message}</div>}
        <input className="w-full p-3 mb-3 rounded" placeholder="Recipient username or user id" value={recipient} onChange={e=>setRecipient(e.target.value)} />
        <input className="w-full p-3 mb-3 rounded" placeholder="Amount in PHP" value={amount} onChange={e=>setAmount(e.target.value)} />
        <button disabled={loading} className="px-4 py-2 bg-brightcyan rounded">{loading ? 'Sending...' : 'Send'}</button>
      </form>
    </div>
  )
}
