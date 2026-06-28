 
//Objetivo de esta funcion: al dar clik en boton que dice "Cambiar tema", toda la pagina pasa a modo oscuro. 
const botonModoOscuro = document.getElementById("botonModoOscuro");

botonModoOscuro.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});
