import React, { useState } from "react";

/* ---------------- HELPERS ---------------- */
const Today = () => new Date().toISOString().split("T")[0];

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
};

/* ---------------- INITIAL DATA ---------------- */
const initialPatients = [
  {
    id: 1,
    name: "John Doe",
    age: 30,
    diagnosis: "Flu",
    status: "In Quarantine",
    temperatures: [
      { date: daysAgo(2), value: 37.5 },
      { date: daysAgo(1), value: 38.0 }
    ],
    doctorVisits: []
  }
];

const USERS = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "doctor", password: "doctor123", role: "doctor" },
  { username: "nurse", password: "nurse123", role: "nurse" }
];

/* ---------------- UTILS ---------------- */
const isFever = (temps) => temps.some(t => t.value >= 38);

const todayTempRecorded = (p) =>
  p.temperatures.some(t => t.date === Today());

const todayDoctorVisited = (p) =>
  (p.doctorVisits || []).some(v => v.date === Today());

/* ---------------- LOGIN ---------------- */
function Login({ onLogin }) {
  const [role, setRole] = useState("nurse");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  const handle = () => {
    const user = USERS.find(
      u => u.username === role && u.password === pw
    );
    if (user) onLogin(user);
    else setErr("Invalid credentials");
  };

  return (
    <div style={styles.center}>
      <div style={styles.card}>
        <h2>Hospital System</h2>

        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="admin">Admin</option>
          <option value="doctor">Doctor</option>
          <option value="nurse">Nurse</option>
        </select>

        <input
          type="password"
          placeholder="Password"
          value={pw}
          onChange={e => setPw(e.target.value)}
        />

        {err && <p style={{ color: "red" }}>{err}</p>}

        <button onClick={handle}>Login</button>
      </div>
    </div>
  );
}

/* ---------------- PATIENT LIST ---------------- */
function PatientList({ patients, onSelect }) {
  return (
    <div>
      <h2>Patients</h2>
      {patients.map(p => (
        <div
          key={p.id}
          style={styles.card}
          onClick={() => onSelect(p)}
        >
          <b>{p.name}</b> | {p.age} yrs | {p.status}
        </div>
      ))}
    </div>
  );
}

/* ---------------- PATIENT DETAILS ---------------- */
function PatientDetails({ patient, user, onUpdate, onClose }) {
  const [temp, setTemp] = useState("");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");

  const tempTaken = todayTempRecorded(patient);
  const visited = todayDoctorVisited(patient);

  const recordTemp = () => {
    const v = parseFloat(temp);

    if (isNaN(v) || v < 35 || v > 45) {
      setMsg("Invalid temperature");
      return;
    }

    if (tempTaken) {
      setMsg("Already recorded today");
      return;
    }

    onUpdate({
      ...patient,
      temperatures: [...patient.temperatures, { date: Today(), value: v }]
    });

    setTemp("");
    setMsg("Temperature added");
  };

  const recordVisit = () => {
    if (visited) {
      setMsg("Already visited today");
      return;
    }

    if (!tempTaken) {
      setMsg("Record temperature first");
      return;
    }

    onUpdate({
      ...patient,
      doctorVisits: [
        ...(patient.doctorVisits || []),
        { date: Today(), notes }
      ]
    });

    setNotes("");
    setMsg("Visit recorded");
  };

  const markRecovered = () => {
    onUpdate({ ...patient, status: "Recovered" });
  };

  return (
    <div style={styles.modal}>
      <h3>{patient.name}</h3>
      <p>Status: {patient.status}</p>

      {user.role === "nurse" && (
        <>
          <input
            placeholder="Temp"
            value={temp}
            onChange={e => setTemp(e.target.value)}
          />
          <button onClick={recordTemp}>Add Temp</button>
        </>
      )}

      {user.role === "doctor" && (
        <>
          <input
            placeholder="Notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
          <button onClick={recordVisit}>Add Visit</button>
        </>
      )}

      {user.role === "admin" && (
        <button onClick={markRecovered}>Mark Recovered</button>
      )}

      {msg && <p>{msg}</p>}

      <button onClick={onClose}>Close</button>
    </div>
  );
}

/* ---------------- MAIN APP ---------------- */
export default function App() {
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState(initialPatients);
  const [selected, setSelected] = useState(null);

  const updatePatient = (updated) => {
    setPatients(prev =>
      prev.map(p => (p.id === updated.id ? updated : p))
    );
    setSelected(updated);
  };

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div style={{ padding: 20 }}>
      <h2>Welcome {user.role}</h2>

      <button onClick={() => setUser(null)}>Logout</button>

      <PatientList patients={patients} onSelect={setSelected} />

      {selected && (
        <PatientDetails
          patient={selected}
          user={user}
          onUpdate={updatePatient}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

/* ---------------- STYLES ---------------- */
const styles = {
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh"
  },
  card: {
    padding: 15,
    margin: 10,
    border: "1px solid #ccc",
    cursor: "pointer"
  },
  modal: {
    position: "fixed",
    top: "20%",
    left: "30%",
    background: "#fff",
    padding: 20,
    border: "1px solid black"
  }
};