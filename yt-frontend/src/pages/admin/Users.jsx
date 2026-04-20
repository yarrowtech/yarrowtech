import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

import {
  createERPUser,
  getERPUsers,
  getProductUserCatalog,
  getProductUserManagers,
  getProductUsers,
  resetUserPassword,
  toggleUserStatus,
} from "../../services/adminService";
import "../../styles/UsersAdmin.css";

const initialErpForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "manager",
};

const initialProductForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  address: "",
  mobileNumber: "",
  managerId: "",
  productName: "",
  customProductName: "",
};

export default function Users() {
  const [activeTab, setActiveTab] = useState("erp");
  const [users, setUsers] = useState([]);
  const [productUsers, setProductUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [erpForm, setErpForm] = useState(initialErpForm);
  const [productForm, setProductForm] = useState(initialProductForm);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [resetUser, setResetUser] = useState(null);
  const [resetPwd, setResetPwd] = useState({ password: "", confirm: "" });
  const [passwordVisibility, setPasswordVisibility] = useState({
    erpPassword: false,
    erpConfirmPassword: false,
    productPassword: false,
    productConfirmPassword: false,
    resetPassword: false,
    resetConfirmPassword: false,
  });

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const loadData = async () => {
    const [erpUsers, pUsers, managerList, productCatalog] = await Promise.all([
      getERPUsers(),
      getProductUsers(),
      getProductUserManagers(),
      getProductUserCatalog(),
    ]);

    setUsers(Array.isArray(erpUsers) ? erpUsers.filter((item) => item.role !== "productuser") : []);
    setProductUsers(Array.isArray(pUsers) ? pUsers : []);
    setManagers(Array.isArray(managerList) ? managerList : []);
    setCatalog(Array.isArray(productCatalog) ? productCatalog : []);
  };

  useEffect(() => {
    loadData().catch(() => toast.error("Failed to load user data"));
  }, []);

  const handleCreateErpUser = async () => {
    if (!erpForm.name || !erpForm.email || !erpForm.password) {
      toast.error("Name, email and password are required");
      return;
    }

    if (erpForm.password !== erpForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await createERPUser({
        name: erpForm.name.trim(),
        email: erpForm.email.toLowerCase(),
        password: erpForm.password,
        role: erpForm.role,
      });

      toast.success("ERP user created successfully");
      setErpForm(initialErpForm);
      setShowCreateModal(false);
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Create failed");
    }
  };

  const handleCreateProductUser = async () => {
    if (
      !productForm.name ||
      !productForm.email ||
      !productForm.password ||
      !productForm.managerId
    ) {
      toast.error("Please fill all required product user fields");
      return;
    }

    if (productForm.password !== productForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!productForm.productName && !productForm.customProductName) {
      toast.error("Select a product or add a custom product");
      return;
    }

    try {
      await createERPUser({
        name: productForm.name,
        email: productForm.email.toLowerCase(),
        password: productForm.password,
        role: "productuser",
        address: productForm.address,
        mobileNumber: productForm.mobileNumber,
        managerId: productForm.managerId,
        productName: productForm.productName,
        customProductName: productForm.customProductName,
      });

      toast.success("Product user created successfully");
      setProductForm(initialProductForm);
      setActiveTab("productusers");
      setShowCreateModal(false);
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Create failed");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleUserStatus(id);
      toast.success("User status updated");
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Status update failed");
    }
  };

  const handleResetPassword = async () => {
    if (resetPwd.password !== resetPwd.confirm) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await resetUserPassword(resetUser._id, resetPwd.password);
      toast.success("Password reset");
      setResetUser(null);
      setResetPwd({ password: "", confirm: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Password reset failed");
    }
  };

  const renderUserTable = (items, showProductColumns = false) => (
    <div className="users-table-wrapper">
      <table className="users-table">
        <thead>
          <tr>
            {showProductColumns && <th>Name</th>}
            <th>Email</th>
            {showProductColumns && <th>Product</th>}
            {showProductColumns && <th>Manager</th>}
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={showProductColumns ? 8 : 5} className="empty-table-cell">
                No users found.
              </td>
            </tr>
          ) : (
            items.map((u) => (
              <tr key={u._id}>
                {showProductColumns && <td>{u.name || "-"}</td>}
                <td>{u.email}</td>
                {showProductColumns && <td>{u.productName || "-"}</td>}
                {showProductColumns && <td>{u.manager?.name || u.managerEmail || "-"}</td>}
                <td>
                  <span className={`role-badge role-${u.role}`}>{u.role}</span>
                </td>
                <td>
                  <button
                    className={`status-toggle ${u.status}`}
                    onClick={() => handleToggleStatus(u._id)}
                  >
                    {u.status === "active" ? "Disable" : "Enable"}
                  </button>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="reset-btn" onClick={() => setResetUser(u)}>
                    Reset Password
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="admin-users-container">
      <div className="admin-header">
        <div>
          <h2>User Management</h2>
          <p className="subtitle">Manage ERP users and product users from separate tabs.</p>
        </div>
      </div>

      <div className="user-tabs">
        <button
          className={activeTab === "erp" ? "active" : ""}
          onClick={() => setActiveTab("erp")}
        >
          ERP Users
        </button>
        <button
          className={activeTab === "productusers" ? "active" : ""}
          onClick={() => setActiveTab("productusers")}
        >
          Product Users
        </button>
      </div>

      {activeTab === "erp" ? (
        <>
          <div className="admin-section-head">
            <div className="admin-header">
              <h2>ERP Users</h2>
              <p className="subtitle">Total ERP Users: {users.length}</p>
            </div>
            <button className="add-user-btn" onClick={() => setShowCreateModal(true)}>
              Add ERP User
            </button>
          </div>
          {renderUserTable(users)}
        </>
      ) : (
        <>
          <div className="admin-section-head">
            <div className="admin-header">
              <h2>Product Users</h2>
              <p className="subtitle">Total Product Users: {productUsers.length}</p>
            </div>
            <button className="add-user-btn" onClick={() => setShowCreateModal(true)}>
              Add Product User
            </button>
          </div>
          {renderUserTable(productUsers, true)}
        </>
      )}

      {showCreateModal && (
        <div className="modal-backdrop">
          <div
            className={`modal-box create-modal-box ${
              activeTab === "productusers" ? "product-create-modal-box" : ""
            }`}
          >
            <div className="create-modal-head">
              <div>
                <h3>
                  {activeTab === "erp" ? "Create ERP User" : "Create Product User"}
                </h3>
                <p className="subtitle">
                  {activeTab === "erp"
                    ? "Add a new admin, manager, or tech lead account."
                    : "Add a new product user and assign the manager and product."}
                </p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                Close
              </button>
            </div>

            {activeTab === "erp" ? (
              <div className="erp-user-form-shell">
                <div className="erp-user-form-grid">
                  <label className="form-field">
                    <span>Full Name</span>
                    <input
                      placeholder="Enter full name"
                      value={erpForm.name}
                      onChange={(e) => setErpForm({ ...erpForm, name: e.target.value })}
                    />
                  </label>

                  <label className="form-field">
                    <span>Email Address</span>
                    <input
                      placeholder="Enter email"
                      value={erpForm.email}
                      onChange={(e) => setErpForm({ ...erpForm, email: e.target.value })}
                    />
                  </label>

                  <label className="form-field">
                    <span>Password</span>
                    <div className="password-field-wrap">
                      <input
                        type={passwordVisibility.erpPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={erpForm.password}
                        onChange={(e) =>
                          setErpForm({ ...erpForm, password: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => togglePasswordVisibility("erpPassword")}
                      >
                        {passwordVisibility.erpPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </label>

                  <label className="form-field">
                    <span>Confirm Password</span>
                    <div className="password-field-wrap">
                      <input
                        type={passwordVisibility.erpConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={erpForm.confirmPassword}
                        onChange={(e) =>
                          setErpForm({ ...erpForm, confirmPassword: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => togglePasswordVisibility("erpConfirmPassword")}
                      >
                        {passwordVisibility.erpConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </label>

                  <label className="form-field form-field-wide">
                    <span>Role</span>
                    <select
                      value={erpForm.role}
                      onChange={(e) => setErpForm({ ...erpForm, role: e.target.value })}
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="techlead">Tech Lead</option>
                    </select>
                  </label>
                </div>

                <div className="erp-role-note">
                  The selected user will get ERP access with the chosen role permissions.
                </div>

                <div className="erp-user-form-actions">
                  <button className="secondary-btn" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button onClick={handleCreateErpUser}>Create User</button>
                </div>
              </div>
            ) : (
              <div className="product-user-form-shell">
                <div className="product-form-panel">
                  <div className="product-form-panel-head">
                    <h4>Basic Details</h4>
                    <p>Name and contact email for the product user account.</p>
                  </div>
                  <div className="product-user-form">
                    <label className="form-field">
                      <span>Full Name</span>
                      <input
                        placeholder="Enter full name"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      />
                    </label>
                    <label className="form-field">
                      <span>Email Address</span>
                      <input
                        placeholder="Enter email address"
                        value={productForm.email}
                        onChange={(e) => setProductForm({ ...productForm, email: e.target.value })}
                      />
                    </label>
                  </div>
                </div>

                <div className="product-form-panel">
                  <div className="product-form-panel-head">
                    <h4>Login Credentials</h4>
                    <p>Set the password the user will use to access the ERP.</p>
                  </div>
                  <div className="product-user-form">
                    <label className="form-field">
                      <span>Password</span>
                      <div className="password-field-wrap">
                        <input
                          type={passwordVisibility.productPassword ? "text" : "password"}
                          placeholder="Create password"
                          value={productForm.password}
                          onChange={(e) =>
                            setProductForm({ ...productForm, password: e.target.value })
                          }
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => togglePasswordVisibility("productPassword")}
                        >
                          {passwordVisibility.productPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </label>
                    <label className="form-field">
                      <span>Confirm Password</span>
                      <div className="password-field-wrap">
                        <input
                          type={
                            passwordVisibility.productConfirmPassword ? "text" : "password"
                          }
                          placeholder="Confirm password"
                          value={productForm.confirmPassword}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              confirmPassword: e.target.value,
                            })
                          }
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => togglePasswordVisibility("productConfirmPassword")}
                        >
                          {passwordVisibility.productConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="product-form-panel">
                  <div className="product-form-panel-head">
                    <h4>Assignment</h4>
                    <p>Choose the manager and product for this user.</p>
                  </div>
                  <div className="product-user-form">
                    <label className="form-field">
                      <span>Assigned Manager</span>
                      <select
                        value={productForm.managerId}
                        onChange={(e) =>
                          setProductForm({ ...productForm, managerId: e.target.value })
                        }
                      >
                        <option value="">Select Manager</option>
                        {managers.map((manager) => (
                          <option key={manager._id} value={manager._id}>
                            {manager.name || manager.email}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="form-field">
                      <span>Product</span>
                      <div className="product-field-stack">
                        <select
                          value={productForm.productName}
                          onChange={(e) =>
                            setProductForm({ ...productForm, productName: e.target.value })
                          }
                        >
                          <option value="">Select Product</option>
                          {catalog.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                        <input
                          placeholder="Or type a custom product"
                          value={productForm.customProductName}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              customProductName: e.target.value,
                            })
                          }
                        />
                      </div>
                    </label>
                  </div>
                </div>

                <div className="product-form-panel">
                  <div className="product-form-panel-head">
                    <h4>Contact Information</h4>
                    <p>Store the mobile number and address for quick reference.</p>
                  </div>
                  <div className="product-user-form">
                    <label className="form-field">
                      <span>Mobile Number</span>
                      <input
                        placeholder="Enter mobile number"
                        value={productForm.mobileNumber}
                        onChange={(e) =>
                          setProductForm({ ...productForm, mobileNumber: e.target.value })
                        }
                      />
                    </label>
                    <label className="form-field form-field-wide">
                      <span>Address</span>
                      <textarea
                        rows="4"
                        placeholder="Enter address"
                        value={productForm.address}
                        onChange={(e) =>
                          setProductForm({ ...productForm, address: e.target.value })
                        }
                      />
                    </label>
                  </div>
                </div>

                <div className="product-form-note">
                  Product users will log in with the email and password created here and can
                  view their assigned product details, payments, and manager chat.
                </div>

                <div className="product-user-form-actions">
                  <button className="secondary-btn" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button onClick={handleCreateProductUser}>Create Product User</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {resetUser && (
        <div className="modal-backdrop">
          <div className="modal-box reset-password-modal">
            <h3>Reset Password</h3>
            <p>{resetUser.email}</p>
            <div className="password-field-wrap">
              <input
                type={passwordVisibility.resetPassword ? "text" : "password"}
                placeholder="New Password"
                value={resetPwd.password}
                onChange={(e) => setResetPwd({ ...resetPwd, password: e.target.value })}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => togglePasswordVisibility("resetPassword")}
              >
                {passwordVisibility.resetPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
            <div className="password-field-wrap">
              <input
                type={passwordVisibility.resetConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={resetPwd.confirm}
                onChange={(e) => setResetPwd({ ...resetPwd, confirm: e.target.value })}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => togglePasswordVisibility("resetConfirmPassword")}
              >
                {passwordVisibility.resetConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
            <div className="modal-actions">
              <button onClick={handleResetPassword}>Update Password</button>
              <button onClick={() => setResetUser(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
