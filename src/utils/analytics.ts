
/**
 * Utility functions for analytics data processing and export
 * 
 * This file contains helper functions for working with analytics data,
 * particularly for CSV export and data transformation.
 */

import { SegmentedMetrics } from "../types";

/**
 * Prepares segmented analytics data for CSV export
 * 
 * Takes segmented data (by country or plan) and transforms it into
 * a format suitable for CSV export
 * 
 * @param {SegmentedMetrics} data - The segmented metrics data
 * @param {string} segmentName - The name of the segment column (e.g., "Country" or "Plan")
 * @returns {Array<Object>} Array of objects formatted for CSV export
 */
export const prepareSegmentedDataForCsv = (data: SegmentedMetrics, segmentName: string) => {
  // Convert the segmented data to an array of records for CSV export
  return Object.entries(data).map(([segment, metrics]) => {
    return {
      // Add the segment as a named column (Country or Plan)
      [segmentName]: segment,
      
      // Add all metric values
      "MRR": metrics.mrr,
      "ARR": metrics.arr,
      "LTV": metrics.ltv,
      "Active Subscriptions": metrics.active_subscriptions,
      "Currency": metrics.currency,
    };
  });
};

/**
 * Exports data to CSV and triggers download in the browser
 * 
 * @param {Array<Object>} data - The data to export (array of objects)
 * @param {string} filename - The name of the CSV file to download
 */
export const exportToCsv = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.error("No data to export");
    return;
  }

  try {
    // Get headers from the first data object
    const headers = Object.keys(data[0]);
    
    // Create CSV header row
    const csvHeader = headers.join(",");
    
    // Create CSV rows from data
    const csvRows = data.map(row => {
      return headers
        .map(header => {
          // Format the value and handle special cases
          const value = row[header];
          
          // Handle strings that might contain commas by quoting them
          if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          
          return value;
        })
        .join(",");
    });
    
    // Combine header and rows
    const csvContent = [csvHeader, ...csvRows].join("\n");
    
    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    
    // Create a download link and trigger the download
    const link = document.createElement("a");
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    
    // Append link to document, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error exporting CSV:", error);
  }
};

/**
 * Formats a metric value for display, based on its type
 * 
 * @param {number} value - The value to format
 * @param {string} type - The type of metric ('currency' or 'number')
 * @param {string} currency - The currency code for currency values
 * @returns {string} Formatted value as string
 */
export const formatMetricValue = (value: number, type: 'currency' | 'number', currency = 'USD') => {
  if (type === 'currency') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(value);
  }
  
  return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Calculates percentage change between two values
 * 
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} Percentage change
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};
