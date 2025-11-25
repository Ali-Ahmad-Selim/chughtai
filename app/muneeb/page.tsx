

"use client"
import React from 'react'
import { QRCodeCanvas } from "qrcode.react";
const page = () => {
   const link = "https://chughtai-ruddy.vercel.app/Muneeb.pdf"; 
  return (
   <div className="h-screen w-screen bg-white flex justify-center items-center">
  <a href={link} target="_blank" rel="noopener noreferrer">
    <QRCodeCanvas value={link} size={180} />
  </a>
</div>
  )
}

export default page
