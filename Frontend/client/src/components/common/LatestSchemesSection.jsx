import { motion } from "framer-motion";
import farmerImg from "@/assets/farmer.jpg";

const containerReveal = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.08,
    },
  },
};

const itemReveal = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

function LatestSchemesSection() {
  return (
    <section id="latest-schemes" className="mx-auto mt-14 w-full px-4 sm:px-6 lg:px-8">
      <motion.div
        variants={containerReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="relative overflow-hidden rounded-3xl border border-[#D8C9B6]/30 bg-[#3FA21A]/80 backdrop-blur-2xl p-6 sm:p-8 lg:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.25)]"
      >
        <motion.div
          animate={{ x: [0, 18, 0], y: [0, -16, 0] }}
          transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -top-16 -left-12 h-44 w-44 rounded-full bg-emerald-300/20 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 14, 0] }}
          transition={{ duration: 9.2, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-orange-300/20 blur-3xl"
        />

        <motion.div variants={itemReveal} className="relative z-10 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#F57C00]">Why AgriLink Works</p>
            <h2 className="mt-2 text-2xl font-black text-black sm:text-3xl">
              Made For Rural Work
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-white/85 sm:text-base">
              One place to find <span className="font-semibold text-[#ffe4b3]">services</span>,
              book <span className="font-semibold text-[#ffd28a]">quickly</span>, and grow
              <span className="font-semibold text-[#fff0cf]"> income</span>.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 22 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="relative block w-full sm:w-auto"
          >
            <motion.div
              animate={{ y: [0, -9, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative h-40 w-full sm:h-36 sm:w-52 overflow-hidden rounded-2xl border border-white/35 shadow-[0_18px_35px_rgba(0,0,0,0.28)]"
            >
              <img src={farmerImg} alt="Farmer working in field" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </motion.div>

            <motion.div
              animate={{ y: [0, 7, 0], x: [0, 5, 0] }}
              transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-5 rounded-xl border border-white/40 bg-white/85 px-3 py-2 shadow-md"
            >
              <p className="text-[11px] font-semibold text-[#1b5e20]">Live Rural Support</p>
            </motion.div>
          </motion.div>
        </motion.div>

        <div className="relative z-10 mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            {
              title: "Trusted Profiles",
              body: "See clear details for labour, drivers, and equipment providers.",
            },
            {
              title: "Quick Booking",
              body: "Book in minutes and track status updates live.",
            },
            {
              title: "Women Support",
              body: "Easy access to women-focused learning and work opportunities.",
            },
            {
              title: "All In One",
              body: "Search, book, and manage services from one dashboard.",
            },
          ].map((feature, index) => (
            <motion.article
              key={feature.title}
              variants={itemReveal}
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ duration: 0.45, ease: "easeOut", delay: index * 0.04 }}
              className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-sm transition hover:shadow-xl"
            >
              <h3 className="text-lg font-bold bg-gradient-to-r from-[#14532d] to-[#0f766e] bg-clip-text text-transparent">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#445e49]">{feature.body}</p>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default LatestSchemesSection;
