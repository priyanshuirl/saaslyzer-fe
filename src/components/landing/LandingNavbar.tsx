
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function LandingNavbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 backdrop-blur-md bg-white/80 shadow-lg border-b border-purple-100">
      <div className="flex items-center gap-2">
        <span className="rounded-lg px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-700 text-white text-2xl font-extrabold tracking-tight shadow-md">
          Saaslyzer
        </span>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/login" className="text-purple-700 hover:text-purple-900 hover:underline font-medium">
          Login
        </Link>
        <Button className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-md" asChild>
          <Link to="/signup">Get Started</Link>
        </Button>
      </div>
    </nav>
  );
}
