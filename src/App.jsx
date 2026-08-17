import { useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import Dashboard from "./components/Dashboard/Dashboard";
import { mockPatients } from "./data/mockPatient";
import { esRecargaUrgente } from "./utils/patientUtils";
import "./App.css";

function App() {
  const [patients, setPatients] = useState(mockPatients);

  const urgentCount = patients.filter((patient) =>
    esRecargaUrgente(patient.nextRefill)
  ).length;

  return (
    <div className="app">

      <Navbar urgentCount={urgentCount} />

      <Dashboard
        patients={patients}
        setPatients={setPatients}
      />

    </div>
  )
}

export default App