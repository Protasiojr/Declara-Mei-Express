

import { User, Company, Employee, Product, Service, Sale, Client, ServiceProvision, Address } from './types';

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

const MOCK_ADDRESS_1: Address = {
  street: 'Rua das Flores',
  number: '123',
  complement: '',
  neighborhood: 'Centro',
  city: 'São Paulo',
  state: 'SP',
  zipCode: '01000-000'
};

const MOCK_ADDRESS_2: Address = {
    street: 'Avenida Principal',
    number: '456',
    complement: 'Apto 10',
    neighborhood: 'Vila Madalena',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '05445-000'
};

const MOCK_ADDRESS_3: Address = {
    street: 'Rua das Pedras',
    number: '789',
    complement: '',
    neighborhood: 'Copacabana',
    city: 'Rio de Janeiro',
    state: 'RJ',
    zipCode: '22010-010'
};

const MOCK_ADDRESS_4: Address = {
    street: 'Alameda dos Anjos',
    number: '101',
    complement: '',
    neighborhood: 'Lourdes',
    city: 'Belo Horizonte',
    state: 'MG',
    zipCode: '30170-020'
};

const MOCK_ADDRESS_5: Address = {
    street: 'Travessa das Palmeiras',
    number: '45',
    complement: '',
    neighborhood: 'Pelourinho',
    city: 'Salvador',
    state: 'BA',
    zipCode: '40026-010'
};


export const MOCK_COMPANY: Company = {
  name: 'Minha Empresa MEI',
  entrepreneur: 'João da Silva',
  cnpj: '12.345.678/0001-99',
  creationDate: '2023-01-15',
  address: MOCK_ADDRESS_1,
};

export const MOCK_EMPLOYEE: Employee = {
  id: 1,
  fullName: 'Maria Oliveira',
  address: MOCK_ADDRESS_2,
  phone: '(11) 98765-4321',
  pis: '123.45678.90-1',
  ctps: '1234567-0001 SP',
  vacationStart: '2025-01-02',
  vacationEnd: '2025-01-31'
};

export const MOCK_CLIENTS: Client[] = [
    { id: 1, clientType: 'Individual', fullName: 'Carlos Pereira', address: MOCK_ADDRESS_3, phone: '(21) 99887-6543', cpf: '123.456.789-00' },
    { id: 2, clientType: 'Company', fullName: 'Ana Souza', address: MOCK_ADDRESS_4, phone: '(31) 98765-1234', companyName: 'Construções ABC Ltda.', tradeName: 'ABC Construções', cnpj: '98.765.432/0001-11', stateRegistration: 'Isento' },
    { id: 3, clientType: 'Individual', fullName: 'Joana Martins', address: MOCK_ADDRESS_5, phone: '(71) 99999-8888', cpf: '111.222.333-44' },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 1, sku: 'CM-BR-01', name: 'Camiseta Branca', price: 25.00, type: 'Regular' },
  { id: 2, sku: 'CN-PR-02', name: 'Caneca Personalizada', price: 15.50, type: 'Industrializado' },
  { id: 3, sku: 'BN-PT-03', name: 'Boné Preto', price: 30.00, type: 'Regular' },
];

export const MOCK_SERVICES: Service[] = [
  { id: 1, name: 'Consultoria de Marketing', price: 150.00 },
  { id: 2, name: 'Manutenção de Computador', price: 80.00 },
  { id: 3, name: 'Design Gráfico - Logotipo', price: 300.00 },
];

export const MOCK_SALES: Sale[] = [
  { id: 1, item: MOCK_PRODUCTS[0], quantity: 2, total: 50.00, date: '2025-07-20', withInvoice: true, client: MOCK_CLIENTS[0] },
  { id: 2, item: MOCK_SERVICES[1], quantity: 1, total: 80.00, date: '2025-07-19', withInvoice: false, client: MOCK_CLIENTS[1] },
  { id: 3, item: MOCK_PRODUCTS[1], quantity: 10, total: 155.00, date: '2025-07-18', withInvoice: true, client: MOCK_CLIENTS[1] },
  { id: 4, item: MOCK_PRODUCTS[2], quantity: 1, total: 30.00, date: '2025-07-15', withInvoice: false, client: null },
];

export const MOCK_SERVICE_PROVISIONS: ServiceProvision[] = [
    { id: 1, service: MOCK_SERVICES[0], quantity: 1, total: 150.00, date: '2025-07-22', withInvoice: true, client: MOCK_CLIENTS[1] },
    { id: 2, service: MOCK_SERVICES[2], quantity: 1, total: 300.00, date: '2025-07-21', withInvoice: true, client: null }
];