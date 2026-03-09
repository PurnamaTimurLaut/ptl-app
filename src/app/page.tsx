"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import LoginScreen from "@/components/LoginScreen";
import DivisionDashboard from "@/components/DivisionDashboard";
import BatchesScreen from "@/components/operational/BatchesScreen";
import BatchDetailScreen from "@/components/operational/BatchDetailScreen";
import ProjectsScreen from "@/components/director/ProjectsScreen";
import AddProjectScreen from "@/components/director/AddProjectScreen";
import ProjectDetailScreen from "@/components/director/ProjectDetailScreen";

type AppView = "dashboard" | "operational_batches" | "operational_batch_detail" | "director_projects" | "director_add_project" | "director_project_detail";

export default function AppRouter() {
  const { data: session, status } = useSession();
  const [currentView, setCurrentView] = useState<AppView>("dashboard");
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  if (status === "loading") {
    return <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex items-center justify-center">Loading...</div>;
  }

  // NextAuth Session Check: If no session, enforce login screen.
  if (!session) {
    return (
      <main className="bg-[var(--color-ios-gray-6)] min-h-screen">
        <LoginScreen />
      </main>
    );
  }

  const handleLogout = () => {
    signOut();
  };

  const navigateToDepartment = (departmentId: string) => {
    if (departmentId === 'operational') {
      setCurrentView("operational_batches");
    } else if (departmentId === 'director') {
      setCurrentView("director_projects");
    }
  };

  const handleViewBatch = (batchId: number) => {
    setSelectedBatchId(batchId);
    setCurrentView("operational_batch_detail");
  };

  const handleBackToBatches = () => {
    setSelectedBatchId(null);
    setCurrentView("operational_batches");
  };

  const handleViewProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentView("director_project_detail");
  };

  return (
    <main className="bg-[var(--color-ios-gray-6)] min-h-screen">
      {currentView === "dashboard" && (
        <DivisionDashboard 
          userName={session.user?.name || "User"} 
          role={session.user?.role?.toUpperCase() || "STAFF"} 
          onLogout={handleLogout} 
          onNavigate={navigateToDepartment}
        />
      )}

      {currentView === "operational_batches" && (
        <BatchesScreen onViewBatch={handleViewBatch} />
      )}

      {currentView === "operational_batch_detail" && selectedBatchId && (
        <BatchDetailScreen batchId={selectedBatchId} onBack={handleBackToBatches} />
      )}

      {currentView === "director_projects" && (
        <ProjectsScreen 
           onAddProject={() => setCurrentView("director_add_project")} 
           onViewProject={handleViewProject}
        />
      )}

      {currentView === "director_add_project" && (
        <AddProjectScreen 
           onBack={() => setCurrentView("director_projects")} 
           onCreate={() => setCurrentView("director_projects")} 
        />
      )}

      {currentView === "director_project_detail" && selectedProjectId && (
        <ProjectDetailScreen 
           projectId={selectedProjectId} 
           onBack={() => setCurrentView("director_projects")} 
        />
      )}
    </main>
  );
}
