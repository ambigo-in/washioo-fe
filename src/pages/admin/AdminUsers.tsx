import { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { fetchUsers, updateUserStatus } from "../../api/adminApi";
import type { AdminUser } from "../../types/adminTypes";
import "./AdminUsers.css";

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "customer" | "cleaner" | "admin"
  >("all");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data.users);
    } catch (err) {
      setError("Failed to load users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    try {
      await updateUserStatus(Number(userId), isActive);
      loadUsers();
    } catch (err) {
      setError("Failed to update user status");
      console.error(err);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);

    const matchesRole =
      roleFilter === "all" || user.roles?.includes(roleFilter);

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (roles?: string[]) => {
    if (!roles || roles.length === 0) return null;

    return roles.map((role) => {
      let badgeClass = "role-badge";
      if (role === "admin") badgeClass += " admin";
      else if (role === "cleaner") badgeClass += " cleaner";
      else if (role === "customer") badgeClass += " customer";

      return (
        <span key={role} className={badgeClass}>
          {role}
        </span>
      );
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <DashboardLayout title="Users">
      <div className="users-page">
        <div className="page-header">
          <h2>Manage Users</h2>
          <div className="header-stats">
            <span>Total: {users.length}</span>
          </div>
        </div>

        <div className="filter-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="cleaner">Cleaners</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <p>No users found.</p>
          </div>
        ) : (
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>#{user.id}</td>
                    <td className="user-name">{user.full_name || "N/A"}</td>
                    <td>{user.phone}</td>
                    <td>{user.email || "N/A"}</td>
                    <td>
                      <div className="role-badges">
                        {getRoleBadge(user.roles)}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status ${user.is_active ? "active" : "inactive"}`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{formatDate(user.created_at)}</td>
                    <td>
                      <button
                        className={`btn-action ${user.is_active ? "deactivate" : "activate"}`}
                        onClick={() =>
                          handleStatusChange(String(user.id), !user.is_active)
                        }
                      >
                        {user.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
