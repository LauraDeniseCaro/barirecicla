// =========================================================================
// 1. REGISTRO DEL SERVICE WORKER
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
            if (!nov.fechaLimite) return false;

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

        totalNovedadesVigentes = novedadesVigentes.length;

        if (totalNovedadesVigentes === 0) {
            console.warn("No hay novedades vigentes para mostrar.");
            contenedor.innerHTML = "";
            return;
        }

        let slidesHTML = novedadesVigentes.map((nov, index) => {
            const tituloSano = sanitizarHTML(nov.titulo || 'Novedad');
            const badgeSana = sanitizarHTML(nov.badge || 'Info');
            const descSana = sanitizarHTML(nov.descripcion || '');
            const textoLinkSano = sanitizarHTML(nov.textoLink || 'Saber más');
            
            const linkSano = (nov.link && (nov.link.startsWith('http://') || nov.link.startsWith('https://'))) ? encodeURI(nov.link) : '';
            const imagenSana = (nov.imagen && (nov.imagen.startsWith('http://') || nov.imagen.startsWith('https://') || nov.imagen.startsWith('./'))) ? encodeURI(nov.imagen) : '';

            const estructuraImagen = imagenSana ? `
                <div class="novedades-col-img">
                    <img src="${imagenSana}" alt="Flyer ${tituloSano}" onerror="this.parentElement.style.display='none';">
                </div>
            ` : '';

            const colorBadgeReal = (nov.colorBadge && nov.colorBadge.startsWith('#')) ? nov.colorBadge : '#40916c';

            return `
                <div class="slide-item ${imagenSana ? 'con-imagen-flyer' : ''}">
                    <div class="novedades-col-texto">
                        <div class="novedades-header">
                            <h4>${tituloSano}</h4>
                            <span class="novedades-badge" style="background-color: ${colorBadgeReal}">${badgeSana}</span>
                        </div>
                        <p>${descSana}</p>
                        ${linkSano ? `
                            <a href="${linkSano}" target="_blank" class="novedades-btn-accion">
                                <i class="fa-solid fa-circle-info"></i> ${textoLinkSano}
                            </a>
                        ` : ''}
                    </div>
                    ${estructuraImagen}
                </div>
            `;
        }).join('');

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
                    ${novedadesVigentes.map((_, index) => `
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
        if(dots[currentSlide]) dots[currentSlide].classList.add('active');
    } else {
        currentSlide = index;
    }
}

// =========================================================================
// 3. MATRIZ DE DATOS FIJOS
// =========================================================================
const listaOrganizaciones = [
    {
        categoria: "reciclaje",
        materiales: "Plásticos (film, botellas PET, tapitas, baldes, cajones), metales (latas de gaseosas, cervezas y conserva, cobre, bronce, aluminio), envases de tetra pack, papel (hojas, libros) and cartón.",
        tags: "arb vertedero recicladores carton papel hojas libros libro baldes de plastico balde de plastico cajones de plastico cajon de plastico botellas pet botella pet tapitas plasticas tapas de botella tapita de botella metales cobre bronce aluminio latas de gaseosa lata de gaseosa latas de cerveza lata de cerveza nylon strech film packs de gaseosa latas de conserva lata de conserva tetra pack tetrapack caja de leche cajas de leche",
        logo: "img/logo-arb.webp",
        imagen: "img/arb.webp",
        nombre: "ARB - RECICLADORES",
        elementos: [
            { tipo: "link-geo", url: "https://www.google.com/maps/d/u/1/viewer?hl=es&mid=1Wp3BTtJJ4WsTPmpX0DdktJHn0T8irK0&ll=-41.1750728%2C-71.354338&z=16", texto: "Vertedero" },
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
            { tipo: "link-geo", url: "https://www.google.com/maps/d/u/1/viewer?hl=es&mid=1Wp3BTtJJ4WsTPmpX0DdktJHn0T8irK0&ll=-41.1341332%2C-71.2826891&z=16", texto: "Esandi 215" },
            { tipo: "texto", icono: "fa-regular fa-clock", texto: "Lun-Vie 9-16hs / Sáb 9-12hs" },
            { tipo: "instagram", usuario: "finorservicios" }
        ]
    },
    {
        categoria: "reciclaje",
        materiales: "Plásticos (botellas PET, tapitas, envases de shampoo o acondicionador, bidones, botellas de lavandina) and latas de cerveza y gaseosa.",
        tags: "jovenes pioneros conicet frutillar pet botella pet botellas pets envase de shampoo envases de shampoo envases de acondicionador envase de acondicionador shampoo acondicionador bolsa de snacks bolsas de snacks envoltorios envoltorio envoltorios de snacks envoltorio de snacks envoltorios fideos envoltorio de fideos bolsa bolsas bolsa de plastico film potes de plastico pote de plastico bandeja de plastico bandejas de plastico tuppers tupper telgopor bandeja de telgopor pote de telgopor cds dvds cd dvd paquetes de cafe paquete de cafe tuppers snacks bidon bidones lavandina",
        logo: "img/logo-jxb.webp",
        imagen: "img/jovenesporbariloche.webp",
        nombre: "JÓVENES POR BARILOCHE",
        elementos: [
            { tipo: "link-geo", url: "https://www.google.com/maps/d/u/1/viewer?hl=es&mid=1Wp3BTtJJ4WsTPmpX0DdktJHn0T8irK0&ll=-41.1600712%2C-71.3417896&z=16", texto: "Quinchamali 784 (Sede Oficial)" },
            { tipo: "texto", icono: "fa-regular fa-clock", texto: "Lun-Vie 9-17hs" },
            { tipo: "instagram", usuario: "jovenesporbariloche" },
            {
                tipo: "desplegable-ecopuntos",
                titulo: "Ver mas Ecopuntos",
                sedes: [
                    { nombre: "Pioneros 2350 (CONICET)", horario: "Lun-Vie 9-17hs", url: "https://www.google.com/maps/d/u/1/viewer?hl=es&mid=1Wp3BTtJJ4WsTPmpX0DdktJHn0T8irK0&ll=-41.1362522%2C-71.3393223&z=16" },
                    { nombre: "Junta Vecinal Altos del Condor", horario: "Jueves de 19 a 20hs", url: "https://www.google.com/maps/d/u/1/viewer?hl=es&mid=1Wp3BTtJJ4WsTPmpX0DdktJHn0T8irK0&ll=-41.1326636%2C-71.2674977&z=16" },
                    { nombre: "Junta Vecinal Melipal", horario: "Todos los días hasta las 20:00hs", url: "https://www.google.com/maps/d/u/1/viewer?hl=es&mid=1Wp3BTtJJ4WsTPmpX0DdktJHn0T8irK0&ll=-41.133323%2C-71.3543389&z=16" },
                    { nombre: "Club Pehuenes (Exclusivo Socios)", horario: "Horarios del club", url: "https://www.google.com/maps/d/u/1/viewer?hl=es&mid=1Wp3BTtJJ4WsTPmpX0DdktJHn0T8irK0&ll=-41.1266176%2C-71.4040048&z=16" },
                    { nombre: "Junta Vecinal Pinar del Lago", horario: "Lun-Vie 9-17hs", url: "https://www.google.com/maps/d/u/1/viewer?hl=es&mid=1Wp3BTtJJ4WsTPmpX0DdktJHn0T8irK0&ll=-41.125668200000014%2C-71.37057500000003&z=13" }
                ]
            }
        ]
    },
    {
        categoria: "reciclaje",
        materiales: "Envases de limpiadores, detergente, jabón líquido, shampoo, acondicionadores y lavandina. Botellas de aguas, gaseosas, bebidas deportivas y reutilizables. Tapitas, bolsas de súper y comercios, sachets de leche, film envoltorio y termocontraible, envases flexibles (azúcar, pan, etc). Envoltorios de galletas, fideos, snacks y transparentes. Contenedores de alimentos/comida, cubiertos descartables, baldes, envases lácteos/descartables, bandejas, vasos térmicos, potes de helado, envases de repuestos para recarga, sorbetes, mamaderas, armazones de anteojos, tarjetas de crédito/débito, calzados, suelas, aislantes para cables y CD / DVD.",
        tags: "buply anonima albarracin botella pet botellas pets envase de shampoo envases de shampoo envases de acondicionador envase de acondicionador shampoo acondicionador bolsa de snacks bolsas de snacks envoltorios envoltorio envoltorios de snacks envoltorio de snacks envoltorios fideos envoltorio de fideos bolsa bolsas bolsa de plastico film potes de plastico pote de plastico bandeja de plastico bandejas de plastico tuppers tupper telgopor bandeja de telgopor pote de telgopor cds dvds cd dvd paquetes de cafe paquete de cafe tuppers snacks limpiadores detergente jabon liquido lavandina agua gaseosa bebida deportiva reutilizable tapitas bolsas super comercios sachets leche flexible azucar pan contenedores alimentos comida cubiertos descartables baldes lacteos vasos termicos helado repuestos recarga sorbetes mamaderas anteojos tarjetas credito debito calzados suelas aislantes cables",
        logo: "img/logo-buply.webp",
        imagen: "img/buply.webp",
        nombre: "BUPLY (LA ANÓNIMA)",
        elementos: [
            { tipo: "link-geo", url: "https://www.google.com/maps/d/u/1/viewer?hl=es&mid=1Wp3BTtJJ4WsTPmpX0DdktJHn0T8irK0&ll=-41.1400806%2C-71.3012945&z=16", texto: "Albarracín 601" },
            { tipo: "texto", icono: "fa-regular fa-clock", texto: "Lun-Vie 10-18hs / Sáb 10-14hs" },
            { tipo: "instagram", usuario: "buply.ar" }
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
            { tipo: "html", html: `<p class="info-p"><a href="https://www.google.com/maps/d/u/1/viewer?hl=es&mid=1Wp3BTtJJ4WsTPmpX0DdktJHn0T8irK0&ll=-41.1541256%2C-71.3165348&z=16" target="_blank" class="geo-link"><i class="fa-solid fa-location-dot"></i> B° Vuriloche</a> <i class="fa-regular fa-clock inline-clock"></i> Miér 18:30hs</p>` },
            { tipo: "html", html: `<p class="info-p"><a href="https://www.google.com/maps/d/u/1/viewer?hl=es&mid=1Wp3BTtJJ4WsTPmpX0DdktJHn0T8irK0&ll=-41.1680663%2C-71.3498344&z=16" target="_blank" class="geo-link"><i class="fa-solid fa-location-dot"></i> B° Valle Azul</a> <i class="fa-regular fa-clock inline-clock"></i> Sáb 17:00hs</p>` },
            { tipo: "instagram", usuario: "comunidadcompost" }
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
            { tipo: "link-geo", url: "https://www.google.com/maps/d/u/1/viewer?hl=es&mid=1Wp3BTtJJ4WsTPmpX0DdktJHn0T8irK0&ll=-41.1442791%2C-71.3208962&z=16", texto: "Campichuelo y Suiza" },
            { tipo: "texto", icono: "fa-solid fa-graduation-cap", texto: "<strong>Proyecto Educativo:</strong> Estudiantes de electrónica reutilizan los componentes para reparación, aprendizaje y proyectos didácticos." },
            { tipo: "texto", icono: "fa-solid fa-heart-pulse", texto: "Reciben equipos tanto <strong>rotas como en funcionamiento</strong>." },
            { tipo: "whatsapp", numero: "2944594891" }
        ]
    },
    {
        categoria: "especiales",
        materiales: "Aceite vegetal usado de cocina (dentro de botellas plásticas cerradas).",
        tags: "aceite rba ambiental domicilio aceite de cocina usado",
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
        materiales: "Celulares, TV LED, cables, auriculares, pavas eléctricas, consolas, aparatos de gym, instrumentos musicales, equipos de audio, notebooks, pilas, telescopios, minicomponentes, mouse, pendrives, proyectores, cámaras, máquinas de coser, herramientas, parlantes y tablets.",
        tags: "electronicos raee cables cable computadoras computadora pc pcs cpu celus celulares celular notebooks notebook tablet tablets auriculares auricular mouse mouses pendrive prendrives prendrivers parlante parlantes equipos de audio equipo de audio proyector camara camaras consola consolas telescopio telescopios pava electrica maquina de coser herramientas aparatos electonicos aparato electronico aparatos de gym aparato de gym dispositivos de comunicación smartwatch smarphone tv led pilas instrumentos musicales minicomponentes mousse",
        logo: "img/logo-electronicos.webp",
        imagen: "img/residuoselectronicos.webp",
        nombre: "RESIDUOS ELECTRÓNICOS",
        elementos: [
            { tipo: "texto", icono: "fa-solid fa-laptop-code", texto: "Reciclaje de RAEEs y tecnología en desuso" },
            { tipo: "whatsapp", numero: "2944652004" }
        ]
    }
];

// =========================================================================
// 4. RENDERIZACIÓN DE TARJETAS ORG
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
                        <span class="materials-label"><i class="fa-solid fa-boxes-stacked"></i> Reciben:</span>
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

document.getElementById('buscador').addEventListener('input', function (e) {
    textoBusqueda = e.target.value;
    aplicarFiltrosCombinados();
});

function filtrarCategoria(e, categoriaSeleccionada) {
    categoriaActiva = categoriaSeleccionada;
    document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
    e.currentTarget.classList.add('active');
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
// 6. INICIALIZACIÓN COMPLETA Y BANNER PWA
// =========================================================================
let deferredPrompt;
document.addEventListener("DOMContentLoaded", function () {
    verificarYMostrarNovedades(); 
    generarTarjetasHTML();
    tarjetas = document.querySelectorAll('.card');

    const banner = document.getElementById('banner-instalar');
    const btnInstalar = document.getElementById('btn-instalar-accion');
    const btnCerrar = document.getElementById('btn-cerrar-banner');
    const textoInstrucciones = document.getElementById('instrucciones-instalacion');

    const ocultarBannerPermanente = localStorage.getItem('ocultarBannerRecicla') === 'true';
    const esModoApp = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    if (esModoApp || ocultarBannerPermanente) return;

    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const esIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault(); deferredPrompt = e; banner.style.display = 'block';
    });
    if (esIOS && !esModoApp) { banner.style.display = 'block'; }

    btnInstalar.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') banner.style.display = 'none';
            deferredPrompt = null;
        } else if (esIOS) {
            textoInstrucciones.innerHTML = 'Tocá el botón <strong>Compartir</strong> <i class="fa-solid fa-share-from-square"></i> y elegí <strong>"Agregar a inicio"</strong>.';
            btnInstalar.style.display = 'none';
        }
    });
    btnCerrar.addEventListener('click', function () { banner.style.display = 'none'; localStorage.setItem('ocultarBannerRecicla', 'true'); });
});