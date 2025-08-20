
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Database } from "lucide-react";

export function MockDataBanner() {
  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50">
      <Database className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <div className="flex items-center gap-2">
          <Info size={14} />
          <span className="font-medium">Demo Mode:</span>
          <span>This application is running with mock data to showcase all features. In production, this would connect to your Supabase database.</span>
        </div>
      </AlertDescription>
    </Alert>
  );
}
