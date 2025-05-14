
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AdminAnalyticsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Resolution Rate</CardTitle>
            <CardDescription>Overall complaint resolution</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">65.8%</p>
            <p className="text-sm text-green-600">↑ 4.3% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Avg. Resolution Time</CardTitle>
            <CardDescription>Time to resolve complaints</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">4.3 days</p>
            <p className="text-sm text-green-600">↓ 0.8 days from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Citizen Satisfaction</CardTitle>
            <CardDescription>Based on feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">4.2/5.0</p>
            <p className="text-sm text-green-600">↑ 0.3 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Active Complaints</CardTitle>
            <CardDescription>Pending & in progress</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">81</p>
            <p className="text-sm text-red-600">↑ 12 from last month</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
            <CardDescription>Complaints vs. resolutions over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <p className="text-gray-500">Chart visualization would appear here</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Breakdown by complaint type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <p className="text-gray-500">Pie chart visualization would appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Performance by Department</CardTitle>
          <CardDescription>Resolution metrics across departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span>Water Department</span>
                <span>72% resolved</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "72%" }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>Electricity Department</span>
                <span>68% resolved</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "68%" }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>Roads & Infrastructure</span>
                <span>58% resolved</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "58%" }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>Sanitation</span>
                <span>76% resolved</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "76%" }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalyticsPage;
