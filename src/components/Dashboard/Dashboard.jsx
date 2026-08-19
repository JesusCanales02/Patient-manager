import { useMemo, useState } from "react";
import { Users, AlertTriangle, Search, Plus, EyeOff } from "lucide-react";

import StatCard from "../StatCard/StatCard";
import PatientList from "../PatientList/PatientList";
import PatientModal from "../PatientModal/PatientModal";

import { esRecargaUrgente } from "../../utils/patientUtils";
import "./Dashboard.css";

const Dashboard = ({ patients, setPatients }) => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewFilter, setViewFilter] = useState("active");

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

  const handleToggleHide = (id) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, hidden: !p.hidden } : p))
    );
  };

  const handleDeletePatient = (id) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddPatient = (newPatient) => {
    setPatients((prev) => [...prev, newPatient]);
  };

  const handleUpdatePatient = (updated) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  const handleCompleteRefill = (id) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 30);

        return {
          ...p,
          nextRefill: nextDate.toISOString().split("T")[0],
          hidden: true,
        };
      })
    );
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