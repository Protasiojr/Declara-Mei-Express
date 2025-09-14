



// FIX: Import the missing ServiceProvision type.
import { User, Company, Employee, Product, Service, Sale, Client, Address, ServiceProvision } from './types';

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
  { id: 1, sku: 'CM-BR-01', name: 'Camiseta Branca', category: 'Vestuário', description: 'Camiseta de algodão branca, gola redonda.', unitOfMeasure: 'un', costPrice: 12.00, price: 25.00, minStock: 10, currentStock: 50, type: 'Regular' },
  { id: 2, sku: 'CN-PR-02', name: 'Caneca Personalizada', category: 'Utensílios', description: 'Caneca de cerâmica com estampa personalizada.', unitOfMeasure: 'un', costPrice: 7.50, price: 15.50, minStock: 20, currentStock: 35, type: 'Industrializado' },
  { id: 3, sku: 'BN-PT-03', name: 'Boné Preto', category: 'Acessórios', description: 'Boné de aba curva, cor preta.', unitOfMeasure: 'un', costPrice: 15.00, price: 30.00, minStock: 5, currentStock: 15, type: 'Regular' },
];

export const MOCK_SERVICES: Service[] = [
  { id: 1, name: 'Consultoria de Marketing', price: 150.00 },
  { id: 2, name: 'Manutenção de Computador', price: 80.00 },
  { id: 3, name: 'Design Gráfico - Logotipo', price: 300.00 },
];

export const MOCK_SALES: Sale[] = [
  { 
    id: 1, 
    items: [
        { item: MOCK_PRODUCTS[0], quantity: 2, unitPrice: 25.00, total: 50.00 }
    ],
    subtotal: 50.00,
    discount: 0,
    total: 50.00,
    payments: [{ method: 'Credit Card', amount: 50.00 }],
    changeDue: 0,
    date: '2025-07-20', 
    withInvoice: true, 
    client: MOCK_CLIENTS[0] 
  },
  { 
    id: 2, 
    items: [
        { item: MOCK_SERVICES[1], quantity: 1, unitPrice: 80.00, total: 80.00 }
    ],
    subtotal: 80.00,
    discount: 0,
    total: 80.00,
    payments: [{ method: 'Cash', amount: 100.00 }],
    changeDue: 20.00,
    date: '2025-07-19', 
    withInvoice: false, 
    client: MOCK_CLIENTS[1] 
  },
  { 
    id: 3, 
    items: [
        { item: MOCK_PRODUCTS[1], quantity: 10, unitPrice: 15.50, total: 155.00 }
    ],
    subtotal: 155.00,
    discount: 0,
    total: 155.00,
    payments: [{ method: 'Pix', amount: 155.00 }],
    changeDue: 0,
    date: '2025-07-18', 
    withInvoice: true, 
    client: MOCK_CLIENTS[1] 
  },
  { 
    id: 4, 
    items: [
        { item: MOCK_PRODUCTS[2], quantity: 1, unitPrice: 30.00, total: 30.00 },
        { item: MOCK_PRODUCTS[0], quantity: 1, unitPrice: 25.00, total: 25.00 }
    ],
    subtotal: 55.00,
    discount: 5.00,
    total: 50.00,
    payments: [{ method: 'Debit Card', amount: 50.00 }],
    changeDue: 0,
    date: '2025-07-15', 
    withInvoice: false, 
    client: null 
  },
];
// FIX: Add missing MOCK_SERVICE_PROVISIONS constant.
export const MOCK_SERVICE_PROVISIONS: ServiceProvision[] = [
    {
        id: 1,
        service: MOCK_SERVICES[1], // Manutenção de Computador
        quantity: 1,
        total: 80.00,
        date: '2025-07-21',
        withInvoice: true,
        client: MOCK_CLIENTS[1] // Construções ABC Ltda.
    },
    {
        id: 2,
        service: MOCK_SERVICES[0], // Consultoria de Marketing
        quantity: 2,
        total: 300.00,
        date: '2025-07-20',
        withInvoice: false,
        client: MOCK_CLIENTS[2] // Joana Martins
    },
    {
        id: 3,
        service: MOCK_SERVICES[2], // Design Gráfico - Logotipo
        quantity: 1,
        total: 300.00,
        date: '2025-07-15',
        withInvoice: true,
        client: null
    }
];