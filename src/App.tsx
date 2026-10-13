import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import SendMoney from './pages/SendMoney'
import AddMoney from './pages/AddMoney'
import History from './pages/History'
import Profile from './pages/Profile'
import Admin from './pages/Admin'

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<Landing/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />
      <Route path="/dashboard" element={<Dashboard/>} />
      <Route path="/send" element={<SendMoney/>} />
      <Route path="/add" element={<AddMoney/>} />
      <Route path="/history" element={<History/>} />
      <Route path="/profile" element={<Profile/>} />
      <Route path="/admin" element={<Admin/>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
