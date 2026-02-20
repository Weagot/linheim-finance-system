# API Documentation

## Base URL

```
http://localhost:3001/api
```

## Endpoints

### Health Check
```
GET /health
```

### Authentication
```
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
```

### Companies
```
GET /api/companies
POST /api/companies
GET /api/companies/:id
PUT /api/companies/:id
DELETE /api/companies/:id
```

### Transactions
```
GET /api/transactions
POST /api/transactions
GET /api/transactions/:id
PUT /api/transactions/:id
DELETE /api/transactions/:id
```

### Invoices
```
GET /api/invoices
POST /api/invoices
GET /api/invoices/:id
PUT /api/invoices/:id
DELETE /api/invoices/:id
POST /api/invoices/:id/generate-pdf
```

### Reports
```
GET /api/reports/profit-loss
GET /api/reports/cash-flow
GET /api/reports/balance-sheet
GET /api/reports/company-summary
```

### Exchange Rates
```
GET /api/exchange-rates
POST /api/exchange-rates/sync
```
