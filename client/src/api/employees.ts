import axios from "axios";

export interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export type EmployeeInput = Pick<Employee, "name" | "email" | "role">;

type ApiSuccess<T> = {
  success: true;
  data: T;
};

type ApiError = {
  message?: string;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

export async function getEmployees(): Promise<Employee[]> {
  const response = await api.get<ApiSuccess<Employee[]>>("/employees");
  return response.data.data;
}

export async function createEmployee(input: EmployeeInput): Promise<Employee> {
  const response = await api.post<ApiSuccess<Employee>>("/employees", input);
  return response.data.data;
}

export async function updateEmployee(
  id: number,
  input: EmployeeInput,
): Promise<Employee> {
  const response = await api.put<ApiSuccess<Employee>>(`/employees/${id}`, input);
  return response.data.data;
}

export async function deleteEmployee(id: number): Promise<void> {
  await api.delete(`/employees/${id}`);
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiError>(error)) {
    const responseMessage = error.response?.data?.message;

    if (responseMessage) {
      return responseMessage;
    }

    if (error.request) {
      return "The API could not be reached. Check that the server is running.";
    }
  }

  return fallback;
}