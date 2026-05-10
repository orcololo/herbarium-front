export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A3D27] via-[#234A30] to-[#2D5F3F] p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="leaf-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M50 20C50 20 30 30 30 50C30 66.56 43.44 80 50 80C56.56 80 70 66.56 70 50C70 30 50 20 50 20Z" fill="white" />
              <path d="M50 20C50 20 50 50 32 68" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#leaf-pattern)" />
        </svg>
      </div>
      <div className="relative z-10 w-full flex justify-center">
        {children}
      </div>
    </div>
  )
}
