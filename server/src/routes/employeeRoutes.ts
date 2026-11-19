import { Router } from "express";
import { z } from "zod";
import pool from "../config/database";

const router = Router();

const employeeSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  role: z.string().trim().min(1, "Role is required").max(100),
});

const idSchema = z.coerce.number().int().positive();

type EmployeeRow = {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: Date;
} & Record<string, unknown>;

function validationResponse(issues: z.ZodIssue[]) {
  return {
    success: false,
    message: "Check the employee details and try again.",
    errors: issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  };
}

router.get("/", async (_req, res) => {
  const result = await pool.query<EmployeeRow>(
    `SELECT id, name, email, role, created_at
     FROM employees
     ORDER BY created_at DESC, id DESC`,
  );

  res.status(200).json({ success: true, data: result.rows });
});

router.post("/", async (req, res) => {
  const parsed = employeeSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json(validationResponse(parsed.error.issues));
    return;
  }

  const { name, email, role } = parsed.data;
  const result = await pool.query<EmployeeRow>(
    `INSERT INTO employees (name, email, role)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, role, created_at`,
    [name, email, role],
  );

  res.status(201).json({ success: true, data: result.rows[0] });
});

router.put("/:id", async (req, res) => {
  const parsedId = idSchema.safeParse(req.params.id);
  const parsedBody = employeeSchema.safeParse(req.body);

  if (!parsedId.success) {
    res.status(400).json({
      success: false,
      message: "Employee ID must be a positive integer.",
    });
    return;
  }

  if (!parsedBody.success) {
    res.status(400).json(validationResponse(parsedBody.error.issues));
    return;
  }

  const { name, email, role } = parsedBody.data;
  const result = await pool.query<EmployeeRow>(
    `UPDATE employees
     SET name = $1, email = $2, role = $3
     WHERE id = $4
     RETURNING id, name, email, role, created_at`,
    [name, email, role, parsedId.data],
  );

  if (result.rowCount === 0) {
    res.status(404).json({ success: false, message: "Employee not found." });
    return;
  }

  res.status(200).json({ success: true, data: result.rows[0] });
});

router.delete("/:id", async (req, res) => {
  const parsedId = idSchema.safeParse(req.params.id);

  if (!parsedId.success) {
    res.status(400).json({
      success: false,
      message: "Employee ID must be a positive integer.",
    });
    return;
  }

  const result = await pool.query(
    "DELETE FROM employees WHERE id = $1 RETURNING id",
    [parsedId.data],
  );

  if (result.rowCount === 0) {
    res.status(404).json({ success: false, message: "Employee not found." });
    return;
  }

  res.status(200).json({ success: true, message: "Employee deleted." });
});

export default router;