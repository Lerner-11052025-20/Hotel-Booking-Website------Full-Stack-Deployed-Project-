import React, { useEffect } from 'react'
import Navbar from '../../components/hotelOwner/Navbar'
import Sidebar from '../../components/hotelOwner/Sidebar'
import { Outlet } from 'react-router-dom'
import {useAppContext} from '../../context/AppContext'


const Layout = () => {
    const {isOwner, navigate} = useAppContext()

    useEffect(()=>{
        if(!isOwner){
            navigate('/')
        }
    }, [isOwner])


    return (
        <div className='flex flex-col h-screen'> 
            <Navbar></Navbar>

            <div className='flex h-full'>
                <Sidebar></Sidebar>

                <div className='flex-1 p-4  pt-10 md:px-10 h-full'>
                    <Outlet></Outlet>
                </div>
            </div>
        </div>
    )
}

export default Layout