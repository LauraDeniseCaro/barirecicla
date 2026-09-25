// =========================================================================
// 1. REGISTRO DEL SERVICE WORKER Y HELPERS
// =========================================================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registrado con éxito', reg))
            .catch(err => console.error('Error al registrar el Service Worker', err));
    });
}

// Helper para prevenir ataques XSS al inyectar strings dinámicos de Google Sheets al HTML
function sanitizarHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// =========================================================================
// 2. CONFIGURACIÓN DE NOVEDADES EN VIVO DESDE GOOGLE SHEETS (Slider)
// =========================================================================
const URL_GOOGLE_SHEETS_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSCJ3M-TVkindGUP9OAZLhfrZnqO6cbuhdS8r-uLkm0JQINs3_lsBVm71i3nkGzpoyRaF6s8VTRAzZQ/pub?output=csv";

let currentSlide = 0;
let totalNovedadesVigentes = 0;

// Función para procesar y limpiar el CSV de Google Sheets
function parsearCSV(texto) {
    const lineas = [];
    let lineaActual = [];
    let valorActual = '';
    let dentroDeComillas = false;

    for (let i = 0; i < texto.length; i++) {
        const char = texto[i];
        const siguienteChar = texto[i + 1];

        if (char === '"') {
            if (dentroDeComillas && siguienteChar === '"') {
                valorActual += '"';
                i++;
            } else {
                dentroDeComillas = !dentroDeComillas;
            }
        } else if (char === ',' && !dentroDeComillas) {
            lineaActual.push(valorActual.trim());
            valorActual = '';
        } else if ((char === '\r' || char === '\n') && !dentroDeComillas) {
            if (char === '\r' && siguienteChar === '\n') {
                i++;
            }
            lineaActual.push(valorActual.trim());
            lineas.push(lineaActual);
            lineaActual = [];
            valorActual = '';
        } else {
            valorActual += char;
        }
    }
    if (lineaActual.length > 0 || valorActual !== '') {
        lineaActual.push(valorActual.trim());
        lineas.push(lineaActual);
    }

    if (lineas.length <= 1) return [];

    const encabezados = lineas[0].map(e => e.trim());
    const resultado = [];

    for (let i = 1; i < lineas.length; i++) {
        const fila = lineas[i];
        if (fila.length === 0 || (fila.length === 1 && fila[0] === "")) continue;

        let objeto = {};
        encabezados.forEach((encabezado, index) => {
            objeto[encabezado] = fila[index] !== undefined ? fila[index] : "";
        });
        resultado.push(objeto);
    }
    return resultado;
}

// Función para descartar la novedad desde el botón
function descartarNovedad(boton) {
    const slide = boton.closest('.slide-item');
    if (slide) slide.style.display = 'none';
}

