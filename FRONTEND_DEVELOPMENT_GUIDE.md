# TMS (Task Management System) - Frontend Development Guide

## Complete Frontend Development Prompt for React/Vite Application

### 📋 Overview
This guide provides complete instructions to build a professional Task Management System (TMS) frontend application. The backend API is already set up and running on `http://localhost:3000`.

---

## 🔌 API Endpoints Documentation

### **Base URL:** `http://localhost:3000/api`

### **Authentication Endpoints**
```
POST   /auth/login              - User login (returns accessToken & refreshToken)
POST   /auth/logout             - User logout
```

### **Company Master Endpoints**
```
GET    /companies               - Get all companies (active only)
GET    /companies/:id           - Get specific company by ID
POST   /companies               - Create new company (multipart/form-data, Admin only)
PUT    /companies/:id           - Update company (multipart/form-data, Admin only)
DELETE /companies/:id           - Soft delete company (deactivate, Admin only)
```

### **Role Master Endpoints**
```
GET    /roles                   - Get all roles
GET    /roles/:id               - Get specific role by ID
POST   /roles                   - Create new role (Admin only)
PUT    /roles/:id               - Update role (Admin only)
DELETE /roles/:id               - Delete role (Admin only)
```

### **User Master Endpoints**
```
GET    /users                   - Get all users (active only)
GET    /users/:id               - Get specific user by ID
POST   /users                   - Create new user (multipart/form-data, Admin only)
PUT    /users/:id               - Update user (multipart/form-data, Admin only)
DELETE /users/:id               - Soft delete user (deactivate, Admin only)
```

---

## 📊 Request/Response Examples

### **Authentication - Login**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "Password@123"
}

Response (200 OK):
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **Authentication - Logout**
```bash
POST /api/auth/logout
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response (200 OK):
{
  "message": "Logged out successfully"
}
```

### **Company - Create with Image**
```bash
POST /api/companies
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

Form Data:
- name: string (required)
- email: string (required, unique)
- phone: string (optional)
- address: string (optional)
- company_logo: file/image (optional, base64 returned)

Response (201 Created):
{
  "message": "Company created",
  "id": 1,
  "company_logo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA..."
}
```

### **Company - Get All**
```bash
GET /api/companies
Authorization: Bearer {accessToken}

Response (200 OK):
[
  {
    "id": 1,
    "name": "Acme Corp",
    "email": "info@acme.com",
    "phone": "123-456-7890",
    "address": "123 Main St",
    "company_logo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA...",
    "is_active": 1,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

### **Company - Update with New Image**
```bash
PUT /api/companies/1
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

Form Data:
- name: string (optional)
- email: string (optional)
- phone: string (optional)
- address: string (optional)
- company_logo: file/image (optional)

Response (200 OK):
{
  "message": "Company updated",
  "company_logo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA..."
}
```

### **User - Create with Profile Image**
```bash
POST /api/users
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

Form Data:
- company_id: integer (required)
- role_id: integer (required)
- name: string (required)
- email: string (required, unique)
- password: string (required)
- profile_image: file/image (optional)

Response (201 Created):
{
  "message": "User created",
  "id": 5,
  "profile_image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA..."
}
```

### **User - Get All**
```bash
GET /api/users
Authorization: Bearer {accessToken}

Response (200 OK):
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@test.com",
    "company": "Acme Corp",
    "role": "Admin",
    "is_active": 1
  }
]
```

### **Role - Create**
```bash
POST /api/roles
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Manager",
  "description": "Project Manager Role"
}

Response (201 Created):
{
  "message": "Role created",
  "id": 3
}
```

---

## 🛠️ Frontend Project Setup

### **Step 1: Create React + Vite Project**
```bash
npm create vite@latest tms-frontend -- --template react
cd tms-frontend
npm install
```

### **Step 2: Install Required Dependencies**
```bash
# Mantine UI & Dependencies
npm install @mantine/core @mantine/hooks @mantine/form @mantine/notifications @emotion/react @emotion/styled

# TanStack Query (React Query)
npm install @tanstack/react-query

# Zustand (State Management)
npm install zustand

# HTTP Client
npm install axios

# React Router
npm install react-router-dom

# Form Validation
npm install zod

# Image Upload
npm install react-dropzone

# Icons
npm install @tabler/icons-react

