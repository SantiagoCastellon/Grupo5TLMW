// Objetivo: al dar click en el botón que dice "Cambiar tema", toda la página pasa a modo oscuro.
const botonModoOscuro = document.getElementById("botonModoOscuro");

if (botonModoOscuro) {
    botonModoOscuro.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        // Reajustar contraste después de cambiar tema
        adjustContrastForAll();
    });
}

/* Ajuste dinámico de contraste
   - Recorre elementos visibles y asegura que el color de texto tenga
     una relación de contraste alta frente al fondo (elige blanco o negro).
   - Se ejecuta al cargar la página y cuando cambia el tema.
*/
function parseRGB(colorStr) {
    if (!colorStr) return null;
    // Maneja formatos: rgb(a) y hex
    colorStr = colorStr.trim();
    if (colorStr.startsWith('rgb')) {
        const vals = colorStr.match(/rgba?\(([^)]+)\)/);
        if (!vals) return null;
        const parts = vals[1].split(',').map(s => parseFloat(s.trim()));
        return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] === undefined ? 1 : parts[3] };
    }
    if (colorStr.startsWith('#')) {
        let hex = colorStr.slice(1);
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        const bigint = parseInt(hex, 16);
        return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255, a: 1 };
    }
    return null;
}

function relativeLuminance({ r, g, b }) {
    // Convert sRGB to linear
    const srgb = [r, g, b].map(v => v / 255).map(c => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function contrastRatio(rgb1, rgb2) {
    const L1 = relativeLuminance(rgb1);
    const L2 = relativeLuminance(rgb2);
    const bright = Math.max(L1, L2);
    const dark = Math.min(L1, L2);
    return (bright + 0.05) / (dark + 0.05);
}

function getEffectiveBackgroundColor(el) {
    let node = el;
    while (node && node !== document.documentElement) {
        const bg = getComputedStyle(node).backgroundColor;
        if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'initial') {
            const parsed = parseRGB(bg);
            if (parsed) return parsed;
        }
        node = node.parentElement;
    }
    // Fallback to body background or white
    const bodyBg = getComputedStyle(document.body).backgroundColor || '#ffffff';
    return parseRGB(bodyBg) || { r: 255, g: 255, b: 255, a: 1 };
}

function adjustContrastForElement(el) {
    const style = getComputedStyle(el);
    if (!style) return;
    const fg = parseRGB(style.color) || { r: 0, g: 0, b: 0 };
    const bg = getEffectiveBackgroundColor(el) || { r: 255, g: 255, b: 255 };
    const currentContrast = contrastRatio(fg, bg);
    if (currentContrast >= 8) return; // ya cumple

    // Evalúa contraste con blanco y negro y elige el que mejore
    const white = { r: 255, g: 255, b: 255 };
    const black = { r: 0, g: 0, b: 0 };
    const contrastWithWhite = contrastRatio(white, bg);
    const contrastWithBlack = contrastRatio(black, bg);
    if (contrastWithWhite >= contrastWithBlack) {
        el.style.color = '#ffffff';
    } else {
        el.style.color = '#000000';
    }
}

function adjustContrastForAll() {
    // Selecciona elementos que normalmente contienen texto
    const nodes = document.querySelectorAll('body *');
    nodes.forEach(el => {
        // omite elementos invisibles
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;
        // Solo ajustar elementos que tengan color y no sean inputs ocultos
        adjustContrastForElement(el);
    });
}

// Ejecutar al cargar
document.addEventListener('DOMContentLoaded', () => {
    adjustContrastForAll();
});

// Reajustar cuando la ventana cambie (por si hay estilos responsivos)
window.addEventListener('resize', () => {
    adjustContrastForAll();
});

