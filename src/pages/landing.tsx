
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingMain } from "@/components/landing/LandingMain";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-purple-100 flex flex-col">
      <LandingNavbar />
      <LandingMain />
      <LandingFooter />
    </div>
  );
}
