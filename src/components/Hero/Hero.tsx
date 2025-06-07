import React from "react";
import heroImage from "../../assets/hero.svg";
import { FaInstagram, FaFacebook, FaLinkedin } from "react-icons/fa";
import { BiCalendar } from "react-icons/bi";
import { FaXTwitter } from "react-icons/fa6";

const Hero: React.FC = () => (
  <section className=" flex min-h-screen bg-white overflow-hidden px-4">
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
      <img
        src={heroImage}
        alt="Hero background"
        className="
          w-full h-full
          object-cover
          scale-225 sm:scale-100
          transition-transform duration-300
        "
      />
    </div>

    <div className="flex absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 flex-col items-center gap-4 2xl:gap-6 text-black">
      <div className="rotate-270 text-xs sm:text-sm font-medium tracking-wide"></div>
      <FaXTwitter className="w-5 h-5 2xl:w-8 3xl:h-8 hover:opacity-70 transition" />
      <FaLinkedin className="w-5 h-5 2xl:w-8 3xl:h-8 hover:opacity-70 transition" />
      <FaFacebook className="w-5 h-5 2xl:w-8 3xl:h-8 hover:opacity-70 transition" />
      <FaInstagram className="w-5 h-5 2xl:w-8 3xl:h-8 hover:opacity-70 transition" />
      <div className="w-px h-8 sm:h-12 bg-black opacity-30 mt-2" />
    </div>

  
    <div className="relative z-10 w-full flex flex-col items-start justify-start sm:justify-center mt-30 sm:mt-0 px-0 sm:px-6 sm:ml-14 py-10 sm:py-16 ml-10 ">
      <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl 3xl:text-9xl font-extrabold text-black leading-normal">
        <span className="sm:mr-2">SEO-Focused</span>
        <br className="block lg:hidden" />
        <span className="bg-black text-white px-2 sm:px-4 py-1 rounded-xl">Developer</span>
        <br className="" />
        <span className="sm:mr-1">High-Performance</span>
        <br className="block" />
        <span className="bg-black text-white px-2 sm:px-4 py-1 rounded-xl">Websites</span>
      </h1>

      <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-700 max-w-full sm:max-w-xl">
  I create fast, SEO-friendly websites that look great and help you grow online.
  Strong performance, and Google-ready from day one.
</p>


      <a
        href="/contact"
        className="mt-6 sm:mt-8 inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-black text-black font-medium rounded-full hover:bg-black hover:text-white transition text-sm sm:text-base"
      >
        <BiCalendar className="w-5 h-5 mr-2" />
        Schedule a Call
      </a>
    </div>
  </section>
);

export default Hero;
