import axios from "axios";
import { useState } from "react";
import jsPDF from "jspdf";
import "./App.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const pieColors = ["#22c55e", "#ef4444"];

function App() {
  const [reactionOrder, setReactionOrder] = useState("first");

  const [k, setK] = useState("");
  const [ca0, setCa0] = useState("");
  const [time, setTime] = useState("");

  const [temperature, setTemperature] = useState("");
  const [activationEnergy, setActivationEnergy] = useState("");
  const [frequencyFactor, setFrequencyFactor] = useState("");

  const [result, setResult] = useState(null);
  const [targetConversion, setTargetConversion] = useState("");
  const [optimizedTime, setOptimizedTime] = useState(null);

  const [graphData, setGraphData] = useState([]);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const calculateConcentration = (order, ca0Val, kVal, tVal) => {
    let concentration;

    if (order === "zero") {
      concentration = ca0Val - kVal * tVal;
    } else if (order === "first") {
      concentration = ca0Val * Math.exp(-kVal * tVal);
    } else {
      concentration = 1 / (1 / ca0Val + kVal * tVal);
    }

    return concentration < 0 ? 0 : concentration;
  };

  const calculate = async () => {
    try {
      const response = await axios.post("http://localhost:5000/simulate", {
        reactionOrder,
        k,
        ca0,
        time,
        temperature,
        activationEnergy,
        frequencyFactor,
      });

      setResult(response.data);

      const effectiveK = Number(response.data.effectiveK);
      const points = [];

      for (let t = 0; t <= Number(time); t++) {
        const concentration = calculateConcentration(
          reactionOrder,
          Number(ca0),
          effectiveK,
          t
        );

        const conversion =
          ((Number(ca0) - concentration) / Number(ca0)) * 100;

        points.push({
          time: t,
          concentration: Number(concentration.toFixed(3)),
          conversion: Number(conversion.toFixed(2)),
        });
      }

      setGraphData(points);
    } catch (error) {
      console.log(error);
    }
  };

  const optimizeTime = () => {
    const ca0Val = Number(ca0);
    const kVal = result ? Number(result.effectiveK) : Number(k);
    const x = Number(targetConversion) / 100;
    const targetCa = ca0Val * (1 - x);

    let requiredTime;

    if (reactionOrder === "zero") {
      requiredTime = (ca0Val - targetCa) / kVal;
    } else if (reactionOrder === "first") {
      requiredTime = -Math.log(1 - x) / kVal;
    } else {
      requiredTime = (1 / targetCa - 1 / ca0Val) / kVal;
    }

    setOptimizedTime(requiredTime.toFixed(2));
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get("http://localhost:5000/history");
      setHistory(response.data);
      setShowHistory(true);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteSimulation = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/history/${id}`);
      fetchHistory();
    } catch (error) {
      console.log(error);
    }
  };

  const downloadPDFReport = () => {
    if (!result) {
      alert("Please run a simulation first.");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Batch Reactor Simulation Report", 20, 20);

    doc.setFontSize(12);
    doc.text(`Reaction Order: ${reactionOrder}`, 20, 40);
    doc.text(`Effective Rate Constant: ${result.effectiveK}`, 20, 50);
    doc.text(`Initial Concentration: ${ca0} mol/L`, 20, 60);
    doc.text(`Reaction Time: ${time} hours`, 20, 70);
    doc.text(`Final Concentration: ${result.finalConcentration} mol/L`, 20, 90);
    doc.text(`Conversion: ${result.conversion} %`, 20, 100);
    doc.text(`Temperature: ${temperature || "Not used"} K`, 20, 120);
    doc.text(`Activation Energy: ${activationEnergy || "Not used"} J/mol`, 20, 130);
    doc.text(`Frequency Factor: ${frequencyFactor || "Not used"}`, 20, 140);
    doc.text(`Target Conversion: ${targetConversion || "Not entered"} %`, 20, 160);
    doc.text(`Required Time: ${optimizedTime || "Not calculated"} hours`, 20, 170);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 20, 190);

    doc.save("Batch_Reactor_Report.pdf");
  };

  const pieData = result
    ? [
        { name: "Converted", value: Number(result.conversion) },
        { name: "Unconverted", value: 100 - Number(result.conversion) },
      ]
    : [];

  const barData = result
    ? [
        {
          name: "Ca0",
          value: Number(ca0),
        },
        {
          name: "Final Ca",
          value: Number(result.finalConcentration),
        },
      ]
    : [];

  return (
    <div className="app">
      <section className="hero">
        <div className="badge">Industrial Process Simulation</div>
        <h1>🧪 Batch Reactor Optimization Dashboard</h1>
        <p>
          Simulate reaction kinetics, optimize conversion, analyze reactor performance,
          store simulations, and export professional reports.
        </p>
      </section>

      <section className="dashboard-grid">
        <div className="card input-card">
          <h2>⚙️ Simulation Inputs</h2>

          <div className="form-grid">
            <div className="field">
              <label>Reaction Order</label>
              <select
                value={reactionOrder}
                onChange={(e) => setReactionOrder(e.target.value)}
              >
                <option value="zero">Zero Order</option>
                <option value="first">First Order</option>
                <option value="second">Second Order</option>
              </select>
            </div>

            <div className="field">
              <label>Rate Constant (k)</label>
              <input value={k} onChange={(e) => setK(e.target.value)} />
            </div>

            <div className="field">
              <label>Initial Concentration (Ca₀)</label>
              <input value={ca0} onChange={(e) => setCa0(e.target.value)} />
            </div>

            <div className="field">
              <label>Reaction Time (hours)</label>
              <input value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          <div className="divider"></div>

          <h3>🌡 Optional Arrhenius Temperature Effect</h3>

          <div className="form-grid">
            <div className="field">
              <label>Temperature (K)</label>
              <input
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Activation Energy Ea (J/mol)</label>
              <input
                value={activationEnergy}
                onChange={(e) => setActivationEnergy(e.target.value)}
              />
            </div>

            <div className="field wide-field">
              <label>Frequency Factor A</label>
              <input
                value={frequencyFactor}
                onChange={(e) => setFrequencyFactor(e.target.value)}
              />
            </div>
          </div>

          <div className="button-row">
            <button className="simulate-btn" onClick={calculate}>
              Simulate
            </button>

            <button className="history-btn" onClick={fetchHistory}>
              Show History
            </button>
          </div>
        </div>

        <div className="card results-card">
          <h2>📊 Reactor KPIs</h2>

          {!result && (
            <p className="muted">
              Run a simulation to view reactor performance metrics.
            </p>
          )}

          {result && (
            <div className="metrics">
              <div className="metric">
                <span>Effective k</span>
                <h3>{result.effectiveK}</h3>
              </div>

              <div className="metric">
                <span>Final Concentration</span>
                <h3>{result.finalConcentration}</h3>
                <small>mol/L</small>
              </div>

              <div className="metric">
                <span>Conversion</span>
                <h3>{result.conversion}%</h3>
              </div>
            </div>
          )}

          <div className="optimization-box">
            <h2>🎯 Optimization</h2>

            <label>Target Conversion (%)</label>
            <input
              value={targetConversion}
              onChange={(e) => setTargetConversion(e.target.value)}
            />

            <button className="optimize-btn" onClick={optimizeTime}>
              Optimize Time
            </button>

            {optimizedTime && (
              <div className="metric highlight">
                <span>Required Time</span>
                <h3>{optimizedTime} hr</h3>
              </div>
            )}

            <button className="download-btn" onClick={downloadPDFReport}>
              Download PDF Report
            </button>
          </div>
        </div>
      </section>

      {graphData.length > 0 && (
        <>
          <section className="chart-grid">
            <div className="card graph-card">
              <h2>📈 Concentration vs Time</h2>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={graphData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="concentration"
                    stroke="#38bdf8"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card graph-card">
              <h2>📈 Conversion vs Time</h2>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={graphData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="conversion"
                    stroke="#22c55e"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="chart-grid small-charts">
            <div className="card graph-card">
              <h2>📊 Initial vs Final Concentration</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card graph-card">
              <h2>🥧 Conversion Split</h2>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      )}

      {showHistory && (
        <section className="card history-card">
          <h2>🗂 Simulation History</h2>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>k</th>
                  <th>Ca₀</th>
                  <th>Time</th>
                  <th>Final Conc.</th>
                  <th>Conversion</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {history.map((item) => (
                  <tr key={item._id}>
                    <td>{item.reactionOrder}</td>
                    <td>{Number(item.effectiveK || item.k).toFixed(4)}</td>
                    <td>{item.ca0}</td>
                    <td>{item.time}</td>
                    <td>{Number(item.finalConcentration).toFixed(3)}</td>
                    <td>{Number(item.conversion).toFixed(2)}%</td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => deleteSimulation(item._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;