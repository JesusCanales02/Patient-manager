import { useState } from 'react';
import { Phone, CalendarDays, AlertCircle, CheckCircle, Edit, Check } from 'lucide-react';
import { obtenerEstadoPaciente, formatearFecha } from "../../utils/patientUtils";
import "./PatientCard.css";

const PatientCard = ({ patient, onUpdatePatient, onCompleteRefill }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...patient });

  const status = obtenerEstadoPaciente(patient.nextRefill);
  const isUrgente = status === "Prioridad";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (onUpdatePatient) onUpdatePatient(formData);
    setIsEditing(false);
  };

  return (
    <div className="patient-card">
      {isEditing ? (
        /* MODO EDICIÓN */
        <div className="patient-card-edit">
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nombre" />
          <input type="text" name="diagnosis" value={formData.diagnosis} onChange={handleChange} placeholder="Diagnóstico" />
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Teléfono" />
          <input type="date" name="nextRefill" value={formData.nextRefill} onChange={handleChange} />
          <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="Alergias" />
          <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Notas" />

          <div className="card-buttons">
            <button className="btn-save" onClick={handleSave}>Guardar</button>
            <button className="btn-cancel" onClick={() => setIsEditing(false)}>Cancelar</button>
          </div>
        </div>
      ) : (
        /* MODO LECTURA (TU ESTRUCTURA ORIGINAL EXACTA) */
        <>
          <div className="patient-card-header">
            <div className="patient-avatar">
              {patient.name ? patient.name.charAt(0).toUpperCase() : "P"}
            </div>

            <div className="patient-name">
              <h3>{patient.name}</h3>
              <span>{patient.diagnosis}</span>
            </div>

            <div className={`patient-status ${isUrgente ? "status-urgent" : "status-ok"}`}>
              {isUrgente ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
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
              <span>Próxima recarga: {formatearFecha(patient.nextRefill)}</span>
            </div>
          </div>

          <div className="patient-extra">
            <div>
              <strong>Alergias</strong>
              <p>{patient.allergies || "Ninguna"}</p>
            </div>

            <div>
              <strong>Notas</strong>
              <p>{patient.notes || "Sin observaciones"}</p>
            </div>
          </div>

          <div className="patient-card-actions">
            <button className="btn-action btn-complete" onClick={() => onCompleteRefill && onCompleteRefill(patient.id)}>
              <Check size={16} /> Completado
            </button>
            <button className="btn-action btn-edit" onClick={() => setIsEditing(true)}>
              <Edit size={16} /> Editar
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PatientCard;