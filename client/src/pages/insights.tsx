import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Eye, Target, Users, Briefcase, Calendar, DollarSign, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InsightCard {
  id: string;
  title: string;
  description: string;
  type: "trend" | "alert" | "opportunity" | "performance";
  severity: "high" | "medium" | "low";
  metric: {
    value: string | number;
    change?: string;
    trend: "up" | "down" | "neutral";
  };
  recommendation?: string;
  category: string;
  timestamp: Date;
}

interface TrendAnalysis {
  metric: string;
  currentValue: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "neutral";
  prediction?: {
    nextPeriod: number;
    confidence: number;
  };
}

export default function Insights() {
  const [timeRange, setTimeRange] = useState("30d");
  const [category, setCategory] = useState("all");

  const { data: insightsData, isLoading } = useQuery({
    queryKey: ["/api/insights", { range: timeRange, category }],
    refetchOnWindowFocus: false,
  });

  // Mock insights data
  const mockInsights: InsightCard[] = [
    {
      id: "1",
      title: "Application Volume Surge",
      description: "Applications have increased by 45% compared to last month, primarily driven by remote job postings",
      type: "trend",
      severity: "high",
      metric: {
        value: "45%",
        change: "+12% vs last week",
        trend: "up"
      },
      recommendation: "Consider increasing recruiter capacity to handle the higher volume",
      category: "applications",
      timestamp: new Date("2024-01-20T10:30:00")
    },
    {
      id: "2", 
      title: "Low Conversion Rate Alert",
      description: "Senior Developer position has 234 applications but only 3% moved to interview stage",
      type: "alert",
      severity: "high",
      metric: {
        value: "3%",
        change: "-8% vs industry average",
        trend: "down"
      },
      recommendation: "Review job requirements and screening criteria. Consider expanding the candidate pool.",
      category: "conversion",
      timestamp: new Date("2024-01-19T14:15:00")
    },
    {
      id: "3",
      title: "Untapped Talent Source",
      description: "LinkedIn referrals show highest quality but represent only 12% of applications",
      type: "opportunity", 
      severity: "medium",
      metric: {
        value: "12%",
        change: "85% hire rate",
        trend: "up"
      },
      recommendation: "Invest more in LinkedIn sourcing and employee referral programs",
      category: "sources",
      timestamp: new Date("2024-01-18T09:45:00")
    },
    {
      id: "4",
      title: "Time-to-Hire Improvement",
      description: "Average time to hire decreased from 28 to 22 days across all positions",
      type: "performance",
      severity: "low",
      metric: {
        value: "22 days",
        change: "-6 days improvement",
        trend: "up"
      },
      category: "performance",
      timestamp: new Date("2024-01-17T16:20:00")
    }
  ];

  const mockTrends: TrendAnalysis[] = [
    {
      metric: "Total Applications",
      currentValue: 847,
      previousValue: 623,
      change: 224,
      changePercent: 35.9,
      trend: "up",
      prediction: {
        nextPeriod: 920,
        confidence: 78
      }
    },
    {
      metric: "Conversion Rate",
      currentValue: 8.2,
      previousValue: 11.5,
      change: -3.3,
      changePercent: -28.7,
      trend: "down",
      prediction: {
        nextPeriod: 9.1,
        confidence: 65
      }
    },
    {
      metric: "Time to Hire",
      currentValue: 22,
      previousValue: 28,
      change: -6,
      changePercent: -21.4,
      trend: "up",
      prediction: {
        nextPeriod: 20,
        confidence: 72
      }
    }
  ];

  const filteredInsights = mockInsights.filter(insight => 
    category === "all" || insight.category === category
  );

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "trend":
        return <TrendingUp className="h-4 w-4" />;
      case "alert":
        return <AlertTriangle className="h-4 w-4" />;
      case "opportunity":
        return <Target className="h-4 w-4" />;
      case "performance":
        return <Eye className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-l-red-500 bg-red-50 dark:bg-red-950/20";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20";
      case "low":
        return "border-l-green-500 bg-green-50 dark:bg-green-950/20";
      default:
        return "border-l-gray-500 bg-gray-50 dark:bg-gray-950/20";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <div className="h-3 w-3 rounded-full bg-gray-400" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">Insights</h1>
          <p className="text-muted-foreground">AI-powered recruitment insights and recommendations</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32" data-testid="select-time-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-40" data-testid="select-category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="applications">Applications</SelectItem>
              <SelectItem value="conversion">Conversion</SelectItem>
              <SelectItem value="sources">Sources</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insights Generated</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockInsights.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockInsights.filter(i => i.severity === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockInsights.filter(i => i.type === 'opportunity').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Growth opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              Prediction accuracy
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights" data-testid="tab-insights">Smart Insights</TabsTrigger>
          <TabsTrigger value="trends" data-testid="tab-trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="predictions" data-testid="tab-predictions">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {filteredInsights.map((insight) => (
            <Card key={insight.id} className={`border-l-4 ${getSeverityColor(insight.severity)}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-background">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold" data-testid={`text-insight-title-${insight.id}`}>
                        {insight.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {insight.type}
                        </Badge>
                        <Badge 
                          variant={insight.severity === "high" ? "destructive" : insight.severity === "medium" ? "default" : "secondary"}
                          className="text-xs capitalize"
                        >
                          {insight.severity} Priority
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(insight.metric.trend)}
                      <span className="text-lg font-bold" data-testid={`text-insight-metric-${insight.id}`}>
                        {insight.metric.value}
                      </span>
                    </div>
                    {insight.metric.change && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {insight.metric.change}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="mb-4" data-testid={`text-insight-description-${insight.id}`}>
                  {insight.description}
                </CardDescription>
                {insight.recommendation && (
                  <div className="bg-background/50 rounded-lg p-4 border">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Target className="h-4 w-4 mr-2 text-blue-600" />
                      Recommendation
                    </h4>
                    <p className="text-sm text-muted-foreground" data-testid={`text-insight-recommendation-${insight.id}`}>
                      {insight.recommendation}
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(insight.timestamp)}
                  </span>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6">
            {mockTrends.map((trend) => (
              <Card key={trend.metric}>
                <CardHeader>
                  <CardTitle className="text-lg">{trend.metric}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Current Period</h4>
                      <div className="text-2xl font-bold">
                        {trend.metric === "Conversion Rate" ? `${trend.currentValue}%` : trend.currentValue.toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Change</h4>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(trend.trend)}
                        <span className={`text-lg font-semibold ${
                          trend.trend === "up" ? "text-green-600" : trend.trend === "down" ? "text-red-600" : "text-gray-600"
                        }`}>
                          {trend.changePercent > 0 ? "+" : ""}{trend.changePercent.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {trend.prediction && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Predicted Next Period</h4>
                        <div className="text-xl font-bold mb-1">
                          {trend.metric === "Conversion Rate" ? `${trend.prediction.nextPeriod}%` : trend.prediction.nextPeriod.toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <Progress value={trend.prediction.confidence} className="flex-1 mr-2" />
                          <span className="text-xs text-muted-foreground">{trend.prediction.confidence}% confidence</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Predictive Analytics</h3>
            <p className="text-muted-foreground mb-6">
              Advanced ML models will analyze your data to provide predictive insights
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <Card className="p-6">
                <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Hiring Demand</h4>
                <p className="text-sm text-muted-foreground">
                  Predict peak hiring periods and resource needs
                </p>
              </Card>
              <Card className="p-6">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Candidate Quality</h4>
                <p className="text-sm text-muted-foreground">
                  Score and rank candidates based on success patterns
                </p>
              </Card>
              <Card className="p-6">
                <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Cost Optimization</h4>
                <p className="text-sm text-muted-foreground">
                  Optimize spending across different recruitment channels
                </p>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}