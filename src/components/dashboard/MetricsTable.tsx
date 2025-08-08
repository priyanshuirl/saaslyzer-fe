
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DashboardData, SegmentedMetrics } from "../../types";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Download } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";

/**
 * MetricsTable Component
 * 
 * Displays detailed metrics in a sortable table format with pagination.
 * Used for showing metrics broken down by segment (country or plan).
 * 
 * @param {DashboardData | null} data - The dashboard data containing metrics
 * @param {"country" | "plan"} segmentType - The type of segmentation to display
 * @param {string} title - The table title
 * @param {Function} onExportCsv - Function to export table data as CSV
 */
interface MetricsTableProps {
  data: DashboardData | null;
  segmentType: "country" | "plan";
  title: string;
  onExportCsv: () => void;
}

/**
 * Format a number as currency with the specified currency code
 * 
 * @param {number} value - The value to format
 * @param {string} currency - The currency code (e.g., "USD")
 * @returns {string} Formatted currency string
 */
const formatCurrency = (value: number, currency: string = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format a number with thousands separators
 * 
 * @param {number} value - The value to format
 * @returns {string} Formatted number string
 */
const formatNumber = (value: number) => {
  return new Intl.NumberFormat("en-US").format(value);
};

const ITEMS_PER_PAGE = 20;

const MetricsTable = ({ data, segmentType, title, onExportCsv }: MetricsTableProps) => {
  // State for table sorting
  const [sortField, setSortField] = useState<string>("mrr");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  // State for pagination
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Guard clause if no data is available
  if (!data) return null;

  // Get the appropriate segment data based on the segmentType
  const segmentData = segmentType === "country" ? data.by_country : data.by_plan;
  
  // Convert the segmented data to an array for sorting and display
  const tableData = Object.entries(segmentData).map(([segment, metrics]) => ({
    segment,  // Country name or plan name
    ...metrics, // All metric values for this segment
  }));

  // Sort the table data based on the current sort field and direction
  const sortedData = [...tableData].sort((a, b) => {
    const aValue = a[sortField as keyof typeof a];
    const bValue = b[sortField as keyof typeof b];
    
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = sortedData.slice(startIndex, endIndex);

  /**
   * Handle column header click to change sort
   * 
   * @param {string} field - The field to sort by
   */
  const handleSort = (field: string) => {
    if (field === sortField) {
      // If clicking the same field, toggle the direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // If clicking a different field, sort by that field in descending order
      setSortField(field);
      setSortDirection("desc");
    }
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  /**
   * Generate pagination items based on current page and total pages
   */
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    // Always show first page
    items.push(
      <PaginationItem key="page-1">
        <PaginationLink 
          isActive={currentPage === 1} 
          onClick={() => setCurrentPage(1)}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Calculate start and end of pagination range
    let startPage = Math.max(2, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 2);
    
    // Adjust if we're near the beginning
    if (currentPage < 4) {
      endPage = Math.min(totalPages - 1, maxVisiblePages);
    }
    
    // Adjust if we're near the end
    if (currentPage > totalPages - 3) {
      startPage = Math.max(2, totalPages - maxVisiblePages + 1);
    }
    
    // Show ellipsis after first page if needed
    if (startPage > 2) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Add pages in the middle
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={`page-${i}`}>
          <PaginationLink 
            isActive={currentPage === i} 
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Show ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={`page-${totalPages}`}>
          <PaginationLink 
            isActive={currentPage === totalPages} 
            onClick={() => setCurrentPage(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {/* CSV Export button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-1" 
          onClick={onExportCsv}
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {/* Segment header (Country or Plan) */}
                <TableHead>{segmentType === "country" ? "Country" : "Plan"}</TableHead>
                
                {/* MRR column with sort button */}
                <TableHead>
                  <button
                    onClick={() => handleSort("mrr")}
                    className="flex items-center space-x-1"
                  >
                    <span>MRR</span>
                    {sortField === "mrr" && (
                      sortDirection === "asc" ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                
                {/* ARR column with sort button */}
                <TableHead>
                  <button
                    onClick={() => handleSort("arr")}
                    className="flex items-center space-x-1"
                  >
                    <span>ARR</span>
                    {sortField === "arr" && (
                      sortDirection === "asc" ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                
                {/* LTV column with sort button */}
                <TableHead>
                  <button
                    onClick={() => handleSort("ltv")}
                    className="flex items-center space-x-1"
                  >
                    <span>LTV</span>
                    {sortField === "ltv" && (
                      sortDirection === "asc" ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                
                {/* Active Subscriptions column with sort button */}
                <TableHead>
                  <button
                    onClick={() => handleSort("active_subscriptions")}
                    className="flex items-center space-x-1"
                  >
                    <span>Active</span>
                    {sortField === "active_subscriptions" && (
                      sortDirection === "asc" ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Table rows with data - just show current page */}
              {currentData.map((row) => (
                <TableRow key={row.segment}>
                  <TableCell className="font-medium">{row.segment}</TableCell>
                  <TableCell>{formatCurrency(row.mrr, row.currency)}</TableCell>
                  <TableCell>{formatCurrency(row.arr, row.currency)}</TableCell>
                  <TableCell>{formatCurrency(row.ltv, row.currency)}</TableCell>
                  <TableCell>{formatNumber(row.active_subscriptions)}</TableCell>
                </TableRow>
              ))}
              
              {/* Show message when no data */}
              {currentData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {/* Only show pagination if there are multiple pages */}
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      aria-disabled={currentPage === 1}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {renderPaginationItems()}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      aria-disabled={currentPage === totalPages}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              
              <div className="text-xs text-center mt-2 text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, sortedData.length)} of {sortedData.length} items
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricsTable;
