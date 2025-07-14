import { Link, useLocation } from "wouter";
import { Home, Sun, Link2 } from "lucide-react";

export default function BottomNavigation() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around items-center py-2">
          <Link href="/">
            <button className={`flex flex-col items-center py-2 px-4 ${
              isActive("/") ? "text-primary" : "text-gray-600"
            }`}>
              <Home className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">전체보기</span>
            </button>
          </Link>
          
          <button className="flex flex-col items-center py-2 px-4 text-gray-600">
            <Sun className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">여름추천</span>
          </button>
          
          <Link href="/admin">
            <button className={`flex flex-col items-center py-2 px-4 ${
              isActive("/admin") ? "text-primary" : "text-gray-600"
            }`}>
              <Link2 className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">관리</span>
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
