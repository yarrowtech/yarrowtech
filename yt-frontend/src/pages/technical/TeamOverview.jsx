import React, { useEffect, useState } from "react";
import "../../styles/TechteamOverview.css";
import API from "../../services/axiosInstance";
import { toast } from "react-hot-toast";

export default function TeamOverview() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      const res = await API.get("/erp/techlead/assigned");

      const projects = res.data?.projects || [];

      // 🔹 Build team list from projects
      const members = projects.map((p) => ({
        name: p.techLeadEmail,
        role: "Technical Lead",
        project: p.name,
      }));

      setTeam(members);
    } catch {
      toast.error("Failed to load team overview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="team-overview">
      <div className="page-title">Team Overview</div>

      {loading ? (
        <p className="muted">Loading team...</p>
      ) : team.length === 0 ? (
        <p className="muted">No team members assigned</p>
      ) : (
        <div className="team-grid">
          {team.map((member, i) => (
            <div className="team-card" key={i}>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
              <span className="muted">{member.project}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
