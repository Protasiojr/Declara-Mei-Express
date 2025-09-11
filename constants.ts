
import { User, Company, Employee, Product, Service, Sale, Client } from './types';

export const MOCK_USER: User = {
  name: 'Usuário Padrão',
  email: 'user@test.com',
  profilePicture: 'https://picsum.photos/100',
  profileType: 'User',
};

export const MOCK_ADMIN: User = {
    name: 'Administrador',
    email: 'admin@test.com',
    profilePicture: 'https://picsum.photos/100',
    profileType: 'Admin',
};


export const MOCK_COMPANY: Company = {
  name: 'Minha Empresa MEI',
  entrepreneur: 'João da Silva',
  cnpj: '12.345.678/0001-99',
  creationDate: '2023-01-15',
  address: 'Rua das Flores, 123, São Paulo, SP',
};

export const MOCK_EMPLOYEE: Employee = {
  id: 1,
  fullName: 'Maria Oliveira',
  address: 'Avenida Principal, 456, São Paulo, SP',
  phone: '(11) 98765-4321',
  registrationData: 'PIS: 123.45678.90-1, CTPS: 1234567-0001 SP',
};

export const MOCK_CLIENTS: Client[] = [
  { 
    id: 1, 
    clientType: 'Individual',
    fullName: 'Carlos Pereira', 
    address: 'Rua das Palmeiras, 789, Rio de Janeiro, RJ', 
    phone: '(21) 99876-5432', 
    cpf: '123.456.789-00' 
  },
  { 
    id: 2, 
    clientType: 'Company',
    companyName: 'ABC Logística Ltda',
    tradeName: 'ABC Log',
    cnpj: '98.765.432/0001-11',
    stateRegistration: 'Isento',
    fullName: 'Ana Souza', // Contact person
    address: 'Avenida das Nações, 101, Brasília, DF', 
    phone: '(61) 98765-1234'
  },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Produto A', price: 25.5, type: 'Regular' },
  { id: 2, name: 'Produto B (Industrializado)', price: 150.0, type: 'Industrializado' },
  { id: 3, name: 'Produto C', price: 15.0, type: 'Regular' },
];

export const MOCK_SERVICES: Service[] = [
  { id: 1, name: 'Consultoria', price: 200.0 },
  { id: 2, name: 'Manutenção', price: 120.0 },
];

export const MOCK_SALES: Sale[] = [
    { id: 1, item: MOCK_PRODUCTS[0], quantity: 2, total: 51.0, date: new Date().toISOString().split('T')[0], withInvoice: false, clientType: 'Consumidor Comum'},
    { id: 2, item: MOCK_PRODUCTS[1], quantity: 1, total: 150.0, date: new Date().toISOString().split('T')[0], withInvoice: true, clientType: 'Empresa'},
    { id: 3, item: MOCK_SERVICES[0], quantity: 1, total: 200.0, date: new Date().toISOString().split('T')[0], withInvoice: true, clientType: 'Empresa'},
];