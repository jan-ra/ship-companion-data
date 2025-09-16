"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileJson, AlertTriangle } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function JsonUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data, loadData, loadStoredData, hasStoredData, loading, error } = useData();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleFileSelect = () => {
    if (data) {
      // If data exists, show confirmation modal
      setShowConfirmation(true);
    } else {
      // If no data exists, directly open file picker
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (data) {
      // If data exists, store the file and show confirmation
      setPendingFile(file);
      setShowConfirmation(true);
    } else {
      // If no data exists, load directly
      loadFile(file);
    }
  };

  const loadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        loadData(content);
      } catch (error) {
        console.error("Error reading file:", error);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmOverwrite = () => {
    if (pendingFile) {
      loadFile(pendingFile);
    } else {
      fileInputRef.current?.click();
    }
    setShowConfirmation(false);
    setPendingFile(null);
  };

  const handleCancelOverwrite = () => {
    setShowConfirmation(false);
    setPendingFile(null);
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLoadExistingData = () => {
    loadStoredData(); // Load from localStorage
  };

  return (
    <>
      {!data ? (
        // Show upload button and conditionally show load existing data button
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleFileSelect}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {loading ? "Loading..." : "Upload Data File"}
            </Button>

            {hasStoredData() && (
              <>
                <span className="text-xs text-muted-foreground">or</span>
                <Button onClick={handleLoadExistingData} disabled={loading} variant="outline">
                  <FileJson className="w-4 h-4 mr-2" />
                  Load Existing Data
                </Button>
              </>
            )}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
            Upload your data file (e.g., <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">app-data-20250916143045.json</code>) provided by Jan through Google Drive.
          </p>
        </div>
      ) : (
        // Show upload button only if data is already loaded
        <Button
          onClick={handleFileSelect}
          disabled={loading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {loading ? "Loading..." : "Upload new file"}
        </Button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Replace Current Data?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You currently have data loaded that will be completely replaced.
              </p>
              <p className="font-medium text-foreground">
                Consider exporting your current changes first to avoid losing
                any work.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelOverwrite}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmOverwrite}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Replace Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {error && (
        <div className="absolute top-full left-0 mt-1 text-sm text-destructive bg-destructive/10 p-2 rounded z-10 min-w-[200px]">
          Error: {error}
        </div>
      )}
    </>
  );
}
