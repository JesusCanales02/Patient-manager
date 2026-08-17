import { useMemo, useState } from "react";
import { Users, AlertTriangle, Search, Plus } from "lucide-react";

import StatCard from "../StatCard/StatCard";
import PatientList from "../PatientList/PatientList";
import PatientModal from "../PatientModal/PatientModal";

import { esRecargaUrgente } from "../../utils/patientUtils";
import "./Dashboard.css";

const Dashboard = ({ patients, setPatients }) => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const urgentPatients = useMemo(() => {
    return patients.filter((patient) =>
      esRecargaUrgente(patient.nextRefill)
    );
  }, [patients]);

  const filteredPatients = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return patients;
    }

    return patients.filter((patient) => {
      return (
        patient.name.toLowerCase().includes(searchValue) ||
        patient.diagnosis.toLowerCase().includes(searchValue)
      );
    });
  }, [patients, search]);

  const handleAddPatient = (newPatient) => {
    setPatients((previous) => [...previous, newPatient]);
  };

  // 1. Función para actualizar los datos al editar
  const handleUpdatePatient = (updatedPatient) => {
    setPatients((previous) =>
      previous.map((patient) =>
        patient.id === updatedPatient.id ? updatedPatient : patient
      )
    );
  };

  // 2. Función para sumar 30 días al dar clic en "Completado"
  const handleCompleteRefill = (patientId) => {
    setPatients((previous) =>
      previous.map((patient) => {
        if (patient.id === patientId) {
          const hoy = new Date();
          hoy.setDate(hoy.getDate() + 30);
          const nuevaFecha = hoy.toISOString().split("T")[0];
          return { ...patient, nextRefill: nuevaFecha };
        }
        return patient;
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

        <button
          className="new-patient-btn"
          onClick={() => setShowModal(true)}
        >
          <Plus size={19} />
          Nuevo Paciente
        </button>
      </div>

      <section className="stats-grid">
        <StatCard
          title="Total de pacientes"
          value={patients.length}
          icon={Users}
        />

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
            <p>{filteredPatients.length} pacientes encontrados</p>
          </div>

          <div className="search-container">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar paciente o diagnóstico..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {/* PASAMOS LAS FUNCIONES AL COMPONENTE HIJO */}
        <PatientList
          patients={filteredPatients}
          onUpdatePatient={handleUpdatePatient}
          onCompleteRefill={handleCompleteRefill}
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