# Development Dependencies
npm install -D @types/react @types/react-dom
```

### **Step 3: Project Folder Structure**
```
src/
├── components/
│   ├── Auth/
│   │   ├── LoginForm.jsx
│   │   └── LogoutButton.jsx
│   ├── Layout/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── MainLayout.jsx
│   ├── Common/
│   │   ├── ConfirmModal.jsx
│   │   ├── ImageUpload.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ErrorAlert.jsx
│   └── Masters/
│       ├── Company/
│       │   ├── CompanyList.jsx
│       │   ├── CompanyForm.jsx
│       │   ├── CompanyDetail.jsx
│       │   └── CompanyTable.jsx
│       ├── User/
│       │   ├── UserList.jsx
│       │   ├── UserForm.jsx
│       │   ├── UserDetail.jsx
│       │   └── UserTable.jsx
│       └── Role/
│           ├── RoleList.jsx
│           ├── RoleForm.jsx
│           └── RoleTable.jsx
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── CompanyPage.jsx
│   ├── UserPage.jsx
│   ├── RolePage.jsx
│   └── NotFound.jsx
├── store/
│   ├── authStore.js        (Zustand - Authentication)
│   ├── uiStore.js          (Zustand - UI State)
│   └── index.js
├── hooks/
│   ├── useCompany.js       (TanStack Query - Company)
│   ├── useUser.js          (TanStack Query - User)
│   ├── useRole.js          (TanStack Query - Role)
│   └── useAuth.js          (TanStack Query - Auth)
├── services/
│   ├── api.js              (Axios instance with auth)
│   ├── authService.js
│   ├── companyService.js
│   ├── userService.js
│   └── roleService.js
├── utils/
│   ├── validators.js
│   ├── formatters.js
│   ├── constants.js
│   └── localStorage.js
├── App.jsx
├── App.css
└── main.jsx
```

---

## 🔐 Authentication Setup

### **File: src/store/authStore.js**
```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      setAccessToken: (token) => set({ accessToken: token }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
```

### **File: src/services/api.js**
```javascript
import axios from 'axios';
import useAuthStore from '../store/authStore';

const API_BASE_URL = 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor - Add token to headers
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 🔄 TanStack Query Hooks Setup

### **File: src/hooks/useCompany.js**
```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api';

const companyService = {
  getAll: () => apiClient.get('/companies').then((res) => res.data),
  getById: (id) => apiClient.get(`/companies/${id}`).then((res) => res.data),
  create: (data) => apiClient.post('/companies', data).then((res) => res.data),
  update: (id, data) => apiClient.put(`/companies/${id}`, data).then((res) => res.data),
  delete: (id) => apiClient.delete(`/companies/${id}`).then((res) => res.data),
};

export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: companyService.getAll,
  });
};

export const useCompanyById = (id) => {
  return useQuery({
    queryKey: ['company', id],
    queryFn: () => companyService.getById(id),
    enabled: !!id,
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: companyService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => companyService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: companyService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};
```

### **File: src/hooks/useUser.js**
```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api';

const userService = {
  getAll: () => apiClient.get('/users').then((res) => res.data),
  getById: (id) => apiClient.get(`/users/${id}`).then((res) => res.data),
  create: (data) => apiClient.post('/users', data).then((res) => res.data),
  update: (id, data) => apiClient.put(`/users/${id}`, data).then((res) => res.data),
  delete: (id) => apiClient.delete(`/users/${id}`).then((res) => res.data),
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  });
};

export const useUserById = (id) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
```

### **File: src/hooks/useRole.js**
```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api';

const roleService = {
  getAll: () => apiClient.get('/roles').then((res) => res.data),
  getById: (id) => apiClient.get(`/roles/${id}`).then((res) => res.data),
  create: (data) => apiClient.post('/roles', data).then((res) => res.data),
  update: (id, data) => apiClient.put(`/roles/${id}`, data).then((res) => res.data),
  delete: (id) => apiClient.delete(`/roles/${id}`).then((res) => res.data),
};

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: roleService.getAll,
  });
};

export const useRoleById = (id) => {
  return useQuery({
    queryKey: ['role', id],
    queryFn: () => roleService.getById(id),
    enabled: !!id,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: roleService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => roleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: roleService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};
```

---

## 📱 Core Component Examples

### **File: src/components/Auth/LoginForm.jsx**
```javascript
import { TextInput, PasswordInput, Button, Card, Container } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import apiClient from '../../services/api';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (!value ? 'Email is required' : null),
      password: (value) => (!value ? 'Password is required' : null),
    },
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', values);
      const { accessToken, refreshToken } = response.data;
      
      // Decode JWT to get user info (in production, get from backend)
      setAuth(null, accessToken, refreshToken);
      navigate('/dashboard');
    } catch (error) {
      form.setErrors({ email: error.response?.data?.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" my={40}>
      <Card withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Email"
            placeholder="your@email.com"
            {...form.getInputProps('email')}
            required
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            mt="md"
            {...form.getInputProps('password')}
            required
          />
          <Button fullWidth mt="xl" type="submit" loading={loading}>
            Sign in
          </Button>
        </form>
      </Card>
    </Container>
  );
};

export default LoginForm;
```

### **File: src/components/Masters/Company/CompanyForm.jsx**
```javascript
import {
  TextInput,
  Textarea,
  Button,
  Group,
  Card,
  Container,
  FileInput,
  Avatar,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useCreateCompany, useUpdateCompany } from '../../../hooks/useCompany';
import { notifications } from '@mantine/notifications';

const CompanyForm = ({ initialData = null, onSuccess }) => {
  const [logoPreview, setLogoPreview] = useState(initialData?.company_logo || null);
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();

  const form = useForm({
    initialValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      company_logo: null,
    },
    validate: {
      name: (value) => (!value ? 'Company name is required' : null),
      email: (value) => (!value ? 'Email is required' : null),
    },
  });

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('email', values.email);
    formData.append('phone', values.phone);
    formData.append('address', values.address);
    if (values.company_logo) {
      formData.append('company_logo', values.company_logo);
    }

    try {
      if (initialData?.id) {
        await updateCompany.mutateAsync({ id: initialData.id, data: formData });
        notifications.show({
          title: 'Success',
          message: 'Company updated successfully',
          color: 'green',
        });
      } else {
        await createCompany.mutateAsync(formData);
        notifications.show({
          title: 'Success',
          message: 'Company created successfully',
          color: 'green',
        });
      }
      onSuccess?.();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Operation failed',
        color: 'red',
      });
    }
  };

  return (
    <Container size="sm">
      <Card withBorder shadow="md" p={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          {logoPreview && (
            <Avatar size={100} radius="md" src={logoPreview} mx="auto" mb="md" />
          )}
          <FileInput
            label="Company Logo"
            placeholder="Upload company logo"
            accept="image/*"
            {...form.getInputProps('company_logo')}
            onChange={(file) => {
              form.setFieldValue('company_logo', file);
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setLogoPreview(reader.result);
                reader.readAsDataURL(file);
              }
            }}
          />
          <TextInput
            label="Company Name"
            placeholder="Enter company name"
            mt="md"
            {...form.getInputProps('name')}
            required
          />
          <TextInput
            label="Email"
            placeholder="company@email.com"
            mt="md"
            {...form.getInputProps('email')}
            required
          />
          <TextInput
            label="Phone"
            placeholder="123-456-7890"
            mt="md"
            {...form.getInputProps('phone')}
          />
          <Textarea
            label="Address"
            placeholder="Company address"
            mt="md"
            {...form.getInputProps('address')}
          />
          <Group justify="flex-end" mt="xl">
            <Button type="submit" loading={createCompany.isPending || updateCompany.isPending}>
              {initialData ? 'Update' : 'Create'} Company
            </Button>
          </Group>
        </form>
      </Card>
    </Container>
  );
};

export default CompanyForm;
```

### **File: src/components/Masters/Company/CompanyTable.jsx**
```javascript
import { Table, ActionIcon, Group, Loader, Alert } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useCompanies, useDeleteCompany } from '../../../hooks/useCompany';
import { notifications } from '@mantine/notifications';

const CompanyTable = ({ onEdit }) => {
  const { data: companies, isLoading, error } = useCompanies();
  const deleteCompany = useDeleteCompany();

  if (isLoading) return <Loader />;
  if (error) return <Alert color="red">Failed to load companies</Alert>;

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteCompany.mutateAsync(id);
        notifications.show({
          title: 'Success',
          message: 'Company deleted',
          color: 'green',
        });
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: error.response?.data?.message || 'Delete failed',
          color: 'red',
        });
      }
    }
  };

  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Email</Table.Th>
          <Table.Th>Phone</Table.Th>
          <Table.Th>Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {companies?.map((company) => (
          <Table.Tr key={company.id}>
            <Table.Td>{company.name}</Table.Td>
            <Table.Td>{company.email}</Table.Td>
            <Table.Td>{company.phone}</Table.Td>
            <Table.Td>
              <Group justify="center" gap="xs">
                <ActionIcon
                  size="sm"
                  color="blue"
                  onClick={() => onEdit(company)}
                >
                  <IconEdit size={16} />
                </ActionIcon>
                <ActionIcon
                  size="sm"
                  color="red"
                  onClick={() => handleDelete(company.id)}
                  loading={deleteCompany.isPending}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
};

export default CompanyTable;
```

---

## 🎯 Pages Setup

### **File: src/pages/CompanyPage.jsx**
```javascript
import { Container, Tabs, Button } from '@mantine/core';
import { useState } from 'react';
import CompanyTable from '../components/Masters/Company/CompanyTable';
import CompanyForm from '../components/Masters/Company/CompanyForm';

const CompanyPage = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [editingCompany, setEditingCompany] = useState(null);

  const handleEdit = (company) => {
    setEditingCompany(company);
    setActiveTab('form');
  };

  const handleFormSuccess = () => {
    setEditingCompany(null);
    setActiveTab('list');
  };

  return (
    <Container size="xl" py="xl">
      <Tabs value={activeTab} onTabChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="list">Companies</Tabs.Tab>
          <Tabs.Tab value="form">
            {editingCompany ? 'Edit' : 'Create'} Company
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="list">
          <CompanyTable onEdit={handleEdit} />
        </Tabs.Panel>

        <Tabs.Panel value="form">
          <CompanyForm
            initialData={editingCompany}
            onSuccess={handleFormSuccess}
          />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default CompanyPage;
```

---

## 🔀 Router Setup

### **File: src/App.jsx**
```javascript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CompanyPage from './pages/CompanyPage';
import UserPage from './pages/UserPage';
import RolePage from './pages/RolePage';
import MainLayout from './components/Layout/MainLayout';
import useAuthStore from './store/authStore';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <Notifications />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/companies" element={<CompanyPage />} />
                      <Route path="/users" element={<UserPage />} />
                      <Route path="/roles" element={<RolePage />} />
                      <Route path="/" element={<Navigate to="/dashboard" />} />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;
```

---

## 📝 Important Implementation Notes

### **Error Handling**
- All API errors should show notifications (success/error)
- Handle 401 (Unauthorized) - Clear auth and redirect to login
- Handle 400 (Bad Request) - Show validation errors
- Handle 500 (Server Error) - Show generic error message

### **Image Upload**
- Images are converted to base64 and stored in database
- Use `FileInput` from Mantine for file uploads
- Show image preview before submission
- Support jpeg, png, gif, webp formats

### **Duplicate Prevention**
- Company: Email must be unique
- User: Email must be unique
- Role: Name must be unique
- Backend returns 400 error if duplicate exists

### **Authentication**
- Access token should be stored in Zustand store
- Refresh token used for logout
- Authorization header: `Bearer {accessToken}`
- Automatically clear auth on 401 response

### **Data Validation**
- Validate on frontend before sending to API
- Use `@mantine/form` for form handling
- Required fields: Name/Email, Password for users
- Phone is optional for companies

### **Role-Based Access**
- Only Admin users can create/edit/delete masters
- Check user role in components before showing admin actions
- Implement role-based button visibility

---

## 🚀 Development Checklist

- [ ] Setup React + Vite project
- [ ] Install all dependencies
- [ ] Create folder structure
- [ ] Setup Zustand auth store
- [ ] Create API service with axios interceptors
- [ ] Setup TanStack Query hooks for each master
- [ ] Create login page and form
- [ ] Create protected routes
- [ ] Create company master (list, create, edit, delete)
- [ ] Create user master (list, create, edit, delete)
- [ ] Create role master (list, create, edit, delete)
- [ ] Create main layout with navbar and sidebar
- [ ] Setup notifications for success/error messages
- [ ] Implement image upload with preview
- [ ] Test all CRUD operations
- [ ] Test authentication flow (login/logout)
- [ ] Handle loading and error states
- [ ] Responsive design for mobile
- [ ] Performance optimization (lazy loading, code splitting)

---

## 📚 Additional Features to Consider

1. **Search & Filter** - Add search functionality to tables
2. **Pagination** - Implement pagination for large datasets
3. **Export to CSV** - Export table data to CSV
4. **Dark Mode** - Add dark mode toggle using Mantine
5. **Real-time Updates** - WebSocket for live data updates
6. **Activity Logs** - Track user actions
7. **Advanced Filters** - Filter by date range, status, etc.
8. **Bulk Actions** - Select multiple rows for bulk delete
9. **Audit Trail** - Show created/updated timestamp and user

---

## 🔗 Useful Resources

- [Mantine Documentation](https://mantine.dev)
- [TanStack Query Documentation](https://tanstack.com/query)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Router Documentation](https://reactrouter.com)
- [Vite Documentation](https://vitejs.dev)

---

## ✅ API Testing

Before starting frontend development, test all endpoints using Postman or cURL:

1. **Login**: Get accessToken & refreshToken
2. **Get all companies**: Verify list endpoint works
3. **Create company**: Test multipart form-data with image
4. **Update company**: Test with and without image
5. **Delete company**: Verify soft delete works
6. **Repeat for users and roles**

---

**Backend API running on:** `http://localhost:3000`  
**Swagger Docs:** `http://localhost:3000/api/docs`  
**Frontend should run on:** `http://localhost:5173` (default Vite port)
