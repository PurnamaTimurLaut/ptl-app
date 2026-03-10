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
import SplashScreen from "@/components/SplashScreen";
import RecipesScreen from "@/components/operational/RecipesScreen";
import RecipeDetailScreen from "@/components/operational/RecipeDetailScreen";

type AppView = "dashboard" | "operational_batches" | "operational_batch_detail" | "operational_recipes" | "operational_recipe_detail" | "director_projects" | "director_add_project" | "director_project_detail";

export default function AppRouter() {
  const { data: session, status } = useSession();
  const [currentView, setCurrentView] = useState<AppView>("dashboard");
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [hasPassedSplash, setHasPassedSplash] = useState(false);

  if (status === "loading") {
    return <div className="min-h-screen bg-[var(--color-ios-gray-6)] flex items-center justify-center">Loading...</div>;
  }

  // NextAuth Session Check: If no session, enforce login screen.
  if (!session) {
    if (!hasPassedSplash) {
      return <SplashScreen onEnter={() => setHasPassedSplash(true)} />;
    }
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

  const handleNavTabChange = (tab: 'production' | 'inventory' | 'schedules' | 'recipes') => {
    if (tab === 'production') setCurrentView('operational_batches');
    else if (tab === 'recipes') setCurrentView('operational_recipes');
    // others can be added as they are built
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
        <BatchesScreen onViewBatch={handleViewBatch} onProfileClick={() => setCurrentView("dashboard")} onNavTabChange={handleNavTabChange} />
      )}

      {currentView === "operational_batch_detail" && selectedBatchId && (
        <BatchDetailScreen batchId={selectedBatchId} onBack={handleBackToBatches} />
      )}

      {currentView === "operational_recipes" && (
        <RecipesScreen 
           onProfileClick={() => setCurrentView("dashboard")} 
           onViewRecipe={(id) => { setSelectedRecipeId(id); setCurrentView("operational_recipe_detail"); }}
           onNavTabChange={handleNavTabChange}
        />
      )}

      {currentView === "operational_recipe_detail" && selectedRecipeId && (
        <RecipeDetailScreen recipeId={selectedRecipeId} onBack={() => setCurrentView("operational_recipes")} />
      )}

      {currentView === "director_projects" && (
        <ProjectsScreen 
           onAddProject={() => setCurrentView("director_add_project")} 
           onViewProject={handleViewProject}
           onProfileClick={() => setCurrentView("dashboard")}
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
