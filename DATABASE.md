# 📊 Database Schema Documentation

## Entity Relationship Overview

```
┌─────────────┐
│    User     │
│─────────────│
│ id (PK)     │
│ email       │
│ password    │
│ name        │
│ mobile      │
└─────────────┘
       │
       │ (1:N relationships)
       ├───────────────────────────────┐
       │                               │
       ├──► Goals                      │
       ├──► Stocks                     │
       ├──► MutualFunds                │
       ├──► SIPs                       │
       ├──► BankAccounts               │
       ├──► FixedDeposits              │
       ├──► Bonds                      │
       ├──► LIC                        │
       ├──► PPF                        │
       ├──► NPS                        │
       ├──► Gold                       │
       ├──► RealEstate                 │
       ├──► EPF                        │
       ├──► Crypto                     │
       └──► Transactions               │
```

## Core Tables

### 1. User
**Purpose**: Store user account information

| Column    | Type   | Description                |
|-----------|--------|----------------------------|
| id        | UUID   | Primary key                |
| email     | String | Unique email address       |
| password  | String | Hashed password (bcrypt)   |
| name      | String | User's full name           |
| mobile    | String | Mobile number (optional)   |
| createdAt | Date   | Account creation timestamp |

---

### 2. Goal
**Purpose**: Financial goals tracking

| Column        | Type   | Description                    |
|---------------|--------|--------------------------------|
| id            | UUID   | Primary key                    |
| userId        | UUID   | Foreign key to User            |
| name          | String | Goal name (e.g., "Retirement") |
| targetAmount  | Float  | Target amount to achieve       |
| currentAmount | Float  | Current progress amount        |
| targetDate    | Date   | Target completion date         |
| category      | String | Category (optional)            |
| description   | String | Description (optional)         |

**Relationships**:
- One Goal can be linked to multiple Stocks, MutualFunds, etc.
- Allows tracking which assets contribute to which goals

---

### 3. Stock
**Purpose**: Equity holdings tracking

| Column            | Type   | Description                      |
|-------------------|--------|----------------------------------|
| id                | UUID   | Primary key                      |
| userId            | UUID   | Foreign key to User              |
| goalId            | UUID   | Foreign key to Goal (nullable)   |
| symbol            | String | Stock symbol (e.g., RELIANCE.NS) |
| companyName       | String | Company name                     |
| exchange          | String | NSE or BSE                       |
| quantity          | Float  | Number of shares                 |
| averagePrice      | Float  | Average purchase price           |
| currentPrice      | Float  | Latest price (auto-updated)      |
| investedAmount    | Float  | Total invested (qty * avgPrice)  |
| currentValue      | Float  | Current value (qty * currPrice)  |
| returns           | Float  | Absolute returns                 |
| returnsPercentage | Float  | Returns percentage               |
| lastUpdated       | Date   | Last price update timestamp      |

**Auto-calculations**:
- `investedAmount = quantity × averagePrice`
- `currentValue = quantity × currentPrice`
- `returns = currentValue - investedAmount`
- `returnsPercentage = (returns / investedAmount) × 100`

---

### 4. MutualFund
**Purpose**: Mutual fund holdings tracking

| Column            | Type   | Description                     |
|-------------------|--------|---------------------------------|
| id                | UUID   | Primary key                     |
| userId            | UUID   | Foreign key to User             |
| goalId            | UUID   | Foreign key to Goal (nullable)  |
| schemeCode        | String | AMFI scheme code                |
| schemeName        | String | Mutual fund scheme name         |
| amcName           | String | AMC name (optional)             |
| units             | Float  | Number of units                 |
| averageNav        | Float  | Average NAV at purchase         |
| currentNav        | Float  | Latest NAV (auto-updated)       |
| investedAmount    | Float  | Total invested                  |
| currentValue      | Float  | Current value                   |
| returns           | Float  | Absolute returns                |
| returnsPercentage | Float  | Returns percentage              |
| lastUpdated       | Date   | Last NAV update timestamp       |

**Auto-calculations**:
- `investedAmount = units × averageNav`
- `currentValue = units × currentNav`
- Updated automatically by SIP execution cron

---

### 5. SIP (Systematic Investment Plan)
**Purpose**: Automated SIP management

