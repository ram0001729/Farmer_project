import { useEffect } from "react";
import Lottie from "lottie-react";
import { FiCheck } from "react-icons/fi";
import successAnimation from "@/assets/success.json";

export default function SuccessLottieOverlay({ message, onClose }) {
  useEffect(() => {
    let audioContext;

    const playSuccessSound = async () => {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;

        audioContext = new AudioContextClass();
        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        const now = audioContext.currentTime;

        const playNote = (frequency, start, duration, type = "sine", gainValue = 0.055) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.type = type;
          oscillator.frequency.setValueAtTime(frequency, start);

          gainNode.gain.setValueAtTime(0.0001, start);
          gainNode.gain.exponentialRampToValueAtTime(gainValue, start + 0.012);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.start(start);
          oscillator.stop(start + duration + 0.02);
        };

        // Premium two-step chime with a short tick accent.
        playNote(660, now + 0.02, 0.12, "triangle", 0.05);
        playNote(880, now + 0.17, 0.18, "triangle", 0.06);
        playNote(1320, now + 0.39, 0.08, "sine", 0.045);
      } catch {
        // Keep UI flow smooth if browser blocks autoplay audio.
      }
    };

    playSuccessSound();

    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => {
      clearTimeout(timer);
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close().catch(() => {});
      }
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-[2px] px-4">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-emerald-100/90 bg-gradient-to-br from-white via-emerald-50/60 to-cyan-50/60 p-8 text-center shadow-[0_30px_70px_rgba(15,23,42,0.28)]">
        <div className="pointer-events-none absolute -top-20 -right-14 h-44 w-44 rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-cyan-300/30 blur-3xl" />

        <div className="relative mx-auto mb-2 h-20 w-20">
          <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
          <span className="absolute inset-2 rounded-full bg-emerald-500/15" />
          <span className="absolute inset-3 flex items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/35">
            <FiCheck className="text-[32px]" strokeWidth={3} />
          </span>
        </div>

        <Lottie
          animationData={successAnimation}
          loop={false}
          className="mx-auto -mt-2 w-36"
        />

        <h2 className="mt-2 text-[1.9rem] font-black leading-none text-slate-800 tracking-tight">
          Booking Confirmed
        </h2>
        <h3 className="mt-2 text-[1.05rem] font-semibold text-slate-700">
          {message || "Success!"}
        </h3>
      </div>
    </div>
  );
}
