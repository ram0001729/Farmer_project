import { FiCheckCircle } from "react-icons/fi";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function BenefitSection({ image, title, description, benefits, reverse = false, ctaLabel, ctaRoute }) {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const benefitItems = useMemo(
    () =>
      benefits.map((item, idx) => (
        <li key={idx} className="flex items-start gap-3">
          <div className="bg-white/15 p-1.5 rounded-full mt-1 shrink-0">
            <FiCheckCircle className="text-black" size={14} />
          </div>
          <span className="font-serif text-black/85 leading-relaxed">
            {t(item)}
          </span>
        </li>
      )),
    [benefits, t]
  );

  // Animation variants
  const slideVariants = {
    hidden: {
      opacity: 0,
      x: reverse ? 80 : -80,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.section
      className="w-full flex justify-center px-2 py-1"
      variants={slideVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="
          relative max-w-6xl w-full
          grid grid-cols-1 md:grid-cols-2
          rounded-3xl overflow-hidden
          border border-white/20
          bg-[#3FA21A]
          transition-all duration-500
        "
      >
        {/* Ambient Glow */}
        <div
          className={`
            pointer-events-none absolute inset-0 rounded-3xl
            transition-opacity duration-500
            bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25)_0%,transparent_60%)]
            ${hovered ? "opacity-60" : "opacity-0"}
          `}
        />

        {/* Image Side */}
        <div className={`${reverse ? "md:order-2" : ""} relative flex justify-center items-center p-8`}>
          <div className="relative rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(5,22,26,0.45)]">
            <img
              src={image}
              alt={title}
              className={`
                w-full max-h-[420px] object-cover
                transition-transform duration-700
                ${hovered ? "scale-[1.03]" : "scale-100"}
              `}
            />
            <div className="absolute inset-0 shadow-inner" />
          </div>
        </div>

        {/* Text Side */}
        <div className={`${reverse ? "md:order-1" : ""} relative z-10 p-12 flex flex-col justify-center`}>
          
          
          <div className="inline-block mb-6 px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
            <h2 className="text-3xl md:text-4xl font-bold text-orange-500">
              {t(title)}
            </h2>
          </div>

          <p className="text-white text-lg leading-relaxed mb-8 max-w-md">
            {t(description)}
          </p>

<ul className="space-y-4 text-black">
            {benefitItems}
          </ul>
                  <button
            onClick={() => navigate(ctaRoute)}
            className="
              mt-8
              px-7 py-3
              rounded-xl
              bg-[#F57C00]
              text-black font-semibold
              tracking-wide
              shadow-lg shadow-[#F57C00]/30
              transition-all duration-300
              hover:scale-105
              hover:shadow-2xl
              active:scale-95
            "
          >
            {t(ctaLabel)}
          </button>

        </div>
      </div>
    </motion.section>
  );
}

export default BenefitSection;
