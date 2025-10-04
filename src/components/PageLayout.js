import React from 'react';

const PageLayout = ({ children, showSidebar = true, Sidebar }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream flex">
      <div className="flex-1 flex flex-col">
        <div className="flex flex-1">
          <main className={`flex-1 ${showSidebar ? '' : 'mr-0'} overflow-y-auto`}>
            {children}
          </main>
          {showSidebar && Sidebar && <Sidebar />}
        </div>
      </div>
    </div>
  );
};

export default PageLayout;