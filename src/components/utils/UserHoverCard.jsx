import { useState, useRef, useEffect } from "react";

export default function UserHoverCard({ user, children }) {
  const [open, setOpen] = useState(false);
  const cardRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (
        cardRef.current &&
        !cardRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousemove", close);
    return () => document.removeEventListener("mousemove", close);
  }, []);

  return (
    <span
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}

      {open && (
        <div
          ref={cardRef}
          className="
            absolute left-0 top-6 z-9999 w-100
            bg-[#16181c] text-white p-4 rounded-3xl 
            border border-gray-800 font-sans
            animate-fadeIn shadow-xl
          "
        >
          {/* Header */}
          <div className="flex justify-between items-start">
            {/* Name */}
            <div className="flex flex-col">
              <h2 className="text-xl font-bold leading-tight hover:underline cursor-pointer">
                {user.full_name}
              </h2>
              <span className="text-[#71767b] text-sm">@{user.username || "joseph"}</span>
            </div>

            {/* Avatar */}
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.full_name}
                className="w-12 h-12 rounded-full object-cover"
              />

              {/* Verified check (si quieres activarlo si user.verified === true) */}
              {user.verified && (
                <div className="absolute -bottom-1 -left-1 bg-black rounded-full p-[2px]">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 text-[#1d9bf0] fill-current"
                  >
                    <g>
                      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .495.083.965.238 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"></path>
                    </g>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {user.bio && (
            <div className="mt-3 text-white text-[15px] leading-snug">
              {user.bio}
            </div>
          )}

         
          {/* Followers */}
          <div className="mt-3 text-[#71767b] text-sm">
            <span className="text-white font-bold">{user.followers_count}</span>{"300 "}
            seguidores
          </div>

          {/* Button */}
          <button className="mt-4 w-full bg-white text-black font-bold py-2 rounded-full hover:bg-gray-200 transition-colors">
            Seguir
          </button>
        </div>
        
      )}
      
    </span>
  );
}
