// import React from "react";
// import "../../styles/technicalDashboard.css";

// export default function TechnicalDashboard() {
//   return (
//     <div className="technical-dashboard">

//       <div className="page-title">Technical Dashboard</div>

//       <div className="dashboard-grid">
//         <div className="card">Active Projects: 12</div>
//         <div className="card">Team Members: 28</div>
//         <div className="card">Pending Tasks: 34</div>
//         <div className="card">This Month Deployment: 5</div>
//       </div>

//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import "../../styles/technicalDashboard.css";
import { getTechLeadStats } from "../../services/techleadService";
import { toast } from "react-hot-toast";

export default function TechnicalDashboard() {
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalProjects: 0,
    pendingTasks: 0,
    thisMonthDeployments: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getTechLeadStats();

      setStats({
        activeProjects: data.activeProjects || 0,
        totalProjects: data.totalProjects || 0,
        pendingTasks: data.pendingTasks || 0,
        thisMonthDeployments: data.thisMonthDeployments || 0,
      });
    } catch (err) {
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="technical-dashboard">
      <div className="page-title">Technical Dashboard</div>

      <div className="dashboard-grid">
        <div className="card">
          <h4>Active Projects</h4>
          <span>{loading ? "…" : stats.activeProjects}</span>
        </div>

        <div className="card">
          <h4>Total Projects</h4>
          <span>{loading ? "…" : stats.totalProjects}</span>
        </div>

        <div className="card">
          <h4>Pending Tasks</h4>
          <span>{loading ? "…" : stats.pendingTasks}</span>
        </div>

        <div className="card">
          <h4>This Month Deployments</h4>
          <span>{loading ? "…" : stats.thisMonthDeployments}</span>
        </div>
      </div>
    </div>
  );
}
