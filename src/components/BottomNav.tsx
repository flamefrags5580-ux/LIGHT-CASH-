import React from 'react'

export default function BottomNav(){
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around">
      <a href="/dashboard">Home</a>
      <a href="/send">Send</a>
      <a href="/history">History</a>
      <a href="/profile">Profile</a>
    </nav>
  )
}
