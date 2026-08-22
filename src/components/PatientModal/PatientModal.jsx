import { useState } from "react";
import { X, Plus } from "lucide-react";
import "./PatientModal.css";

const INITIAL_FORM = {
  name: "",
  age: "",
  gender: "", 
  phone: "",
  diagnosis: "",
  nextRefill: "",
  notes: "",
};

const PatientModal = ({ onClose, onAddPatient }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [allergies, setAllergies] = useState([""]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderSelect = (genderValue) => {
    setFormData((prev) => ({
      ...prev,
      gender: prev.gender === genderValue ? "" : genderValue,
    }));
  };

  const handleAllergyChange = (idx, value) => {
    const updated = [...allergies];
    updated[idx] = value;
    setAllergies(updated);
  };

  const addAllergy = () => setAllergies((prev) => [...prev, ""]);

  const removeAllergy = (idx) => {
    setAllergies((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanAllergies = allergies
      .map((a) => a.trim())
      .filter(Boolean)
      .join(", ");

    onAddPatient({
      id: Date.now(),
      name: formData.name.trim() || "Sin nombre",
      age: formData.age ? parseInt(formData.age, 10) : "No decir",
      gender: formData.gender || "No decir",
      phone: formData.phone.trim() || "Sin teléfono",
      diagnosis: formData.diagnosis.trim() || "Sin diagnóstico",
      nextRefill: formData.nextRefill || "No asignada",
      allergies: cleanAllergies || "Ninguna",
      notes: formData.notes.trim() || "Sin notas",
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nuevo Paciente</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Nombre del paciente</label>
            <input
              type="text"
              name="name"
              placeholder="Ej. Rosa Flores"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Edad</label>
              <input
                type="number"
                name="age"
                placeholder="Ej. 45"
                min="0"
                max="120"
                value={formData.age}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Género</label>
              <div className="gender-selector">
                <button
                  type="button"
                  className={`gender-btn ${formData.gender === "Masculino" ? "active" : ""}`}
                  onClick={() => handleGenderSelect("Masculino")}
                >
                  Masculino
                </button>
                <button
                  type="button"
                  className={`gender-btn ${formData.gender === "Femenino" ? "active" : ""}`}
                  onClick={() => handleGenderSelect("Femenino")}
                >
                  Femenino
                </button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="text"
              name="phone"
              placeholder="646-000-00-00"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Diagnóstico principal</label>
            <input
              type="text"
              name="diagnosis"
              placeholder="Ej. Tiene fiebre"
              value={formData.diagnosis}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Alergias</label>
            {allergies.map((allergy, i) => (
              <div key={i} className="allergy-field-row">
                <input
                  type="text"
                  placeholder={`Alergia ${i + 1}`}
                  value={allergy}
                  onChange={(e) => handleAllergyChange(i, e.target.value)}
                />
                {allergies.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove-field"
                    onClick={() => removeAllergy(i)}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn-add-field" onClick={addAllergy}>
              <Plus size={16} /> Agregar otra alergia
            </button>
          </div>

          <div className="form-group">
            <label>Próxima recarga</label>
            <input
              type="date"
              name="nextRefill"
              value={formData.nextRefill}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Notas / Observaciones</label>
            <textarea
              name="notes"
              placeholder="Información adicional..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientModal;