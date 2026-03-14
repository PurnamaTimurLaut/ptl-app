"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import DivisionDashboard from "@/components/DivisionDashboard";
import ProductionScreen from "@/components/operational/ProductionScreen";
import ProductionDetailScreen from "@/components/operational/ProductionDetailScreen";
import ProjectsScreen from "@/components/director/ProjectsScreen";
import AddProjectScreen from "@/components/director/AddProjectScreen";
import ProjectDetailScreen from "@/components/director/ProjectDetailScreen";
import RecipesScreen from "@/components/operational/RecipesScreen";
import TemplateDetailScreen from "@/components/operational/RecipeDetailScreen";
import RecipeDetailScreen from "@/components/operational/RecipeDetailNewScreen";
import InventoryScreen from "@/components/inventory/InventoryScreen";
import InventoryDetailScreen from "@/components/inventory/InventoryDetailScreen";
import LoginScreen from "@/components/LoginScreen";
import SplashScreen from "@/components/SplashScreen";

type AppView = "dashboard" | "operational_production" | "operational_production_detail" | "operational_recipes" | "operational_recipe_detail" | "operational_cooking_recipe_detail" | "operational_inventory" | "operational_inventory_detail" | "director_projects" | "director_add_project" | "director_project_detail";

export default function AppRouter() {
  const { data: session, status } = useSession();
  const [hasEntered, setHasEntered] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>("dashboard");
  const [selectedProductionId, setSelectedProductionId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [selectedInventoryItemId, setSelectedInventoryItemId] = useState<string | null>(null);

  // console.log("Account Session Role:", session?.user?.role);

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;

  if (!hasEntered && !session) {
    return <SplashScreen onEnter={() => setHasEntered(true)} />;
  }

  if (!session) return <LoginScreen />;

  const handleLogout = () => signOut();

  const handleBackToProduction = () => {
    setSelectedProductionId(null);
    setCurrentView("operational_production");
  };

  const handleNavTabChange = (tab: 'production' | 'inventory' | 'schedules' | 'recipes') => {
    switch (tab) {
      case 'production': setCurrentView("operational_production"); break;
      case 'inventory': setCurrentView("operational_inventory"); break;
      case 'recipes': setCurrentView("operational_recipes"); break;
      default: setCurrentView("dashboard");
    }
  };

  const navigateToDepartment = (dept: string) => {
    const d = dept.toLowerCase();
    if (d === "operational") setCurrentView("operational_production");
    else if (d === "director") setCurrentView("director_projects");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center overflow-x-hidden">
      <div className="w-full max-w-md bg-gray-50 min-h-screen shadow-2xl relative flex flex-col">
        {currentView === "dashboard" && (
          <DivisionDashboard 
            userName={session.user?.name || "User"} 
            role={session.user?.role?.toUpperCase() || "STAFF"} 
            onLogout={handleLogout} 
            onNavigate={navigateToDepartment}
          />
        )}

        {currentView === "operational_production" && (
          <ProductionScreen 
            onProfileClick={() => setCurrentView("dashboard")} 
            onViewProduction={(id: string) => { setSelectedProductionId(id); setCurrentView("operational_production_detail"); }} 
            onNavTabChange={handleNavTabChange}
          />
        )}

        {currentView === "operational_production_detail" && selectedProductionId && (
          <ProductionDetailScreen productionId={selectedProductionId} onBack={handleBackToProduction} />
        )}

        {currentView === "operational_recipes" && (
          <RecipesScreen 
            onProfileClick={() => setCurrentView("dashboard")} 
            onViewTemplate={(id: string) => { setSelectedRecipeId(id); setCurrentView("operational_recipe_detail"); }}
            onViewRecipe={(id: string) => { setSelectedRecipeId(id); setCurrentView("operational_cooking_recipe_detail"); }}
            onNavTabChange={handleNavTabChange}
          />
        )}

        {currentView === "operational_recipe_detail" && selectedRecipeId && (
          <TemplateDetailScreen templateId={selectedRecipeId} onBack={() => setCurrentView("operational_recipes")} />
        )}

        {currentView === "operational_cooking_recipe_detail" && selectedRecipeId && (
          <RecipeDetailScreen recipeId={selectedRecipeId} onBack={() => setCurrentView("operational_recipes")} />
        )}

        {currentView === "operational_inventory" && (
          <InventoryScreen 
            onProfileClick={() => setCurrentView("dashboard")} 
            onViewItem={(id: string) => { setSelectedInventoryItemId(id); setCurrentView("operational_inventory_detail"); }}
            onNavTabChange={handleNavTabChange}
          />
        )}

        {currentView === "operational_inventory_detail" && selectedInventoryItemId && (
          <InventoryDetailScreen itemId={selectedInventoryItemId} onBack={() => setCurrentView("operational_inventory")} />
        )}

        {currentView === "director_projects" && (
          <ProjectsScreen 
            onProfileClick={() => setCurrentView("dashboard")} 
            onAddProject={() => setCurrentView("director_add_project")}
            onViewProject={(id: string) => { setSelectedProjectId(id); setCurrentView("director_project_detail"); }}
          />
        )}

        {currentView === "director_add_project" && (
          <AddProjectScreen onBack={() => setCurrentView("director_projects")} onCreate={() => setCurrentView("director_projects")} />
        )}

        {currentView === "director_project_detail" && selectedProjectId && (
          <ProjectDetailScreen projectId={selectedProjectId} onBack={() => setCurrentView("director_projects")} />
        )}
      </div>
    </div>
  );
}
