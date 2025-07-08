## Prompt for Lovable.dev AI: Loan Calculator

Create a responsive loan calculator with the following logic and UI structure, ensuring the Loan Type and Duration are always selected separately.

---

### **Inputs**

- **Loan Type** (Dropdown)
  - Bridging Loan
  - Short Term Loan

- **Loan Amount** (Numeric input)
  - Placeholder: "Ksh"
  - Validation: Minimum Ksh 1,000, Maximum Ksh 50,000 for Short Term Loan

- **Duration** (Dropdown)
  - For Bridging Loan:
    - 10 months (Option 1)
    - 12 months (Option 2)
  - For Short Term Loan:
    - 1 month
    - 2 months

---

### **Calculation Logic**

#### **Bridging Loan**

- **Interest Rate:**
  - 10 months: 60% over the loan period
  - 12 months: 70% over the loan period

- **Monthly Payment Calculation:**
  - Total Repayment = Principal + (Principal × Interest Rate)
  - Monthly Payment = Total Repayment ÷ Number of Months

  | Duration   | Interest Rate | Example (Ksh 1,000)         |
  |------------|---------------|-----------------------------|
  | 10 months  | 60%           | (1000 + 1000×0.6)/10 = 160  |
  | 12 months  | 70%           | (1000 + 1000×0.7)/12 ≈ 141.67 |

#### **Short Term Loan**

- **Interest Rate:**
  - 1 month: 20% per month
  - 2 months: 30% per month

- **Monthly Payment Calculation:**
  - For 1 month: Total Repayment = Principal + (Principal × 0.2)
    - Monthly Payment = Total Repayment
  - For 2 months: Total Repayment = Principal + (Principal × 0.3 × 2)
    - Monthly Payment = Total Repayment ÷ 2

  | Duration   | Interest Rate | Example (Ksh 1,000)         |
  |------------|---------------|-----------------------------|
  | 1 month    | 20%           | 1000 + 1000×0.2 = 1200      |
  | 2 months   | 30%           | (1000 + 1000×0.3×2)/2 = 800 |

---

### **Special Rules**

- **Loans under 2 weeks:** Always issued at 10% per month interest, regardless of type.
- **Late Payment:** 5 days grace period, then 5% penalty per week applies.

---

### **UI Requirements**

- Show the calculated **Monthly Payment** prominently after user input.
- Display the applicable **interest rate** and **duration** clearly.
- Always show the following note:
  - Loans under 2 weeks are issued at 10% per month
  - 5 days grace period available. Late payments incur 5% penalty per week

---

### **Sample UI Flow**

1. User selects **Loan Type**.
2. User enters **Loan Amount**.
3. User selects **Duration** (options update based on Loan Type).
4. Calculator displays the **Monthly Payment** and other relevant details.

---

**Example Calculation for Bridging Loan, 12 months, Ksh 1,000:**

- Interest Rate: 70%
- Total Repayment: 1,000 + (1,000 × 0.7) = 1,700
- Monthly Payment: 1,700 ÷ 12 = 141.67

---

**Example Calculation for Short Term Loan, 2 months, Ksh 1,000:**

- Interest Rate: 30% per month
- Total Repayment: 1,000 + (1,000 × 0.3 × 2) = 1,600
- Monthly Payment: 1,600 ÷ 2 = 800

---

**Ensure the calculator logic matches these examples and that Loan Type and Duration are always selected independently.**
