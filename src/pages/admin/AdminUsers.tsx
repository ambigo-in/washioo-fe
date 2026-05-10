import { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { fetchUsers } from "../../api/adminApi";
import type { AdminUser } from "../../types/adminTypes";
import {
  FilterSelect,
  PaginationControls,
  SearchInput,
  matchesSearch,
  paginateItems,
  useDashboardQueryState,
} from "../../components/dashboard/DashboardControls";
import { formatIndianPhoneForDisplay } from "../../utils/phoneUtils";
import "./AdminUsers.css";

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const query = useDashboardQueryState<"all" | "customer" | "cleaner" | "admin">("all");

  useEffect(() => {
    loadUsers();
  }, [query.offset, query.pageSize, query.status]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers({
        role: query.status === "all" ? undefined : query.status,
        limit: query.pageSize,
        offset: query.offset,
      });
      setUsers(data.users);
      setTotal(data.total);
      setError("");
    } catch (err) {
      setError("Failed to load users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    matchesSearch(user, query.debouncedSearch, [
      (item) => item.full_name,
      (item) => item.phone,
      (item) => item.email,
      (item) => item.roles?.join(" "),
    ]),
  );
  const visibleUsers = query.debouncedSearch
    ? paginateItems(filteredUsers, query.page, query.pageSize)
    : filteredUsers;
  const visibleTotal = query.debouncedSearch ? filteredUsers.length : total;

  const getRoleBadge = (roles?: string[]) => {
    if (!roles || roles.length === 0) return null;

    return roles.map((role) => {
      let badgeClass = "role-badge";
      if (role === "admin") badgeClass += " admin";
      else if (role === "cleaner") badgeClass += " cleaner";
      else if (role === "customer") badgeClass += " customer";

      return (
        <span key={role} className={badgeClass}>
          {role.toUpperCase()}
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
            <span>Total: {total.toLocaleString()}</span>
          </div>
        </div>

        <div className="filter-row">
          <SearchInput
            value={query.search}
            onChange={query.setSearch}
            placeholder="Search by name, phone, email..."
          />
          <FilterSelect
            value={query.status}
            onChange={query.setStatus}
            options={[
              { value: "all", label: "All Roles" },
              { value: "customer", label: "Customers" },
              { value: "cleaner", label: "Cleaners" },
              { value: "admin", label: "Admins" },
            ]}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Loading users...</p>
          </div>
        ) : visibleUsers.length === 0 ? (
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
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="user-id-cell" title={user.id}>
                      #{user.id}
                    </td>
                    <td className="user-name">{user.full_name || "N/A"}</td>
                    <td className="user-phone-cell">
                      {formatIndianPhoneForDisplay(user.phone)}
                    </td>
                    <td className="user-email-cell" title={user.email || "N/A"}>
                      {user.email || "N/A"}
                    </td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <PaginationControls
          page={query.page}
          pageSize={query.pageSize}
          total={visibleTotal}
          onPageChange={query.setPage}
        />
      </div>
    </DashboardLayout>
  );
}
