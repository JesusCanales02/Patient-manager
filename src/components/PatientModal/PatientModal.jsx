import { useState } from "react"
import { X, Plus } from "lucide-react"
import "./PatientModal.css"

const PatientModal = ({ onClose, onAddPatient }) => {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [nextRefill, setNextRefill] = useState("")
  const [notes, setNotes] = useState("")

  const [allergies, setAllergies] = useState([""])

  const handleAllergyChange = (index, value) => {
    const updated = [...allergies]
    updated[index] = value
    setAllergies(updated)
  };

  const handleAddAllergyInput = () => {
    setAllergies([...allergies, ""])
  };

  const handleRemoveAllergyInput = (index) => {
    setAllergies(allergies.filter((_, i) => i !== index))
  };

  const handleSubmit = (e) => {
    e.preventDefault()

    const cleanAllergies = allergies
      .map((item) => item.trim())
      .filter((item) => item !== "")
      .join(", ")

    const newPatient = {
      id: Date.now(),
      name: name.trim() || "Sin nombre",
      phone: phone.trim() || null,
      diagnosis: diagnosis.trim() || null,
      nextRefill: nextRefill || null,
      allergies: cleanAllergies || "Ninguna",
      notes: notes.trim() || null,
    }

    onAddPatient(newPatient);
    onClose();
  }

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
              placeholder="Ej. Rosa Flores"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="text"
              placeholder="646-000-00-00"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Diagnóstico principal</label>
            <input
              type="text"
              placeholder="Ej. Tiene fiebre"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Alergias</label>
            {allergies.map((allergy, index) => (
              <div key={index} className="allergy-field-row">
                <input
                  type="text"
                  placeholder={`Alergia ${index + 1}`}
                  value={allergy}
                  onChange={(e) => handleAllergyChange(index, e.target.value)}
                />
                {allergies.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove-field"
                    onClick={() => handleRemoveAllergyInput(index)}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn-add-field"
              onClick={handleAddAllergyInput}
            >
              <Plus size={16} /> Agregar otra alergia
            </button>
          </div>

          <div className="form-group">
            <label>Próxima recarga</label>
            <input
              type="date"
              value={nextRefill}
              onChange={(e) => setNextRefill(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Notas / Observaciones</label>
            <textarea
              placeholder="Información adicional..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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

export default PatientModal