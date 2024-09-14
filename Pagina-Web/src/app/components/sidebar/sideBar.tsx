"use client"
import React, { useState } from 'react'
import { Container, Content } from './style'
import { 
  FaTimes, 
  FaHome, 
  FaRegCalendarAlt,
  FaChartArea,
  FaChartLine
} from 'react-icons/fa';
import {SidebarItem} from "../sideBarItem/sideBarItem";


//componente react da barra lateral
export const Sidebar = ({ active, setPressButton }:{active:any, setPressButton:any}) => {

  const closeSidebar = () => {
    active(false)
  }



  return (
    <Container sidebar={active}>
      <FaTimes onClick={closeSidebar} />  
      <Content>
        <SidebarItem Icon={FaHome} Text="Em tempo real" href='/'/>
        <SidebarItem Icon={FaChartArea} Text="Graficos Temperatura" href='/pages/tempPage'/>
        <SidebarItem Icon={FaChartArea} Text="potencia" href='/pages/powerPage'/>
        <SidebarItem Icon={FaChartLine} Text="corrente x tensao" href='/pages/voltagePage'/>
        <SidebarItem Icon={FaRegCalendarAlt} Text="Graficos por dia" href='/pages/forDayPage'/>
        <SidebarItem Icon={FaRegCalendarAlt} Text="Graficos por periodo de tempo" href='/pages/forMonthPage'/>
      </Content>
    </Container>
  )
}
