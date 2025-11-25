"use client"
import React from 'react'
import { QRCodeCanvas } from "qrcode.react";
const page = () => {
   const link = "https://chughtai-ruddy.vercel.app/awais.pdf"; 
  return (
    <div className='h-100% w-100% bg-white mx-auto flex justify-center items-center'>
 <a href={link} target="_blank" rel="noopener noreferrer">
      <QRCodeCanvas value={link} size={180} />
    </a>    </div>
  )
}

export default page
