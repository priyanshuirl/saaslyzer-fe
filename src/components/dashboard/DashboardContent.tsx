
import MetricsGrid from "./MetricsGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MetricsChart from "./MetricsChart";
import MetricsTable from "./MetricsTable";
import { DashboardData } from "@/types";
import { useState } from "react";
import { exportToCsv, prepareSegmentedDataForCsv } from "@/utils/analytics";
import { toast } from "@/components/ui/use-toast";

interface DashboardContentProps {
  dashboardData: DashboardData | null;
  isLoading: boolean;
}

const DashboardContent = ({ dashboardData, isLoading }: DashboardContentProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  const handleExportByCountry = () => {
    if (!dashboardData) return;
    
    const csvData = prepareSegmentedDataForCsv(dashboardData.by_country, "Country");
    exportToCsv(csvData, "saaslyzer-metrics-by-country.csv");
    
    toast({
      title: "Export successful",
      description: "Metrics by country have been exported to CSV",
    });
  };

  const handleExportByPlan = () => {
    if (!dashboardData) return;
    
    const csvData = prepareSegmentedDataForCsv(dashboardData.by_plan, "Plan");
    exportToCsv(csvData, "saaslyzer-metrics-by-plan.csv");
    
    toast({
      title: "Export successful",
      description: "Metrics by plan have been exported to CSV",
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 sm:p-4 lg:p-6 border border-purple-100 shadow-md">
        <MetricsGrid data={dashboardData} isLoading={isLoading} />
      </div>

      {/* Tabs for different views - removed monthly tab */}
      <Tabs 
        defaultValue="overview" 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="space-y-4 sm:space-y-6"
      >
        <TabsList className="bg-white/80 backdrop-blur-sm w-full grid grid-cols-3 rounded-lg border border-purple-100">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="by-country">By Country</TabsTrigger>
          <TabsTrigger value="by-plan">By Plan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {dashboardData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 sm:p-4 lg:p-6 border border-purple-100 shadow-md">
                <MetricsChart
                  data={dashboardData}
                  segmentType="country"
                  metricType="mrr"
                  title="MRR by Country"
                />
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 sm:p-4 lg:p-6 border border-purple-100 shadow-md">
                <MetricsChart
                  data={dashboardData}
                  segmentType="plan"
                  metricType="mrr"
                  title="MRR by Plan"
                />
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="by-country" className="space-y-4">
          {dashboardData && (
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 sm:p-4 lg:p-6 border border-purple-100 shadow-md">
              <MetricsTable
                data={dashboardData}
                segmentType="country"
                title="Metrics by Country"
                onExportCsv={handleExportByCountry}
              />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="by-plan" className="space-y-4">
          {dashboardData && (
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 sm:p-4 lg:p-6 border border-purple-100 shadow-md">
              <MetricsTable
                data={dashboardData}
                segmentType="plan"
                title="Metrics by Plan"
                onExportCsv={handleExportByPlan}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardContent;
