# 🧪 Batch Reactor Optimization Dashboard

A full-stack MERN application developed for chemical engineering students and researchers to simulate batch reactor performance, analyze reaction kinetics, optimize reaction time, and visualize reactor data through interactive charts.

---

## 🚀 Features

- Multiple Reaction Orders
  - Zero Order
  - First Order
  - Second Order

- Arrhenius Temperature Effect
  - Temperature Input
  - Activation Energy
  - Frequency Factor
  - Automatic Effective Rate Constant Calculation

- Reactor Performance Analysis
  - Final Concentration
  - Conversion Percentage
  - Reaction Time Optimization

- Interactive Visualizations
  - Concentration vs Time Line Chart
  - Conversion vs Time Line Chart
  - Initial vs Final Concentration Bar Chart
  - Conversion Distribution Pie Chart

- Simulation History
  - Save to MongoDB Atlas
  - View Previous Simulations
  - Delete Simulations

- PDF Report Generation

- Responsive Dashboard UI

---

## 🛠 Tech Stack

### Frontend

- React
- Axios
- Recharts
- jsPDF
- CSS3

### Backend

- Node.js
- Express.js

### Database

- MongoDB Atlas
- Mongoose

---

## ⚙ Engineering Concepts Used

### Zero Order Reaction

Ca = Ca₀ − kt

### First Order Reaction

Ca = Ca₀ e^(-kt)

### Second Order Reaction

1/Ca = 1/Ca₀ + kt

### Arrhenius Equation

k = A e^(-Ea / RT)

---

## 📊 Dashboard Modules

- Simulation Input Panel
- Reactor KPI Cards
- Concentration Analysis
- Conversion Analysis
- Optimization Module
- PDF Report Generator
- Simulation History
- Interactive Charts

---

## 📷 Screenshots

(Add screenshots after deployment.)

---

## ▶ Installation

### Clone Repository

```bash
git clone https://github.com/anishka-jha/batch-reactor-optimization-dashboard.git
```

### Backend

```bash
cd server
npm install
node index.js
```

### Frontend

```bash
cd client
npm install
npm run dev
```

---

## 📁 Project Structure

```
batch-reactor-optimization-dashboard
│
├── client
│   ├── src
│   ├── public
│   └── package.json
│
├── server
│   ├── index.js
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## ✨ Future Improvements

- User Authentication
- Process Economics Module
- Heat Transfer Analysis
- CSTR & PFR Simulation
- AI-based Process Optimization
- Cloud Deployment

---

## 👩‍💻 Developed By

Anishka Jha
Chemical Engineering Undergraduate(2025-2029)
BIT Sindri
