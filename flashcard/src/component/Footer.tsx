import { Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="hidden md:flex w-full py-6 px-8 mt-auto border-t border-gray-100 bg-transparent items-center justify-between shrink-0">
      {/* Brand & Copyright */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-[#1a1a4b]">HoloStudy</span>
        <span className="text-xs text-gray-400 font-medium">
          © {new Date().getFullYear()}
        </span>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-8">
        <a
          href="#"
          className="text-xs font-bold text-gray-400 hover:text-[#6c7df3] transition-colors"
        >
          Privacy Policy
        </a>
        <a
          href="#"
          className="text-xs font-bold text-gray-400 hover:text-[#6c7df3] transition-colors"
        >
          Terms of Service
        </a>
        <a
          href="#"
          className="text-xs font-bold text-gray-400 hover:text-[#6c7df3] transition-colors"
        >
          Help Center
        </a>
      </div>

      {/* Credits */}
      <div className="flex items-center text-xs font-medium text-gray-400">
        Built with{" "}
        <Heart className="w-3.5 h-3.5 text-[#6c7df3] fill-[#6c7df3] mx-1.5" />{" "}
        for students
      </div>
    </footer>
  );
};
