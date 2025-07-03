import { useState, useEffect } from "react";
import { KpiCard } from "@/components/KpiCard";
import { JiraConnectionForm } from "@/components/JiraConnectionForm";
import { SprintSelector } from "@/components/SprintSelector";
import { useJiraApi } from "@/hooks/useJiraApi";
import { BarChart3, Target, TrendingUp, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface Sprint {
  id: number;
  name: string;
  state: "active" | "closed" | "future";
  startDate?: string;
  endDate?: string;
}

interface SprintData {
  committedIssues: number;
  completedIssues: number;
  storyPointsCommitted: number;
  storyPointsCompleted: number;
  overspillIssues: number;
  overspillStoryPoints: number;
  velocity: number;
}

const Index = () => {
  const { isConnected, isLoading, connect, fetchSprints, fetchSprintData } = useJiraApi();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [sprintData, setSprintData] = useState<SprintData | null>(null);

  const handleConnect = async (config: any) => {
    connect(config);
    // Fetch sprints after connecting
    const fetchedSprints = await fetchSprints();
    setSprints(fetchedSprints);
  };

  const handleSprintSelect = async (sprint: Sprint) => {
    setSelectedSprint(sprint);
    const data = await fetchSprintData(sprint.id);
    setSprintData(data);
  };

  const handleRefreshSprints = async () => {
    const fetchedSprints = await fetchSprints();
    setSprints(fetchedSprints);
  };

  useEffect(() => {
    if (isConnected) {
      handleRefreshSprints();
    }
  }, [isConnected]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Jira Sprint KPI Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your sprint metrics including velocity, overspill, and commitment accuracy
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Connection Form */}
          <div className="lg:col-span-1">
            <JiraConnectionForm onConnect={handleConnect} isConnected={isConnected} />
          </div>

          {/* Sprint Selector */}
          {isConnected && (
            <div className="lg:col-span-2">
              <SprintSelector
                sprints={sprints}
                selectedSprint={selectedSprint}
                onSprintSelect={handleSprintSelect}
                onRefresh={handleRefreshSprints}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>

        {/* KPI Cards */}
        {selectedSprint && sprintData && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">
              Sprint Metrics for {selectedSprint.name}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Committed Issues */}
              <KpiCard
                title="Issues Committed"
                value={sprintData.committedIssues}
                subtitle={`${sprintData.completedIssues} completed`}
                icon={<Target className="h-5 w-5" />}
                trend="neutral"
              />

              {/* Story Points Velocity */}
              <KpiCard
                title="Story Points Velocity"
                value={sprintData.velocity}
                subtitle={`${sprintData.storyPointsCommitted} committed`}
                icon={<TrendingUp className="h-5 w-5" />}
                trend="up"
              />

              {/* Completion Rate */}
              <KpiCard
                title="Completion Rate"
                value={`${Math.round((sprintData.completedIssues / sprintData.committedIssues) * 100)}%`}
                subtitle={`${sprintData.completedIssues}/${sprintData.committedIssues} issues`}
                icon={<CheckCircle2 className="h-5 w-5" />}
                trend={sprintData.completedIssues === sprintData.committedIssues ? "up" : "neutral"}
              />

              {/* Overspill Issues */}
              <KpiCard
                title="Overspill Issues"
                value={sprintData.overspillIssues}
                subtitle={sprintData.overspillIssues === 0 ? "Perfect sprint!" : "Issues not completed"}
                icon={<AlertTriangle className="h-5 w-5" />}
                trend={sprintData.overspillIssues === 0 ? "up" : "down"}
              />

              {/* Overspill Story Points */}
              <KpiCard
                title="Overspill Story Points"
                value={sprintData.overspillStoryPoints}
                subtitle={sprintData.overspillStoryPoints === 0 ? "All points delivered!" : "Points not delivered"}
                icon={<Clock className="h-5 w-5" />}
                trend={sprintData.overspillStoryPoints === 0 ? "up" : "down"}
              />

              {/* Sprint Health Score */}
              <KpiCard
                title="Sprint Health Score"
                value={`${Math.round(((sprintData.storyPointsCompleted / sprintData.storyPointsCommitted) * 100))}%`}
                subtitle="Story points completion rate"
                icon={<BarChart3 className="h-5 w-5" />}
                trend={sprintData.storyPointsCompleted === sprintData.storyPointsCommitted ? "up" : "neutral"}
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {isConnected && !selectedSprint && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Select a Sprint</h3>
            <p className="text-muted-foreground">
              Choose a sprint from the dropdown above to view its KPI metrics
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