// Generador del HTML de cada tarjeta de novedad (Diseño de 2 columnas y contactos)
function crearTarjetaNovedad(item) {
    // 1. WhatsApp / Teléfono
    let telefonoHtml = '';
    if (item.telefono) {
        const numLimpio = item.telefono.toString().replace(/[^0-9]/g, '');
        telefonoHtml = `
      <a href="https://wa.me/${numLimpio}" target="_blank" rel="noopener" class="contacto-item whatsapp-link">
        <i class="fab fa-whatsapp"></i> ${item.telefono}
      </a>`;
    }

    // 2. Instagram
    let instagramHtml = '';
    if (item.instagram) {
        const instaUser = item.instagram
            .replace('https://www.instagram.com/', '')
            .replace('https://instagram.com/', '')
            .replace('@', '')
            .replace(/\/$/, '')
            .trim();
        instagramHtml = `
      <a href="https://www.instagram.com/${instaUser}" target="_blank" rel="noopener" class="contacto-item instagram-link">
        <i class="fab fa-instagram"></i> @${instaUser}
      </a>`;
    }

    // 3. Dirección opcional (Google Maps)
    let direccionHtml = '';
    if (item.direccion) {
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.direccion)}`;
        direccionHtml = `
      <a href="${mapsUrl}" target="_blank" rel="noopener" class="contacto-item direccion-link">
        <i class="fas fa-map-marker-alt"></i> ${item.direccion}
      </a>`;
    }

    // Caja de datos de contacto
    const tieneContactos = telefonoHtml || instagramHtml || direccionHtml;
    const contactosBlock = tieneContactos ? `
    <div class="novedades-contactos-box">
      <span class="contactos-titulo">Datos de contacto</span>
      ${telefonoHtml}
      ${instagramHtml}
      ${direccionHtml}
    </div>` : '';

    // Imagen derecha (Flyer)
    let imagenHtml = '';
    if (item.imagen) {
        const imagenSana = (item.imagen.startsWith('http://') || item.imagen.startsWith('https://') || item.imagen.startsWith('./')) ? encodeURI(item.imagen) : '';
        if (imagenSana) {
            imagenHtml = `
        <div class="novedades-col-img">
          <img src="${imagenSana}" alt="${item.titulo || 'Novedad'}" loading="lazy" onerror="this.parentElement.style.display='none';">
        </div>`;
        }
    }

    const colorBadgeReal = (item.colorBadge && item.colorBadge.startsWith('#')) ? item.colorBadge : 'var(--verde-medio)';

    return `
    <div class="slide-item ${imagenHtml ? 'con-imagen-flyer' : ''}">
      <!-- COLUMNA IZQUIERDA: INFORMACIÓN -->
      <div class="novedades-col-info">
        <div class="novedades-header">
          <h4>${item.titulo || 'Novedad'}</h4>
          ${item.badge ? `<span class="novedades-badge" style="background-color: ${colorBadgeReal}">${item.badge}</span>` : ''}
        </div>

        ${item.descripcion ? `<p class="novedades-descripcion">${item.descripcion}</p>` : ''}

        ${contactosBlock}

        <div class="novedades-acciones">
          <button class="novedades-btn-descartar" onclick="descartarNovedad(this)">Descartar</button>
        </div>
      </div>

      <!-- COLUMNA DERECHA: FLYER -->
      ${imagenHtml}
    </div>
  `;
}

// Función principal para obtener, filtrar y renderizar las novedades
async function verificarYMostrarNovedades() {
    const contenedor = document.getElementById('contenedor-novedades');
    if (!contenedor) return;

    try {
        const respuesta = await fetch(URL_GOOGLE_SHEETS_CSV);
        if (!respuesta.ok) throw new Error("Fallo en la red");
        const textoCSV = await respuesta.text();
        const listaNovedadesDinamica = parsearCSV(textoCSV);

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const novedadesVigentes = listaNovedadesDinamica.filter(nov => {
            if (!nov.titulo) return false;
            if (!nov.fechaLimite) return true;

            let partes = [];
            let fechaLimiteDate;

            if (nov.fechaLimite.includes('-')) {
                partes = nov.fechaLimite.split('-');
                fechaLimiteDate = new Date(partes[0], partes[1] - 1, partes[2]);
            } else if (nov.fechaLimite.includes('/')) {
                partes = nov.fechaLimite.split('/');
                fechaLimiteDate = new Date(partes[2], partes[1] - 1, partes[0]);
            } else {
                fechaLimiteDate = new Date(nov.fechaLimite);
            }

            fechaLimiteDate.setHours(0, 0, 0, 0);
            return fechaLimiteDate >= hoy;
        });

        const ultimasNovedades = novedadesVigentes.reverse().slice(0, 3);
        totalNovedadesVigentes = ultimasNovedades.length;

        if (totalNovedadesVigentes === 0) {
            console.warn("No hay novedades vigentes para mostrar.");
            contenedor.innerHTML = "";
            return;
        }

        // Renderizado usando la función modularizada
        let slidesHTML = ultimasNovedades.map(nov => crearTarjetaNovedad(nov)).join('');

        let controlesHTML = "";
        if (totalNovedadesVigentes > 1) {
            controlesHTML = `
                <button class="slider-btn btn-prev" onclick="cambiarSlide(-1)" aria-label="Anterior">
                    <i class="fa-solid fa-angle-left"></i>
                </button>
                <button class="slider-btn btn-next" onclick="cambiarSlide(1)" aria-label="Siguiente">
                    <i class="fa-solid fa-angle-right"></i>
                </button>
                <div class="slider-indicators">
                    ${ultimasNovedades.map((_, index) => `
                        <span class="indicator-dot ${index === 0 ? 'active' : ''}" onclick="irAlSlide(${index})"></span>
                    `).join('')}
                </div>
            `;
        }

        contenedor.innerHTML = `
            <section class="novedades-section">
                <h3 class="novedades-section-title">
                    <i class="fa-solid fa-bullhorn"></i> Novedades y Campañas
                </h3>
                <div class="slider-wrapper">
                    <div class="slides-container" id="slides-container-id">
                        ${slidesHTML}
                    </div>
                    ${controlesHTML}
                </div>
            </section>
        `;

        currentSlide = 0;
        configurarScrollTactil();

    } catch (error) {
        console.error("Error en las novedades:", error);
        contenedor.innerHTML = `
            <section class="novedades-section">
                <p style="text-align: center; color: var(--verde-medio); font-size: 0.9rem; padding: 15px; background: rgba(45, 106, 79, 0.05); border-radius: 12px; margin: 0 0 20px 0;">
                    <i class="fa-solid fa-circle-exclamation"></i> No se pudieron cargar las novedades en vivo en este momento.
                </p>
            </section>
        `;
    }
}

// Configuración de interacción y navegación del slider
function configurarScrollTactil() {
    const contenedorSlides = document.getElementById('slides-container-id');
    if (!contenedorSlides) return;

    contenedorSlides.addEventListener('scroll', () => {
        const anchoSlide = contenedorSlides.clientWidth;
        const nuevoIndex = Math.round(contenedorSlides.scrollLeft / anchoSlide);

        if (nuevoIndex !== currentSlide && nuevoIndex >= 0 && nuevoIndex < totalNovedadesVigentes) {
            actualizarIndicadoresVisuales(nuevoIndex);
        }
    });
}

function cambiarSlide(direccion) {
    let nuevoIndex = currentSlide + direccion;
    if (nuevoIndex >= totalNovedadesVigentes) nuevoIndex = 0;
    else if (nuevoIndex < 0) nuevoIndex = totalNovedadesVigentes - 1;
    irAlSlide(nuevoIndex);
}

function irAlSlide(index) {
    const contenedorSlides = document.getElementById('slides-container-id');
    if (!contenedorSlides) return;

    const anchoSlide = contenedorSlides.clientWidth;
    contenedorSlides.scrollTo({
        left: anchoSlide * index,
        behavior: 'smooth'
    });

    actualizarIndicadoresVisuales(index);
}

function actualizarIndicadoresVisuales(index) {
    const dots = document.querySelectorAll('.indicator-dot');
    if (dots.length > 0 && dots[currentSlide]) {
        dots[currentSlide].classList.remove('active');
        currentSlide = index;
        if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    } else {
        currentSlide = index;
    }
}

// =========================================================================
// 3. MATRIZ DE DATOS COMPLETA DE ORGANIZACIONES Y CENTROS
// =========================================================================
const listaOrganizaciones = [
    {
        categoria: "reciclaje",
        materiales: "Plásticos (film, botellas PET, tapitas, baldes, cajones), metales (latas de gaseosas, cervezas, cobre, bronce, aluminio), papel (hojas, libros) y cartón.",
        tags: "arb vertedero recicladores carton papel hojas libros libro baldes de plastico balde de plastico cajones de plastico cajon de plastico botellas pet botella pet tapitas plasticas tapas de botella tapita de botella metales cobre bronce aluminio latas de gaseosa lata de gaseosa latas de cerveza lata de cerveza nylon strech film packs de gaseosa",
        logo: "img/logo-arb.webp",
        imagen: "img/arb.webp",
        nombre: "ARB - RECICLADORES",
        elementos: [
            { tipo: "link-geo", url: "https://www.google.com/maps/search/?api=1&query=Vertedero+Municipal+Bariloche", texto: "Vertedero Municipal" },
            { tipo: "texto", icono: "fa-regular fa-clock", texto: "Lun-Vie 8-16hs / Sáb 8-12hs" },
            { tipo: "whatsapp", numero: "2944916790" },
            { tipo: "email", correo: "arbbariloche@gmail.com" },
            { tipo: "instagram", usuario: "recicladores_bariloche" }
        ]
    },
    {
        categoria: "reciclaje",
        materiales: "Cartón, papel (revistas, recortes, hojas, libros), plásticos (film, envases de limpieza, vasos, bandejas, botellas PET, tapitas), Telgopor, metales (latas de conserva, latas de aluminio de cervezas o gaseosas), envases de tetrapack y vidrio (botellas, frascos).",
        tags: "finor servicios esandi nylon film telgopor vidrio latas de conseva lata de conserva latas de cerveza lata de cerveza lata de gaseosa latas de gaseosas alumnio tetra tetrapack botellas de vidrio botella de vidrio carton papel revista revistas recortes de papel recortes botellas pet botella pet tapitas de botella tapas de botella tapa de botella tapita de botella tapita",
        logo: "img/logo-finor.webp",
        imagen: "img/finor.webp",
        nombre: "FINOR SERVICIOS",
        elementos: [
            { tipo: "link-geo", url: "https://www.google.com/maps/search/?api=1&query=Esandi+215+Bariloche", texto: "Esandi 215" },
            { tipo: "texto", icono: "fa-regular fa-clock", texto: "Lun-Vie 9-16hs / Sáb 9-12hs" },
            { tipo: "instagram", usuario: "finorservicios" }
        ]
    },
    {
        categoria: "reciclaje",
        materiales: "Plásticos (botellas PET, tapitas, envases de shampoo o acondicionador, bidones, botellas de lavandina) y latas de cerveza y gaseosa.",
        tags: "jovenes pioneros conicet frutillar pet botella pet shampoo acondicionador latas de cerveza latas de gaseosa club andino victorias 106 viviendas mirador cartel centro civico",
        logo: "img/logo-jxb.webp",
        imagen: "img/jovenesporbariloche.webp",
        nombre: "JÓVENES POR BARILOCHE",
        elementos: [
            { tipo: "link-geo", url: "https://www.google.com/maps/search/?api=1&query=-41.160071,-71.341790", texto: "Quinchamali 784 (Sede Oficial)" },
            { tipo: "texto", icono: "fa-regular fa-clock", texto: "Lun-Vie 9-17hs" },
            { tipo: "instagram", usuario: "jovenesporbariloche" },
            {
                tipo: "desplegable-ecopuntos",
                titulo: "Ver más Ecopuntos",
                sedes: [
                    { nombre: "Club Andino Bariloche (20 de Febrero 30)", horario: "Todos los días", url: "https://www.google.com/maps/place/Club+Andino+Bariloche/@-41.1353602,-71.3128706,17z/data=!3m1!4b1!4m6!3m5!1s0x961a7b72a7da94c3:0xd9e9283572d5e1f5!8m2!3d-41.1353602!4d-71.3102957" },
                    { nombre: "Junta Vecinal Las Victorias (Av. Las Victorias 651)", horario: "Todos los días", url: "https://www.google.com/maps/place/Av.+Las+Victorias+651,+R8400+San+Carlos+de+Bariloche,+R%C3%ADo+Negro/@-41.1346862,-71.2610285,19z" },
                    { nombre: "106 Viviendas (Puerto Argentino y Rawson)", horario: "Punto exterior 24hs", url: "https://www.google.com/maps/place/Puerto+Argentino+y+Rawson/@-41.168145,-71.3112749,17z" },
                    { nombre: "Mirador Lago Nahuel Huapi (Cartel Bariloche)", horario: "Punto exterior 24hs", url: "https://www.google.com/maps/place/Mirador+Lago+Nahuel+Huapi/@-41.1322307,-71.3136724,17z" },
                    { nombre: "Pioneros 2350 (CONICET)", horario: "Lun-Vie 9-17hs", url: "https://www.google.com/maps/search/?api=1&query=Avenida+de+los+Pioneros+2350+Bariloche" },
                    { nombre: "Junta Vecinal Altos del Cóndor", horario: "Jueves 19 a 20hs", url: "https://www.google.com/maps/search/?api=1&query=Junta+Vecinal+Altos+del+Condor+Bariloche" },
                    { nombre: "Junta Vecinal Melipal", horario: "Todos los días hasta las 20:00hs", url: "https://www.google.com/maps/search/?api=1&query=Junta+Vecinal+Melipal+Bariloche" },
                    { nombre: "Club Pehuenes (Exclusivo Socios)", horario: "Horarios del club", url: "https://www.google.com/maps/search/?api=1&query=Club+Los+Pehuenes+Bariloche" },
                    { nombre: "Junta Vecinal Pinar del Lago", horario: "Lun-Vie 9-17hs", url: "https://www.google.com/maps/search/?api=1&query=Junta+Vecinal+Pinar+del+Lago+Bariloche" },
                    { nombre: "Centro del Copiado", horario: "Lun-Vie 9-17hs", url: "https://www.google.com/maps/search/?api=1&query=Centro+del+Copiado+Bariloche" },
                    { nombre: "Centro Cívico", horario: "Lun-Vie 9-17hs", url: "https://www.google.com/maps/search/?api=1&query=Centro+Civico+Bariloche" },
                    { nombre: "Junta Vecinal Barrio Unión", horario: "Lun-Vie 9-17hs", url: "https://www.google.com/maps/search/?api=1&query=Pecho+Colorado+711,+San+Carlos+de+Bariloche" },
                    { nombre: "Barrio Valle Azul", horario: "Lun-Vie 9-17hs", url: "https://www.google.com/maps/search/?api=1&query=Cascada+de+los+Cesares+816,+San+Carlos+de+Bariloche" }
                ]
            }
        ]
    },
    {
        categoria: "reciclaje",
        materiales: "Envases de limpiadores, detergente, jabón líquido, shampoo, acondicionadores y lavandina. Botellas de agua, gaseosas, bebidas deportivas y reutilizables. Tapitas, bolsas de súper y comercios, sachets de leche, film envoltorio y termocontraíble, envases flexibles (azúcar, pan, etc). Envoltorios de galletas, fideos, snacks y transparentes. Contenedores de alimentos/comida, cubiertos descartables, baldes, envases lácteos/descartables, bandejas, vasos térmicos, potes de helado, envases de repuestos para recarga, sorbetes, mamaderas, armazones de anteojos, tarjetas de crédito/débito, calzados, suelas, aislantes para cables y CD / DVD.",
        tags: "buply anonima albarracin botella pet botellas pets envase de shampoo envases de shampoo envases de acondicionador envase de acondicionador shampoo acondicionador bolsa de snacks bolsas de snacks envoltorios envoltorio envoltorios de snacks envoltorio de snacks envoltorios fideos envoltorio de fideos bolsa bolsas bolsa de plastico film potes de plastico pote de plastico bandeja de plastico bandejas de plastico tuppers tupper telgopor bandeja de telgopor pote de telgopor cds dvds cd dvd paquetes de cafe paquete de cafe tuppers snacks limpiadores detergente jabon liquido lavandina agua gaseosa bebida deportiva reutilizable tapitas bolsas super comercios sachets leche flexible azucar pan contenedores alimentos comida cubiertos descartables baldes lacteos vasos termicos helado repuestos recarga sorbetes mamaderas anteojos tarjetas credito debito calzados suelas aislantes cables",
        logo: "img/logo-buply.webp",
        imagen: "img/buply.webp",
        nombre: "BUPLY (LA ANÓNIMA)",
        elementos: [
            { tipo: "link-geo", url: "https://www.google.com/maps/search/?api=1&query=Albarracin+601+Bariloche", texto: "Albarracín 601" },
            { tipo: "texto", icono: "fa-regular fa-clock", texto: "Lun-Vie 10-18hs / Sáb 10-14hs" },
            { tipo: "instagram", usuario: "buply.ar" }
        ]
    },
    {
        categoria: "reciclaje",
        materiales: "Envases de limpiadores, detergente, jabón líquido, shampoo, acondicionadores y lavandina. Botellas de agua, gaseosas, bebidas deportivas y reutilizables. Tapitas, bolsas de súper y comercios, sachets de leche, film envoltorio y termocontraíble, envases flexibles (azúcar, pan, etc). Envoltorios de galletas, fideos, snacks y transparentes. Contenedores de alimentos/comida, cubiertos descartables, baldes, envases lácteos/descartables, bandejas, vasos térmicos, potes de helado, envases de repuestos para recarga, sorbetes, mamaderas, armazones de anteojos, tarjetas de crédito/débito, calzados, suelas, aislantes para cables y CD / DVD.",
        tags: "buply mercado diego neil ruta 40 sur intendencia anonima albarracin botella pet botellas pets envase de shampoo envases de shampoo envases de acondicionador envase de acondicionador shampoo acondicionador bolsa de snacks bolsas de snacks envoltorios envoltorio envoltorios de snacks envoltorio de snacks envoltorios fideos envoltorio de fideos bolsa bolsas bolsa de plastico film potes de plastico pote de plastico bandeja de plastico bandejas de plastico tuppers tupper telgopor bandeja de telgopor pote de telgopor cds dvds cd dvd paquetes de cafe paquete de cafe tuppers snacks limpiadores detergente jabon liquido lavandina agua gaseosa bebida deportiva reutilizable tapitas bolsas super comercios sachets leche flexible azucar pan contenedores alimentos comida cubiertos descartables baldes lacteos vasos termicos helado repuestos recarga sorbetes mamaderas anteojos tarjetas credito debito calzados suelas aislantes cables",
        logo: "img/logo-mercado.webp",
        imagen: "img/buply.webp",
        nombre: "Mercado",
        elementos: [
            { tipo: "link-geo", url: "https://www.google.com/maps/search/?api=1&query=Diego+Neil+3022+Bariloche", texto: "Diego Neil 3022 (Ruta 40 Sur)" },
            { tipo: "texto", icono: "fa-regular fa-clock", texto: "Lun-Sáb 9-21hs / Dom y Fer 9-14hs" },
            { tipo: "whatsapp", numero: "1154731689" }
        ]
    },
    {
        categoria: "compostaje",
        materiales: "Yerba, café, frutas, verduras, hojas, pasto, papel y cartón.",
        tags: "zona compost domicilio organicos frutas hojas hojas secas yerba cafe residuos organicos pasto papel sin tinta carton sin adhesivos verduras",
        logo: "img/logo-zonacompost.webp",
        imagen: "img/zonadecompost.webp",
        nombre: "ZONA DE COMPOST",
        elementos: [
            { tipo: "texto", icono: "fa-solid fa-truck-ramp-box", texto: "Recolección a domicilio (Arancelado)" },
            { tipo: "texto", icono: "fa-solid fa-seedling", texto: "Venta de composteras domiciliarias" },
            { tipo: "whatsapp", numero: "2944517496" },
            { tipo: "instagram", usuario: "zonadecompost" }
        ]
    },
    {
        categoria: "compostaje",
        materiales: "Yerba, café, frutas, verduras, hojas, pasto, papel y cartón.",
        tags: "comunidad compost gratis vuriloche valle azul organicos verduras cafe yerba hojas pasto papel carton",
        logo: "img/logo-comunidadcompost.webp",
        imagen: "img/comunidadcompost.webp",
        nombre: "COMUNIDAD COMPOST",
        elementos: [
            { tipo: "texto", icono: "fa-solid fa-gift", texto: "Composteras comunitarias gratuitas" },
            { tipo: "html", html: `<p class="info-p"><a href="https://www.google.com/maps/search/?api=1&query=-41.154126,-71.316535" target="_blank" class="geo-link"><i class="fa-solid fa-location-dot"></i> B° Vuriloche</a> <i class="fa-regular fa-clock inline-clock"></i> Miér 18:30hs</p>` },
            { tipo: "html", html: `<p class="info-p"><a href="https://www.google.com/maps/search/?api=1&query=-41.167938,-71.350288" target="_blank" class="geo-link"><i class="fa-solid fa-location-dot"></i> B° Valle Azul</a> <i class="fa-regular fa-clock inline-clock"></i> Sáb 17:00hs</p>` },
            { tipo: "instagram", usuario: "comunidadcompost" }
        ]
    },
    {
        categoria: "compostaje",
        labelMateriales: "Contenido de la guía:",
        iconoMateriales: "fa-solid fa-book-open",
        materiales: "Aprende el paso a paso: qué residuos orgánicos sumar, qué evitar, equilibrio verde/seco, control de humedad y cosecha del abono.",
        tags: "guia compostaje compost compostar tierra abono residuos organicos manual descargar pdf como compostar lombrices abono casero",
        logo: "img/logo-guiareciclaje.webp",
        imagen: "img/guiadecompostaje.webp", // Podés usar una foto de compost o la que prefieras
        nombre: "GUÍA DE COMPOSTAJE EN CASA",
        elementos: [
            { tipo: "texto", icono: "fa-solid fa-book-open-reader", texto: "Manual práctico y gratuito en PDF para iniciar tu compostera." },
            {
                tipo: "html",
                html: `<a href="./docs/guia-compost-baritoxico.pdf" target="_blank" rel="noopener" class="btn-descarga-guia">
                        <i class="fa-solid fa-file-pdf"></i> Ver o Descargar Guía (PDF)
                       </a>`
            }
        ]
    },
    {
        categoria: "especiales",
        materiales: "Línea blanca (heladeras, freezers, lavarropas, secarropas), pantallas y monitores LED, microondas, hornos eléctricos, máquinas a nafta (motosierras, cortadoras), soldadoras, ventiladores y caloventores.",
        tags: "electroreciclaje campichuelo suiza estudiantes electronica reutilizan componentes proyectos educativos reparacion aprendizaje rotas funcionamiento electrodomesticos grandes heladeras freezers lavarropas secarropas microondas hornos electricos tv led monitores pantallas maquinas nafteras motosierras motoguadañas cortadoras de cesped maquinas electricas soldadoras ventiladores calefactores raee chatarra metales especiales blanca linea blanca caloventores",
        logo: "img/logo-electroreciclaje.webp",
        imagen: "img/electroreciclaje.webp",
        nombre: "ELECTRORECICLAJE",
        elementos: [
            { tipo: "link-geo", url: "https://www.google.com/maps/search/?api=1&query=Campichuelo+y+Suiza+Bariloche", texto: "Campichuelo y Suiza" },
            { tipo: "texto", icono: "fa-solid fa-graduation-cap", texto: "<strong>Proyecto Educativo:</strong> Estudiantes de electrónica reutilizan componentes para reparación y aprendizaje." },
            { tipo: "texto", icono: "fa-solid fa-heart-pulse", texto: "Reciben equipos tanto <strong>rotos como en funcionamiento</strong>." },
            { tipo: "whatsapp", numero: "2944594891" }
        ]
    },
    {
        categoria: "especiales",
        materiales: "Aceite vegetal usado de cocina (dentro de botellas plásticas cerradas).",
        tags: "aceite rba ambiental domicilio aceite de cocina usado vegetal botellas",
        logo: "img/logo-rba.webp",
        imagen: "img/aceiteusado.webp",
        nombre: "ACEITE - RBA AMBIENTAL",
        elementos: [
            { tipo: "texto", icono: "fa-solid fa-house-chimney-user", texto: "Recolección sin cargo a domicilio" },
            { tipo: "whatsapp", numero: "2944230505" },
            { tipo: "whatsapp", numero: "1160481838" }
        ]
    },
    {
        categoria: "especiales",
        materiales: "Celulares, TV LED, cables, auriculares, pavas eléctricas, consolas, aparatos de gym, instrumentos musicales, equipos de audio, notebooks, telescopios, minicomponentes, mouse, pendrives, proyectores, cámaras, máquinas de coser, herramientas, parlantes, tablets y latas de pintura de todo tipo (nuevas, usadas o con restos secos).",
        tags: "electronicos raee cables cable computadoras computadora pc pcs cpu celus celulares celular notebooks notebook tablet tablets auriculares auricular mouse mouses pendrive parlantes equipos de audio consola pava electrica herramientas pintura pinturas latas de pintura lata de pintura barniz sintetico pintura al agua",
        logo: "img/logo-electronicos.webp",
        imagen: "img/residuoselectronicos.webp",
        nombre: "RESIDUOS ELECTRÓNICOS",
        elementos: [
            { tipo: "texto", icono: "fa-solid fa-laptop-code", texto: "Reciclaje de RAEEs y tecnología en desuso" },
            { tipo: "texto", icono: "fa-solid fa-paint-roller", texto: "Reciben latas de pintura (al agua o sintéticas, secas o usadas)" },
            { tipo: "whatsapp", numero: "2944652004" }
        ]
    },
    {
        categoria: "especiales",
        materiales: "Latas de aluminio, cobre, bronce, plomo, aluminio. Matafuegos, garrafas, bombonas, barriles, tanques (GNC, Oxígeno, Argón, Acetileno), tubos, cilindros, perfiles. Aceite usado de cocina y motor. Plásticos (cajones, baldes, tapitas). Residuos electrónicos. Electrodomésticos grandes y pequeños (termotanques, lavarropas, heladeras, hornos eléctricos, caloventores, estufas, aspiradoras, minipimer). Herramientas eléctricas y de mano. Cables, alambres, eslingas. Maderas, pallets, aserrín, viruta. Vidrio (botellas, frascos, ventanas, DVH). Muebles, estantes, estructuras. Cartón y papel.",
        tags: "esquina ñireco nireco namuncura chatarra metales aluminio cobre bronce plomo latas latitas latas de aluminio matafuegos matafuego garrafas garrafa bombona bombonas barriles barril tanques gnc oxigeno argon acetileno tubos cilindros perfiles aceite usado aceite de cocina aceite de motor plasticos cajon cajones balde baldes tapitas tapas raee electronicos residuos electronicos electrodomesticos termotanques termotanque lavarropas heladeras heladera hornos electricos horno electrico caloventores estufas aspiradora aspiradoras minipimer herramientas herramientas electricas cables cable alambre alambres eslingas eslinga madera maderas pallets pallet aserrin viruta vidrio vidrios botellas frascos ventanas dvh muebles mueble estantes estructuras carton papel",
        logo: "img/esquina-nireco-logo.webp",
        imagen: "img/esquina-nireco.webp",
        nombre: "ESQUINA ÑIRECO",
        elementos: [
            { tipo: "texto", icono: "fa-solid fa-boxes-packing", texto: "Recepción de materiales recuperables, metales y RAEE" },
            { tipo: "link-geo", url: "https://www.google.com/maps/search/?api=1&query=Namuncura+1997+Bariloche", texto: "Namuncura 1997" },
            { tipo: "texto", icono: "fa-regular fa-clock", texto: "Lun-Sáb 10-21 hs. / Dom y Fer 11-21 hs." },
            { tipo: "whatsapp", numero: "2944663243" }
        ]
    },
    {
        categoria: "especiales",
        materiales: "Cobre, bronce, aluminio, plomo, batería, bocha de heladera, radiador de bronce, latitas, batería de moto.",
        tags: "metales sur metal sur reciclados sobral chatarra cobre bronce aluminio plomo bateria baterias bateria de moto baterias de moto bateria de auto baterias de auto bocha de heladera bochas radiador radiadores radiador de bronce latas latitas latitas de cerveza latitas de gaseosa metales no ferrosos fundicion compra de metales",
        logo: "img/logo-metalsur.webp",
        imagen: "img/metalsur.webp",
        nombre: "METALES SUR RECICLADOS",
        elementos: [
            { tipo: "texto", icono: "fa-solid fa-recycle", texto: "Compra y reciclado de metales no ferrosos y baterías" },
            { tipo: "link-geo", url: "https://www.google.com/maps/search/?api=1&query=Sobral+J+M+946+Bariloche", texto: "Sobral J. M. 946" },
            { tipo: "texto", icono: "fa-regular fa-clock", texto: "Lun-Vie 9-13 hs y 15:30-19 hs / Sáb 9-14 hs / Dom Cerrado" },
            { tipo: "whatsapp", numero: "2944419422" },
            { tipo: "instagram", usuario: "recicladosmetalsur" },
            { tipo: "facebook", usuario: "recicladosmetalsur" }
        ]
    },
    {
        categoria: "especiales",
        labelMateriales: "Situación actual:",
        iconoMateriales: "fa-solid fa-triangle-exclamation",
        materiales: "Sin recepción continua en Bariloche. Aprendé a encapsularlas en casa de forma segura hasta próximas campañas.",
        tags: "pilas bateria baterias descarte encapsulado residuo peligroso litio alcalinas aa aaa boton como desechar pilas recargables",
        logo: "img/pilas-logo.webp",
        imagen: "img/pilasbanner.webp",
        nombre: "GUÍA: ¿CÓMO DESCARTAR PILAS?",
        elementos: [
            {
                tipo: "html",
                html: `
                    <div class="contenedor-ecopuntos">
                        <button class="btn-desplegar-jxb btn-desplegar-pilas" onclick="toggleEcopuntos(this)">
                            <span><i class="fa-solid fa-shield-halved"></i> Ver guía de encapsulado seguro</span>
                            <i class="fa-solid fa-angle-down btn-icono-flecha"></i>
                        </button>
                        <div class="lista-sedes-jxb guia-pilas-desplegada" style="display: none;">
                            <div class="guia-pilas-pasos">
                                <div class="paso-pila-item">
                                    <span class="paso-pila-num">1</span>
                                    <p><strong>Aislá los polos:</strong> Pegá cinta adhesiva o aisladora en los extremos (+ y -) de cada pila para evitar chispas.</p>
                                </div>
                                <div class="paso-pila-item">
                                    <span class="paso-pila-num">2</span>
                                    <p><strong>Botella PET:</strong> Usá una botella plástica gruesa, limpia y totalmente seca.</p>
                                </div>
                                <div class="paso-pila-item">
                                    <span class="paso-pila-num">3</span>
                                    <p><strong>Secante:</strong> Llená los huecos con arena seca, aserrín o ceniza para absorber derrames.</p>
                                </div>
                                <div class="paso-pila-item">
                                    <span class="paso-pila-num">4</span>
                                    <p><strong>Sellado hermético:</strong> Cerrá la tapa y asegurala con cinta. Guardala en un lugar seco fuera del alcance de niños.</p>
                                </div>
                            </div>
                            <div class="pilas-consejo-box">
                                <p><i class="fa-solid fa-triangle-exclamation"></i> <strong>Importante:</strong> Guardá el envase hasta que haya campañas de recolección de residuos peligrosos.</p>
                                <p><i class="fa-solid fa-bolt"></i> <strong>Recomendación:</strong> Priorizá el uso de <strong>pilas recargables</strong> para evitar generar el residuo.</p>
                            </div>
                        </div>
                    </div>
                `
            }
        ]
    }
];

// =========================================================================
// 4. RENDERIZACIÓN DINÁMICA DE TARJETAS
// =========================================================================
function generarTarjetasHTML() {
    const contenedor = document.getElementById('contenedor-tarjetas');
    if (!contenedor) return;

    contenedor.innerHTML = listaOrganizaciones.map(org => {
        const elementosHTML = org.elementos.map(el => {
            if (el.tipo === 'link-geo') {
                return `<p class="info-p"><a href="${el.url}" target="_blank" class="geo-link"><i class="fa-solid fa-location-dot"></i> ${el.texto}</a></p>`;
            } else if (el.tipo === 'texto') {
                return `<p class="info-p"><i class="${el.icono}"></i> ${el.texto}</p>`;
            } else if (el.tipo === 'whatsapp') {
                return `<p class="info-p"><a href="https://wa.me/549${el.numero}" target="_blank" class="whatsapp-link"><i class="fa-brands fa-whatsapp"></i> ${el.numero}</a></p>`;
            } else if (el.tipo === 'email') {
                return `<p class="info-p"><a href="mailto:${el.correo}" class="geo-link" style="color: #4a5568;"><i class="fa-regular fa-envelope"></i> ${el.correo}</a></p>`;
            } else if (el.tipo === 'instagram') {
                return `<a href="https://www.instagram.com/${el.usuario}/" target="_blank" class="info-link instagram-link"><i class="fa-brands fa-instagram"></i> @${el.usuario}</a>`;
            } else if (el.tipo === 'html') {
                return el.html;
            } else if (el.tipo === 'desplegable-ecopuntos') {
                const sedesHTML = el.sedes.map(sede => `
                    <div class="sede-item">
                        <a href="${sede.url}" target="_blank" class="geo-link">
                            <i class="fa-solid fa-location-dot"></i> ${sede.nombre}
                        </a>
                        <span class="sede-horario"><i class="fa-regular fa-clock"></i> ${sede.horario}</span>
                    </div>
                `).join('');

                return `
                    <div class="contenedor-ecopuntos">
                        <button class="btn-desplegar-jxb" onclick="toggleEcopuntos(this)">
                            <span><i class="fa-solid fa-map-location-dot"></i> ${el.titulo}</span>
                            <i class="fa-solid fa-angle-down btn-icono-flecha"></i>
                        </button>
                        <div class="lista-sedes-jxb" style="display: none;">
                            ${sedesHTML}
                        </div>
                    </div>
                `;
            }
            return '';
        }).join('');

        let nombreBadge = '';
        let iconoBanner = '';

        if (org.categoria === 'reciclaje') {
            nombreBadge = '<i class="fa-solid fa-recycle"></i> Reciclables';
            iconoBanner = 'fa-solid fa-recycle';
        } else if (org.categoria === 'compostaje') {
            nombreBadge = '<i class="fa-solid fa-seedling"></i> Compost';
            iconoBanner = 'fa-solid fa-seedling';
        } else {
            nombreBadge = '<i class="fa-solid fa-triangle-exclamation"></i> Especiales';
            iconoBanner = 'fa-solid fa-triangle-exclamation';
        }
        let textoMaterialesHTML = `<p>${org.materiales}</p>`;
        if (org.materiales.length > 160) {
            const textoCorto = org.materiales.substring(0, 150) + "...";
            textoMaterialesHTML = `
                <p class="materiales-texto-container">
                    <span class="materiales-resumen">${textoCorto}</span>
                    <span class="materiales-completo" style="display: none;">${org.materiales}</span>
                    <button class="btn-ver-mas-materiales" onclick="toggleMateriales(this)">Ver más</button>
                </p>
            `;
        }

        // Si la tarjeta define un título e ícono propio los usa, sino usa "Reciben:" por defecto
        const labelMateriales = org.labelMateriales || "Reciben:";
        const iconoMateriales = org.iconoMateriales || "fa-solid fa-boxes-stacked";

        return `
            <div class="card" data-categoria="${org.categoria}" data-tags="${org.tags}">
                <div class="card-banner banner-${org.categoria}">
                    <img src="${org.imagen}" class="banner-img" alt="Fondo ${org.nombre}" onerror="this.style.display='none';">
                    <i class="${iconoBanner} banner-vector-icon"></i>
                </div>
                <div class="card-header">
                    <img src="${org.logo}" class="org-logo" alt="Logo ${org.nombre}" onerror="this.src='img/baritoxico-logo.webp'; this.onerror=null;">
                    <div class="header-title-wrapper">
                        <h3>${org.nombre}</h3>
                        <span class="category-badge badge-${org.categoria}">${nombreBadge}</span>
                    </div>
                </div>
                <div class="card-body">
                    <div class="card-materials">
                        <span class="materials-label"><i class="${iconoMateriales}"></i> ${labelMateriales}</span>
                        ${textoMaterialesHTML}
                    </div>
                    ${elementosHTML}
                </div>
            </div>
        `;
    }).join('');
}

function toggleEcopuntos(boton) {
    const lista = boton.nextElementSibling;
    const icono = boton.querySelector('.btn-icono-flecha');
    if (lista.style.display === "none" || lista.style.display === "") {
        lista.style.display = "flex";
        if (icono) icono.style.transform = "rotate(180deg)";
    } else {
        lista.style.display = "none";
        if (icono) icono.style.transform = "rotate(0deg)";
    }
}

function toggleMateriales(boton) {
    const contenedor = boton.parentElement;
    const resumen = contenedor.querySelector('.materiales-resumen');
    const completo = contenedor.querySelector('.materiales-completo');
    if (completo.style.display === "none") {
        completo.style.display = "inline";
        resumen.style.display = "none";
        boton.textContent = "Ver menos";
    } else {
        completo.style.display = "none";
        resumen.style.display = "inline";
        boton.textContent = "Ver más";
    }
}

// =========================================================================
// 5. FILTRADO COMBINADO INTELIGENTE (Buscador + Categorías)
// =========================================================================
let categoriaActiva = 'todas';
let textoBusqueda = '';
let tarjetas = [];

function normalizarTermino(palabra) {
    let t = palabra.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim();
    if (!t) return "";
    if (t.includes("tergopor")) return "telgopor";
    if (t === "sachets") return "sachet";
    if (t.endsWith("ones")) { t = t.replace(/ones$/, "on"); }
    else if (t.endsWith("es") && t.length > 4) { if (/[lrn]es$/.test(palabra.toLowerCase())) { t = t.slice(0, -2); } else { t = t.slice(0, -1); } }
    else if (t.endsWith("s") && !t.endsWith("is") && t.length > 3) { t = t.slice(0, -1); }
    return t;
}

function filtrarCategoria(e, categoriaSeleccionada) {
    categoriaActiva = categoriaSeleccionada;
    document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
    if (e && e.currentTarget) {
        e.currentTarget.classList.add('active');
    }
    aplicarFiltrosCombinados();
}

function aplicarFiltrosCombinados() {
    const palabrasBuscadas = textoBusqueda.split(/\s+/).map(p => normalizarTermino(p)).filter(p => p.length > 0);
    tarjetas.forEach(tarjeta => {
        const tagsRaw = tarjeta.getAttribute('data-tags').toLowerCase();
        const catTarjeta = tarjeta.getAttribute('data-categoria');
        const coincideCategoria = (categoriaActiva === 'todas' || catTarjeta === categoriaActiva);
        const coincideTexto = palabrasBuscadas.every(palabraBusqueda => tagsRaw.includes(palabraBusqueda));
        tarjeta.style.display = (coincideCategoria && coincideTexto) ? "flex" : "none";
    });
}

// =========================================================================
// 6. INICIALIZACIÓN Y GESTIÓN DE BANNER PWA Y NOTIFICACIONES
// =========================================================================
let deferredPrompt;

document.addEventListener("DOMContentLoaded", function () {
    // Inicializar secciones de la App
    verificarYMostrarNovedades();
    generarTarjetasHTML();
    tarjetas = document.querySelectorAll('.card');

    // DETECTAR SI LA APP ESTÁ INSTALADA Y ACTIVAR EL BADGE
    const esModoApp = window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone === true
        || document.referrer.includes('android-app://');

    const badgeInstalada = document.getElementById('badge-app-instalada');
    if (esModoApp && badgeInstalada) {
        badgeInstalada.style.display = 'inline-flex';
    }

    // Event listener del buscador
    const inputBuscador = document.getElementById('buscador');
    if (inputBuscador) {
        inputBuscador.addEventListener('input', function (e) {
            textoBusqueda = e.target.value;
            aplicarFiltrosCombinados();
        });
    }

    // =========================================================================
    // LÓGICA DEL BOTÓN DE NOTIFICACIONES (ONESIGNAL)
    // =========================================================================
    const btnToggle = document.getElementById('btn-onesignal-toggle');

    if (btnToggle) {
        window.OneSignalDeferred = window.OneSignalDeferred || [];

        // Sincronizar el texto del botón según el estado real al cargar la página
        OneSignalDeferred.push(async function (OneSignal) {
            actualizarEstadoBoton(OneSignal.User.PushSubscription.optedIn);

            // Escuchar cambios de suscripción en tiempo real
            OneSignal.User.PushSubscription.addEventListener("change", function (event) {
                actualizarEstadoBoton(event.current.optedIn);
            });
        });

        btnToggle.addEventListener('click', () => {
            OneSignalDeferred.push(async function (OneSignal) {
                if (!OneSignal.Notifications.isPushSupported()) {
                    alert("Tu navegador no soporta notificaciones push.");
                    return;
                }

                const estadoActual = OneSignal.User.PushSubscription.optedIn;

                if (estadoActual) {
                    // DESUSCRIBIR
                    await OneSignal.User.PushSubscription.optOut();
                    alert("Notificaciones desactivadas correctamente.");
                } else {
                    // SUSCRIBIR
                    if (OneSignal.Notifications.permission !== "granted") {
                        await OneSignal.Notifications.requestPermission();
                    }
                    await OneSignal.User.PushSubscription.optIn();
                    alert("¡Listo! Notificaciones activadas con éxito. 🎉");
                }
            });
        });
    }

    function actualizarEstadoBoton(isSubscribed) {
        if (!btnToggle) return;
        if (isSubscribed) {
            btnToggle.textContent = "Desactivar";
            btnToggle.classList.add("activo");
        } else {
            btnToggle.textContent = "Activar";
            btnToggle.classList.remove("activo");
        }
    }

    // =========================================================================
    // GESTIÓN INTELIGENTE DE INSTALACIÓN PWA (Android / PC vs. iPhone iOS)
    // =========================================================================
    const banner = document.getElementById('banner-instalar');
    const btnInstalar = document.getElementById('btn-instalar-accion');
    const btnCerrar = document.getElementById('btn-cerrar-banner');

    if (banner) {
        const ocultarBannerPermanente = localStorage.getItem('ocultarBannerRecicla') === 'true';

        // Solo muestra la barra si NO está instalada y NO fue cerrada previamente
        if (!esModoApp && !ocultarBannerPermanente) {
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            const esIOS = (/iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) && !window.MSStream;

            if (esIOS) {
                // Adaptado para iPhone / Safari en barra fija
                banner.classList.add('banner-ios');
                banner.innerHTML = `
                    <div class="install-content-ios">
                        <div class="install-header-ios">
                            <span class="install-badge-ios"><i class="fa-brands fa-apple"></i> Instalar en iPhone</span>
                            <button id="btn-cerrar-ios" class="btn-cerrar-banner-bar" title="Cerrar">&times;</button>
                        </div>
                        <p class="install-titulo-ios">¡Tené la guía siempre a mano como una app!</p>
                        <div class="pasos-ios">
                            <p>1. Tocá <strong>Compartir</strong> <i class="fa-solid fa-arrow-up-from-bracket"></i> abajo en Safari.</p>
                            <p>2. Elegí <strong>"Agregar a pantalla de inicio"</strong> <i class="fa-regular fa-square-plus"></i>.</p>
                        </div>
                        <button id="btn-entendido-ios" class="btn-entendido-ios">¡Entendido!</button>
                    </div>
                `;
                banner.style.display = 'block';

                const cerrarIos = () => {
                    banner.style.display = 'none';
                    localStorage.setItem('ocultarBannerRecicla', 'true');
                };
                document.getElementById('btn-cerrar-ios')?.addEventListener('click', cerrarIos);
                document.getElementById('btn-entendido-ios')?.addEventListener('click', cerrarIos);

            } else {
                // Android y navegadores de escritorio (Chrome, Edge, etc.)
                window.addEventListener('beforeinstallprompt', (e) => {
                    e.preventDefault();
                    deferredPrompt = e;
                    banner.style.display = 'block';
                });

                if (btnInstalar) {
                    btnInstalar.addEventListener('click', async () => {
                        if (deferredPrompt) {
                            deferredPrompt.prompt();
                            const { outcome } = await deferredPrompt.userChoice;
                            if (outcome === 'accepted') banner.style.display = 'none';
                            deferredPrompt = null;
                        }
                    });
                }

                if (btnCerrar) {
                    btnCerrar.addEventListener('click', function () {
                        banner.style.display = 'none';
                        localStorage.setItem('ocultarBannerRecicla', 'true');
                    });
                }
            }
        }
    }
});
