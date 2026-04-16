





import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { getAdminStats } from "../../services/adminService";
import "../../styles/AdminDashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#ffcb05", "#007bff", "#ff5252"];

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      console.error("Admin stats error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="loading-text">Loading dashboard...</p>;

  return (
    <div className="admin-dashboard-container">
      
      {/* PAGE TITLE */}
      <div className="admin-header">
        <h2>Dashboard Overview</h2>
        <p className="subtitle">Insights & analytics for admin activity</p>
      </div>

      {/* TOP STATS */}
      <div className="top-stats-grid">
        {stats.topCards.map((item) => (
          <div key={item.label} className="stat-card">
            <h4>{item.label}</h4>
            <p className="value">{item.value}</p>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="charts-grid">
        
        {/* MONTHLY DEMO REQUESTS */}
        <div className="chart-box">
          <h3>Demo Requests (Monthly)</h3>
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={stats.demoChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#29415c" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="requests">
                {stats.demoChart.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* USER GROWTH */}
        <div className="chart-box">
          <h3>User Growth Trend</h3>
          <ResponsiveContainer width="100%" height={270}>
            <LineChart data={stats.userGrowth}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#ffcb05" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* PROJECT STATUS DISTRIBUTION */}
        <div className="chart-box">
          <h3>Projects Status Distribution</h3>
          <ResponsiveContainer width="100%" height={270}>
            <PieChart>
              <Pie
                data={stats.projectDistribution}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={75}
                label
              >
                {stats.projectDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}







// import React, { useEffect, useState } from "react";
// import {
//   BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
//   CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Legend,
// } from "recharts";
// import { getAdminStats } from "../../services/adminService";
// import "../../styles/AdminDashboard.css";

// export default function AdminDashboard() {

//   // ✅ SAFE INITIAL STATE (NO NULL)
//   const [stats, setStats] = useState({
//     topCards: [],
//     demoChart: [],
//     userGrowth: [],
//     projectDistribution: [],
//   });

//   const [loading, setLoading] = useState(true);

//   const COLORS = ["#ffcb05", "#007bff", "#ff5252"];

//   useEffect(() => {
//     loadStats();
//   }, []);

//   const loadStats = async () => {
//     try {
//       const data = await getAdminStats();
//       setStats({
//         topCards: data?.topCards || [],
//         demoChart: data?.demoChart || [],
//         userGrowth: data?.userGrowth || [],
//         projectDistribution: data?.projectDistribution || [],
//       });
//     } catch (err) {
//       console.error("Admin stats error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return <p className="loading-text">Loading dashboard...</p>;
//   }

//   return (
//     <div className="admin-dashboard-container">

//       <div className="admin-header">
//         <h2>Dashboard Overview</h2>
//         <p className="subtitle">Insights & analytics for admin activity</p>
//       </div>

//       <div className="top-stats-grid">
//         {stats.topCards.map((item) => (
//           <div key={item.label} className="stat-card">
//             <h4>{item.label}</h4>
//             <p className="value">{item.value}</p>
//           </div>
//         ))}
//       </div>

//       <div className="charts-grid">

//         <div className="chart-box">
//           <h3>Demo Requests (Monthly)</h3>
//           <ResponsiveContainer width="100%" height={270}>
//             <BarChart data={stats.demoChart}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="month" />
//               <YAxis />
//               <Tooltip />
//               <Bar dataKey="requests">
//                 {stats.demoChart.map((_, i) => (
//                   <Cell key={i} fill={COLORS[i % COLORS.length]} />
//                 ))}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         <div className="chart-box">
//           <h3>User Growth</h3>
//           <ResponsiveContainer width="100%" height={270}>
//             <LineChart data={stats.userGrowth}>
//               <XAxis dataKey="date" />
//               <YAxis />
//               <Tooltip />
//               <Line dataKey="users" stroke="#ffcb05" strokeWidth={3} />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>

//         <div className="chart-box">
//           <h3>Project Distribution</h3>
//           <ResponsiveContainer width="100%" height={270}>
//             <PieChart>
//               <Pie
//                 data={stats.projectDistribution}
//                 dataKey="value"
//                 nameKey="name"
//                 outerRadius={80}
//                 label
//               >
//                 {stats.projectDistribution.map((_, i) => (
//                   <Cell key={i} fill={COLORS[i % COLORS.length]} />
//                 ))}
//               </Pie>
//               <Legend />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>

//       </div>
//     </div>
//   );
// }
