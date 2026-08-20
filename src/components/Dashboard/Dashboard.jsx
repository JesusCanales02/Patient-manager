import { useMemo, useState, useEffect } from "react";
import { Users, AlertTriangle, Search, Plus, EyeOff } from "lucide-react";

import StatCard from "../StatCard/StatCard";
import PatientList from "../PatientList/PatientList";
import PatientModal from "../PatientModal/PatientModal";

import { esRecargaUrgente } from "../../utils/patientUtils";
import "./Dashboard.css";

const API_URL = "http://127.0.0.1:5000/api/patients";

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewFilter, setViewFilter] = useState("active");

  // 1. Cargar pacientes desde MySQL al iniciar
  const fetchPatients = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      console.error("Error al cargar pacientes:", err);
    }
  };

useEffect(() => {
  let isMounted = true;

  const getPatientsData = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (isMounted) {
        setPatients(data);
      }
    } catch (err) {
      console.error("Error al cargar pacientes:", err);
    }
  };

  getPatientsData();

  return () => {
    isMounted = false;
  };
}, []);

  const urgentPatients = useMemo(() => {
    return patients.filter((p) => esRecargaUrgente(p.nextRefill));
  }, [patients]);

  const filteredPatients = useMemo(() => {
    const q = search.toLowerCase().trim();

    return patients.filter((p) => {
      const isUrgent = esRecargaUrgente(p.nextRefill);

      if (viewFilter === "active" && p.hidden) return false;
      if (viewFilter === "urgent" && (!isUrgent || p.hidden)) return false;
      if (viewFilter === "hidden" && !p.hidden) return false;

      if (!q) return true;

      const nameMatch = p.name?.toLowerCase().includes(q);
      const diagMatch = p.diagnosis?.toLowerCase().includes(q);
      return nameMatch || diagMatch;
    });
  }, [patients, search, viewFilter]);

  // 2. Alternar oculto/visible (PUT)
  const handleToggleHide = async (id) => {
    const patient = patients.find((p) => p.id === id);
    if (!patient) return;

    const updatedPatient = { ...patient, hidden: !patient.hidden };

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPatient),
      });
      if (res.ok) fetchPatients();
    } catch (err) {
      console.error("Error al actualizar:", err);
    }
  };

  // 3. Eliminar paciente (DELETE)
  const handleDeletePatient = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (res.ok) fetchPatients();
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  // 4. Agregar paciente (POST)
  const handleAddPatient = async (newPatient) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPatient),
      });
      if (res.ok) fetchPatients();
    } catch (err) {
      console.error("Error al agregar:", err);
    }
  };

  // 5. Actualizar información de paciente (PUT)
  const handleUpdatePatient = async (updated) => {
    try {
      const res = await fetch(`${API_URL}/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) fetchPatients();
    } catch (err) {
      console.error("Error al actualizar:", err);
    }
  };

  // 6. Completar recarga (PUT)
  const handleCompleteRefill = async (id) => {
    const patient = patients.find((p) => p.id === id);
    if (!patient) return;

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 30);

    const updatedPatient = {
      ...patient,
      nextRefill: nextDate.toISOString().split("T")[0],
      hidden: true,
    };

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPatient),
      });
      if (res.ok) fetchPatients();
    } catch (err) {
      console.error("Error al completar recarga:", err);
    }
  };

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

export default Dashboard;