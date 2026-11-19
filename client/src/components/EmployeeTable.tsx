import { useState } from "react";
import type { Employee } from "../types/employee";

type EmployeeTableProps = {
  employees: Employee[];
  loading: boolean;
  loadError: string;
  actionError: string;
  notice: string;
  deletingId: number | null;
  onRetry: () => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
};

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function EmployeeTable({
  employees,
  loading,
  loadError,
  actionError,
  notice,
  deletingId,
  onRetry,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
  const visibleEmployees = normalizedSearch
    ? employees.filter((employee) =>
        employee.name.toLocaleLowerCase().includes(normalizedSearch),
      )
    : employees;
  const countLabel = normalizedSearch
    ? `${visibleEmployees.length} ${visibleEmployees.length === 1 ? "match" : "matches"}`
    : `${employees.length} ${employees.length === 1 ? "employee" : "employees"}`;

  return (
    <section className="directory-panel" aria-labelledby="directory-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">EMPLOYEE RECORDS</p>
          <h2 id="directory-title">Directory</h2>
        </div>
        <span className="count-pill">
          <span className="count-dot" />
          {countLabel}
        </span>
      </div>

      {notice && <p className="notice" role="status">{notice}</p>}
      {actionError && <p className="message message-error" role="alert">{actionError}</p>}

      {!loading && !loadError && employees.length > 0 && (
        <label className="search-box">
          <span aria-hidden="true" className="search-icon" />
          <span className="visually-hidden">Search employees by name</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name"
            autoComplete="off"
          />
          {searchTerm && (
            <button
              className="search-clear"
              type="button"
              onClick={() => setSearchTerm("")}
              aria-label="Clear name search"
            >
              Clear
            </button>
          )}
        </label>
      )}

      {loading ? (
        <div className="list-state" role="status">Loading the directory…</div>
      ) : loadError ? (
        <div className="list-state list-state-error">
          <p>{loadError}</p>
          <button className="text-button" type="button" onClick={onRetry}>
            Try again
          </button>
        </div>
      ) : employees.length === 0 ? (
        <div className="list-state empty-state">
          <span className="empty-mark" aria-hidden="true">+</span>
          <h3>Your directory is ready</h3>
          <p>Add your first employee using the form.</p>
        </div>
      ) : visibleEmployees.length === 0 ? (
        <div className="list-state empty-state">
          <h3>No names match</h3>
          <p>Try a different search or clear the current one.</p>
          <button className="text-button" type="button" onClick={() => setSearchTerm("")}>
            Clear search
          </button>
        </div>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">EMPLOYEE</th>
                <th scope="col">JOB ROLE</th>
                <th scope="col">ADDED</th>
                <th scope="col"><span className="visually-hidden">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {visibleEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <div className="employee-cell">
                      <span className="avatar" aria-hidden="true">{initials(employee.name)}</span>
                      <span className="employee-details">
                        <strong>{employee.name}</strong>
                        <span>{employee.email}</span>
                      </span>
                    </div>
                  </td>
                  <td><span className="role-label">{employee.role}</span></td>
                  <td className="date-cell">{formatDate(employee.created_at)}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="text-button"
                        type="button"
                        onClick={() => onEdit(employee)}
                        aria-label={`Edit ${employee.name}`}
                      >
                        Edit
                      </button>
                      <button
                        className="text-button delete-button"
                        type="button"
                        onClick={() => onDelete(employee)}
                        disabled={deletingId === employee.id}
                        aria-label={`Delete ${employee.name}`}
                      >
                        {deletingId === employee.id ? "Removing…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="panel-footnote">Update a record when someone's details change.</p>
    </section>
  );
}

export default EmployeeTable;