| Column            | Type   | Description                       |
|-------------------|--------|-----------------------------------|
| id                | UUID   | Primary key                       |
| userId            | UUID   | Foreign key to User               |
| mfId              | UUID   | Foreign key to MutualFund         |
| goalId            | UUID   | Foreign key to Goal (nullable)    |
| amount            | Float  | SIP amount                        |
| startDate         | Date   | SIP start date                    |
| frequency         | String | monthly/quarterly                 |
| nextExecutionDate | Date   | Next execution date               |
| status            | String | active/paused/stopped             |

**How it works**:
1. Cron job checks for SIPs with `nextExecutionDate <= today`
2. Fetches current NAV from AMFI
3. Calculates units: `newUnits = amount / currentNAV`
4. Updates MutualFund: adds units, recalculates average NAV
5. Updates `nextExecutionDate` based on frequency

---

### 6. Transaction
**Purpose**: Transaction history for XIRR calculation

| Column          | Type   | Description                    |
|-----------------|--------|--------------------------------|
| id              | UUID   | Primary key                    |
| userId          | UUID   | Foreign key to User            |
| assetType       | String | stock/mutual_fund/bank/etc     |
| assetId         | UUID   | Foreign key to specific asset  |
| transactionType | String | buy/sell/deposit/withdrawal    |
| amount          | Float  | Transaction amount             |
| date            | Date   | Transaction date               |

**Future use**: Calculate accurate XIRR based on cash flows

---

## Other Asset Classes

All follow similar structure with specific fields:

### BankAccount
- bankName, accountType, balance

### FixedDeposit
- bankName, amount, interestRate, maturityDate, maturityAmount

### Bond
- issuer, bondType, faceValue, units, couponRate, maturityDate

### LIC
- policyName, policyNumber, premiumAmount, sumAssured, maturityDate

### PPF / NPS / EPF
- accountNumber/pranNumber, balance

### Gold
- type (Physical/Digital/ETF), quantityGrams, averagePricePerGram

### RealEstate
- propertyType, location, purchasePrice, purchaseDate, currentValue

### Crypto
- coinName, symbol, quantity, averagePrice, currentPrice

---

## Indexing Strategy

**Current Indexes** (automatically created by Prisma):
- Primary keys on all `id` fields
- Unique indexes on:
  - `User.email`
  - `LIC.policyNumber`
  - `PPF.accountNumber`
  - `NPS.pranNumber`
- Foreign key indexes on all `userId`, `goalId`, `mfId`

**Recommended for Production**:
```sql
-- For faster queries
CREATE INDEX idx_stocks_user_id ON stocks(user_id);
CREATE INDEX idx_mutual_funds_user_id ON mutual_funds(user_id);
CREATE INDEX idx_sips_next_execution ON sips(next_execution_date) WHERE status = 'active';
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date);
```

---

## Data Flow Examples

### Adding a Stock
1. User enters stock details in UI
2. Frontend calls `POST /api/stocks`
3. Backend:
   - Validates data with Zod
   - Fetches current price from Yahoo Finance API
   - Calculates invested amount, current value, returns
   - Saves to database
4. Returns stock with all calculated fields

### SIP Execution (Automated)
1. Cron runs daily at 9 AM
2. Finds all SIPs with `nextExecutionDate <= today` and `status = active`
3. For each SIP:
   - Fetches current NAV from AMFI API
   - Calculates new units: `amount / NAV`
   - Updates MutualFund:
     - `units += newUnits`
     - `investedAmount += sipAmount`
     - `averageNav = investedAmount / units`
   - Updates SIP:
     - `nextExecutionDate = today + 1 month` (or 3 months for quarterly)
4. User sees updated holdings automatically

### Price Update (Automated)
1. Cron runs every 6 hours
2. Fetches all stocks from database
3. Calls Yahoo Finance API in parallel for all unique symbols
4. Updates each stock's `currentPrice`, `currentValue`, `returns`
5. Repeats for mutual funds with AMFI API

---

## Performance Considerations

### Current Implementation
- ✅ Batch price updates (all stocks at once)
- ✅ Parallel API calls for better performance
- ✅ Caching in AMFI API utility (1 hour cache)
- ✅ Foreign key relationships with cascade delete

### Future Optimizations
- [ ] Add Redis for caching API responses
- [ ] Implement pagination for large portfolios
- [ ] Add database connection pooling
- [ ] Implement partial updates (only changed fields)

---

## Migration Guide

If you need to reset the database:

```bash
cd backend
npx prisma migrate reset   # Deletes all data
npx prisma migrate dev     # Recreate tables
npx prisma db seed         # (Optional) Add seed data
```

For production migrations:
```bash
npx prisma migrate deploy
```
