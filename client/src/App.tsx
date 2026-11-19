import { useEffect, useState, type FormEvent } from "react";
import {
  createEmployee,
  deleteEmployee,
  getApiErrorMessage,
  getEmployees,
  updateEmployee,
} from "./api/employees";
import EmployeeForm from "./components/EmployeeForm";
import EmployeeTable from "./components/EmployeeTable";
import type { Employee, EmployeeInput } from "./types/employee";
import "./App.css";

const blankEmployee: EmployeeInput = { name: "", email: "", role: "" };

function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState<EmployeeInput>(blankEmployee);
  const [employeeBeingEdited, setEmployeeBeingEdited] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isCurrent = true;

    getEmployees()
      .then((records) => {
        if (isCurrent) {
          setEmployees(records);
          setLoadError("");
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setLoadError(
            getApiErrorMessage(error, "Employees could not be loaded. Please try again."),
          );
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  async function loadEmployees() {
    try {
      setEmployees(await getEmployees());
      setLoadError("");
    } catch (error) {
      setLoadError(
        getApiErrorMessage(error, "Employees could not be loaded. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  }

  function retryLoading() {
    setLoading(true);
    setLoadError("");
    void loadEmployees();
  }

  function clearForm() {
    setForm(blankEmployee);
    setEmployeeBeingEdited(null);
    setFormError("");
  }

  function startEditing(employee: Employee) {
    setForm({ name: employee.name, email: employee.email, role: employee.role });
    setEmployeeBeingEdited(employee);
    setFormError("");
    setNotice("");
  }

  function updateField(field: keyof EmployeeInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setFormError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    setNotice("");

    try {
      if (employeeBeingEdited) {
        await updateEmployee(employeeBeingEdited.id, form);
        setNotice("Employee details saved.");
      } else {
        await createEmployee(form);
        setNotice("Employee added to the directory.");
      }

      clearForm();
      await loadEmployees();
    } catch (error) {
      setFormError(
        getApiErrorMessage(error, "Your changes could not be saved. Please try again."),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(employee: Employee) {
    if (!window.confirm(`Remove ${employee.name} from the directory?`)) return;

    setDeletingId(employee.id);
    setActionError("");
    setNotice("");

    try {
      await deleteEmployee(employee.id);
      setEmployees((current) => current.filter((person) => person.id !== employee.id));
      if (employeeBeingEdited?.id === employee.id) clearForm();
      setNotice("Employee removed from the directory.");
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
        <span className="topbar-note">EMPLOYEE DIRECTORY</span>
      </header>

      <main id="top" className="main-content">
        <section className="intro" aria-labelledby="page-title">
          <div>
            <p className="eyebrow"><span className="eyebrow-line" /> PEOPLE, AT A GLANCE</p>
            <h1 id="page-title">A clear view<br />of your team.</h1>
          </div>
          <p className="intro-copy">
            Keep names, work emails, and job roles together. Add someone new or update
            a detail when things change.
          </p>
        </section>

        <section className="workspace" aria-label="Employee directory">
          <EmployeeTable
            employees={employees}
            loading={loading}
            loadError={loadError}
            actionError={actionError}
            notice={notice}
            deletingId={deletingId}
            onRetry={retryLoading}
            onEdit={startEditing}
            onDelete={(employee) => void handleDelete(employee)}
          />
          <EmployeeForm
            employeeBeingEdited={employeeBeingEdited}
            form={form}
            saving={saving}
            error={formError}
            onChange={updateField}
            onSubmit={(event) => void handleSubmit(event)}
            onCancel={clearForm}
          />
        </section>
      </main>

      <footer className="footer">
        <span>PeopleDesk</span>
        <span>Names, roles, and work emails.</span>
      </footer>
    </div>
  );
}

export default App;