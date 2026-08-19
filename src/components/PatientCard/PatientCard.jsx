import { useState } from "react"
import { Check, Edit, Trash2, Eye, EyeOff, Calendar, Phone, Plus, X } from "lucide-react"
import { esRecargaUrgente } from "../../utils/patientUtils"
import "./PatientCard.css"

const PatientCard = ({
  patient,
  onUpdatePatient,
  onCompleteRefill,
  onDeletePatient,
  onToggleHide,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [editedData, setEditedData] = useState({ ...patient })
  const [phoneError, setPhoneError] = useState("")

  const isUrgent = esRecargaUrgente(patient?.nextRefill);

  const getAllergiesArray = (allergiesData) => {
    if (Array.isArray(allergiesData)) return allergiesData
    if (typeof allergiesData === "string" && allergiesData.trim() !== "") {
      return allergiesData.split(",").map((a) => a.trim())
    }
    return [];
  };

  const allergiesList = Array.isArray(editedData.allergies)
    ? editedData.allergies
    : getAllergiesArray(editedData.allergies);

  const handleAllergyChange = (index, value) => {
    const updated = [...allergiesList];
    updated[index] = value;
    setEditedData({ ...editedData, allergies: updated });
  };

  const handlePhoneChange = (e) => {
    const rawValue = e.target.value;

    const onlyNums = rawValue.replace(/\D/g, "")

    if (onlyNums.length > 12) {
      setPhoneError("Máximo 12 números permitidos.")
      setEditedData({ ...editedData, phone: onlyNums.slice(0, 12) })
    } else {
      setPhoneError("")
      setEditedData({ ...editedData, phone: onlyNums })
    }
  };

  const handleAddAllergy = () => {
    setEditedData({ ...editedData, allergies: [...allergiesList, ""] })
  };

  const handleRemoveAllergy = (index) => {
    const updated = allergiesList.filter((_, i) => i !== index)
    setEditedData({ ...editedData, allergies: updated })
  };

  const handleSave = () => {
    if (phoneError) return

    const cleanAllergies = allergiesList.filter((a) => a.trim() !== "")
    
    const currentPhone = editedData.phone ? editedData.phone.toString().trim() : ""
    const finalPhone = currentPhone === "" ? "Sin teléfono" : currentPhone

    onUpdatePatient({ 
      ...editedData, 
      phone: finalPhone, 
      allergies: cleanAllergies 
    });
    setIsEditing(false)
  }

  const startEditing = () => {
    const currentAllergies = getAllergiesArray(patient.allergies)
    setPhoneError("")
    const rawPhone = patient.phone === "Sin teléfono" ? "" : patient.phone || ""
    const cleanPhone = rawPhone.replace(/\D/g, "")

    setEditedData({
      ...patient,
      name: patient.name || "",
      diagnosis: patient.diagnosis || "",
      phone: cleanPhone,
      nextRefill: patient.nextRefill || "",
      notes: patient.notes || "",
      allergies: currentAllergies.length > 0 ? currentAllergies : [""]
    })

    setIsEditing(true);
  }

  const displayAllergies = getAllergiesArray(patient.allergies).join(", ")

  return (
    <div className={`patient-card ${patient.hidden ? "patient-card-hidden" : ""}`}>
      <button
        className="btn-hide-toggle"
        onClick={() => onToggleHide(patient.id)}
        title={patient.hidden ? "Restaurar a pendientes" : "Archivar paciente"}
      >
        {patient.hidden ? <Eye size={18} /> : <EyeOff size={18} />}
      </button>

      {!isEditing ? (
        <>
          <div className="patient-card-header">
            <div className="patient-avatar">
              {patient.name ? patient.name.charAt(0).toUpperCase() : "?"}
            </div>
            <div className="patient-name">
              <h3>{patient.name || "Sin nombre"}</h3>
              <span>{patient.diagnosis || "Sin diagnóstico"}</span>
            </div>
            <span className={`patient-status ${isUrgent ? "status-urgent" : "status-ok"}`}>
              {isUrgent ? "Prioridad" : "Sin prisa"}
            </span>
          </div>

          <div className="patient-details">
            <div className="patient-detail">
              <Phone size={16} />
              <span>{patient.phone || "Sin teléfono"}</span>
            </div>
            <div className="patient-detail">
              <Calendar size={16} />
              <span>Próxima recarga: {patient.nextRefill || "No asignada"}</span>
            </div>
          </div>

          <div className="patient-extra">
            <div>
              <strong>Alergias</strong>
              <p>{displayAllergies || "Ninguna"}</p>
            </div>
            <div>
              <strong>Notas</strong>
              <p>{patient.notes || "Sin notas"}</p>
            </div>
          </div>

          <div className="patient-card-actions">
            {showConfirmDelete ? (
              <div className="confirm-delete-box">
                <span>¿Eliminar?</span>
                <button
                  className="btn-confirm-yes"
                  onClick={() => onDeletePatient(patient.id)}
                >
                  Sí
                </button>
                <button
                  className="btn-confirm-no"
                  onClick={() => setShowConfirmDelete(false)}
                >
                  No
                </button>
              </div>
            ) : (
              <>
                <button
                  className="btn-action btn-complete"
                  onClick={() => onCompleteRefill(patient.id)}
                >
                  <Check size={16} /> Completado
                </button>
                <button className="btn-action btn-edit" onClick={startEditing}>
                  <Edit size={16} /> Editar
                </button>
                <button
                  className="btn-action btn-delete"
                  onClick={() => setShowConfirmDelete(true)}
                  title="Eliminar paciente"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="patient-card-edit">
          <input
            type="text"
            value={editedData.name || ""}
            onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
            placeholder="Nombre"
          />
          <input
            type="text"
            value={editedData.diagnosis || ""}
            onChange={(e) => setEditedData({ ...editedData, diagnosis: e.target.value })}
            placeholder="Diagnóstico"
          />

          <div className="phone-input-container">
            <input
              type="text"
              inputMode="numeric"
              maxLength={12}
              value={editedData.phone || ""}
              onChange={handlePhoneChange}
              placeholder="Teléfono (dejar vacío para 'Sin teléfono')"
              className={phoneError ? "input-error" : ""}
            />
            {phoneError && <span className="error-message">{phoneError}</span>}
          </div>

          <input
            type="date"
            value={editedData.nextRefill || ""}
            onChange={(e) => setEditedData({ ...editedData, nextRefill: e.target.value })}
          />

          <div className="edit-allergies-container">
            <label>Alergias:</label>
            {allergiesList.map((allergy, index) => (
              <div key={index} className="allergy-field-row">
                <input
                  type="text"
                  value={allergy || ""}
                  onChange={(e) => handleAllergyChange(index, e.target.value)}
                  placeholder={`Alergia ${index + 1}`}
                />
                {allergiesList.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove-field"
                    onClick={() => handleRemoveAllergy(index)}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn-add-field"
              onClick={handleAddAllergy}
            >
              <Plus size={14} /> Agregar alergia
            </button>
          </div>

          <textarea
            value={editedData.notes || ""}
            onChange={(e) => setEditedData({ ...editedData, notes: e.target.value })}
            placeholder="Notas"
          />

          <div className="card-buttons">
            <button 
              className="btn-save" 
              onClick={handleSave}
              disabled={!!phoneError}
            >
              Guardar
            </button>
            <button className="btn-cancel" onClick={() => setIsEditing(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientCard