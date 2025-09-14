

export enum Page {
  Dashboard = 'Dashboard',
  Employee = 'Employee',
  Client = 'Client',
  Sales = 'Sales',
  Products = 'Products',
  Financial = 'Financial',
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
  barcode?: string;
}

export interface Service {
  id: number;
  name: string;
  price: number;
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

export type ExpenseCategory = 'Fornecedores' | 'Aluguel' | 'Salário' | 'Impostos' | 'Marketing' | 'Outros';

export interface AccountPayable {
  id: number;
  description: string;
  category: ExpenseCategory;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  status: 'Pending' | 'Paid';
}

export interface AccountReceivable {
  id: number;
  saleId: number;
  client: Client;
  amount: number;
  issueDate: string;
  dueDate: string;
  paymentDate?: string;
  status: 'Pending' | 'Paid';
}

export type StockMovementType = 'Entrada' | 'Ajuste' | 'Perda';

export interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  type: StockMovementType;
  quantity: number; // can be positive or negative depending on type
  reason: string;
  date: string;
  operatorName: string;
}