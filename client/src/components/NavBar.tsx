import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { ShoppingCart, Box, FolderOpen, Sparkles } from "lucide-react";

export default function NavBar() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="sticky bottom-0 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.15)] z-40 border-t border-white/10 dark:border-gray-700/30">
      <div className="flex justify-around items-center py-2 px-2">
        <NavItem 
          icon={<ShoppingCart className="w-5 h-5 mb-1" />} 
          label="Shop" 
          path="/" 
          isActive={isActive("/")} 
        />
        <NavItem 
          icon={<Box className="w-5 h-5 mb-1" />} 
          label="Open Packs" 
          path="/open-pack" 
          isActive={isActive("/open-pack")} 
        />
        <NavItem 
          icon={<FolderOpen className="w-5 h-5 mb-1" />} 
          label="Collection" 
          path="/collection" 
          isActive={isActive("/collection")} 
        />
        <NavItem 
          icon={<Sparkles className="w-5 h-5 mb-1" />} 
          label="Holo Demo" 
          path="/holo-demo" 
          isActive={isActive("/holo-demo")} 
        />
      </div>
    </nav>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
}

function NavItem({ icon, label, path, isActive }: NavItemProps) {
  return (
    <Link href={path}>
      <div className={cn(
        "flex flex-col items-center py-2 px-4 min-w-[64px] min-h-[64px] touch-ripple cursor-pointer transition-all duration-300 relative",
        isActive 
          ? "text-primary" 
          : "text-gray-400 hover:text-gray-200"
      )}>
        <div className={cn(
          "absolute -top-1.5 w-6 h-1 rounded-full transition-all duration-300",
          isActive ? "bg-primary" : "bg-transparent"
        )}></div>
        {icon}
        <span className={cn(
          "text-xs font-medium transition-all duration-300",
          isActive ? "text-white" : "text-gray-400"
        )}>{label}</span>
      </div>
    </Link>
  );
}
