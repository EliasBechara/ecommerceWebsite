export const Underline = ({ children }: { children: React.ReactNode }) => (
  <span className="relative">
    {children}
    <span className="absolute -bottom-1 left-0 w-0 h-px bg-black transition-all duration-300 ease-[cubic-bezier(0.39,0.575,0.565,1)] group-hover:w-full" />
  </span>
);
