import PatientCard from "../PatientCard/PatientCard"
import "./PatientList.css"

const PatientList = ({
  patients,
  onUpdatePatient,
  onCompleteRefill,
  onDeletePatient,
  onToggleHide,
}) => {
  if (patients.length === 0) {
    return (
      <div className="empty-state">
        <h3>No hay pacientes ocultos</h3>
      </div>
    )
  }

  return (
    <div className="patients-grid">
      {patients.map((patient) => (
        <PatientCard
          key={patient.id}
          patient={patient}
          onUpdatePatient={onUpdatePatient}
          onCompleteRefill={onCompleteRefill}
          onDeletePatient={onDeletePatient}
          onToggleHide={onToggleHide}
        />
      ))}
    </div>
  )
}

export default PatientList;