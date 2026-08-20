from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)  

def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="farmacia_db"
    )

@app.route('/api/patients', methods=['GET'])
def get_patients():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM patients ORDER BY id DESC")
    patients = cursor.fetchall()
    
    for p in patients:
        p['hidden'] = bool(p['hidden'])
        
    cursor.close()
    db.close()
    return jsonify(patients)

@app.route('/api/patients', methods=['POST'])
def add_patient():
    data = request.json
    db = get_db()
    cursor = db.cursor()
    
    sql = """INSERT INTO patients (name, age, gender, phone, diagnosis, allergies, nextRefill, notes, hidden)
             VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"""
             
    allergies = ", ".join(data.get('allergies', [])) if isinstance(data.get('allergies'), list) else data.get('allergies', 'Ninguna')
    hidden = 1 if data.get('hidden') else 0
    
    values = (
        data.get('name', 'Sin nombre'),
        str(data.get('age', 'No decir')),
        data.get('gender', 'No decir'),
        data.get('phone', 'Sin teléfono'),
        data.get('diagnosis', 'Sin diagnóstico'),
        allergies,
        data.get('nextRefill', 'No asignada'),
        data.get('notes', 'Sin notas'),
        hidden
    )
    
    cursor.execute(sql, values)
    db.commit()
    new_id = cursor.lastrowid
    
    cursor.close()
    db.close()
    
    data['id'] = new_id
    return jsonify(data), 201

@app.route('/api/patients/<int:patient_id>', methods=['PUT'])
def update_patient(patient_id):
    data = request.json
    db = get_db()
    cursor = db.cursor()
    
    sql = """UPDATE patients 
             SET name=%s, age=%s, gender=%s, phone=%s, diagnosis=%s, allergies=%s, nextRefill=%s, notes=%s, hidden=%s 
             WHERE id=%s"""
             
    allergies = ", ".join(data.get('allergies', [])) if isinstance(data.get('allergies'), list) else data.get('allergies', 'Ninguna')
    hidden = 1 if data.get('hidden') else 0
    
    values = (
        data.get('name'),
        str(data.get('age')),
        data.get('gender'),
        data.get('phone'),
        data.get('diagnosis'),
        allergies,
        data.get('nextRefill'),
        data.get('notes'),
        hidden,
        patient_id
    )
    
    cursor.execute(sql, values)
    db.commit()
    
    cursor.close()
    db.close()
    return jsonify({"success": True})

@app.route('/api/patients/<int:patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("DELETE FROM patients WHERE id = %s", (patient_id,))
    db.commit()
    
    cursor.close()
    db.close()
    return jsonify({"success": True})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)