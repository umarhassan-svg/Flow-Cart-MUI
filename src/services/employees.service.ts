// --- MOCK ROLES & USERS DATA (Copied from your prompt) ---

// NOTE: In a real app, 'bcrypt' would handle password hashing server-side.
// We'll mock the required data fields here for front-end consumption.
import type { Employee } from "../types/Employee";
const users = [
  {
    id: "u1",
    name: "Super Admin",
    email: "admin@test.com",
    roles: ["admin"],
    // Added specific employee details
    jobTitle: "Chief Executive Officer",
    department: "Executive",
    reportsTo: "N/A (Owner)",
    avatar: "/static/images/avatar/1.jpg",
    phone: "+1 (555) 123-0001",
    dob: "05-15-1980",
    cnic: "11111-1111111-1",
    hireDate: "Jan 1, 2015",
    address: { street: "10 Downing St", city: "London", country: "UK" },
  },
  {
    id: "u2",
    name: "Sarah Manager",
    email: "manager@test.com",
    roles: ["store_manager"],
    jobTitle: "Store Manager",
    department: "Retail Operations",
    reportsTo: "Super Admin (u1)",
    avatar: "/static/images/avatar/2.jpg",
    phone: "+1 (555) 123-0002",
    dob: "08-20-1992",
    cnic: "22222-2222222-2",
    hireDate: "Mar 10, 2019",
    address: { street: "45 Main St", city: "New York", country: "USA" },
  },
  {
    id: "u3",
    name: "Ivan Inventory",
    email: "inventory@test.com",
    roles: ["inventory_clerk"],
    jobTitle: "Inventory Clerk",
    department: "Supply Chain",
    reportsTo: "Sarah Manager (u2)",
    avatar: "/static/images/avatar/3.jpg",
    phone: "+1 (555) 123-0003",
    dob: "11-05-1995",
    cnic: "33333-3333333-3",
    hireDate: "Sep 25, 2020",
    address: { street: "123 Warehouse Rd", city: "Dallas", country: "USA" },
  },
  {
    id: "u4",
    name: "Clara Support",
    email: "support@test.com",
    roles: ["support_agent"],
    jobTitle: "Support Agent",
    department: "Customer Service",
    reportsTo: "Super Admin (u1)",
    avatar: "/static/images/avatar/4.jpg",
    phone: "+1 (555) 123-0004",
    dob: "03-12-1998",
    cnic: "44444-4444444-4",
    hireDate: "Feb 1, 2021",
    address: { street: "55 Help Desk Ln", city: "Toronto", country: "Canada" },
  },
  {
    id: "u5",
    name: "Alex Auditor",
    email: "auditor@test.com",
    roles: ["auditor"],
    jobTitle: "Financial Auditor",
    department: "Finance",
    reportsTo: "N/A (External)",
    avatar: "/static/images/avatar/5.jpg",
    phone: "+1 (555) 123-0005",
    dob: "01-01-1975",
    cnic: "55555-5555555-5",
    hireDate: "Aug 1, 2018",
    address: { street: "789 Accounting Way", city: "Zurich", country: "Switzerland" },
  },
  // We'll skip customers (u6, u7) as they are typically not displayed on an employee overview page.
];
export const fetchEmployeeProfile = async (userId : string) : Promise<Employee> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const employee = users.find(u => u.id === userId || u.email === userId);
  
  if (!employee) {
    // In a real app, this would be an HTTP 404 error
    throw new Error(`Employee with ID/Email ${userId} not found.`);
  }

  // Find the manager's name using the reportsTo ID
  const managerName = employee.reportsTo && employee.reportsTo.includes('(u') 
  ? users.find(u => u.id === employee.reportsTo.match(/\(([^)]+)\)/)?.[1])?.name 
  : employee.reportsTo;
      
  return { 
      ...employee, 
      isActive: true,
      managerName: managerName || 'N/A'
  };
};

export const fetchColleagues = async (currentEmployeeId : string) : Promise<Employee[]> => {
    // Get the department of the current user
    const currentUser = users.find(u => u.id === currentEmployeeId);
    if (!currentUser) return [];

    return users.map(employee => ({
    ...employee,
    isActive: true,
    managerName: employee.reportsTo || 'N/A'
}));
};