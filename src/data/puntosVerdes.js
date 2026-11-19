export const listaOrganizaciones = [
    {
        categoria: "reciclaje",
        materiales: "Plásticos (film, botellas PET, tapitas, baldes, cajones), metales (latas de gaseosas, cervezas y conserva, cobre, bronce, aluminio), papel (hojas, libros) y cartón.",
        tags: "arb vertedero recicladores carton papel hojas libros libro baldes de plastico balde de plastico cajones de plastico cajon de plastico botellas pet botella pet tapitas plasticas tapas de botella tapita de botella metales cobre bronce aluminio latas de gaseosa lata de gaseosa latas de cerveza lata de cerveza nylon strech film packs de gaseosa",
        logo: "/img/logo-arb.webp",
        imagen: "/img/arb.webp",
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
        logo: "/img/logo-finor.webp",
        imagen: "/img/finor.webp",
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
        logo: "/img/logo-jxb.webp",
        imagen: "/img/jovenesporbariloche.webp",
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
        materiales: "Envases de limpiadores, detergente, jabón líquido, shampoo, acondicionadores y lavandina. Botellas de agua, gaseosas, bebidas deportivas y reutilizables. Tapitas, bolsas de súper y comercios, sachets de leche, film envoltorio y termocontraíble, envases flexibles (azúcar, pan, etc). Envoltorios de galletas, fideos, snacks y transparentes. Contenedores de alimentos/comida, cubiertos descartables, baldes, envases lácteos/descartables, bandejas, vasos térmicos, potes de helado, envases de repuestos para recarga, sorbetes, mamaderas, armazones de anteojos, tarjetas de crédito/débito, calzados, suelas, aislantes para cables y CD / DVD. Además, reciben aluminio (latas aplastadas y aerosoles vacíos —desodorantes, repelentes— en bolsa separada del plástico; solo aluminio, no hojalata).",
        tags: "buply anonima albarracin botella pet botellas pets envase de shampoo envases de shampoo envases de acondicionador envase de acondicionador shampoo acondicionador bolsa de snacks bolsas de snacks envoltorios envoltorio envoltorios de snacks envoltorio de snacks envoltorios fideos envoltorio de fideos bolsa bolsas bolsa de plastico film potes de plastico pote de plastico bandeja de plastico bandejas de plastico tuppers tupper telgopor bandeja de telgopor pote de telgopor cds dvds cd dvd paquetes de cafe paquete de cafe tuppers snacks limpiadores detergente jabon liquido lavandina agua gaseosa bebida deportiva reutilizable tapitas bolsas super comercios sachets leche flexible azucar pan contenedores alimentos comida cubiertos descartables baldes lacteos vasos termicos helado repuestos recarga sorbetes mamaderas anteojos tarjetas credito debito calzados suelas aislantes cables aluminio lata latas latita latitas latas de aluminio lata de aluminio latas de cerveza latas de gaseosa aerosol aerosoles desodorante desodorantes envase de aerosol",
        logo: "/img/logo-buply.webp",
        imagen: "/img/buply.webp",
        nombre: "BUPLY (LA ANÓNIMA)",
        elementos: [
            { tipo: "link-geo", url: "https://www.google.com/maps/search/?api=1&query=Albarracin+601+Bariloche", texto: "Albarracín 601" },
            { tipo: "texto", icono: "fa-regular fa-clock", texto: "Lun-Vie 10-18hs / Sáb 10-14hs" },
            { tipo: "instagram", usuario: "buply.ar" }
        ]
    },
    {
        categoria: "reciclaje",
        materiales: "Envases de limpiadores, detergente, jabón líquido, shampoo, acondicionadores y lavandina. Botellas de agua, gaseosas, bebidas deportivas y reutilizables. Tapitas, bolsas de súper y comercios, sachets de leche, film envoltorio y termocontraíble, envases flexibles (azúcar, pan, etc). Envoltorios de galletas, fideos, snacks y transparentes. Contenedores de alimentos/comida, cubiertos descartables, baldes, envases lácteos/descartables, bandejas, vasos térmicos, potes de helado, envases de repuestos para recarga, sorbetes, mamaderas, armazones de anteojos, tarjetas de crédito/débito, calzados, suelas, aislantes para cables y CD / DVD. Además, reciben aluminio (latas aplastadas y aerosoles vacíos —desodorantes, repelentes— en bolsa separada del plástico; solo aluminio, no hojalata).",
        tags: "buply mercado diego neil ruta 40 sur intendencia anonima albarracin botella pet botellas pets envase de shampoo envases de shampoo envases de acondicionador envase de acondicionador shampoo acondicionador bolsa de snacks bolsas de snacks envoltorios envoltorio envoltorios de snacks envoltorio de snacks envoltorios fideos envoltorio de fideos bolsa bolsas bolsa de plastico film potes de plastico pote de plastico bandeja de plastico bandejas de plastico tuppers tupper telgopor bandeja de telgopor pote de telgopor cds dvds cd dvd paquetes de cafe paquete de cafe tuppers snacks limpiadores detergente jabon liquido lavandina agua gaseosa bebida deportiva reutilizable tapitas bolsas super comercios sachets leche flexible azucar pan contenedores alimentos comida cubiertos descartables baldes lacteos vasos termicos helado repuestos recarga sorbetes mamaderas anteojos tarjetas credito debito calzados suelas aislantes cables aluminio lata latas latita latitas latas de aluminio lata de aluminio latas de cerveza latas de gaseosa aerosol aerosoles desodorante desodorantes envase de aerosol",
        logo: "/img/logo-mercado.webp",
        imagen: "/img/buply.webp",
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
        logo: "/img/logo-zonacompost.webp",
        imagen: "/img/zonadecompost.webp",
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
        logo: "/img/logo-comunidadcompost.webp",
        imagen: "/img/comunidadcompost.webp",
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
        esGuia: true,
        labelMateriales: "Contenido de la guía:",
        iconoMateriales: "fa-solid fa-book-open",
        materiales: "Aprende el paso a paso: qué residuos orgánicos sumar, qué evitar, equilibrio verde/seco, control de humedad y cosecha del abono.",
        tags: "guia compostaje compost compostar tierra abono residuos organicos manual descargar pdf como compostar lombrices abono casero",
        logo: "/img/logo-guiareciclaje.webp",
        imagen: "/img/guiadecompostaje.webp",
        nombre: "GUÍA DE COMPOSTAJE EN CASA",
        elementos: [
            { tipo: "texto", icono: "fa-solid fa-book-open-reader", texto: "Manual práctico y gratuito en PDF para iniciar tu compostera." },
            {
                tipo: "html",
                html: `<a href="/docs/guia-compost-baritoxico.pdf" target="_blank" rel="noopener" class="btn-descarga-guia">
                        <i class="fa-solid fa-file-pdf"></i> Ver o Descargar Guía (PDF)
                       </a>`
            }
        ]
    },
    {
        categoria: "especiales",
        materiales: "Línea blanca (heladeras, freezers, lavarropas, secarropas), televisores de tubo (CRT), pantallas y monitores LED, microondas, hornos eléctricos, máquinas a nafta (motosierras, cortadoras), soldadoras, ventiladores y caloventores.",
        tags: "electroreciclaje campichuelo suiza estudiantes electronica reutilizan componentes proyectos educativos reparacion aprendizaje rotas funcionamiento electrodomesticos grandes heladeras freezers lavarropas secarropas microondas hornos electricos tv de tubo televisor de tubo televisores de tubo tele de tubo teles de tubo crt tv led monitores pantallas maquinas nafteras motosierras motoguadañas cortadoras de cesped maquinas electricas soldadoras ventiladores calefactores raee chatarra metales especiales blanca linea blanca caloventores",
        logo: "/img/logo-electroreciclaje.webp",
        imagen: "/img/electroreciclaje.webp",
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
        logo: "/img/logo-rba.webp",
        imagen: "/img/aceiteusado.webp",
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
        tags: "electronicos raee cables cable computadoras computadora pc pcs cpu celus celulares celular notebooks notebook tablet tablets auriculares auricular mouse mouses pendrive prendrives prendrivers parlante parlantes equipos de audio equipo de audio proyector camara camaras consola consolas telescopio telescopios pava electrica maquina de coser herramientas aparatos electonicos aparato electronico aparatos de gym aparato de gym dispositivos de comunicación smartwatch smarphone tv led instrumentos musicales minicomponentes mousse pintura pinturas latas de pintura lata de pintura barniz sintetico pintura al agua",
        logo: "/img/logo-electronicos.webp",
        imagen: "/img/residuoselectronicos.webp",
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
        logo: "/img/esquina-nireco-logo.webp",
        imagen: "/img/esquina-nireco.webp",
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
        logo: "/img/logo-metalsur.webp",
        imagen: "/img/metalsur.webp",
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
        esGuia: true,
        labelMateriales: "Situación actual:",
        iconoMateriales: "fa-solid fa-triangle-exclamation",
        materiales: "Sin recepción continua en Bariloche. Aprendé a encapsularlas en casa de forma segura hasta próximas campañas.",
        tags: "pilas bateria baterias descarte encapsulado residuo peligroso litio alcalinas aa aaa boton como desechar pilas recargables",
        logo: "/img/pilas-logo.webp",
        imagen: "/img/pilasbanner.webp",
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