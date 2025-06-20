import React, { ReactNode } from 'react';
import Navigation from './Navigation';
import OceanBackground from './OceanBackground';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700 relative overflow-hidden">
      <OceanBackground />
      <div className="relative z-10">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;