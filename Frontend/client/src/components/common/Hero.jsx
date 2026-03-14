import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const heroVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.16,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const floatMotion = {
  animate: {
    y: [0, -10, 0],
  },
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

function Hero() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <motion.section
      variants={heroVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="relative w-full min-h-screen flex items-center justify-center px-6 overflow-hidden"
    >

      <motion.div
        variants={fadeInUp}
        className="max-w-1xl w-full bg-[#3FA21A]/80 backdrop-blur-2xl border border-[#D8C9B6]/30 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.25)] p-10 md:p-20 text-center"
      >

 <span className="inline-block mb-6 px-6 py-2 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
         {t("Trusted by 10,000+ Farmers")}
   </span>                

        {/* Video-in-Text Heading */}
      <div className="w-full flex justify-center py-1 overflow-visible">
        <svg
  viewBox="0 0 1500 300"
  className="w-full max-w-5xl h-40 md:h-48"
  preserveAspectRatio="xMidYMid meet"
>

  <defs>
    <mask id="text-mask">
      <rect width="100%" height="100%" fill="black" />
      <text
        x="50%"
        y="45%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="100"
        fontWeight="800"

        
        fill="white"
        fontFamily="Arial, sans-serif"
      >
        <tspan x="50%" dy="0">{t("Connecting Farmers")}</tspan>
        <tspan x="50%" dy="100">{t("with Trusted Services")}</tspan>
      </text>
    </mask>
  </defs>

 <foreignObject width="100%" height="100%" mask="url(#text-mask)">
  <img
    src="https://t4.ftcdn.net/jpg/11/85/20/91/360_F_1185209142_mXwyE1vGr68KlNsHCUQfZN3snELrQl8y.jpg"
    className="w-full h-full object-cover"
  />
</foreignObject>
</svg>

</div>
{/* Left Floating Image */}


<motion.div
  className="hidden lg:block absolute left-10 top-1/2 -translate-y-1/2 w-64 h-[520px] rounded-3xl overflow-hidden shadow-2xl opacity-100"
  {...floatMotion}
>
  <video
    src="https://res.cloudinary.com/dwp9qjmdf/video/upload/v1770805053/From_KlickPin_CF_Trator_agro_neg%C3%B3cio___Fotos_de_trator_Trator_Fotos_de_fazendasS_avatar_link_czh0xn.mp4"
    autoPlay
    loop
    muted
    playsInline
    className="w-full h-full object-cover"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
</motion.div>







<motion.div
  className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2 w-64 h-[520px] rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.35)]"
  {...floatMotion}
  transition={{ ...floatMotion.transition, delay: 0.5 }}
>
  <video
    src="https://res.cloudinary.com/dwp9qjmdf/video/upload/v1770804758/6c1f614c2141c59837ce8d66323112f1_t4_jrppde.mp4"
    autoPlay
    loop
    muted
    playsInline
    className="w-full h-full object-cover"
  />

  {/* Gradient Overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent pointer-events-none" />
</motion.div>


<p className="mt-6 text-lg md:text-xl text-gray-800 max-w-3xl mx-auto">
          {t(
            "Our platform bridges the gap between farmers and trusted agricultural service providers. From skilled labour and reliable drivers to modern equipment and verified services — we bring everything together in one seamless digital ecosystem."
          )}
        </p>

        <motion.div
          className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
          variants={fadeInUp}
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => navigate("/search?available=true")}
            className="px-8 py-3 rounded-xl bg-[#F57C00] text-white font-semibold shadow-md shadow-[#F57C00]/30"
          >
            {t("Explore Services")}
          </motion.button>
        </motion.div>

      </motion.div>
    </motion.section>
  );
}

export default Hero;
