import { useState } from "react";
import { X } from "lucide-react";

const initialForm = {
  name: "",
  phone: "",
  diagnosis: "",
  allergies: "",
  nextRefill: "",
  notes: "",
};

const PatientModal = ({ onClose, onAddPatient }) => {
  const [form, setForm] = useState(initialForm);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const newPatient = {
      id: Date.now(),
      ...form,
    };

    onAddPatient(newPatient);

    setForm(initialForm);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>

      <div
        className="patient-modal"
        onClick={(event) => event.stopPropagation()}
      >

        <div className="modal-header">
          <div>
            <h2>Nuevo paciente</h2>
            <p>Registra la información del paciente.</p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-grid">

            <div className="form-group full-width">
              <label>Nombre completo</label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ej. Juan Pérez"
                required
              />
            </div>

            <div className="form-group">
              <label>Teléfono</label>

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="646-123-4567"
                required
              />
            </div>

            <div className="form-group">
              <label>Diagnóstico principal</label>

              <input
                type="text"
                name="diagnosis"
                value={form.diagnosis}
                onChange={handleChange}
                placeholder="Ej. Diabetes Tipo 2"
                required
              />
            </div>

            <div className="form-group">
              <label>Alergias</label>

              <input
                type="text"
                name="allergies"
                value={form.allergies}
                onChange={handleChange}
                placeholder="Ej. Penicilina"
              />
            </div>

            <div className="form-group">
              <label>Próxima recarga</label>

              <input
                type="date"
                name="nextRefill"
                value={form.nextRefill}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Notas / Observaciones</label>

              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Información adicional..."
                rows="4"
              />
            </div>

          </div>

          <div className="modal-actions">

            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn-primary"
            >
              Registrar paciente
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default PatientModal;