import React from 'react'
import WindowButtons from './WindowButtons';

const MainNavBar = () => {
  return (
    <div className='h-full w-full row-start-1 bg-zinc-750 grid grid-cols-[1fr_200px] grid-rows-1'>
        <div className='col-start-10 h-full flex flex-grow flex-shrink items-center justify-end py-2'>
          <WindowButtons />
        </div>
    </div>
  )
}

export default MainNavBar