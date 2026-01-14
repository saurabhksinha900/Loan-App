'use client';

import { motion } from 'framer-motion';
import { Moon, Sun, Bell, Search, User } from 'lucide-react';
import { useTheme } from '@/app/providers';

export default function TopBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-40 h-16 border-b border-white/50 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl"
    >
      <div className="flex h-full items-center justify-between px-8">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl bg-white/50 dark:bg-gray-700/50 px-4 py-2 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
          <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search loans, transactions..."
            className="w-64 bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative rounded-xl bg-white/50 dark:bg-gray-700/50 p-2 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
          >
            <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500" />
          </motion.button>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="rounded-xl bg-white/50 dark:bg-gray-700/50 p-2 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
          >
            <motion.div
              animate={{ rotate: theme === 'dark' ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
            </motion.div>
          </motion.button>

          {/* User Profile */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 px-4 py-2 text-white shadow-lg shadow-emerald-500/50 transition-all duration-300 hover:shadow-xl"
          >
            <User className="h-5 w-5" />
            <span className="text-sm font-medium">Account</span>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
