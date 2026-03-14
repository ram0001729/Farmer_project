import Hero from "@/components/common/Hero";
import MiddleSection from "@/components/common/MiddleSection";
import AboutSection from "@/components/common/AboutSection";
import Footer from "@/components/common/Footer";
import { motion, useScroll, useSpring } from "framer-motion";

function Home() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.2,
  });

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#f7f9ef]">
      <motion.div
        style={{ scaleX }}
        className="fixed left-0 top-0 z-50 h-1 w-full origin-left bg-gradient-to-r from-[#1f7a1f] via-[#f57c00] to-[#0f9b9c]"
      />

      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          animate={{ x: [0, 35, 0], y: [0, -30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-[#80c45a]/25 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -45, 0], y: [0, 25, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-0 top-1/4 h-[24rem] w-[24rem] rounded-full bg-[#f3a75a]/20 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, 40, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-[#5e9cd3]/18 blur-3xl"
        />
      </div>

      <main className="flex-grow">
        <Hero />
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <AboutSection />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <MiddleSection />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

export default Home;