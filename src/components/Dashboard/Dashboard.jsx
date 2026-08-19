import { useMemo, useState } from "react"
import { Users, AlertTriangle, Search, Plus, EyeOff } from "lucide-react"

import StatCard from "../StatCard/StatCard"
import PatientList from "../PatientList/PatientList"
import PatientModal from "../PatientModal/PatientModal"

import { esRecargaUrgente } from "../../utils/patientUtils"
import "./Dashboard.css"

const Dashboard = ({ patients, setPatients }) => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewFilter, setViewFilter] = useState("active"); 

  const urgentPatients = useMemo(() => {
    return patients.filter((patient) => esRecargaUrgente(patient.nextRefill))
  }, [patients])

  const filteredPatients = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return patients.filter((patient) => {
      const isUrgent = esRecargaUrgente(patient.nextRefill)

      if (viewFilter === "active" && patient.hidden) {
        return false
      }

      if (viewFilter === "urgent" && (!isUrgent || patient.hidden)) {
        return false
      }

      if (viewFilter === "hidden" && !patient.hidden) {
        return false
      }

      if (searchValue) {
        const nameMatch = patient.name?.toLowerCase().includes(searchValue);
        const diagMatch = patient.diagnosis?.toLowerCase().includes(searchValue);
        return nameMatch || diagMatch
      }

      return true;
    });
  }, [patients, search, viewFilter])

  const handleToggleHide = (patientId) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, hidden: !p.hidden } : p))
    )
  }

  const handleDeletePatient = (patientId) => {
    setPatients((previous) => previous.filter((p) => p.id !== patientId));
  }

  const handleAddPatient = (newPatient) => {
    setPatients((previous) => [...previous, newPatient]);
  }

  const handleUpdatePatient = (updatedPatient) => {
    setPatients((previous) =>
      previous.map((patient) =>
        patient.id === updatedPatient.id ? updatedPatient : patient
      )
    )
  }

  const handleCompleteRefill = (patientId) => {
    setPatients((previous) =>
      previous.map((patient) => {
        if (patient.id === patientId) {
          const hoy = new Date();
          hoy.setDate(hoy.getDate() + 30);
          const nuevaFecha = hoy.toISOString().split("T")[0];
          return { ...patient, nextRefill: nuevaFecha, hidden: true };
        }
        return patient;
      })
    )
  }

  return (
    <main className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Gestión de pacientes</h1>
          <p>Administra pacientes y seguimiento de recargas.</p>
        </div>

        <button className="new-patient-btn" onClick={() => setShowModal(true)}>
          <Plus size={19} />
          Nuevo Paciente
        </button>
      </div>

      <section className="stats-grid">
        <StatCard title="Total de pacientes" value={patients.length} icon={Users} />
        <StatCard
          title="Alertas de recarga"
          value={urgentPatients.length}
          icon={AlertTriangle}
          variant="urgent"
        />
      </section>

      <section className="patients-section">
        <div className="section-header">
          <div>
            <h2>Pacientes</h2>
            <p>{filteredPatients.length} pacientes mostrados</p>
          </div>

          <div className="controls-container">
            <div className="filter-buttons">
              <button
                className={`filter-btn ${viewFilter === "active" ? "active" : ""}`}
                onClick={() => setViewFilter("active")}
              >
                Mostrar Todos
              </button>
              <button
                className={`filter-btn ${viewFilter === "urgent" ? "active" : ""}`}
                onClick={() => setViewFilter("urgent")}
              >
                <AlertTriangle size={15} /> Solo Prioridad
              </button>
              <button
                className={`filter-btn ${viewFilter === "hidden" ? "active" : ""}`}
                onClick={() => setViewFilter("hidden")}
              >
                <EyeOff size={15} /> Archivados
              </button>
            </div>

            <div className="search-container">
              <Search size={18} />
              <input
                type="text"
                placeholder="Buscar paciente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <PatientList
          patients={filteredPatients}
          onUpdatePatient={handleUpdatePatient}
          onCompleteRefill={handleCompleteRefill}
          onDeletePatient={handleDeletePatient}
          onToggleHide={handleToggleHide}
        />
      </section>

      {showModal && (
        <PatientModal
          onClose={() => setShowModal(false)}
          onAddPatient={handleAddPatient}
        />
      )}
    </main>
  );
};

export default Dashboard