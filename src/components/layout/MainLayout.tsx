import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TopNav from './TopNav.tsx';
import BottomNav from './BottomNav.tsx';
import ResourcesNav, { TabType } from './ResourcesNav.tsx';
import { useNav } from '../../contexts/NavContext.tsx';
import { motion, AnimatePresence } from 'motion/react';

export default function MainLayout() {
  const location = useLocation();
  const { isResourcesNavOpen, setIsResourcesNavOpen } = useNav();
  const lastScrollY = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Paths where BottomNav should be visible
  const tabPaths = ['/', '/reels', '/chats', '/hub', '/profile'];
  const showBottomNav = tabPaths.includes(location.pathname);
  
  // Paths where TopNav should be visible
  const showTopNav = tabPaths.includes(location.pathname);

  // Determine current tab for ResourcesNav
  const getTab = (path: string): TabType | null => {
    if (path === '/') return 'home';
    if (path === '/reels') return 'reels';
    if (path === '/chats') return 'chats';
    if (path === '/hub') return 'hub';
    if (path === '/profile') return 'profile';
    return null;
  };

  const currentTab = getTab(location.pathname);

  // Scroll listener to toggle ResourcesNav
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const currentScrollY = container.scrollTop;
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        // Scrolling down - hide
        if (isResourcesNavOpen) setIsResourcesNavOpen(false);
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up - show
        if (!isResourcesNavOpen && currentScrollY > 20) setIsResourcesNavOpen(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isResourcesNavOpen, setIsResourcesNavOpen]);

  // Reset visibility on tab change
  useEffect(() => {
    setIsResourcesNavOpen(false);
  }, [location.pathname, setIsResourcesNavOpen]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {showTopNav && <TopNav />}
      
      <AnimatePresence>
        {currentTab && isResourcesNavOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden shrink-0"
          >
            <ResourcesNav tab={currentTab} />
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden relative no-scrollbar"
      >
        <Outlet />
      </div>
      {showBottomNav && <BottomNav />}
    </div>
  );
}
