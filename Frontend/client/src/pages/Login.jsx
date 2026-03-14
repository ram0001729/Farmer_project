import { useState } from "react";
import { loginWithPassword } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useTranslation } from "react-i18next";

function Login() {
  const [form, setForm] = useState({ mobile: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await loginWithPassword(form);
      const token = res.token;
      const role = res.user.role;
      const normalizedRole = role.toLowerCase();


      login(token,normalizedRole);
      console.log("ROLE SAVED 👉", role);

      alert(t("Login successful"));
        if (normalizedRole === "farmer") {
          navigate("/FarmerHome", { replace: true });
        } else if (["driver", "labour", "equipment_provider"].includes(normalizedRole)) {
          navigate("/ProviderHome", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
     } catch (err) {
      alert(t("Login unsuccessful"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_center,#F5F5DC_0%,#D9F99D_50%,#C4E07A_100%)] from-green-50 to-white px-4">
      
      <form
        onSubmit={handleSubmit}
        className="
          w-full max-w-md
          bg-white
          border border-black/20
          rounded-3xl
          p-8
          shadow-xl shadow-green-500/10
        "
      >
        {/* Heading */}
        <h2 className="text-3xl font-bold text-green-900 mb-6 text-center">
          {t("Login")}
        </h2>

        {/* Mobile */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("Mobile Number")}
          </label>
          <input
            type="text"
            placeholder={t("Enter mobile number")}
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            className="
              w-full
              px-4 py-2
              rounded-xl
              border border-gray-300
              focus:outline-none
              focus:ring-2 focus:ring-green-500
              focus:border-transparent
            "
          />
        </div>
{/* Password */}
<div className="mb-6">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    {t("Password")}
  </label>

  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      placeholder={t("Enter password")}
      value={form.password}
      onChange={(e) => setForm({ ...form, password: e.target.value })}
      className="
        w-full
        px-4 py-2
        pr-10
        rounded-xl
        border border-gray-300
        focus:outline-none
        focus:ring-2 focus:ring-green-500
        focus:border-transparent
      "
    />

    {/* Eye Button */}
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-2.5 text-gray-500"
    >
      {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
    </button>
  </div>
</div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="
            w-full
            py-3
            rounded-xl
            bg-gradient-to-r from-green-600 to-emerald-600
            text-white font-semibold
            shadow-lg shadow-green-500/30
            hover:scale-[1.01]
            transition
            disabled:opacity-60
          "
        >
          {loading ? t("Logging in...") : t("Login")}
        </button>
      </form>
    </div>
  );
}

export default Login;
