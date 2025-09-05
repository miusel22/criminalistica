// Ejemplo de señales físicas detalladas para el indiciado 861738e4-4f73-479c-8970-24eeb17a7496
// Estos datos se pueden agregar usando el formulario de edición en el frontend

const senalesFisicasDetalladas = {
  complexion: "Atlética",
  formaCara: "Ovalada",
  tipoCabello: "Rizado", 
  largoCabello: "Corto",
  formaOjos: "Almendrados",
  formaNariz: "Recta",
  formaBoca: "Mediana",
  formaLabios: "Normales"
};

// Ejemplo de payload completo que se enviaría al backend
const payloadEjemplo = {
  // ... otros campos del indiciado
  senalesFisicasDetalladas: {
    complexion: "Atlética",
    formaCara: "Ovalada", 
    tipoCabello: "Rizado",
    largoCabello: "Corto",
    formaOjos: "Almendrados", 
    formaNariz: "Recta",
    formaBoca: "Mediana",
    formaLabios: "Normales"
  }
};

console.log("Señales físicas detalladas de ejemplo:");
console.log(JSON.stringify(senalesFisicasDetalladas, null, 2));

// Para usar este ejemplo:
// 1. Ve a http://localhost:3001
// 2. Busca el indiciado con ID: 861738e4-4f73-479c-8970-24eeb17a7496  
// 3. Haz clic en "Editar"
// 4. Ve a la sección "Señales Físicas Detalladas"
// 5. Llena los campos con estos valores:
//    - Complexión: "Atlética"
//    - Forma de Cara: "Ovalada"
//    - Tipo de Cabello: "Rizado"
//    - Largo de Cabello: "Corto"
//    - Forma de Ojos: "Almendrados"
//    - Forma de Nariz: "Recta" 
//    - Forma de Boca: "Mediana"
//    - Forma de Labios: "Normales"
// 6. Haz clic en "Actualizar Indiciado"
// 7. Verifica en la consola del navegador que se envíen correctamente
