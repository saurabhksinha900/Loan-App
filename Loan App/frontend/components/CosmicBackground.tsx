'use client';

import { motion } from 'framer-motion';

const orbs = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  size: Math.random() * 200 + 200, // 200-400px
  x: Math.random() * 100, // 0-100%
  y: Math.random() * 100, // 0-100%
  delay: Math.random() * 5,
  duration: Math.random() * 10 + 15, // 15-25s
  color: i % 3 === 0 ? 'from-blue-400/20 to-teal-400/20' : 
         i % 3 === 1 ? 'from-teal-400/20 to-emerald-400/20' : 
         'from-cyan-400/20 to-blue-400/20',
}));

export default function CosmicBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50 dark:from-gray-900 dark:via-blue-950 dark:to-emerald-950" />
      
      {/* Animated orbs */}
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className={`absolute rounded-full bg-gradient-to-br ${orb.color} blur-3xl`}
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.1, 0.9, 1],
            rotate: [0, 120, 240, 360],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] dark:opacity-[0.05]" />
    </div>
  );
}
