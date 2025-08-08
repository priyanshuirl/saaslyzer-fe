
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

interface FilterBarProps {
  selectedCountry: string | null;
  selectedPlan: string | null;
  availableCountries: string[];
  availablePlans: string[];
  onCountryChange: (value: string | null) => void;
  onPlanChange: (value: string | null) => void;
}

const FilterBar = ({
  selectedCountry,
  selectedPlan,
  availableCountries,
  availablePlans,
  onCountryChange,
  onPlanChange,
}: FilterBarProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className="p-3 sm:p-4 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 items-center">
      <div className="w-full sm:w-auto">
        <Select
          value={selectedCountry || "all_countries"}
          onValueChange={(value) => onCountryChange(value === "all_countries" ? null : value)}
        >
          <SelectTrigger className="w-full sm:w-[140px] md:w-[180px]">
            <SelectValue placeholder="All Countries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_countries">All Countries</SelectItem>
            {availableCountries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-auto">
        <Select
          value={selectedPlan || "all_plans"}
          onValueChange={(value) => onPlanChange(value === "all_plans" ? null : value)}
        >
          <SelectTrigger className="w-full sm:w-[140px] md:w-[180px]">
            <SelectValue placeholder="All Plans" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_plans">All Plans</SelectItem>
            {availablePlans.map((plan) => (
              <SelectItem key={plan} value={plan}>
                {plan}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
};

export default FilterBar;
