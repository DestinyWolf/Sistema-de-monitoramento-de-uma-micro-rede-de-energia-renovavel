'use client'
import React from 'react'
import { Container } from './style'
import { useRouter } from 'next/navigation'


//Componente react do item da barra lateral
export const SidebarItem = ({ Icon, Text, href }:{Icon:any, Text:any, href:string}) => {
  const router = useRouter();

  return (
    <Container 
      onClick={() => {
      router.push(href);
      }}>
      <Icon />
      {Text}
    </Container>
  )
}