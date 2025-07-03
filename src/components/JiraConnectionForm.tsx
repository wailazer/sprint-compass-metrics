import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Eye, EyeOff } from "lucide-react";

interface JiraConfig {
  domain: string;
  email: string;
  apiToken: string;
}

interface JiraConnectionFormProps {
  onConnect: (config: JiraConfig) => void;
  isConnected: boolean;
}

export const JiraConnectionForm = ({ onConnect, isConnected }: JiraConnectionFormProps) => {
  const [config, setConfig] = useState<JiraConfig>({
    domain: "",
    email: "",
    apiToken: "",
  });
  const [showToken, setShowToken] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (config.domain && config.email && config.apiToken) {
      onConnect(config);
    }
  };

  const handleInputChange = (field: keyof JiraConfig) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig(prev => ({ ...prev, [field]: e.target.value }));
  };

  if (isConnected) {
    return (
      <Alert className="border-success bg-success/5">
        <Settings className="h-4 w-4" />
        <AlertDescription>
          Connected to Jira successfully. You can now fetch sprint data.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Connect to Jira
        </CardTitle>
        <CardDescription>
          Enter your Jira credentials to fetch sprint KPIs. Your credentials are stored locally in your browser.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="domain">Jira Domain</Label>
            <Input
              id="domain"
              placeholder="yourcompany.atlassian.net"
              value={config.domain}
              onChange={handleInputChange("domain")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@company.com"
              value={config.email}
              onChange={handleInputChange("email")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiToken">API Token</Label>
            <div className="relative">
              <Input
                id="apiToken"
                type={showToken ? "text" : "password"}
                placeholder="Your Jira API token"
                value={config.apiToken}
                onChange={handleInputChange("apiToken")}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <Button type="submit" className="w-full">
            Connect to Jira
          </Button>
        </form>
        
        <Alert className="mt-4">
          <AlertDescription className="text-xs">
            <strong>How to get your API token:</strong><br />
            1. Go to Atlassian Account Settings<br />
            2. Click on "Security" tab<br />
            3. Create and manage API tokens<br />
            4. Create a new token and copy it here
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};