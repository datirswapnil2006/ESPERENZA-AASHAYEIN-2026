import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import DemoSwitcher from '../components/common/DemoSwitcher';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-cream text-navy-text">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <DemoSwitcher />
    </div>
  );
}
