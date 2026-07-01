import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  LayoutDashboard,
  Target,
  Brain,
  Settings,
} from 'lucide-react';

const bottomNavItems = [
  { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { path: '/goals', label: 'Goals', icon: Target },
  { path: '/chat', label: 'Chat', icon: MessageSquare, primary: true },
  { path: '/memories', label: 'Memory', icon: Brain },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const BottomNavigation = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bottom-nav md:hidden" id="bottom-navigation">
      <div className="bottom-nav-inner">
        {bottomNavItems.map(({ path, label, icon: Icon, primary }) => {
          const active = isActive(path);
          return (
            <Link
              key={path}
              to={path}
              className={`bottom-nav-item ${active ? 'active' : ''} ${primary ? 'primary' : ''}`}
              aria-label={label}
              id={`bottom-nav-${label.toLowerCase()}`}
            >
              {primary ? (
                <motion.div
                  className="bottom-nav-primary-btn"
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <Icon size={22} strokeWidth={2.5} />
                </motion.div>
              ) : (
                <>
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    className="bottom-nav-icon-wrapper"
                  >
                    <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                  </motion.div>
                  <span className="bottom-nav-label">{label}</span>
                  {active && (
                    <motion.div
                      className="bottom-nav-active-dot"
                      layoutId="bottomNavDot"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
