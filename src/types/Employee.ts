export interface Employee {
  id: string; // Employee ID should be unique, often a string or number
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  hireDate: string; // Use the built-in Date type for dates
  roles: string[]; // An employee can have multiple roles
  managerId?: string; // Optional property (use '?' for properties that might not exist)
    isActive: boolean;
    managerName: string;
    avatar: string;
    phone: string;
    dob: string;
    cnic: string;
    address: {
      street: string;
      city: string;
      country: string;
    };
}