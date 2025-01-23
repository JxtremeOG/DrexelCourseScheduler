import React from 'react'
import { Outlet } from 'react-router-dom'
import MainNavBar from '../components/MainNavBar'

const MainLayout = () => {
  return (
    <div className='min-h-screen h-screen w-screen bg-zinc-800 text-slate-200 overflow-hidden grid grid-rows-[40px_calc(100%-40px)]'>
        <MainNavBar />
        <Outlet />
    </div>
  )
}

export default MainLayout