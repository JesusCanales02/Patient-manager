export const esRecargaUrgente = (fechaRecarga) =>{
    const hoy = new Date()
    const fechaLimite = new Date(fechaRecarga)
    const Diferencia_D_Tiempo = fechaLimite - hoy
    const diasFaltantes = Diferencia_D_Tiempo / (1000 * 60 * 60 * 24)
    if(diasFaltantes <= 3){
        return true
    } else{
        return false
    }
}

export const obtenerEstadoPaciente = (fechaRecarga) =>{
    if (esRecargaUrgente(fechaRecarga)) {
        return "Prioridad"
    } else {
        return "Sin prisa"
    }
}

export const formatearFecha = (fechaTexto) =>{
    if (fechaTexto == null) {
        return ""
    }
    const [año, mes, dia] = fechaTexto.split("-")
    return `${año} - ${mes} - ${dia}`
}