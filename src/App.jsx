import { useState, useEffect, useMemo } from 'react';
import { listaOrganizaciones } from './data/puntosVerdes';
import { supabase } from './lib/supabase';
import AdminPanel from './components/AdminPanel';

function normalizarTexto(texto = '') {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function normalizarTermino(palabra) {
  let t = normalizarTexto(palabra).replace(/[^a-z0-9]/g, '');
  if (!t) return '';
  if (t.includes('tergopor')) return 'telgopor';
  if (t === 'sachets') return 'sachet';
  if (t.endsWith('ones')) t = t.replace(/ones$/, 'on');
  else if (t.endsWith('es') && t.length > 4) {
    t = /[lrn]es$/.test(palabra.toLowerCase()) ? t.slice(0, -2) : t.slice(0, -1);
  } else if (t.endsWith('s') && !t.endsWith('is') && t.length > 3) {
    t = t.slice(0, -1);
  }
  return t;
}

function TarjetaPuntoVerde({ org }) {
  const [ecopuntosAbierto, setEcopuntosAbierto] = useState(false);
  const [verTodoMateriales, setVerTodoMateriales] = useState(false);

  const badgeInfo =
    org.categoria === 'reciclaje'
      ? { label: 'Reciclables', icon: 'fa-solid fa-recycle' }
      : org.categoria === 'compostaje'
      ? { label: 'Compost', icon: 'fa-solid fa-seedling' }
      : { label: 'Especiales', icon: 'fa-solid fa-triangle-exclamation' };

  const esLargo = org.materiales.length > 160;
  const textoMateriales =
    esLargo && !verTodoMateriales
      ? org.materiales.substring(0, 150) + '...'
      : org.materiales;

  const labelMateriales = org.labelMateriales || 'Reciben:';
  const iconoMateriales = org.iconoMateriales || 'fa-solid fa-boxes-stacked';

  return (
    <div className="card" data-categoria={org.categoria}>
      <div className={`card-banner banner-${org.categoria}`}>
        <img
          src={org.imagen}
          className="banner-img"
          alt={`Fondo ${org.nombre}`}
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
        <i className={`${badgeInfo.icon} banner-vector-icon`}></i>
      </div>

      <div className="card-header">
        <img
          src={org.logo}
          className="org-logo"
          alt={`Logo ${org.nombre}`}
          onError={(e) => {
            e.currentTarget.src = '/img/baritoxico-logo.webp';
            e.currentTarget.onerror = null;
          }}
        />
        <div className="header-title-wrapper">
          <h3>{org.nombre}</h3>
          <span className={`category-badge badge-${org.categoria}`}>
            <i className={badgeInfo.icon}></i> {badgeInfo.label}
          </span>
        </div>
      </div>

      <div className="card-body">
        <div className="card-materials">
          <span className="materials-label">
            <i className={iconoMateriales}></i> {labelMateriales}
          </span>
          <p className="materiales-texto-container">
            <span>{textoMateriales}</span>
            {esLargo && (
              <button
                type="button"
                className="btn-ver-mas-materiales"
                onClick={() => setVerTodoMateriales(!verTodoMateriales)}
              >
                {verTodoMateriales ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </p>
        </div>

        {org.elementos.map((el, idx) => {
          if (el.tipo === 'link-geo') {
            return (
              <p className="info-p" key={idx}>
                <a href={el.url} target="_blank" rel="noreferrer" className="geo-link">
                  <i className="fa-solid fa-location-dot"></i> {el.texto}
                </a>
              </p>
            );
          }
          if (el.tipo === 'texto') {
            return (
              <p className="info-p" key={idx}>
                <i className={el.icono}></i>{' '}
                <span dangerouslySetInnerHTML={{ __html: el.texto }} />
              </p>
            );
          }
          if (el.tipo === 'whatsapp') {
            return (
              <p className="info-p" key={idx}>
                <a
                  href={`https://wa.me/549${el.numero}`}
                  target="_blank"
                  rel="noreferrer"
                  className="whatsapp-link"
                >
                  <i className="fa-brands fa-whatsapp"></i> {el.numero}
                </a>
              </p>
            );
          }
          if (el.tipo === 'email') {
            return (
              <p className="info-p" key={idx}>
                <a href={`mailto:${el.correo}`} className="geo-link" style={{ color: '#4a5568' }}>
                  <i className="fa-regular fa-envelope"></i> {el.correo}
                </a>
              </p>
            );
          }
          if (el.tipo === 'instagram') {
            return (
              <a
                key={idx}
                href={`https://www.instagram.com/${el.usuario}/`}
                target="_blank"
                rel="noreferrer"
                className="info-link instagram-link"
              >
                <i className="fa-brands fa-instagram"></i> @{el.usuario}
              </a>
            );
          }
          if (el.tipo === 'facebook') {
            return (
              <a
                key={idx}
                href={`https://www.facebook.com/${el.usuario}/`}
                target="_blank"
                rel="noreferrer"
                className="info-link instagram-link"
              >
                <i className="fa-brands fa-facebook"></i> {el.usuario}
              </a>
            );
          }
          if (el.tipo === 'desplegable-ecopuntos') {
            return (
              <div className="contenedor-ecopuntos" key={idx}>
                <button
                  type="button"
                  className="btn-desplegar-jxb"
                  onClick={() => setEcopuntosAbierto(!ecopuntosAbierto)}
                >
                  <span>
                    <i className="fa-solid fa-map-location-dot"></i> {el.titulo}
                  </span>
                  <i
                    className="fa-solid fa-angle-down btn-icono-flecha"
                    style={{
                      transform: ecopuntosAbierto ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  ></i>
                </button>
                {ecopuntosAbierto && (
                  <div className="lista-sedes-jxb" style={{ display: 'flex' }}>
                    {el.sedes.map((sede, sIdx) => (
                      <div className="sede-item" key={sIdx}>
                        <a href={sede.url} target="_blank" rel="noreferrer" className="geo-link">
                          <i className="fa-solid fa-location-dot"></i> {sede.nombre}
                        </a>
                        <span className="sede-horario">
                          <i className="fa-regular fa-clock"></i> {sede.horario}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          if (el.tipo === 'html') {
            if (el.html.includes('toggleEcopuntos')) {
              return (
                <div className="contenedor-ecopuntos" key={idx}>
                  <button
                    type="button"
                    className="btn-desplegar-jxb btn-desplegar-pilas"
                    onClick={() => setEcopuntosAbierto(!ecopuntosAbierto)}
                  >
                    <span>
                      <i className="fa-solid fa-shield-halved"></i> Ver guía de encapsulado seguro
                    </span>
                    <i
                      className="fa-solid fa-angle-down btn-icono-flecha"
                      style={{
                        transform: ecopuntosAbierto ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    ></i>
                  </button>
                  {ecopuntosAbierto && (
                    <div className="lista-sedes-jxb guia-pilas-desplegada" style={{ display: 'flex' }}>
                      <div className="guia-pilas-pasos">
                        <div className="paso-pila-item">
                          <span className="paso-pila-num">1</span>
                          <p><strong>Aislá los polos:</strong> Pegá cinta adhesiva o aisladora en los extremos (+ y -) de cada pila para evitar chispas.</p>
                        </div>
                        <div className="paso-pila-item">
                          <span className="paso-pila-num">2</span>
                          <p><strong>Botella PET:</strong> Usá una botella plástica gruesa, limpia y totalmente seca.</p>
                        </div>
                        <div className="paso-pila-item">
                          <span className="paso-pila-num">3</span>
                          <p><strong>Secante:</strong> Llená los huecos con arena seca, aserrín o ceniza para absorber derrames.</p>
                        </div>
                        <div className="paso-pila-item">
                          <span className="paso-pila-num">4</span>
                          <p><strong>Sellado hermético:</strong> Cerrá la tapa y asegurala con cinta. Guardala en un lugar seco fuera del alcance de niños.</p>
                        </div>
                      </div>
                      <div className="pilas-consejo-box">
                        <p><i className="fa-solid fa-triangle-exclamation"></i> <strong>Importante:</strong> Guardá el envase hasta que haya campañas de recolección de residuos peligrosos.</p>
                        <p><i className="fa-solid fa-bolt"></i> <strong>Recomendación:</strong> Priorizá el uso de <strong>pilas recargables</strong> para evitar generar el residuo.</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            return <div key={idx} dangerouslySetInnerHTML={{ __html: el.html }} />;
          }
          return null;
        })}
      </div>
    </div>
  );
}

export default function App() {
  if (window.location.pathname === '/admin') {
    return <AdminPanel />;
  }

  const [seccionActiva, setSeccionActiva] = useState('puntos');
  const [categoriaActiva, setCategoriaActiva] = useState('todas');
  const [textoBusqueda, setTextoBusqueda] = useState('');

  // Estados de instalación PWA
  const [esModoApp, setEsModoApp] = useState(false);
  const [esIOS, setEsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [mostrarBannerPwa, setMostrarBannerPwa] = useState(false);

  // Datos desde Supabase (Emprendimientos y Novedades)
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [cargandoEmprendimientos, setCargandoEmprendimientos] = useState(false);
  const [busquedaEmp, setBusquedaEmp] = useState('');
  const [novedades, setNovedades] = useState([]);

  // Estados para Cero Basura (Donaciones / Pedidos)
  const [donaciones, setDonaciones] = useState([]);
  const [cargandoDonaciones, setCargandoDonaciones] = useState(false);
  const [filtroCb, setFiltroCb] = useState('todos');
  const [busquedaCb, setBusquedaCb] = useState('');
  const [mostrarFormCb, setMostrarFormCb] = useState(false);
  const [enviandoCb, setEnviandoCb] = useState(false);
  const [subiendoFotoCb, setSubiendoFotoCb] = useState(false);
  const [avisoEnviadoOk, setAvisoEnviadoOk] = useState(false);
  const [nuevoAvisoCb, setNuevoAvisoCb] = useState({
    tipo: 'dono',
    titulo: '',
    descripcion: '',
    barrio: '',
    whatsapp: '',
    imagen_url: '',
  });

  useEffect(() => {
    async function cargarNovedades() {
      const { data } = await supabase
        .from('novedades')
        .select('*')
        .eq('activa', true)
        .order('created_at', { ascending: false })
        .limit(3);
      if (data) setNovedades(data);
    }
    cargarNovedades();
  }, []);

  useEffect(() => {
    const instalada =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    setEsModoApp(instalada);

    const oculto = localStorage.getItem('ocultarBannerRecicla') === 'true';
    if (instalada || oculto) return;

    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const iosDetected =
      (/iPad|iPhone|iPod/.test(ua) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
      !window.MSStream;

    if (iosDetected) {
      setEsIOS(true);
      setMostrarBannerPwa(true);
    } else {
      const handleBeforeInstall = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setMostrarBannerPwa(true);
      };
      window.addEventListener('beforeinstallprompt', handleBeforeInstall);
      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    }
  }, []);

  async function instalarApp() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setMostrarBannerPwa(false);
    }
    setDeferredPrompt(null);
  }

  function cerrarBannerPwa() {
    setMostrarBannerPwa(false);
    localStorage.setItem('ocultarBannerRecicla', 'true');
  }

  useEffect(() => {
    if (seccionActiva !== 'emprendimientos') return;
    async function cargarEmprendimientos() {
      setCargandoEmprendimientos(true);
      const { data } = await supabase
        .from('emprendimientos')
        .select('*')
        .eq('activo', true)
        .order('created_at', { ascending: false });
      if (data) setEmprendimientos(data);
      setCargandoEmprendimientos(false);
    }
    cargarEmprendimientos();
  }, [seccionActiva]);

  useEffect(() => {
    if (seccionActiva !== 'cerobasura') return;
    async function cargarDonaciones() {
      setCargandoDonaciones(true);
      const { data } = await supabase
        .from('donaciones')
        .select('*')
        .eq('estado', 'aprobado')
        .order('created_at', { ascending: false });
      if (data) setDonaciones(data);
      setCargandoDonaciones(false);
    }
    cargarDonaciones();
  }, [seccionActiva]);

  async function subirFotoDonacion(file) {
    if (!file) return;
    setSubiendoFotoCb(true);
    try {
      const authRes = await fetch('/api/imagekit-auth');
      if (!authRes.ok) throw new Error('No se pudo conectar con el servidor de imágenes');
      const { token, expire, signature } = await authRes.json();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', `cb-${Date.now()}-${file.name}`);
      formData.append('folder', '/barirecicla/donaciones');
      formData.append('publicKey', import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY);
      formData.append('signature', signature);
      formData.append('expire', expire);
      formData.append('token', token);

      const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(data.message || 'Error al subir la foto');

      setNuevoAvisoCb((prev) => ({
        ...prev,
        imagen_url: `${data.url}?tr=f-webp,q-80`,
      }));
    } catch (err) {
      alert('No se pudo subir la imagen: ' + err.message);
    } finally {
      setSubiendoFotoCb(false);
    }
  }

  async function enviarAvisoCeroBasura(e) {
    e.preventDefault();
    setEnviandoCb(true);
    const { error } = await supabase.from('donaciones').insert([
      {
        ...nuevoAvisoCb,
        estado: 'pendiente',
      },
    ]);
    setEnviandoCb(false);

    if (error) {
      alert('Error al enviar la publicación: ' + error.message);
      return;
    }

    setNuevoAvisoCb({
      tipo: 'dono',
      titulo: '',
      descripcion: '',
      barrio: '',
      whatsapp: '',
      imagen_url: '',
    });
    setMostrarFormCb(false);
    setAvisoEnviadoOk(true);
  }

  const organizacionesFiltradas = useMemo(() => {
    const palabrasBuscadas = textoBusqueda
      .split(/\s+/)
      .map((p) => normalizarTermino(p))
      .filter((p) => p.length > 0);

    return listaOrganizaciones.filter((org) => {
      const coincideCategoria =
        categoriaActiva === 'todas' ||
        (categoriaActiva === 'guias'
          ? org.esGuia === true
          : org.categoria === categoriaActiva);
      const tagsLower = org.tags.toLowerCase();
      const coincideTexto = palabrasBuscadas.every((palabra) =>
        tagsLower.includes(palabra)
      );
      return coincideCategoria && coincideTexto;
    });
  }, [categoriaActiva, textoBusqueda]);

  const emprendimientosFiltrados = useMemo(() => {
    const q = normalizarTexto(busquedaEmp);
    if (!q) return emprendimientos;
    return emprendimientos.filter((emp) => {
      const contenido = normalizarTexto(
        `${emp.nombre} ${emp.rubro} ${emp.descripcion} ${emp.barrio}`
      );
      return contenido.includes(q);
    });
  }, [emprendimientos, busquedaEmp]);

  const donacionesFiltradas = useMemo(() => {
    const q = normalizarTexto(busquedaCb);
    return donaciones.filter((item) => {
      const coincideTipo = filtroCb === 'todos' || item.tipo === filtroCb;
      if (!q) return coincideTipo;
      const contenido = normalizarTexto(
        `${item.titulo} ${item.descripcion} ${item.barrio}`
      );
      return coincideTipo && contenido.includes(q);
    });
  }, [donaciones, filtroCb, busquedaCb]);

  return (
    <div className="app-container">
      {/* HEADER */}
      <div className="header-container">
        <div className="header-brand-group">
          <img
            src="/img/baritoxico-logo.webp"
            className="brand-logo"
            alt="Logo BariRecicla"
          />
          <div className="header-text-wrapper">
            <h1>BariRecicla</h1>
            <h2>Economía circular en Bariloche</h2>
            {esModoApp && (
              <span className="badge-instalada">
                <i className="fa-solid fa-circle-check"></i> App Instalada
              </span>
            )}
          </div>
        </div>

        <a
          href="https://cafecito.app/baritoxico"
          target="_blank"
          rel="noreferrer"
          className="btn-cafecito-header"
          title="Invitanos un Cafecito"
        >
          <i className="fa-solid fa-mug-hot"></i> <span>Cafecito</span>
        </a>
      </div>

      {/* BARRA FIJA DISCRETA DE INSTALACIÓN PWA */}
      {mostrarBannerPwa && !esModoApp && (
        <div className={`install-bar-fixed ${esIOS ? 'banner-ios' : ''}`}>
          {esIOS ? (
            <div className="install-content-ios">
              <div className="install-header-ios">
                <span className="install-badge-ios">
                  <i className="fa-brands fa-apple"></i> Instalar en iPhone
                </span>
                <button
                  type="button"
                  onClick={cerrarBannerPwa}
                  className="btn-cerrar-banner-bar"
                  title="Cerrar"
                >
                  &times;
                </button>
              </div>
              <p className="install-titulo-ios">¡Tené la guía siempre a mano como una app!</p>
              <div className="pasos-ios">
                <p>
                  1. Tocá <strong>Compartir</strong>{' '}
                  <i className="fa-solid fa-arrow-up-from-bracket" style={{ color: '#007aff' }}></i>{' '}
                  abajo en Safari.
                </p>
                <p>
                  2. Elegí <strong>«Agregar a pantalla de inicio»</strong>{' '}
                  <i className="fa-regular fa-square-plus"></i>.
                </p>
              </div>
              <button type="button" onClick={cerrarBannerPwa} className="btn-entendido-ios">
                ¡Entendido!
              </button>
            </div>
          ) : (
            <div className="install-bar-content">
              <div className="install-bar-info">
                <i className="fa-solid fa-mobile-screen-button install-bar-icon"></i>
                <span>
                  <strong>Instalá la App</strong> para usarla más rápido
                </span>
              </div>
              <div className="install-bar-actions">
                <button type="button" onClick={instalarApp} className="btn-instalar-pills">
                  Instalar
                </button>
                <button
                  type="button"
                  onClick={cerrarBannerPwa}
                  className="btn-cerrar-banner-bar"
                  title="Cerrar"
                >
                  &times;
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* NAVEGACIÓN PRINCIPAL DE 3 PESTAÑAS */}
      <nav className="main-nav-tabs" aria-label="Secciones principales">
        <button
          type="button"
          className={`main-tab-btn ${seccionActiva === 'puntos' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('puntos')}
        >
          <i className="fa-solid fa-recycle"></i>
          <span>Puntos Verdes</span>
        </button>

        <button
          type="button"
          className={`main-tab-btn ${seccionActiva === 'emprendimientos' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('emprendimientos')}
        >
          <i className="fa-solid fa-store"></i>
          <span>Emprendimientos</span>
        </button>

        <button
          type="button"
          className={`main-tab-btn ${seccionActiva === 'cerobasura' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('cerobasura')}
        >
          <i className="fa-solid fa-hand-holding-heart"></i>
          <span>Cero Basura</span>
        </button>
      </nav>

      {/* SECCIÓN 1: PUNTOS VERDES */}
      {seccionActiva === 'puntos' && (
        <>
          <div className="info-accent-box">
            <p>
              <i className="fa-solid fa-circle-check"></i> Recordá: todos los materiales deben estar{' '}
              <strong>limpios y secos</strong>.
            </p>
          </div>

          <div className="search-filter-container">
            <input
              type="text"
              id="buscador"
              value={textoBusqueda}
              onChange={(e) => setTextoBusqueda(e.target.value)}
              placeholder="Buscar por barrio, material u organización..."
            />

            <div className="filter-buttons">
              <button
                type="button"
                className={`btn-filter ${categoriaActiva === 'todas' ? 'active' : ''}`}
                onClick={() => setCategoriaActiva('todas')}
              >
                <i className="fa-solid fa-border-all"></i> Todo
              </button>
              <button
                type="button"
                className={`btn-filter ${categoriaActiva === 'reciclaje' ? 'active' : ''}`}
                onClick={() => setCategoriaActiva('reciclaje')}
              >
                <i className="fa-solid fa-recycle"></i> Reciclables
              </button>
              <button
                type="button"
                className={`btn-filter ${categoriaActiva === 'compostaje' ? 'active' : ''}`}
                onClick={() => setCategoriaActiva('compostaje')}
              >
                <i className="fa-solid fa-seedling"></i> Compost
              </button>
              <button
                type="button"
                className={`btn-filter ${categoriaActiva === 'especiales' ? 'active' : ''}`}
                onClick={() => setCategoriaActiva('especiales')}
              >
                <i className="fa-solid fa-triangle-exclamation"></i> Especiales
              </button>
              <button
                type="button"
                className={`btn-filter ${categoriaActiva === 'guias' ? 'active' : ''}`}
                onClick={() => setCategoriaActiva('guias')}
              >
                <i className="fa-solid fa-book-open"></i> Guías
              </button>
            </div>
          </div>

          {/* NOVEDADES DESDE SUPABASE (Si hay activas) */}
          {novedades.length > 0 && (
            <section className="novedades-section">
              <h3 className="novedades-section-title">
                <i className="fa-solid fa-bullhorn"></i> Novedades y Campañas
              </h3>
              <div className="grid-org">
                {novedades.map((nov) => (
                  <div className="card" key={nov.id}>
                    {nov.imagen_url && (
                      <div className="card-banner banner-reciclaje">
                        <img src={nov.imagen_url} className="banner-img" alt={nov.titulo} />
                      </div>
                    )}
                    <div className="card-body">
                      <h3 style={{ color: '#1b4332', marginBottom: '6px' }}>{nov.titulo}</h3>
                      {nov.descripcion && <p className="info-p">{nov.descripcion}</p>}
                      {nov.link && (
                        <a href={nov.link} target="_blank" rel="noreferrer" className="geo-link">
                          <i className="fa-solid fa-arrow-up-right-from-square"></i> Más info
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* REJILLA DE PUNTOS VERDES */}
          <div className="grid-org">
            {organizacionesFiltradas.map((org, index) => (
              <TarjetaPuntoVerde key={index} org={org} />
            ))}
          </div>

          {/* MAPA */}
          <div className="map-container">
            <div className="map-header">
              <div className="map-title-wrapper">
                <i className="fa-solid fa-map-location-dot map-title-icon"></i>
                <div>
                  <h3>Mapa de Puntos Verdes</h3>
                  <span>Explorá los centros de recepción en Bariloche</span>
                </div>
              </div>
            </div>
            <iframe
              title="Mapa de Puntos Verdes Bariloche"
              src="https://www.google.com/maps/d/u/1/embed?mid=1Wp3BTtJJ4WsTPmpX0DdktJHn0T8irK0&ehbc=2E312F"
              width="100%"
              height="450"
              loading="lazy"
            ></iframe>
          </div>
        </>
      )}

      {/* SECCIÓN 2: EMPRENDIMIENTOS SUSTENTABLES */}
      {seccionActiva === 'emprendimientos' && (
        <section style={{ marginBottom: '28px' }}>
          <div className="info-accent-box">
            <p>
              <i className="fa-solid fa-seedling"></i> Proyectos, tiendas a granel y emprendimientos de impacto positivo en Bariloche.
            </p>
          </div>

          <div className="search-filter-container">
            <input
              type="text"
              id="buscador"
              value={busquedaEmp}
              onChange={(e) => setBusquedaEmp(e.target.value)}
              placeholder="Buscar emprendimiento, rubro o barrio..."
            />
          </div>

          {cargandoEmprendimientos ? (
            <p style={{ textAlign: 'center', padding: '24px', color: '#2d6a4f' }}>
              Cargando emprendimientos...
            </p>
          ) : emprendimientosFiltrados.length === 0 ? (
            <div className="proximamente-card">
              <div className="proximamente-icon">
                <i className="fa-solid fa-store"></i>
              </div>
              <h3>No encontramos emprendimientos con esa búsqueda</h3>
              <p>
                Probá buscando con otra palabra clave o borrá el filtro para ver todos los proyectos sustentables de Bariloche.
              </p>
            </div>
          ) : (
            <div className="grid-org">
              {emprendimientosFiltrados.map((emp) => (
                <div className="card" key={emp.id}>
                  <div className="card-banner banner-compostaje">
                    {emp.imagen_url && (
                      <img src={emp.imagen_url} className="banner-img" alt={emp.nombre} />
                    )}
                    <i className="fa-solid fa-store banner-vector-icon"></i>
                  </div>
                  <div className="card-header">
                    <div className="header-title-wrapper">
                      <h3>{emp.nombre}</h3>
                      <span className="category-badge badge-compostaje">{emp.rubro}</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <p className="info-p">{emp.descripcion}</p>
                    <p className="info-p">
                      <i className="fa-solid fa-location-dot"></i> {emp.barrio}
                    </p>
                    {emp.whatsapp && (
                      <p className="info-p">
                        <a
                          href={`https://wa.me/549${emp.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="whatsapp-link"
                        >
                          <i className="fa-brands fa-whatsapp"></i> {emp.whatsapp}
                        </a>
                      </p>
                    )}
                    {emp.instagram && (
                      <a
                        href={`https://www.instagram.com/${emp.instagram.replace('@', '')}/`}
                        target="_blank"
                        rel="noreferrer"
                        className="info-link instagram-link"
                      >
                        <i className="fa-brands fa-instagram"></i> @{emp.instagram.replace('@', '')}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* SECCIÓN 3: TABLÓN COMUNITARIO CERO BASURA */}
      {seccionActiva === 'cerobasura' && (
        <section style={{ marginBottom: '32px' }}>
          <div className="info-accent-box">
            <p>
              <i className="fa-solid fa-hand-holding-heart"></i> Espacio gratuito para{' '}
              <strong>donar objetos o materiales</strong> en buen estado o pedir lo que necesitás reutilizar en Bariloche.
            </p>
          </div>

          {avisoEnviadoOk && (
            <div
              className="info-accent-box"
              style={{ borderLeftColor: '#1b4332', background: '#d8f3dc', marginBottom: '16px' }}
            >
              <p>
                <i className="fa-solid fa-circle-check"></i>{' '}
                <span>
                  <strong>¡Aviso enviado!</strong> En breve lo revisamos y queda publicado en el tablón.
                </span>
              </p>
            </div>
          )}

          {/* BUSCADOR DEL TABLÓN */}
          <div className="search-filter-container" style={{ marginBottom: '14px' }}>
            <input
              type="text"
              id="buscador"
              value={busquedaCb}
              onChange={(e) => setBusquedaCb(e.target.value)}
              placeholder="Buscar por objeto, material o barrio (ej: frascos, pallets, Centro)..."
            />
          </div>

          {/* BARRA DE FILTROS Y BOTÓN PUBLICAR */}
          <div className="cb-toolbar">
            <div className="cb-filtros">
              <button
                type="button"
                className={`btn-filter ${filtroCb === 'todos' ? 'active' : ''}`}
                onClick={() => setFiltroCb('todos')}
              >
                <i className="fa-solid fa-border-all"></i> Todos
              </button>
              <button
                type="button"
                className={`btn-filter ${filtroCb === 'dono' ? 'active' : ''}`}
                onClick={() => setFiltroCb('dono')}
              >
                <i className="fa-solid fa-gift"></i> Dono
              </button>
              <button
                type="button"
                className={`btn-filter ${filtroCb === 'busco' ? 'active' : ''}`}
                onClick={() => setFiltroCb('busco')}
              >
                <i className="fa-solid fa-magnifying-glass"></i> Busco
              </button>
            </div>

            <button
              type="button"
              className="btn-publicar-cb"
              onClick={() => {
                setMostrarFormCb(!mostrarFormCb);
                setAvisoEnviadoOk(false);
              }}
            >
              <i className={mostrarFormCb ? 'fa-solid fa-xmark' : 'fa-solid fa-plus'}></i>
              <span>{mostrarFormCb ? 'Cerrar formulario' : 'Publicar gratis'}</span>
            </button>
          </div>

          {/* FORMULARIO PARA VECINOS */}
          {mostrarFormCb && (
            <div className="cb-form-card">
              <h3>
                <i className="fa-solid fa-hand-holding-heart"></i> Nueva publicación comunitaria
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#475569' }}>
                Las publicaciones son gratuitas (sin venta ni canje comercial) y se aprueban antes de mostrarse.
              </p>

              <form onSubmit={enviarAvisoCeroBasura} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="cb-tipo-selector">
                  <button
                    type="button"
                    className={`cb-tipo-btn ${nuevoAvisoCb.tipo === 'dono' ? 'active-dono' : ''}`}
                    onClick={() => setNuevoAvisoCb({ ...nuevoAvisoCb, tipo: 'dono' })}
                  >
                    <i className="fa-solid fa-gift"></i> Dono / Regalo
                  </button>
                  <button
                    type="button"
                    className={`cb-tipo-btn ${nuevoAvisoCb.tipo === 'busco' ? 'active-busco' : ''}`}
                    onClick={() => setNuevoAvisoCb({ ...nuevoAvisoCb, tipo: 'busco' })}
                  >
                    <i className="fa-solid fa-magnifying-glass"></i> Busco para reutilizar
                  </button>
                </div>

                <input
                  type="text"
                  className="cb-input"
                  placeholder={
                    nuevoAvisoCb.tipo === 'dono'
                      ? '¿Qué regalás? (ej: 12 frascos de vidrio con tapa) *'
                      : '¿Qué buscás? (ej: Pallets de madera para huerta) *'
                  }
                  value={nuevoAvisoCb.titulo}
                  onChange={(e) => setNuevoAvisoCb({ ...nuevoAvisoCb, titulo: e.target.value })}
                  required
                />

                <textarea
                  className="cb-input"
                  rows="3"
                  placeholder="Detalles (estado, medidas, horarios para retirar, etc.) *"
                  value={nuevoAvisoCb.descripcion}
                  onChange={(e) => setNuevoAvisoCb({ ...nuevoAvisoCb, descripcion: e.target.value })}
                  required
                />

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    className="cb-input"
                    style={{ flex: 1 }}
                    placeholder="Barrio o zona (ej: Km 4, Centro, Ñireco) *"
                    value={nuevoAvisoCb.barrio}
                    onChange={(e) => setNuevoAvisoCb({ ...nuevoAvisoCb, barrio: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    className="cb-input"
                    style={{ flex: 1 }}
                    placeholder="Tu WhatsApp (ej: 2944123456) *"
                    value={nuevoAvisoCb.whatsapp}
                    onChange={(e) => setNuevoAvisoCb({ ...nuevoAvisoCb, whatsapp: e.target.value })}
                    required
                  />
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <i className="fa-solid fa-camera"></i> Foto opcional del objeto:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => subirFotoDonacion(e.target.files[0])}
                    style={{ fontSize: '0.82rem' }}
                  />
                  {subiendoFotoCb && (
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#2d6a4f', marginTop: '4px' }}>
                      Subiendo y optimizando foto...
                    </span>
                  )}
                  {nuevoAvisoCb.imagen_url && !subiendoFotoCb && (
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#1b4332', marginTop: '4px', fontWeight: '600' }}>
                      <i className="fa-solid fa-circle-check"></i> Foto cargada correctamente
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={enviandoCb || subiendoFotoCb}
                  className="btn-publicar-cb"
                  style={{ justifyContent: 'center', padding: '12px', borderRadius: '12px' }}
                >
                  <i className="fa-solid fa-paper-plane"></i>
                  <span>{enviandoCb ? 'Enviando...' : 'Enviar publicación'}</span>
                </button>
              </form>
            </div>
          )}

          {/* LISTADO DE PUBLICACIONES APROBADAS */}
          {cargandoDonaciones ? (
            <p style={{ textAlign: 'center', padding: '24px', color: '#2d6a4f' }}>
              Cargando publicaciones...
            </p>
          ) : donacionesFiltradas.length === 0 ? (
            <div className="proximamente-card">
              <div className="proximamente-icon">
                <i className="fa-solid fa-hand-holding-heart"></i>
              </div>
              <h3>No hay publicaciones que coincidan</h3>
              <p>
                Probá buscando con otra palabra o tocale a{' '}
                <strong>«Publicar gratis»</strong> para compartir lo que tenés o necesitás reutilizar.
              </p>
            </div>
          ) : (
            <div className="grid-org">
              {donacionesFiltradas.map((item) => {
                const esDono = item.tipo === 'dono';
                const telLimpio = item.whatsapp.replace(/\D/g, '');
                const mensajeWa = encodeURIComponent(
                  `Hola! Vi tu aviso en BariRecicla (${esDono ? 'Dono' : 'Busco'}): "${item.titulo}".`
                );

                return (
                  <div
                    className={`card ${esDono ? 'card-cb-dono' : 'card-cb-busco'}`}
                    key={item.id}
                  >
                    {item.imagen_url && (
                      <div className="card-banner">
                        <img src={item.imagen_url} className="banner-img" alt={item.titulo} />
                        <i
                          className={`${
                            esDono ? 'fa-solid fa-gift' : 'fa-solid fa-magnifying-glass'
                          } banner-vector-icon`}
                        ></i>
                      </div>
                    )}

                    <div className="card-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span className={`category-badge ${esDono ? 'badge-dono' : 'badge-busco'}`}>
                          <i className={esDono ? 'fa-solid fa-gift' : 'fa-solid fa-magnifying-glass'}></i>{' '}
                          {esDono ? 'Dono' : 'Busco'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                          <i className="fa-solid fa-location-dot" style={{ color: '#ef4444' }}></i> {item.barrio}
                        </span>
                      </div>

                      <h3 style={{ margin: '2px 0 6px 0', color: '#081c15', fontSize: '1.1rem' }}>
                        {item.titulo}
                      </h3>
                      <p className="info-p" style={{ marginBottom: '12px' }}>
                        {item.descripcion}
                      </p>

                      <a
                        href={`https://wa.me/549${telLimpio}?text=${mensajeWa}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-whatsapp-cb"
                      >
                        <i className="fa-brands fa-whatsapp"></i> Contactar por WhatsApp
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* FOOTER */}
      <div className="footer-box">
        <p className="footer-brand">BARIRECICLA</p>
        <p className="footer-subtitle">
          ¡Sumate a la comunidad para no perderte ninguna data ambiental!
        </p>

        <div className="footer-socials">
          <a
            href="https://www.instagram.com/baritoxico/"
            target="_blank"
            rel="noreferrer"
            className="footer-icon icon-instagram"
            title="Instagram"
          >
            <i className="fa-brands fa-instagram"></i>
          </a>
          <a
            href="https://www.tiktok.com/@baritoxico"
            target="_blank"
            rel="noreferrer"
            className="footer-icon icon-tiktok"
            title="TikTok"
          >
            <i className="fa-brands fa-tiktok"></i>
          </a>
          <a
            href="https://www.facebook.com/share/1GFwuuGC3p/"
            target="_blank"
            rel="noreferrer"
            className="footer-icon icon-facebook"
            title="Facebook"
          >
            <i className="fa-brands fa-facebook-f"></i>
          </a>
        </div>

        <hr className="footer-hr" />

        <div className="support-section">
          <p className="support-title">
            <i className="fa-solid fa-recycle"></i> ¿Te sirvió la guía?
          </p>
          <p className="support-text">
            Creamos este espacio de forma independiente para facilitar el reciclaje en Bariloche. Si querés
            darnos una mano para seguir mejorando la web y expandir el proyecto, ¡todo suma un montón!
          </p>
          <a
            href="https://cafecito.app/baritoxico"
            target="_blank"
            rel="noreferrer"
            className="btn-cafecito"
          >
            <i className="fa-solid fa-mug-hot"></i> Invitanos un Cafecito
          </a>
        </div>

        <p className="footer-copy">
          San Carlos de Bariloche - 2026 ·{' '}
          <a
            href="/admin"
            style={{
              color: 'inherit',
              textDecoration: 'none',
              opacity: 0.65,
              fontWeight: 600,
            }}
          >
            Gestión
          </a>
        </p>
      </div>
    </div>
  );
}