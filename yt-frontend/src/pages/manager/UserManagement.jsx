import React from "react";
import { useSearchParams } from "react-router-dom";
import { Layers3, Users } from "lucide-react";
import ManagerProductUsers from "./ProductUsers";
import CreateClient from "./CreateClient";
import "../../styles/ManagerUserManagement.css";

const TABS = [
  { id: "products", label: "Product Users", icon: Layers3 },
  { id: "clients", label: "Client Users", icon: Users },
];

export default function ManagerUserManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = TABS.some((t) => t.id === searchParams.get("tab"))
    ? searchParams.get("tab")
    : "products";

  const selectTab = (id) => setSearchParams({ tab: id }, { replace: true });

  return (
    <div className="mum-page">
      <div className="mum-header">
        <h1>User Management</h1>
        <p>Manage your product users and client users in one place.</p>
      </div>

      <div className="mum-tabs" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`mum-tab ${tab === id ? "active" : ""}`}
            onClick={() => selectTab(id)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div className="mum-body">
        {tab === "products" ? <ManagerProductUsers embedded /> : <CreateClient embedded />}
      </div>
    </div>
  );
}
