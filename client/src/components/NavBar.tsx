import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { ShoppingCart, Box, FolderOpen, Sparkles } from "lucide-react";

export default function NavBar() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="sticky bottom-0 bg-white dark:bg-gray-800 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-40">
      <div className="flex justify-around items-center py-1">
        <NavItem 
          icon={<ShoppingCart className="text-xl mb-1" />} 
          label="Shop" 
          path="/" 
          isActive={isActive("/")} 
        />
        <NavItem 
          icon={<Box className="text-xl mb-1" />} 
          label="Open Packs" 
          path="/open-pack" 
          isActive={isActive("/open-pack")} 
        />
        <NavItem 
          icon={<FolderOpen className="text-xl mb-1" />} 
          label="Collection" 
          path="/collection" 
          isActive={isActive("/collection")} 
        />
        <NavItem 
          icon={<Sparkles className="text-xl mb-1" />} 
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
        "flex flex-col items-center py-2 px-4 min-w-[64px] min-h-[64px] touch-ripple cursor-pointer",
        isActive ? "text-primary" : "text-gray-500 dark:text-gray-400"
      )}>
        {icon}
        <span className="text-xs">{label}</span>
      </div>
    </Link>
  );
}
