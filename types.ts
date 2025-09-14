



export enum Page {
  Dashboard = 'Dashboard',
  Employee = 'Employee',
  Client = 'Client',
  Sales = 'Sales',
  Products = 'Products',
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
  name:string;
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
  category: string;
  description: string;
  unitOfMeasure: string;
  costPrice: number;
  price: number; // Sale Price
  minStock: number;
  currentStock: number;
  type: 'Regular' | 'Industrializado';
}

export interface Service {
  id: number;
  name: string;
  price: number;
}

// FIX: Add ServiceProvision interface for ServicesPage.
export interface ServiceProvision {
  id: number;
  service: Service;
  quantity: number;
  total: number;
  date: string;
  withInvoice: boolean;
  client: Client | null;
}

export interface SaleItem {
  item: Product | Service;
  quantity: number;
  unitPrice: number; // Price at the time of sale
  total: number;
}

export type PaymentMethod = 'Cash' | 'Debit Card' | 'Credit Card' | 'Pix' | 'On Account';

export interface Payment {
  method: PaymentMethod;
  amount: number;
}

export interface Sale {
  id: number;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  payments: Payment[];
  changeDue: number;
  date: string;
  withInvoice: boolean;
  client: Client | null;
}

export type CashTransactionType = 'Opening' | 'Supply' | 'Withdrawal' | 'Sale';

export interface CashTransaction {
  id: number;
  type: CashTransactionType;
  amount: number; // Always positive. For withdrawals, the logic will treat it as negative.
  timestamp: string;
  description: string;
  operatorName: string;
  saleId?: number;
}

export interface CashSession {
  id: number;
  operatorName: string;
  openingBalance: number;
  closingBalance?: number;
  expectedBalance?: number;
  difference?: number;
  openedAt: string;
  closedAt?: string;
  status: 'Open' | 'Closed';
  transactions: CashTransaction[];
}
