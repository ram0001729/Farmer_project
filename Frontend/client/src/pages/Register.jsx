import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  registerUser,
  requestOtp,
  verifyOtp,
  setPassword,
} from "../services/authService";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useTranslation } from "react-i18next";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    password: "",
    role: "",
    otp: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const otpRefs = useRef([]);

  const handleVerifyOtp = async () => {
    try {
      const otpRes = await verifyOtp({
        mobile: form.mobile,
        otp: form.otp,
      });

      const token = otpRes.token;
      const role = otpRes.user.role;


if (!form.password || form.password.length < 6) {
  alert(t("Password must be at least 6 characters"));
  return;
}

      await setPassword({ password: form.password }, token);
      await registerUser({ mobile: form.mobile });
            login(token, role);

      alert(t("Account created successfully!"));
      if (role === "farmer") {
        navigate("/FarmerHome");
      } else if (["driver", "labour", "equipment_provider"].includes(role)) {
        navigate("/ProviderHome");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      alert(t("OTP verification failed"));
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const otpArray = form.otp.split("");
    otpArray[index] = value;
    const newOtp = otpArray.join("");
    setForm({ ...form, otp: newOtp });

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleSendOtp = async () => {
    try {
      await requestOtp({
        name: form.name,
        mobile: form.mobile,
        role: form.role,
      });
      alert(t("OTP sent!"));
      setOtpSent(true);
    } catch (err) {
      alert(t("Failed to send OTP"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_center,#F5F5DC_0%,#D9F99D_50%,#C4E07A_100%)] from-green-50 to-white px-4">
      <div
        className="
          w-full max-w-md
          bg-white
          border border-black/20
          rounded-3xl
          p-4
          shadow-xl shadow-green-500/10
        "
      >
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <img
            src="https://res.cloudinary.com/dwp9qjmdf/image/upload/v1768772826/farmer_jebfjw.png"
            alt="Farmer"
            className="w-24 h-24 rounded-full border-4 border-lime-600 shadow"
          />
        </div>

        {/* Heading */}
        <h2 className="text-3xl font-bold text-green-900 text-center mb-2">
          {t("Create Account")}
        </h2>
       

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          {/* Name */}
          <input
            placeholder={t("Name")}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
          />

          {/* Role */}
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="">{t("Select role")}</option>
            <option value="farmer">{t("Farmer")}</option>
            <option value="driver">{t("Driver")}</option>
            <option value="labour">{t("Labour")}</option>
            <option value="equipment_provider">{t("Equipment Provider")}</option>
          </select>

          {/* Mobile */}
          <input
            placeholder={t("Mobile Number")}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
          />

          {/* OTP */}
          <div className="flex justify-between gap-2 mt-4">
            {[...Array(6)].map((_, i) => (
              <input
                key={i}
                maxLength="1"
                ref={(el) => (otpRefs.current[i] = el)}
                onChange={(e) => handleOtpChange(e.target.value, i)}
                className="
                  w-10 h-12 text-center
                  rounded-lg
                  border border-gray-300
                  text-lg font-semibold
                  focus:ring-2 focus:ring-green-500
                  outline-none
                "
              />
            ))}
          </div>

          {/* Send OTP */}
          <button
            type="button"
            onClick={handleSendOtp}
            className="
              w-full py-2 mt-2
              rounded-xl
              border border-green-600
              text-green-700 font-semibold
              hover:bg-green-50
              transition
            "
          >
            {t("Request OTP")}
          </button>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t("Set Password")}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2 pr-10 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-500"
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          {/* Create Account */}
          <button
            type="button"
            disabled={!otpSent}
            onClick={handleVerifyOtp}
            className="
              w-full py-2
              rounded-xl
            bg-green-800
              text-white font-semibold
              shadow-lg shadow-green-500/30
              transition
            "
          >
            {t("Create Account")}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-600">
          {t("Already have an account?")}{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-green-700 font-semibold cursor-pointer hover:underline"
          >
            {t("Login")}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Register;
