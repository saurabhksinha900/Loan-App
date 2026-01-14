'use client';

import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Wallet, 
  TrendingUp, 
  FileText, 
  Settings, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Marketplace', href: '/marketplace', icon: TrendingUp },
  { name: 'My Portfolio', href: '/portfolio', icon: Wallet },
  { name: 'Transactions', href: '/transactions', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed left-0 top-0 z-50 h-screen w-64 border-r border-white/50 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl hidden lg:block"
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-white/50 dark:border-gray-700/50 px-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent" />
        </motion.div>
        <div>
          <h1 className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-xl font-bold text-transparent">
            LoanTrader
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">AI-Powered Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  group relative flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-lg shadow-emerald-500/50' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-4"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </motion.div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom gradient decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-emerald-500/10 to-transparent" />
    </motion.aside>
  );
}
