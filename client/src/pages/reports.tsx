import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Download, Filter, Calendar, BarChart3, FileText, Eye, Edit, Trash2, Share, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  chartType?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  metrics: string[];
  filters: Record<string, any>;
}

export default function Reports() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("templates");
  
  // Report Builder State
  const [reportName, setReportName] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportCategory, setReportCategory] = useState("recruitment");
  const [reportType, setReportType] = useState("chart");
  const [chartType, setChartType] = useState("bar");
  const [dataSource, setDataSource] = useState("jobs");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ["/api/reports", { q: searchQuery, category: categoryFilter, type: typeFilter }],
    refetchOnWindowFocus: false,
  });

  // Mock data for report templates
  const mockReports: ReportTemplate[] = [
    {
      id: "1",
      name: "Monthly Hiring Report",
      description: "Comprehensive monthly hiring statistics and trends",
      category: "recruitment",
      type: "chart",
      chartType: "line",
      isPublic: true,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-20"),
      metrics: ["hires", "applications", "conversion_rate"],
      filters: { dateRange: "month", status: "all" }
    },
    {
      id: "2", 
      name: "Job Performance Analysis",
      description: "Analyze job posting performance and application rates",
      category: "performance",
      type: "table",
      isPublic: false,
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-01-18"),
      metrics: ["applications_per_job", "time_to_fill", "source_quality"],
      filters: { jobStatus: "active", period: "90d" }
    },
    {
      id: "3",
      name: "Recruiter Performance Dashboard", 
      description: "Track individual recruiter performance metrics",
      category: "performance",
      type: "chart",
      chartType: "pie",
      isPublic: true,
      createdAt: new Date("2024-01-05"),
      updatedAt: new Date("2024-01-15"),
      metrics: ["successful_hires", "pipeline_conversion", "avg_time_to_hire"],
      filters: { recruiter: "all", period: "quarter" }
    }
  ];

  const availableMetrics = {
    jobs: [
      { key: "total_jobs", label: "Total Jobs Posted" },
      { key: "active_jobs", label: "Active Jobs" },
      { key: "applications_per_job", label: "Applications per Job" },
      { key: "time_to_fill", label: "Time to Fill" },
      { key: "job_views", label: "Job Views" }
    ],
    applications: [
      { key: "total_applications", label: "Total Applications" },
      { key: "conversion_rate", label: "Conversion Rate" },
      { key: "application_sources", label: "Application Sources" },
      { key: "rejection_reasons", label: "Rejection Reasons" }
    ],
    recruitment: [
      { key: "successful_hires", label: "Successful Hires" },
      { key: "pipeline_conversion", label: "Pipeline Conversion" },
      { key: "avg_time_to_hire", label: "Average Time to Hire" },
      { key: "cost_per_hire", label: "Cost per Hire" }
    ]
  };

  const availableFilters = [
    { key: "dateRange", label: "Date Range" },
    { key: "jobStatus", label: "Job Status" },
    { key: "department", label: "Department" },
    { key: "location", label: "Location" },
    { key: "employmentType", label: "Employment Type" },
    { key: "experienceLevel", label: "Experience Level" },
    { key: "recruiter", label: "Recruiter" },
    { key: "source", label: "Application Source" }
  ];

  const reports = mockReports.filter(report => {
    const matchesSearch = !searchQuery || 
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || report.category === categoryFilter;
    const matchesType = typeFilter === "all" || report.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleCreateReport = () => {
    console.log("Creating report:", {
      name: reportName,
      description: reportDescription,
      category: reportCategory,
      type: reportType,
      chartType,
      dataSource,
      metrics: selectedMetrics,
      filters: selectedFilters
    });
    setIsCreateModalOpen(false);
    // Reset form
    setReportName("");
    setReportDescription("");
    setSelectedMetrics([]);
    setSelectedFilters([]);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} days ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} months ago`;
  };

  return (
    <div className="space-y-6">
      {/* Modern 21st.dev Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-pink-100 rounded-none">
            <FileText className="h-6 w-6 text-pink-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Reports</h1>
            <p className="text-muted-foreground">Create, manage, and generate custom reports</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-create-report">
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Create Custom Report</DialogTitle>
                <DialogDescription>
                  Build a custom report with your preferred metrics, filters, and visualization
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-y-auto max-h-[calc(90vh-120px)] space-y-6 p-1">
                {/* Basic Information */}
                <div className="space-y-4 border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reportName">Report Name</Label>
                      <Input
                        id="reportName"
                        value={reportName}
                        onChange={(e) => setReportName(e.target.value)}
                        placeholder="Enter report name"
                        data-testid="input-report-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reportCategory">Category</Label>
                      <Select value={reportCategory} onValueChange={setReportCategory}>
                        <SelectTrigger data-testid="select-report-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recruitment">Recruitment</SelectItem>
                          <SelectItem value="performance">Performance</SelectItem>
                          <SelectItem value="analytics">Analytics</SelectItem>
                          <SelectItem value="financial">Financial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reportDescription">Description</Label>
                    <Textarea
                      id="reportDescription"
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="Describe what this report will show"
                      data-testid="textarea-report-description"
                    />
                  </div>
                </div>

                <Separator />

                {/* Report Configuration */}
                <div className="space-y-4 border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="text-lg font-medium">Report Configuration</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reportType">Report Type</Label>
                      <Select value={reportType} onValueChange={setReportType}>
                        <SelectTrigger data-testid="select-report-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chart">Chart</SelectItem>
                          <SelectItem value="table">Table</SelectItem>
                          <SelectItem value="summary">Summary</SelectItem>
                          <SelectItem value="dashboard">Dashboard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {reportType === "chart" && (
                      <div className="space-y-2">
                        <Label htmlFor="chartType">Chart Type</Label>
                        <Select value={chartType} onValueChange={setChartType}>
                          <SelectTrigger data-testid="select-chart-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bar">Bar Chart</SelectItem>
                            <SelectItem value="line">Line Chart</SelectItem>
                            <SelectItem value="pie">Pie Chart</SelectItem>
                            <SelectItem value="area">Area Chart</SelectItem>
                            <SelectItem value="scatter">Scatter Plot</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="dataSource">Data Source</Label>
                      <Select value={dataSource} onValueChange={setDataSource}>
                        <SelectTrigger data-testid="select-data-source">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="jobs">Jobs</SelectItem>
                          <SelectItem value="applications">Applications</SelectItem>
                          <SelectItem value="contacts">Contacts</SelectItem>
                          <SelectItem value="companies">Companies</SelectItem>
                          <SelectItem value="interviews">Interviews</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Metrics Selection */}
                <div className="space-y-4 border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="text-lg font-medium">Metrics to Include</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {availableMetrics[dataSource as keyof typeof availableMetrics]?.map((metric) => (
                      <div key={metric.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={metric.key}
                          checked={selectedMetrics.includes(metric.key)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedMetrics([...selectedMetrics, metric.key]);
                            } else {
                              setSelectedMetrics(selectedMetrics.filter(m => m !== metric.key));
                            }
                          }}
                          data-testid={`checkbox-metric-${metric.key}`}
                        />
                        <Label htmlFor={metric.key} className="text-sm font-normal">
                          {metric.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Filters Selection */}
                <div className="space-y-4 border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="text-lg font-medium">Available Filters</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {availableFilters.map((filter) => (
                      <div key={filter.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={filter.key}
                          checked={selectedFilters.includes(filter.key)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedFilters([...selectedFilters, filter.key]);
                            } else {
                              setSelectedFilters(selectedFilters.filter(f => f !== filter.key));
                            }
                          }}
                          data-testid={`checkbox-filter-${filter.key}`}
                        />
                        <Label htmlFor={filter.key} className="text-sm font-normal">
                          {filter.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateReport} data-testid="button-save-report">
                    Create Report
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <Input
              type="text"
              placeholder="Search reports by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              data-testid="input-search-reports"
            />
          </div>
          <div className="flex items-center space-x-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40" data-testid="select-category-filter">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="recruitment">Recruitment</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32" data-testid="select-type-filter">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="chart">Charts</SelectItem>
                <SelectItem value="table">Tables</SelectItem>
                <SelectItem value="summary">Summary</SelectItem>
                <SelectItem value="dashboard">Dashboards</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Report Templates */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates" data-testid="tab-templates">Templates</TabsTrigger>
          <TabsTrigger value="custom" data-testid="tab-custom">My Reports</TabsTrigger>
          <TabsTrigger value="scheduled" data-testid="tab-scheduled">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4 border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-primary/10 rounded-none">
                        {report.type === "chart" ? (
                          <BarChart3 className="h-4 w-4 text-primary" />
                        ) : (
                          <FileText className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-sm font-medium" data-testid={`text-report-name-${report.id}`}>
                          {report.name}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {report.category}
                          </Badge>
                          {report.isPublic && (
                            <Badge variant="outline" className="text-xs">
                              Public
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-xs mb-3" data-testid={`text-report-description-${report.id}`}>
                    {report.description}
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatTimeAgo(report.updatedAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" title="View Report" data-testid={`button-view-report-${report.id}`}>
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Edit Report" data-testid={`button-edit-report-${report.id}`}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Share Report" data-testid={`button-share-report-${report.id}`}>
                        <Share className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4 border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Custom Reports Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first custom report to get started</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4 border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Scheduled Reports</h3>
            <p className="text-muted-foreground">Set up automated report generation and delivery</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}