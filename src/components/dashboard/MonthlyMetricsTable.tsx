
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, RefreshCw } from "lucide-react";

interface MonthlyData {
  month: string;
  year: number;
  total_subscriptions: number;
  total_mrr: number;
  total_arr: number;
  countries: string[];
}

const MonthlyMetricsTable = () => {
  const { authState } = useAuth();
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMonthlyBreakdown = async () => {
    if (!authState.user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('monthly-breakdown', {
        body: { user_id: authState.user.id }
      });

      if (error) {
        console.error('Error fetching monthly breakdown:', error);
        return;
      }

      setMonthlyData(data.monthlyData || []);
    } catch (error) {
      console.error('Error fetching monthly breakdown:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyBreakdown();
  }, [authState.user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Monthly Metrics Breakdown
        </CardTitle>
        <Button
          onClick={fetchMonthlyBreakdown}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading monthly data...</div>
        ) : monthlyData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No monthly data available. Try syncing your data first.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead className="text-right">Subscriptions</TableHead>
                  <TableHead className="text-right">MRR</TableHead>
                  <TableHead className="text-right">ARR</TableHead>
                  <TableHead>Countries</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.month}</TableCell>
                    <TableCell>{row.year}</TableCell>
                    <TableCell className="text-right">{row.total_subscriptions}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.total_mrr)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.total_arr)}</TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {row.countries.slice(0, 3).join(', ')}
                        {row.countries.length > 3 && ` (+${row.countries.length - 3} more)`}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyMetricsTable;
