import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const sectionReveal = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

function AboutSection() {
  const { t } = useTranslation();

  return (
    <motion.section
      id="about"
      variants={sectionReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      className="relative w-full py-24 flex items-center justify-center px-6 overflow-hidden"
    >
      <motion.div
        className="pointer-events-none absolute top-12 left-10 h-40 w-40 rounded-full bg-[#5CB338]/20 blur-3xl"
        animate={{ x: [0, 20, 0], y: [0, -18, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-10 right-10 h-44 w-44 rounded-full bg-[#0F9B9C]/16 blur-3xl"
        animate={{ x: [0, -24, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Outer Container */}
<div className="w-full max-w-screen-2xl bg-gradient-to-br from-[#5CB338] to-[#5CB338] backdrop-blur-sm border border-white/20 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.25)] py-20 text-white">
        
        <div className="max-w-6xl mx-auto px-6 text-center">

          {/* Section badge */}
          <span className="inline-block mb-6 px-6 py-2 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
            {t("About Our Platform")}
          </span>

          {/* Heading */}
          <h2 className="relative text-4xl md:text-5xl font-extrabold text-green-900 mb-6">
            <span className="absolute -inset-x-6 -inset-y-3 bg-green-100/60 blur-2xl rounded-full"></span>
            <span className="relative">{t("Empowering Agriculture Through Technology")}</span>
          </h2>

          {/* Description */}
<p className="text-lg text-black font-medium tracking-wide max-w-4xl mx-auto mb-12 leading-relaxed">
            {t(
              "Our platform bridges the gap between farmers and trusted agricultural service providers. From skilled labour and reliable drivers to modern equipment and verified services — we bring everything together in one seamless digital ecosystem."
            )}
          </p>

          {/* Feature cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.14 } },
            }}
          >

            {/* Card 1 */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
              whileHover={{ y: -8, rotateX: 1.5, rotateY: -1.5 }}
              className="group relative bg-[linear-gradient(135deg,#6DA5C0_0%,#0F9B9C_45%,#0C7075_100%)] border border-white/20 rounded-3xl p-8 shadow-[0_25px_70px_rgba(12,112,117,0.45)] transition-all duration-500 hover:shadow-[0_40px_90px_rgba(12,112,117,0.65)] cursor-pointer"
            >
              <div className="absolute inset-0 rounded-3xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <h3 className="text-xl font-semibold text-[#FF4400]  mb-3">Trusted Network</h3>
              <p className="font-serif text-black leading-relaxed">
                All service providers are verified to ensure safety, reliability,
                and transparency for farmers.
              </p>
              <div className="mt-6 h-[2px] w-10 bg-white/60 rounded-full transition-all duration-500 group-hover:w-20 group-hover:bg-white"></div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
              whileHover={{ y: -8, rotateX: 1.5, rotateY: -1.5 }}
              className="group relative bg-[linear-gradient(135deg,#6DA5C0_0%,#0F9B9C_45%,#0C7075_100%)] border border-white/20 rounded-3xl p-8 shadow-[0_25px_70px_rgba(12,112,117,0.45)] transition-all duration-500 hover:shadow-[0_40px_90px_rgba(12,112,117,0.65)] cursor-pointer"
            >
              <div className="absolute inset-0 rounded-3xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <h3 className="text-xl font-semibold text-[#FF4400]  mb-3">Smart & Simple</h3>
              <p className="font-serif text-black leading-relaxed">
                Book labour, drivers, or equipment in just a few clicks with clear
                pricing and real-time availability.
              </p>
              <div className="mt-6 h-[2px] w-10 bg-white/60 rounded-full transition-all duration-500 group-hover:w-20 group-hover:bg-white"></div>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
              whileHover={{ y: -8, rotateX: 1.5, rotateY: -1.5 }}
              className="group relative bg-[linear-gradient(135deg,#6DA5C0_0%,#0F9B9C_45%,#0C7075_100%)] border border-white/20 rounded-3xl p-8 shadow-[0_25px_70px_rgba(12,112,117,0.45)] transition-all duration-500 hover:shadow-[0_40px_90px_rgba(12,112,117,0.65)] cursor-pointer"
            >
              <div className="absolute inset-0 rounded-3xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <h3 className="text-xl font-semibold text-[#FF4400]  mb-3">Farmer First</h3>
              <p className="font-serif text-black leading-relaxed">
                Built with farmers at the core, our mission is to increase
                productivity, reduce costs, and improve livelihoods.
              </p>
              <div className="mt-6 h-[2px] w-10 bg-white/60 rounded-full transition-all duration-500 group-hover:w-20 group-hover:bg-white"></div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

export default AboutSection;

