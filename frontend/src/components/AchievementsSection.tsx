"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Award, Trophy, Medal } from "lucide-react";

const achievements = [
  {
    title: "50+ Students Trained",
    description: "Successfully trained over 50 students in AI/ML and Deep Learning",
    icon: "👥",
    stat: "50+",
  },
  {
    title: "90% Placement Rate",
    description: "90% of graduates successfully placed in top tech companies",
    icon: "🎯",
    stat: "90%",
  },
  {
    title: "Industry Partnerships",
    description: "Collaborated with leading tech companies for internships",
    icon: "🤝",
    stat: "15+",
  },
  {
    title: "Expert Trainers",
    description: "Learn from experienced professionals in AI, ML, and NLP",
    icon: "👨‍🏫",
    stat: "5+",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export function AchievementsSection() {
  return (
    <motion.section
      className="py-16 px-4"
      initial="hidden"
      whileInView="visible"
      variants={containerVariants}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[var(--brand)] to-purple-600 bg-clip-text text-transparent">
            Our Achievements
          </h2>
          <p className="text-[var(--muted)] max-w-2xl mx-auto">
            Building success stories through comprehensive training in AI, ML, Deep Learning, and professional soft skills
          </p>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" variants={containerVariants}>
          {achievements.map((achievement, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="group relative glass p-6 rounded-2xl hover:border-[var(--brand)] transition-all duration-300 cursor-pointer overflow-hidden"
              whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(99, 102, 241, 0.1)" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand)]/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="text-4xl mb-4">{achievement.icon}</div>
                <div className="text-3xl font-bold bg-gradient-to-r from-[var(--brand)] to-purple-600 bg-clip-text text-transparent mb-2">
                  {achievement.stat}
                </div>
                <h3 className="text-lg font-semibold mb-2">{achievement.title}</h3>
                <p className="text-sm text-[var(--muted)]">{achievement.description}</p>
              </div>

              <motion.div
                className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-[var(--brand)]/20 to-purple-600/20 rounded-full blur-xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
