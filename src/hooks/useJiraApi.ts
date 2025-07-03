import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface JiraConfig {
  domain: string;
  email: string;
  apiToken: string;
}

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

export const useJiraApi = () => {
  const [config, setConfig] = useState<JiraConfig | null>(() => {
    const stored = localStorage.getItem("jiraConfig");
    return stored ? JSON.parse(stored) : null;
  });
  const [isConnected, setIsConnected] = useState(!!config);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const connect = useCallback((newConfig: JiraConfig) => {
    localStorage.setItem("jiraConfig", JSON.stringify(newConfig));
    setConfig(newConfig);
    setIsConnected(true);
    toast({
      title: "Connected",
      description: "Successfully connected to Jira",
    });
  }, [toast]);

  const disconnect = useCallback(() => {
    localStorage.removeItem("jiraConfig");
    setConfig(null);
    setIsConnected(false);
  }, []);

  const makeJiraRequest = useCallback(async (endpoint: string) => {
    if (!config) throw new Error("Not connected to Jira");
    
    const auth = btoa(`${config.email}:${config.apiToken}`);
    const url = `https://${config.domain}/rest/agile/1.0${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        "Authorization": `Basic ${auth}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Jira API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }, [config]);

  const fetchSprints = useCallback(async (boardId?: number): Promise<Sprint[]> => {
    if (!config) return [];
    
    setIsLoading(true);
    try {
      // If no boardId provided, get the first board
      let endpoint = "/board";
      if (boardId) {
        endpoint = `/board/${boardId}/sprint`;
      } else {
        const boardsResponse = await makeJiraRequest("/board");
        if (boardsResponse.values && boardsResponse.values.length > 0) {
          const firstBoard = boardsResponse.values[0];
          endpoint = `/board/${firstBoard.id}/sprint`;
        }
      }
      
      const response = await makeJiraRequest(endpoint);
      const sprints = response.values || [];
      
      return sprints.map((sprint: any) => ({
        id: sprint.id,
        name: sprint.name,
        state: sprint.state.toLowerCase(),
        startDate: sprint.startDate,
        endDate: sprint.endDate,
      }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sprints from Jira",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [config, makeJiraRequest, toast]);

  const fetchSprintData = useCallback(async (sprintId: number): Promise<SprintData | null> => {
    if (!config) return null;

    setIsLoading(true);
    try {
      // Get sprint details
      const sprintResponse = await makeJiraRequest(`/sprint/${sprintId}`);
      
      // Get issues for the sprint
      const issuesResponse = await makeJiraRequest(`/sprint/${sprintId}/issue`);
      const issues = issuesResponse.issues || [];

      // Calculate KPIs
      const committedIssues = issues.length;
      const completedIssues = issues.filter((issue: any) => 
        issue.fields.status.statusCategory.key === "done"
      ).length;

      const storyPointsCommitted = issues.reduce((sum: number, issue: any) => 
        sum + (issue.fields.customfield_10016 || 0), 0 // Story Points field
      );

      const storyPointsCompleted = issues
        .filter((issue: any) => issue.fields.status.statusCategory.key === "done")
        .reduce((sum: number, issue: any) => sum + (issue.fields.customfield_10016 || 0), 0);

      const overspillIssues = committedIssues - completedIssues;
      const overspillStoryPoints = storyPointsCommitted - storyPointsCompleted;
      const velocity = storyPointsCompleted;

      return {
        committedIssues,
        completedIssues,
        storyPointsCommitted,
        storyPointsCompleted,
        overspillIssues,
        overspillStoryPoints,
        velocity,
      };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sprint data from Jira",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [config, makeJiraRequest, toast]);

  return {
    config,
    isConnected,
    isLoading,
    connect,
    disconnect,
    fetchSprints,
    fetchSprintData,
  };
};