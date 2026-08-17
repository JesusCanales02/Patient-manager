import {Phone, CalendarDays, AlertCircle, CheckCircle} from 'lucide-react'
import {obtenerEstadoPaciente, formatearFecha} from "../../utils/patientUtils";

const PatiendCard = ({patient}) =>{
    const status = obtenerEstadoPaciente(patient.nextRefill)
    const isUrgente = status === "Urgente"
     return (
    <div className="patient-card">

      <div className="patient-card-header">

        <div className="patient-avatar">
          {patient.name.charAt(0).toUpperCase()}
        </div>

        <div className="patient-name">
          <h3>{patient.name}</h3>
          <span>{patient.diagnosis}</span>
        </div>

        <div
          className={`patient-status ${
            isUrgente ? "status-urgent" : "status-ok"
          }`}
        >
          {isUrgente ? (
            <AlertCircle size={16} />
          ) : (
            <CheckCircle size={16} />
          )}

          {status}
        </div>

      </div>

      <div className="patient-details">

        <div className="patient-detail">
          <Phone size={17} />
          <span>{patient.phone}</span>
        </div>

        <div className="patient-detail">
          <CalendarDays size={17} />
          <span>
            Próxima recarga: {formatearFecha(patient.nextRefill)}
          </span>
        </div>

      </div>

      <div className="patient-extra">

        <div>
          <strong>Alergias</strong>
          <p>{patient.allergies}</p>
        </div>

        <div>
          <strong>Notas</strong>
          <p>{patient.notes || "Sin observaciones"}</p>
        </div>

      </div>

    </div>
  );
};
export default PatiendCard