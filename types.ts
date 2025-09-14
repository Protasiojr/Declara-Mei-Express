

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

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Company {
  name: string;
  entrepreneur: string;
  cnpj: string;
  creationDate: string;
  address: Address;
}

export interface Employee {
  id: number;
  fullName: string;
  address: Address;
  phone: string;
  pis: string;
  ctps: string;
  vacationStart?: string;
  vacationEnd?: string;
}

export interface Client {
  id: number;
  clientType: 'Individual' | 'Company';
  fullName: string; // Individual's name or Company's contact person
  address: Address;
  phone: string;
  cpf?: string;
  companyName?: string;
  tradeName?: string;
  cnpj?: string;
  stateRegistration?: string;
}

export interface Product {
  id: number;
  sku: string;
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
  client: Client | null;
}

export interface ServiceProvision {
  id: number;
  service: Service;
  quantity: number;
  total: number;
  date: string;
  withInvoice: boolean;
  client: Client | null;
}