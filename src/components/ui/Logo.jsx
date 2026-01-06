
const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-9 h-9 bg-linear-to-r from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer">
        <img
          src="/logo.png"
          alt="YoMac logo"
          className="w-full h-full object-cover"
        />
      </div>
      <h1 className="text-xl font-bold bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent hidden sm:inline">
        YoMAC
      </h1>
    </div>
  );
};

export default Logo;
