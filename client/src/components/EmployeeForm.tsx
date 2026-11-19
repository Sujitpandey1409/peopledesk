import type { FormEvent } from "react";
import type { Employee, EmployeeInput } from "../types/employee";

type EmployeeFormProps = {
  employeeBeingEdited: Employee | null;
  form: EmployeeInput;
  saving: boolean;
  error: string;
  onChange: (field: keyof EmployeeInput, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

function EmployeeForm({
  employeeBeingEdited,
  form,
  saving,
  error,
  onChange,
  onSubmit,
  onCancel,
}: EmployeeFormProps) {
  const isEditing = employeeBeingEdited !== null;

  return (
    <aside className="form-panel" aria-labelledby="form-title">
      <div className="form-heading">
        <p className="eyebrow">{isEditing ? "UPDATE A RECORD" : "NEW RECORD"}</p>
        <h2 id="form-title">{isEditing ? "Edit employee" : "Add an employee"}</h2>
        <p>
          {isEditing
            ? "Change the details below and save when you're done."
            : "Add a name, work email, and job role to the directory."}
        </p>
      </div>

      {error && <p className="message message-error" role="alert">{error}</p>}

      <form onSubmit={onSubmit}>
        <label htmlFor="name">Full name</label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          maxLength={100}
          placeholder="e.g. Sam Rivera"
          value={form.name}
          onChange={(event) => onChange("name", event.target.value)}
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
          onChange={(event) => onChange("email", event.target.value)}
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
          onChange={(event) => onChange("role", event.target.value)}
          required
        />

        <button className="submit-button" type="submit" disabled={saving}>
          {saving ? "Saving…" : isEditing ? "Save changes" : "Add employee"}
          {!saving && <span aria-hidden="true">↗</span>}
        </button>
        {isEditing && (
          <button className="cancel-button" type="button" onClick={onCancel}>
            Cancel editing
          </button>
        )}
      </form>

      <p className="form-note">Each email address can belong to one employee.</p>
    </aside>
  );
}

export default EmployeeForm;