import { useEffect } from "react";
import Lottie from "lottie-react";
import successAnimation from "@/assets/success.json";

export default function SuccessLottieOverlay({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // show for 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-10 text-center w-80 animate-fadeIn">
        <Lottie
          animationData={successAnimation}
          loop={false}
          className="w-40 mx-auto"
        />
        <h2 className="text-xl font-semibold text-gray-800 mt-4">
          {message || "Success!"}
        </h2>
      </div>
    </div>
  );
}
