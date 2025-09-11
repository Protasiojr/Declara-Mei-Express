
export enum Page {
  Dashboard = 'Dashboard',
  Employee = 'Employee',
  Client = 'Client',
  Sales = 'Sales',
  Products = 'Products',
  Services = 'Services',
  Company = 'Company',
  Profile = 'Profile',
  Reports = 'Reports',
  Settings = 'Settings',
}

export interface User {
  name: string;
  email: string;
  profilePicture: string;
  profileType: 'Admin' | 'User';
}

export interface Company {
  name: string;
  entrepreneur: string;
  cnpj: string;
  creationDate: string;
  address: string;
}

export interface Employee {
  id: number;
  fullName: string;
  address: string;
  phone: string;
  registrationData: string;
}

export interface Client {
  id: number;
  clientType: 'Individual' | 'Company';
  fullName: string; // Individual's name or Company's contact person
  address: string;
  phone: string;
  cpf?: string;
  companyName?: string;
  tradeName?: string;
  cnpj?: string;
  stateRegistration?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  type: 'Regular' | 'Industrializado';
}

export interface Service {
  id: number;
  name: string;
  price: number;
}

export interface Sale {
  id: number;
  item: Product | Service;
  quantity: number;
  total: number;
  date: string;
  withInvoice: boolean;
  clientType: 'Empresa' | 'Consumidor Comum';
}