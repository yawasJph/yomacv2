import { Link } from "react-router-dom";

const Logo = () => {
  const onViewCredits = ["games"].some((route) =>
    location.pathname.includes(route),
  );

  return (
    <div className="flex items-center gap-2">
      <div className="w-9 h-9 bg-linear-to-r from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer">
        <Link to={"/"}>
          <img
            src="/logo.png"
            alt="YoMac logo"
            className="w-full h-full object-cover"
          />
        </Link>
      </div>    
      <h1
        className={`text-xl font-bold text-transparent bg-clip-text bg-size-[200%_100%] animate-gradient bg-linear-to-r from-emerald-600 via-teal-400 to-emerald-600 ${
          onViewCredits ? "max-sm:scale-0 max-sm:w-0 overflow-hidden" : ""
        }`}
      >
        YoMAC
      </h1>
    </div>
  );
};

export default Logo;
