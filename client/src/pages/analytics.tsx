import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Users, Briefcase, Calendar, Filter, Download, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ReactNode;
  description?: string;
}

function MetricCard({ title, value, change, trend = "neutral", icon, description }: MetricCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600 dark:text-green-400";
      case "down":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="p-2 bg-muted rounded-lg">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${getTrendColor()}`}>
            {change}
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface ChartPlaceholderProps {
  title: string;
  height?: string;
  type: "line" | "bar" | "pie" | "area";
}

function ChartPlaceholder({ title, height = "h-80", type }: ChartPlaceholderProps) {
  const getChartIcon = () => {
    switch (type) {
      case "line":
        return <TrendingUp className="h-12 w-12 text-muted-foreground" />;
      case "bar":
        return <BarChart3 className="h-12 w-12 text-muted-foreground" />;
      case "pie":
        return <div className="h-12 w-12 rounded-full border-4 border-muted-foreground" />;
      case "area":
        return <BarChart3 className="h-12 w-12 text-muted-foreground" />;
    }
  };

  return (
    <div className={`${height} flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-lg bg-muted/10`}>
      {getChartIcon()}
      <h3 className="mt-4 text-lg font-semibold text-muted-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">Chart will be rendered here</p>
    </div>
  );
}

export default function Analytics() {
  const [dateRange, setDateRange] = useState("30d");
  const [selectedMetrics, setSelectedMetrics] = useState("recruitment");
  const [isCustomReportOpen, setIsCustomReportOpen] = useState(false);

  // Mock data - replace with actual API calls
  const mockMetrics = {
    totalJobs: 156,
    activeJobs: 89,
    totalApplications: 2847,
    hiredCandidates: 42,
    avgTimeToHire: "18 days",
    applicationConversion: "12.8%",
  };

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["/api/analytics", { range: dateRange, metrics: selectedMetrics }],
    refetchOnWindowFocus: false,
  });

  return (
    <div className="space-y-6">
      {/* Modern 21st.dev Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <BarChart3 className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Analytics</h1>
            <p className="text-muted-foreground">Track recruitment performance and insights</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32" data-testid="select-date-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCustomReportOpen} onOpenChange={setIsCustomReportOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-custom-report">
                <Plus className="h-4 w-4 mr-2" />
                Custom Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create Custom Report</DialogTitle>
              </DialogHeader>
              <div className="p-4 text-center text-muted-foreground">
                Custom report builder will be implemented here
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Jobs Posted"
          value={mockMetrics.totalJobs}
          change="+12% from last period"
          trend="up"
          icon={<Briefcase className="h-5 w-5 text-blue-600" />}
          description="All time job postings"
        />
        <MetricCard
          title="Active Jobs"
          value={mockMetrics.activeJobs}
          change="+5% from last period"
          trend="up"
          icon={<Calendar className="h-5 w-5 text-green-600" />}
          description="Currently open positions"
        />
        <MetricCard
          title="Total Applications"
          value={mockMetrics.totalApplications.toLocaleString()}
          change="+8% from last period"
          trend="up"
          icon={<Users className="h-5 w-5 text-purple-600" />}
          description="All time applications"
        />
        <MetricCard
          title="Successful Hires"
          value={mockMetrics.hiredCandidates}
          change="+15% from last period"
          trend="up"
          icon={<TrendingUp className="h-5 w-5 text-orange-600" />}
          description="Candidates hired"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Average Time to Hire</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.avgTimeToHire}</div>
            <div className="flex items-center mt-2">
              <Progress value={65} className="flex-1" />
              <span className="text-sm text-muted-foreground ml-2">Target: 15 days</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Application Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.applicationConversion}</div>
            <div className="flex items-center mt-2">
              <Progress value={78} className="flex-1" />
              <span className="text-sm text-muted-foreground ml-2">Industry avg: 10%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top Performing Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Senior Developer</span>
                <Badge variant="secondary">45 applications</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Product Manager</span>
                <Badge variant="secondary">32 applications</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">UX Designer</span>
                <Badge variant="secondary">28 applications</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs value={selectedMetrics} onValueChange={setSelectedMetrics}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recruitment" data-testid="tab-recruitment">Recruitment</TabsTrigger>
          <TabsTrigger value="performance" data-testid="tab-performance">Performance</TabsTrigger>
          <TabsTrigger value="sources" data-testid="tab-sources">Sources</TabsTrigger>
          <TabsTrigger value="trends" data-testid="tab-trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="recruitment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Applications Over Time</CardTitle>
                <CardDescription>Daily application volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder title="Application Timeline" type="line" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hiring Funnel</CardTitle>
                <CardDescription>Conversion through recruitment stages</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder title="Recruitment Funnel" type="bar" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Job Performance Comparison</CardTitle>
              <CardDescription>Applications per job posting</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartPlaceholder title="Job Performance" type="bar" height="h-96" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Time to Hire Distribution</CardTitle>
                <CardDescription>Days from posting to hire</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder title="Time to Hire" type="bar" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recruiter Performance</CardTitle>
                <CardDescription>Successful hires by recruiter</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder title="Recruiter Metrics" type="pie" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Sources</CardTitle>
                <CardDescription>Where candidates find our jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder title="Application Sources" type="pie" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Source Quality</CardTitle>
                <CardDescription>Hire rate by source</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder title="Source Conversion" type="bar" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Hiring Trends</CardTitle>
                <CardDescription>Hires and applications by month</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder title="Monthly Trends" type="line" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seasonal Patterns</CardTitle>
                <CardDescription>Application volume patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder title="Seasonal Analysis" type="area" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}