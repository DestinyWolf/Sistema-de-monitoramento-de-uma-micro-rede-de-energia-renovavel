'use client'
import React, { useState } from 'react'
import { FaBars } from 'react-icons/fa'
import {Sidebar} from "../sidebar/sideBar"
import {StatusBar} from "../util/tabBar";


//componente react do cabeçalho da pagina
export const Header = () => {
  const [sidebar, setSidebar] = useState(false)
  

  const showSiderbar = () => setSidebar(!sidebar)

  return (
    
      
        <div className="h-20 flex bg-[#1a202c] shadow-3xl relative">
          <FaBars onClick={showSiderbar} className="relative fill-white w-8 h-8 mt-8 ml-8 cursor-pointer"/>
            {sidebar && <Sidebar active={setSidebar} setPressButton={(n:number) =>{}}/>}
            <div className="mt-8  grow flex ">
              <h1 className="font-bold text-white ml-auto text-center text-2xl">
                SISTEMA DE MONITORAMENTO DE UMA MICRORREDE DE ENERGIA RENOVÁVEL
                </h1>
              <div className=" justify-end items-end ml-auto mr-5">
                <StatusBar/>
              </div>
            </div>
        </div>
  )
}

