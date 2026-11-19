import Footer from '@/components/sheard/Footer';
import Navbar from '@/components/sheard/Navbar';
import TopHeader from '@/components/sheard/TopHeader';
import ChatBot from '@/components/sheard/ChatBot';

import MobileBottomNav from '@/components/sheard/MobileBottomNav';
import WhatsAppButton from '@/components/sheard/WhatsAppButton';
import React from 'react';

const mainLayout = ({ children }) => {
    return (
        <>
            <div className="pb-[58px] md:pb-0">
                <TopHeader></TopHeader>
                <Navbar></Navbar>
                {children}
                <Footer></Footer>
            </div>
            {/* ChatBot hidden for now (per request) */}
            {/* <ChatBot /> */}

            <WhatsAppButton />
            <MobileBottomNav />
        </>
    );
};

export default mainLayout;