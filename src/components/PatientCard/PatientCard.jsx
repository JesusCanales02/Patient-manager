import { useState } from "react";
import { Check, Edit, Trash2, Eye, EyeOff, Calendar, Phone, Plus, X, User } from "lucide-react";
import { esRecargaUrgente } from "../../utils/patientUtils";
import "./PatientCard.css";

const parseAllergies = (data) => {
  if (Array.isArray(data)) return data;
  if (typeof data === "string" && data.trim()) {
    return data.split(",").map((a) => a.trim());
  }
  return [];
};

const PatientCard = ({
  patient,
  onUpdatePatient,
  onCompleteRefill,
  onDeletePatient,
  onToggleHide,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [formData, setFormData] = useState({ ...patient });
  const [phoneError, setPhoneError] = useState("");

  const isUrgent = esRecargaUrgente(patient?.nextRefill);
  const allergiesList = parseAllergies(formData.allergies);

  const handlePhone = (e) => {
    const raw = e.target.value.replace(/\D/g, "");

    if (raw.length > 12) {
      setPhoneError("Máximo 12 números permitidos.");
      setFormData((prev) => ({ ...prev, phone: raw.slice(0, 12) }));
    } else {
      setPhoneError("");
      setFormData((prev) => ({ ...prev, phone: raw }));
    }
  };

  const handleAllergyChange = (idx, val) => {
    const updated = [...allergiesList];
    updated[idx] = val;
    setFormData((prev) => ({ ...prev, allergies: updated }));
  };

  const addAllergyField = () => {
    setFormData((prev) => ({ ...prev, allergies: [...allergiesList, ""] }));
  };

  const removeAllergyField = (idx) => {
    setFormData((prev) => ({
      ...prev,
      allergies: allergiesList.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = () => {
    if (phoneError) return;

    const cleanAllergies = allergiesList.filter((a) => a.trim() !== "");
    const currentPhone = formData.phone ? formData.phone.toString().trim() : "";
    const finalPhone = currentPhone === "" ? "Sin teléfono" : currentPhone;

    onUpdatePatient({
      ...formData,
      age: formData.age ? formData.age : "No decir",
      gender: formData.gender || "No decir",
      phone: finalPhone,
      allergies: cleanAllergies,
    });
    setIsEditing(false);
  };

  const startEdit = () => {
    setPhoneError("");
    const currentAllergies = parseAllergies(patient.allergies);
    const rawPhone = patient.phone === "Sin teléfono" ? "" : patient.phone || "";

    setFormData({
      ...patient,
      name: patient.name || "",
      age: patient.age === "No decir" ? "" : patient.age || "",
      gender: patient.gender === "No decir" ? "" : patient.gender || "",
      diagnosis: patient.diagnosis || "",
      phone: rawPhone.replace(/\D/g, ""),
      nextRefill: patient.nextRefill || "",
      notes: patient.notes || "",
      allergies: currentAllergies.length ? currentAllergies : [""],
    });

    setIsEditing(true);
  };

  const displayAllergies = parseAllergies(patient.allergies).join(", ");

  const formatAge = (age) => {
    if (!age || age === "No decir") return "Edad: No decir";
    return `${age} años`;
  };

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
              <h3>
                {patient.name || "Sin nombre"} ({formatAge(patient.age)})
              </h3>
              <span>{patient.diagnosis || "Sin diagnóstico"}</span>
            </div>
            <span className={`patient-status ${isUrgent ? "status-urgent" : "status-ok"}`}>
              {isUrgent ? "Prioridad" : "Sin prisa"}
            </span>
          </div>

          <div className="patient-details">
            <div className="patient-detail">
              <User size={16} />
              <span>Género: {patient.gender || "No decir"}</span>
            </div>
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
            {confirmDelete ? (
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
                  onClick={() => setConfirmDelete(false)}
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
                <button className="btn-action btn-edit" onClick={startEdit}>
                  <Edit size={16} /> Editar
                </button>
                <button
                  className="btn-action btn-delete"
                  onClick={() => setConfirmDelete(true)}
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
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nombre"
          />

          <div className="edit-row">
            <input
              type="number"
              value={formData.age || ""}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="Edad (dejar vacío para 'No decir')"
              min="0"
              max="120"
            />
            <div className="gender-selector">
              <button
                type="button"
                className={`gender-btn ${formData.gender === "Masculino" ? "active" : ""}`}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    gender: prev.gender === "Masculino" ? "" : "Masculino",
                  }))
                }
              >
                Masculino
              </button>
              <button
                type="button"
                className={`gender-btn ${formData.gender === "Femenino" ? "active" : ""}`}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    gender: prev.gender === "Femenino" ? "" : "Femenino",
                  }))
                }
              >
                Femenino
              </button>
            </div>
          </div>

          <input
            type="text"
            value={formData.diagnosis || ""}
            onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
            placeholder="Diagnóstico"
          />

          <div className="phone-input-container">
            <input
              type="text"
              inputMode="numeric"
              maxLength={12}
              value={formData.phone || ""}
              onChange={handlePhone}
              placeholder="Teléfono (dejar vacío para 'Sin teléfono')"
              className={phoneError ? "input-error" : ""}
            />
            {phoneError && <span className="error-message">{phoneError}</span>}
          </div>

          <input
            type="date"
            value={formData.nextRefill || ""}
            onChange={(e) => setFormData({ ...formData, nextRefill: e.target.value })}
          />

          <div className="edit-allergies-container">
            <label>Alergias:</label>
            {allergiesList.map((allergy, i) => (
              <div key={i} className="allergy-field-row">
                <input
                  type="text"
                  value={allergy || ""}
                  onChange={(e) => handleAllergyChange(i, e.target.value)}
                  placeholder={`Alergia ${i + 1}`}
                />
                {allergiesList.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove-field"
                    onClick={() => removeAllergyField(i)}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn-add-field"
              onClick={addAllergyField}
            >
              <Plus size={14} /> Agregar alergia
            </button>
          </div>

          <textarea
            value={formData.notes || ""}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
  );
};

export default PatientCard;