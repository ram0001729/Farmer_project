import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";

const footerReveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: "easeOut" },
  },
};

function Footer() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const quickLinks = [
    { label: t("Home"), to: "/" },
    { label: t("About"), to: "/#about" },
    { label: t("Services"), to: "/search" },
    { label: t("Contact"), to: "/#contact" },
  ];

  const servicesLinks = [
    { label: t("For Farmers"), to: "/register?role=farmer" },
    { label: t("For Labour"), to: "/register?role=labour" },
    { label: t("For Drivers"), to: "/register?role=driver" },
    { label: t("Equipment Providers"), to: "/register?role=equipment_provider" },
  ];

  const navigateTo = (to) => {
    if (to.startsWith("/#")) {
      const id = to.slice(2);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        return;
      }
      navigate("/");
      return;
    }
    navigate(to);
  };

  return (
    <motion.footer
      id="contact"
      variants={footerReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      className="relative w-full mx-auto mt-24  rounded-3xl overflow-hidden"
    >

      {/* Glow Background */}
      <div className="absolute inset-0 bg-[#3FA21A]/80 backdrop-blur-2xl"></div>

      {/* Border Overlay */}
      <div className="relative border border-[#D8C9B6]/20 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.35)] px-10 py-16 text-white">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-5 tracking-wide text-[#F57C00]">
              AgriLink
            </h3>
            <p className="text-black/80 leading-relaxed text-lg">
              {t(
                "Our platform bridges the gap between farmers and trusted agricultural service providers. From skilled labour and reliable drivers to modern equipment and verified services — we bring everything together in one seamless digital ecosystem."
              )}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold mb-5 uppercase tracking-wider text-[#F57C00]">
              Quick Links
            </h4>
            <ul className="space-y-4 text-sm text-black">
              {quickLinks.map((item) => (
                <li
                  key={item.label}
                  onClick={() => navigateTo(item.to)}
                  className="hover:text-white hover:translate-x-1 transition-all duration-200 cursor-pointer"
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-base font-semibold mb-6 uppercase tracking-wider text-[#F57C00]">
              Services
            </h4>
            <ul className="space-y-3 text-sm text-black">
              {servicesLinks.map((item) => (
                <li
                  key={item.label}
                  onClick={() => navigateTo(item.to)}
                  className="hover:text-white hover:translate-x-1 transition-all duration-200 cursor-pointer"
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-base font-semibold mb-6 uppercase tracking-wider text-[#F57C00]">
              Contact
            </h4>
            <ul className="space-y-4 text-base text-black">
              <li>Email: support@agrilink.com</li>
              <li>Phone: +91 98765 43210</li>
              <li>Location: India</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 my-14"></div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between text-base text-[#F57C00]">
          <p className="font-medium">
            © {new Date().getFullYear()} AgriLink. All rights reserved.
          </p>

          <div className="flex gap-10 mt-4 md:mt-0">
            <span
              onClick={() => navigate("/privacy")}
              className="hover:text-black hover:underline transition text-black duration-200 cursor-pointer"
            >
              {t("Privacy Policy")}
            </span>
            <span
              onClick={() => navigate("/terms")}
              className="hover:text-black hover:underline transition  text-black duration-200 cursor-pointer"
            >
              {t("Terms of Service")}
            </span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;

