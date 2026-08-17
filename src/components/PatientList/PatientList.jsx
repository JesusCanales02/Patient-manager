import PatientCard from "../PatientCard/PatientCard";
import "./PatientList.css"

const PatientList = ({ patients,onUpdatePatient, onCompleteRefill }) => {
  if (patients.length === 0) {
    return (
      <div className="empty-state">
        <h3>No se encontraron pacientes</h3>
        <p>
          Intenta buscar con otro nombre o diagnóstico.
        </p>
      </div>
    );
  }

  return (
    <div className="patients-grid">
      {patients.map((patient) => (
        <PatientCard
          key={patient.id}
          patient={patient}
          onUpdatePatient={onUpdatePatient}
          onCompleteRefill={onCompleteRefill}
        />
      ))}
    </div>
  );
};

export default PatientList;