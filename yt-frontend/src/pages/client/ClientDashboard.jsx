// import React, { useEffect, useState } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
//   Cell,
//   LineChart,
//   Line,
//   PieChart,
//   Pie,
//   Cell as PieCell,
//   Legend,
// } from "recharts";
// import "../../styles/ClientDashboard.css";
// import API from "../../services/axiosInstance";
// import { toast } from "react-hot-toast";

// export default function ClientDashboard() {
//   const [loading, setLoading] = useState(true);

//   /* ================= STATE ================= */
//   const [stats, setStats] = useState([]);
//   const [barData, setBarData] = useState([]);
//   const [lineData, setLineData] = useState([]);
//   const [pieData, setPieData] = useState([]);

//   const COLORS = ["#ffcb05", "#007bff", "#ff5252"];

//   /* ================= LOAD DASHBOARD ================= */
//   const loadDashboard = async () => {
//     try {
//       setLoading(true);

//       // ✅ USE EXISTING BACKEND ROUTE
//       const res = await API.get("/erp/client/projects");
//       const projects = res.data.projects || [];

//       /* ================= TOP STATS ================= */
//       setStats([
//         { label: "My Projects", value: projects.length },
//         { label: "Payments Made", value: 0 },
//         { label: "Pending Bills", value: 0 },
//         { label: "Support Tickets", value: 0 },
//       ]);

//       /* ================= PIE CHART (STATUS) ================= */
//       const statusCount = {};
//       projects.forEach((p) => {
//         statusCount[p.status] = (statusCount[p.status] || 0) + 1;
//       });

//       setPieData(
//         Object.entries(statusCount).map(([name, value]) => ({
//           name,
//           value,
//         }))
//       );

//       /* ================= BAR + LINE (TEMP DEMO DATA) ================= */
//       setBarData([
//         { month: "Jan", work: 30 },
//         { month: "Feb", work: 45 },
//         { month: "Mar", work: 60 },
//       ]);

//       setLineData([
//         { date: "Week 1", progress: 20 },
//         { date: "Week 2", progress: 40 },
//         { date: "Week 3", progress: 70 },
//       ]);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load client dashboard");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadDashboard();
//   }, []);

//   /* ================= UI ================= */
//   if (loading) {
//     return <p className="muted">Loading dashboard...</p>;
//   }

//   return (
//     <div className="client-dashboard-container">
//       {/* PAGE TITLE */}
//       <div className="client-header">
//         <h2>Client Dashboard</h2>
//         <p className="subtitle">Overview of your project activity</p>
//       </div>

//       {/* TOP STATS */}
//       <div className="client-stats-grid">
//         {stats.map((item) => (
//           <div key={item.label} className="client-stat-card">
//             <h4>{item.label}</h4>
//             <p className="value">{item.value}</p>
//           </div>
//         ))}
//       </div>

//       {/* CHARTS */}
//       <div className="client-charts-grid">
//         {/* BAR */}
//         <div className="client-chart-box">
//           <h3>Monthly Work Progress</h3>
//           <ResponsiveContainer width="100%" height={270}>
//             <BarChart data={barData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="month" />
//               <YAxis />
//               <Tooltip />
//               <Bar dataKey="work">
//                 {barData.map((_, i) => (
//                   <Cell key={i} fill={COLORS[i % COLORS.length]} />
//                 ))}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         {/* LINE */}
//         <div className="client-chart-box">
//           <h3>Overall Progress</h3>
//           <ResponsiveContainer width="100%" height={270}>
//             <LineChart data={lineData}>
//               <XAxis dataKey="date" />
//               <YAxis />
//               <Tooltip />
//               <Line
//                 type="monotone"
//                 dataKey="progress"
//                 stroke="#ffcb05"
//                 strokeWidth={3}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>

//         {/* PIE */}
//         <div className="client-chart-box">
//           <h3>Project Status Breakdown</h3>
//           <ResponsiveContainer width="100%" height={270}>
//             <PieChart>
//               <Pie
//                 data={pieData}
//                 dataKey="value"
//                 nameKey="name"
//                 innerRadius={45}
//                 outerRadius={75}
//                 label
//               >
//                 {pieData.map((_, i) => (
//                   <PieCell
//                     key={i}
//                     fill={COLORS[i % COLORS.length]}
//                   />
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








import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell as PieCell,
  Legend,
} from "recharts";
import "../../styles/ClientDashboard.css";
import API from "../../services/axiosInstance";
import { toast } from "react-hot-toast";

export default function ClientDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [pieData, setPieData] = useState([]);

  const COLORS = ["#ffcb05", "#007bff", "#ff5252"];

  /* ================= LOAD DASHBOARD ================= */
  const loadDashboard = async () => {
    try {
      setLoading(true);

      // ✅ Existing backend route
      const res = await API.get("/erp/client/projects");
      const projects = res.data?.projects || [];

      /* ================= STATS ================= */
      setStats([
        { label: "My Projects", value: projects.length },
        { label: "Payments Made", value: 0 },
        { label: "Pending Bills", value: 0 },
        { label: "Support Tickets", value: 0 },
      ]);

      /* ================= PIE (STATUS) ================= */
      const statusCount = {};
      projects.forEach((p) => {
        statusCount[p.status || "unknown"] =
          (statusCount[p.status || "unknown"] || 0) + 1;
      });

      setPieData(
        Object.entries(statusCount).map(([name, value]) => ({
          name,
          value,
        }))
      );

      /* ================= DEMO CHART DATA ================= */
      setBarData([
        { month: "Jan", work: 30 },
        { month: "Feb", work: 45 },
        { month: "Mar", work: 60 },
      ]);

      setLineData([
        { date: "Week 1", progress: 20 },
        { date: "Week 2", progress: 40 },
        { date: "Week 3", progress: 70 },
      ]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load client dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <p className="muted">Loading dashboard...</p>;
  }

  return (
    <div className="client-dashboard-container">
      {/* HEADER */}
      <div className="client-header">
        <h2>Client Dashboard</h2>
        <p className="subtitle">Overview of your project activity</p>
      </div>

      {/* STATS */}
      <div className="client-stats-grid">
        {stats.map((item) => (
          <div key={item.label} className="client-stat-card">
            <h4>{item.label}</h4>
            <p className="value">{item.value}</p>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="client-charts-grid">
        {/* BAR */}
        <div className="client-chart-box">
          <h3>Monthly Work Progress</h3>
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="work">
                {barData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* LINE */}
        <div className="client-chart-box">
          <h3>Overall Progress</h3>
          <ResponsiveContainer width="100%" height={270}>
            <LineChart data={lineData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="progress"
                stroke="#ffcb05"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* PIE */}
        <div className="client-chart-box">
          <h3>Project Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={270}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={75}
                label
              >
                {pieData.map((_, i) => (
                  <PieCell key={i} fill={COLORS[i % COLORS.length]} />
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
