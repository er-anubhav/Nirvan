
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  
  return (
    <div className=" font-serif space-y-6">
      <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">1,247</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <p className="text-xl font-bold">Operational</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Active Officials</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">24</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Database Size</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">4.2 GB</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage system users and roles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Citizens</span>
                <span>1,184</span>
              </div>
              <div className="flex justify-between">
                <span>Officials</span>
                <span>42</span>
              </div>
              <div className="flex justify-between">
                <span>Administrators</span>
                <span>18</span>
              </div>
              <div className="flex justify-between">
                <span>Super Admins</span>
                <span>3</span>
              </div>
            </div>
            <Button onClick={() => navigate("/super-admin/users")}>
              Manage Users
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Analytics</CardTitle>
            <CardDescription>Overall system performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div>
                <div className="flex justify-between mb-1">
                  <span>CPU Usage</span>
                  <span>38%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "38%" }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span>Memory Usage</span>
                  <span>64%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "64%" }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span>Disk Usage</span>
                  <span>52%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "52%" }}></div>
                </div>
              </div>
            </div>
            
            <Button onClick={() => navigate("/super-admin/analytics")}>
              View Full Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>System Logs</CardTitle>
          <CardDescription>Recent system events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="p-3 bg-green-50 border-l-4 border-green-500">
              <div className="flex justify-between">
                <span className="font-medium">Backup Completed</span>
                <span className="text-sm text-gray-500">Today, 03:15 AM</span>
              </div>
              <p className="text-sm text-gray-600">Daily system backup completed successfully.</p>
            </div>
            
            <div className="p-3 bg-blue-50 border-l-4 border-blue-500">
              <div className="flex justify-between">
                <span className="font-medium">User Role Changed</span>
                <span className="text-sm text-gray-500">Yesterday, 2:42 PM</span>
              </div>
              <p className="text-sm text-gray-600">User 'Michael Chen' was promoted to 'Admin' role.</p>
            </div>
            
            <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500">
              <div className="flex justify-between">
                <span className="font-medium">High Traffic Alert</span>
                <span className="text-sm text-gray-500">Yesterday, 9:15 AM</span>
              </div>
              <p className="text-sm text-gray-600">Unusual traffic spike detected. System scaled resources automatically.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;
