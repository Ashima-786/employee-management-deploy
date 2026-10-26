// Changed import from "./profile-types" to "./workspace-data"
import { Employee, Project } from "./workspace-data";

// Fixed the Vite environment variable syntax to use bracket notation
const API_BASE_URL = import.meta.env['VITE_API_URL'] || "http://localhost:5000/api";

export const getEmployees = async (): Promise<Employee[]> => {
  const response = await fetch(`${API_BASE_URL}/employees`);
  if (!response.ok) throw new Error("Failed to fetch employees");
  return response.json();
};

export const createEmployee = async (employeeData: Partial<Employee>): Promise<Employee> => {
  const response = await fetch(`${API_BASE_URL}/employees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(employeeData),
  });
  if (!response.ok) throw new Error("Failed to create employee");
  return response.json();
};

export const deleteEmployee = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete employee");
};