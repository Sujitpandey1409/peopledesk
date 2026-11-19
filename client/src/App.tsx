import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  createEmployee,
  deleteEmployee,
  getApiErrorMessage,
  getEmployees,
  updateEmployee,
  type Employee,
  type EmployeeInput,
} from "./api/employees";
import "./App.css";

const blankEmployee: EmployeeInput = { name: "", email: "", role: "" };

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState<EmployeeInput>(blankEmployee);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      setEmployees(await getEmployees());
    } catch (error) {
      setLoadError(
        getApiErrorMessage(error, "Employees could not be loaded. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  function resetForm() {
    setForm(blankEmployee);
    setEditingId(null);
  }

  function beginEdit(employee: Employee) {
    setForm({ name: employee.name, email: employee.email, role: employee.role });
    setEditingId(employee.id);
    setActionError("");
    setNotice("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setActionError("");
    setNotice("");

    try {
      if (editingId === null) {
        await createEmployee(form);
        setNotice("Employee added to the directory.");
      } else {
        await updateEmployee(editingId, form);
        setNotice("Employee details updated.");
      }

      resetForm();
      await loadEmployees();
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, "Your changes could not be saved. Please try again."),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(employee: Employee) {
    const confirmed = window.confirm(`Remove ${employee.name} from the directory?`);
    if (!confirmed) return;

    setDeletingId(employee.id);
    setActionError("");
    setNotice("");

    try {
      await deleteEmployee(employee.id);
      setEmployees((current) => current.filter((person) => person.id !== employee.id));
      if (editingId === employee.id) resetForm();
      setNotice(`${employee.name} was removed from the directory.`);
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, "This employee could not be removed. Please try again."),
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="PeopleDesk home">
          <span className="brand-mark" aria-hidden="true">P</span>
          <span className="brand-name">people<span>desk</span></span>
        </a>
        <span className="topbar-note">A quieter way to keep team details</span>
      </header>

      <main id="top" className="main-content">
        <section className="intro" aria-labelledby="page-title">
          <div>
            <p className="eyebrow"><span className="eyebrow-line" /> TEAM DIRECTORY</p>
            <h1 id="page-title">Everyone,<br />in one place.</h1>
          </div>
          <p className="intro-copy">
            Names, roles, and the right way to get in touch. Keep the essentials close
            so your team can get on with the work.
          </p>
        </section>

        <section className="workspace" aria-label="Employee directory">
          <div className="directory-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">YOUR PEOPLE</p>
                <h2>Directory</h2>
              </div>
              <span className="count-pill">
                <span className="count-dot" />
                {employees.length} {employees.length === 1 ? "person" : "people"}
              </span>
            </div>

            {notice && <p className="notice" role="status">{notice}</p>}
            {actionError && <p className="message message-error" role="alert">{actionError}</p>}

            {loading ? (
              <div className="list-state" role="status">Loading the directory…</div>
            ) : loadError ? (
              <div className="list-state list-state-error">
                <p>{loadError}</p>
                <button className="text-button" type="button" onClick={() => void loadEmployees()}>
                  Try again
                </button>
              </div>
            ) : employees.length === 0 ? (
              <div className="list-state empty-state">
                <span className="empty-mark" aria-hidden="true">+</span>
                <h3>A good place to start</h3>
                <p>No one is in the directory yet. Add your first teammate using the form.</p>
              </div>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">EMPLOYEE</th>
                      <th scope="col">ROLE</th>
                      <th scope="col">ADDED</th>
                      <th scope="col"><span className="visually-hidden">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => (
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
                        <td className="date-cell">
                          {new Date(employee.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="text-button"
                              type="button"
                              onClick={() => beginEdit(employee)}
                              aria-label={`Edit ${employee.name}`}
                            >
                              Edit
                            </button>
                            <button
                              className="text-button delete-button"
                              type="button"
                              onClick={() => void handleDelete(employee)}
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
            <p className="panel-footnote">A clear list makes the everyday a little easier.</p>
          </div>

          <aside className="form-panel" aria-labelledby="form-title">
            <div className="form-heading">
              <p className="eyebrow">{editingId === null ? "GROW YOUR TEAM" : "MAKE A CHANGE"}</p>
              <h2 id="form-title">{editingId === null ? "Add a person" : "Edit details"}</h2>
              <p>{editingId === null ? "Just the details people need." : "Update this person's directory details."}</p>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                maxLength={100}
                placeholder="e.g. Sam Rivera"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />

              <label htmlFor="email">Work email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={255}
                placeholder="sam@company.com"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />

              <label htmlFor="role">Job role</label>
              <input
                id="role"
                name="role"
                type="text"
                autoComplete="organization-title"
                maxLength={100}
                placeholder="e.g. Product designer"
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value })}
                required
              />

              <button className="submit-button" type="submit" disabled={saving}>
                {saving ? "Saving…" : editingId === null ? "Add to directory" : "Save changes"}
                {!saving && <span aria-hidden="true">↗</span>}
              </button>
              {editingId !== null && (
                <button className="cancel-button" type="button" onClick={resetForm}>
                  Cancel editing
                </button>
              )}
            </form>
            <p className="form-note">Each email address can belong to one employee.</p>
          </aside>
        </section>
      </main>

      <footer className="footer">
        <span>PeopleDesk</span>
        <span>Team details, kept simple.</span>
      </footer>
    </div>
  );
}

export default App;