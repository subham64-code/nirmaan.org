"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  gradient?: string;
  delay?: number;
}

export function AnimatedCard({
  title,
  value,
  icon,
  description,
  gradient = "from-[var(--brand)] to-purple-600",
  delay = 0,
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(99, 102, 241, 0.15)" }}
      className="group relative glass p-6 rounded-2xl overflow-hidden cursor-pointer"
    >
      {/* Animated background gradient */}
      <motion.div
        className={`absolute -inset-1 bg-gradient-to-r ${gradient} rounded-2xl opacity-20 blur`}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          {icon && <div className="text-3xl">{icon}</div>}
          <div className="text-right">
            <motion.div
              className={`text-4xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {value}
            </motion.div>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        {description && <p className="text-sm text-[var(--muted)]">{description}</p>}
      </div>

      {/* Hover effect light */}
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--brand)]/20 rounded-full blur-3xl"
        animate={{
          x: [0, 20, 0],
          y: [0, 20, 0],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </motion.div>
  );
}
