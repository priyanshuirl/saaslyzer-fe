
import React from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MainLayout from '@/components/layout/MainLayout';

export default function Docs() {
  // Fetch the markdown content
  const changelogContent = `
# Changelog

All notable changes to the SaaSlyzer project will be documented in this file.

## [Unreleased]

## [0.1.0] - 2025-04-23

### Added
- Initial project setup with React, Vite, TypeScript, and Tailwind CSS
- Landing page with responsive design
- Authentication system with login and signup functionality
- Dashboard structure with metrics visualization
- Stripe integration for payment processing
- Settings page for user account management

### Changed
- Updated the landing page features section UI
- Removed drop-shadow from feature titles for cleaner appearance
- Standardized icon gradients across all feature cards

### Fixed
- Fixed text-md class error in CSS
  `;

  const roadmapContent = `
# SaaSlyzer Roadmap

This document outlines the planned features and improvements for the SaaSlyzer platform.

## Short-term Goals (Next 1-3 Months)

### Core Features
- [ ] Enhance dashboard with real-time data updates
- [ ] Implement advanced filtering options for metrics
- [ ] Add CSV export functionality for all metrics data
- [ ] Create user onboarding flow for new customers

### UI/UX Improvements
- [ ] Optimize mobile responsiveness across all pages
- [ ] Implement dark mode toggle with system preference detection
- [ ] Add loading states and better error handling

### Integrations
- [ ] Complete Stripe integration for subscription management
- [ ] Add integration with popular CRM platforms
- [ ] Implement email notification system for important metrics changes

## Mid-term Goals (3-6 Months)

### Advanced Analytics
- [ ] Implement cohort analysis for customer segments
- [ ] Create prediction models for churn and LTV
- [ ] Build customizable dashboard widgets

### Team Features
- [ ] Add team collaboration with multiple user accounts
- [ ] Implement role-based permissions system
- [ ] Create team activity logs and audit trails

### Expansion
- [ ] Add support for multiple currencies
- [ ] Implement localization for at least 3 languages
- [ ] Create API documentation for developers

## Long-term Goals (6+ Months)

### Enterprise Features
- [ ] Build white-label solution for agencies
- [ ] Implement enterprise-grade security features
- [ ] Create advanced reporting system with scheduled reports

### Platform Growth
- [ ] Develop marketplace for third-party integrations
- [ ] Create affiliate and referral programs
- [ ] Build mobile apps for iOS and Android

### Infrastructure
- [ ] Optimize performance for large datasets
- [ ] Implement advanced caching strategies
- [ ] Enhance scalability for enterprise customers
  `;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">SaaSlyzer Documentation</h1>
          <p className="text-muted-foreground">
            Track the evolution of our SaaS analytics platform
          </p>
          <div className="mt-4">
            <Link to="/dashboard" className="text-primary hover:underline">
              Back to Dashboard
            </Link>
          </div>
        </div>

        <Tabs defaultValue="changelog" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="changelog">Changelog</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          </TabsList>
          <TabsContent value="changelog">
            <Card>
              <CardHeader>
                <CardTitle>Changelog</CardTitle>
                <CardDescription>A history of updates and changes to SaaSlyzer</CardDescription>
              </CardHeader>
              <CardContent className="prose">
                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md overflow-auto max-h-[70vh] font-mono">
                  {changelogContent}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="roadmap">
            <Card>
              <CardHeader>
                <CardTitle>Roadmap</CardTitle>
                <CardDescription>Upcoming features and planned improvements</CardDescription>
              </CardHeader>
              <CardContent className="prose">
                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md overflow-auto max-h-[70vh] font-mono">
                  {roadmapContent}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
