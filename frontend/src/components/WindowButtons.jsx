import React from 'react'
import { useEffect, useState } from 'react';
import { MdClose } from "react-icons/md";
import { VscChromeRestore } from "react-icons/vsc";
import { LuMinus } from "react-icons/lu";
import { VscChromeMaximize } from "react-icons/vsc";

const WindowButtons = () => {
    const WindowButtonStyle = 'h-10 w-11 flex items-center justify-center';

    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        // Listen for window maximize and restore events
        const handleWindowMaximized = () => setIsMaximized(true);
        const handleWindowRestored = () => setIsMaximized(false);

        window.electron.ipcRenderer.on('window-maximized', handleWindowMaximized);
        window.electron.ipcRenderer.on('window-restored', handleWindowRestored);

        // Cleanup listeners on unmount
        return () => {
            window.electron.ipcRenderer.removeListener('window-maximized', handleWindowMaximized);
            window.electron.ipcRenderer.removeListener('window-restored', handleWindowRestored);
        };
    }, []);
  return (
    <>
        <button className={`${WindowButtonStyle} hover:bg-zinc-600 transition`}
            onClick={() => window.electron.ipcRenderer.send('minimize-window')}
        >
            <LuMinus  className="text-white stroke-2"/>
        </button>

        <button className={`${WindowButtonStyle} hover:bg-zinc-600 transition`}
            onClick={() => window.electron.ipcRenderer.send('maximize-window')}
            >
            {isMaximized ? (
                <VscChromeRestore className="text-white" />
            ) : (
                <VscChromeMaximize className="text-white" />
            )}
        </button>

        <button className={`${WindowButtonStyle} hover:bg-red-500 transition`}
            onClick={() => window.electron.ipcRenderer.send('close-window')}
        >
            <MdClose className="text-white size-4" />
        </button>
    </>
  )
}

export default WindowButtons