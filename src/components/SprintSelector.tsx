import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Calendar } from "lucide-react";

interface Sprint {
  id: number;
  name: string;
  state: "active" | "closed" | "future";
  startDate?: string;
  endDate?: string;
}

interface SprintSelectorProps {
  sprints: Sprint[];
  selectedSprint: Sprint | null;
  onSprintSelect: (sprint: Sprint) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const SprintSelector = ({ 
  sprints, 
  selectedSprint, 
  onSprintSelect, 
  onRefresh, 
  isLoading = false 
}: SprintSelectorProps) => {
  const getSprintStateColor = (state: Sprint['state']) => {
    switch (state) {
      case "active":
        return "text-success";
      case "closed":
        return "text-muted-foreground";
      case "future":
        return "text-info";
      default:
        return "text-muted-foreground";
    }
  };

  const getSprintStateText = (state: Sprint['state']) => {
    switch (state) {
      case "active":
        return "Active";
      case "closed":
        return "Completed";
      case "future":
        return "Future";
      default:
        return "Unknown";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Sprint Selection
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select
            value={selectedSprint?.id.toString() || ""}
            onValueChange={(value) => {
              const sprint = sprints.find(s => s.id.toString() === value);
              if (sprint) onSprintSelect(sprint);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a sprint" />
            </SelectTrigger>
            <SelectContent>
              {sprints.map((sprint) => (
                <SelectItem key={sprint.id} value={sprint.id.toString()}>
                  <div className="flex items-center justify-between w-full">
                    <span>{sprint.name}</span>
                    <span className={`text-xs ml-2 ${getSprintStateColor(sprint.state)}`}>
                      {getSprintStateText(sprint.state)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedSprint && (
            <div className="p-3 bg-accent rounded-lg">
              <div className="text-sm font-medium">{selectedSprint.name}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Status: <span className={getSprintStateColor(selectedSprint.state)}>
                  {getSprintStateText(selectedSprint.state)}
                </span>
              </div>
              {selectedSprint.startDate && selectedSprint.endDate && (
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(selectedSprint.startDate).toLocaleDateString()} - {new Date(selectedSprint.endDate).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};