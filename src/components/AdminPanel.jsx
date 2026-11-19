import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminPanel() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorLogin, setErrorLogin] = useState('');
  const [cargando, setCargando] = useState(false);

  const [tabAdmin, setTabAdmin] = useState('emprendimientos');

  // Estados para Emprendimientos
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [nuevoEmp, setNuevoEmp] = useState({
    nombre: '',
    rubro: '',
    descripcion: '',
    barrio: '',
    instagram: '',
    whatsapp: '',
    imagen_url: '',
  });

  // Estados para Novedades y Push
  const [novedades, setNovedades] = useState([]);
  const [enviarPushAlPublicar, setEnviarPushAlPublicar] = useState(true);
  const [enviandoPushId, setEnviandoPushId] = useState(null);
  const [nuevaNov, setNuevaNov] = useState({
    titulo: '',
    descripcion: '',
    imagen_url: '',
    link: '',
  });

  // Estados para Donaciones (Cero Basura)
  const [donaciones, setDonaciones] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      cargarDatosAdmin();
    }
  }, [session]);

  async function cargarDatosAdmin() {
    const { data: dataEmp } = await supabase
      .from('emprendimientos')
      .select('*')
      .order('created_at', { ascending: false });
    if (dataEmp) setEmprendimientos(dataEmp);

    const { data: dataNov } = await supabase
      .from('novedades')
      .select('*')
      .order('created_at', { ascending: false });
    if (dataNov) setNovedades(dataNov);

    const { data: dataDon } = await supabase
      .from('donaciones')
      .select('*')
      .order('created_at', { ascending: false });
    if (dataDon) setDonaciones(dataDon);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setErrorLogin('');
    setCargando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorLogin('Email o contraseña incorrectos.');
    }
    setCargando(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  // Subida de imagen directa a ImageKit con optimización automática a WebP
  async function subirImagen(file, carpeta, callbackUrl) {
    if (!file) return;
    setCargando(true);

    try {
      const authRes = await fetch('/api/imagekit-auth');
      if (!authRes.ok) throw new Error('No se pudo obtener la firma de ImageKit');
      const { token, expire, signature } = await authRes.json();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', `${Date.now()}-${file.name}`);
      formData.append('folder', `/barirecicla/${carpeta}`);
      formData.append('publicKey', import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY);
      formData.append('signature', signature);
      formData.append('expire', expire);
      formData.append('token', token);

      const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(data.message || 'Error al subir a ImageKit');

      const urlOptimizada = `${data.url}?tr=f-webp,q-80`;
      callbackUrl(urlOptimizada);
    } catch (err) {
      alert('Error al subir imagen a ImageKit: ' + err.message);
    } finally {
      setCargando(false);
    }
  }

  // Envío de notificación Push vía OneSignal (Vercel API)
  async function dispararNotificacionPush(nov, pedirConfirmacion = false) {
    if (pedirConfirmacion) {
      const ok = window.confirm(`¿Enviar notificación push a todos los suscriptores con "${nov.titulo}"?`);
      if (!ok) return;
    }

    setEnviandoPushId(nov.id || 'nueva');
    try {
      const res = await fetch('/api/enviar-notificacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: nov.titulo,
          mensaje: nov.descripcion,
          url: nov.link || 'https://baritoxicorecicla.vercel.app/',
          imagen_url: nov.imagen_url || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo enviar la notificación');
      alert(`Notificación push enviada correctamente (${data.recipients ?? 0} destinatarios).`);
    } catch (err) {
      alert('La novedad se guardó, pero falló el envío Push: ' + err.message);
    } finally {
      setEnviandoPushId(null);
    }
  }

  // CRUD Emprendimientos
  async function crearEmprendimiento(e) {
    e.preventDefault();
    setCargando(true);
    const { error } = await supabase.from('emprendimientos').insert([
      { ...nuevoEmp, activo: true },
    ]);
    if (error) {
      alert('Error al guardar: ' + error.message);
    } else {
      setNuevoEmp({
        nombre: '',
        rubro: '',
        descripcion: '',
        barrio: '',
        instagram: '',
        whatsapp: '',
        imagen_url: '',
      });
      await cargarDatosAdmin();
    }
    setCargando(false);
  }

  async function toggleActivoEmp(id, estadoActual) {
    await supabase
      .from('emprendimientos')
      .update({ activo: !estadoActual })
      .eq('id', id);
    cargarDatosAdmin();
  }

  async function eliminarEmp(id) {
    if (!window.confirm('¿Seguro que querés eliminar este emprendimiento?')) return;
    await supabase.from('emprendimientos').delete().eq('id', id);
    cargarDatosAdmin();
  }

  // CRUD Novedades
  async function crearNovedad(e) {
    e.preventDefault();
    setCargando(true);
    const novedadParaGuardar = { ...nuevaNov, activa: true };
    const { error } = await supabase.from('novedades').insert([novedadParaGuardar]);

    if (error) {
      alert('Error al guardar novedad: ' + error.message);
      setCargando(false);
      return;
    }

    if (enviarPushAlPublicar) {
      await dispararNotificacionPush(novedadParaGuardar, false);
    }

    setNuevaNov({ titulo: '', descripcion: '', imagen_url: '', link: '' });
    await cargarDatosAdmin();
    setCargando(false);
  }

  async function toggleActivaNov(id, estadoActual) {
    await supabase
      .from('novedades')
      .update({ activa: !estadoActual })
      .eq('id', id);
    cargarDatosAdmin();
  }

  async function eliminarNov(id) {
    if (!window.confirm('¿Seguro que querés eliminar esta novedad?')) return;
    await supabase.from('novedades').delete().eq('id', id);
    cargarDatosAdmin();
  }

  // Moderación Donaciones (Cero Basura)
  async function cambiarEstadoDonacion(id, nuevoEstado) {
    await supabase
      .from('donaciones')
      .update({ estado: nuevoEstado })
      .eq('id', id);
    cargarDatosAdmin();
  }

  async function eliminarDonacion(id) {
    if (!window.confirm('¿Seguro que querés eliminar esta publicación?')) return;
    await supabase.from('donaciones').delete().eq('id', id);
    cargarDatosAdmin();
  }

  const pendientesCount = donaciones.filter((d) => d.estado === 'pendiente').length;

  // PANTALLA DE LOGIN
  if (!session) {
    return (
      <div className="app-container" style={{ maxWidth: '420px', marginTop: '40px' }}>
        <div className="proximamente-card" style={{ textAlign: 'left', borderStyle: 'solid' }}>
          <h2 style={{ color: '#1b4332', marginBottom: '6px' }}>Panel Admin BariRecicla</h2>
          <p style={{ margin: '0 0 18px 0', fontSize: '0.88rem' }}>
            Ingresá con tu cuenta de administrador para gestionar comercios, novedades y avisos.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="email"
              placeholder="Email administrador"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
            />
            {errorLogin && <p style={{ color: '#dc2626', margin: 0, fontSize: '0.85rem' }}>{errorLogin}</p>}
            <button
              type="submit"
              disabled={cargando}
              className="btn-filter active"
              style={{ justifyContent: 'center', padding: '12px', marginTop: '4px' }}
            >
              {cargando ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>

          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <a href="/" className="geo-link" style={{ fontSize: '0.85rem' }}>
              <i className="fa-solid fa-arrow-left"></i> Volver a BariRecicla
            </a>
          </div>
        </div>
      </div>
    );
  }

  // PANTALLA DEL PANEL LOGUEADO
  return (
    <div className="app-container">
      <div className="header-container">
        <div className="header-brand-group">
          <img src="/img/baritoxico-logo.webp" className="brand-logo" alt="Logo BariRecicla" />
          <div className="header-text-wrapper">
            <h1>Panel Admin</h1>
            <h2>Gestión de BariRecicla</h2>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <a href="/" className="btn-filter" style={{ textDecoration: 'none' }}>
            <i className="fa-solid fa-globe"></i> Ver Web
          </a>
          <button type="button" onClick={handleLogout} className="btn-filter">
            <i className="fa-solid fa-right-from-bracket"></i> Salir
          </button>
        </div>
      </div>

      {/* PESTAÑAS DEL ADMIN */}
      <nav className="main-nav-tabs">
        <button
          type="button"
          className={`main-tab-btn ${tabAdmin === 'emprendimientos' ? 'active' : ''}`}
          onClick={() => setTabAdmin('emprendimientos')}
        >
          <i className="fa-solid fa-store"></i>
          <span>Emprendimientos ({emprendimientos.length})</span>
        </button>

        <button
          type="button"
          className={`main-tab-btn ${tabAdmin === 'novedades' ? 'active' : ''}`}
          onClick={() => setTabAdmin('novedades')}
        >
          <i className="fa-solid fa-bullhorn"></i>
          <span>Novedades ({novedades.length})</span>
        </button>

        <button
          type="button"
          className={`main-tab-btn ${tabAdmin === 'donaciones' ? 'active' : ''}`}
          onClick={() => setTabAdmin('donaciones')}
        >
          <i className="fa-solid fa-hand-holding-heart"></i>
          <span>Cero Basura ({pendientesCount} pend.)</span>
        </button>
      </nav>

      {/* GESTIÓN DE EMPRENDIMIENTOS */}
      {tabAdmin === 'emprendimientos' && (
        <div>
          <div className="proximamente-card" style={{ textAlign: 'left', borderStyle: 'solid', padding: '20px' }}>
            <h3 style={{ marginBottom: '12px' }}>+ Agregar Emprendimiento Sustentable</h3>
            <form onSubmit={crearEmprendimiento} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                placeholder="Nombre del emprendimiento *"
                value={nuevoEmp.nombre}
                onChange={(e) => setNuevoEmp({ ...nuevoEmp, nombre: e.target.value })}
                required
                style={{ padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
              />
              <input
                type="text"
                placeholder="Rubro (ej: Tienda a granel, Cosmética natural, Suprarreciclaje) *"
                value={nuevoEmp.rubro}
                onChange={(e) => setNuevoEmp({ ...nuevoEmp, rubro: e.target.value })}
                required
                style={{ padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
              />
              <textarea
                placeholder="Descripción corta de qué ofrecen *"
                rows="3"
                value={nuevoEmp.descripcion}
                onChange={(e) => setNuevoEmp({ ...nuevoEmp, descripcion: e.target.value })}
                required
                style={{ padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
              />
              <input
                type="text"
                placeholder="Barrio o Zona (ej: Centro, Km 4, Envíos a todo Bariloche) *"
                value={nuevoEmp.barrio}
                onChange={(e) => setNuevoEmp({ ...nuevoEmp, barrio: e.target.value })}
                required
                style={{ padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
              />
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Instagram (sin @)"
                  value={nuevoEmp.instagram}
                  onChange={(e) => setNuevoEmp({ ...nuevoEmp, instagram: e.target.value })}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                />
                <input
                  type="text"
                  placeholder="WhatsApp (ej: 2944123456)"
                  value={nuevoEmp.whatsapp}
                  onChange={(e) => setNuevoEmp({ ...nuevoEmp, whatsapp: e.target.value })}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Foto / Banner del emprendimiento (ImageKit automático o URL):
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    subirImagen(e.target.files[0], 'emprendimientos', (url) =>
                      setNuevoEmp({ ...nuevoEmp, imagen_url: url })
                    )
                  }
                  style={{ fontSize: '0.82rem', marginBottom: '6px' }}
                />
                <input
                  type="text"
                  placeholder="O pegá acá la URL de la imagen"
                  value={nuevoEmp.imagen_url}
                  onChange={(e) => setNuevoEmp({ ...nuevoEmp, imagen_url: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <button type="submit" disabled={cargando} className="btn-filter active" style={{ justifyContent: 'center', padding: '12px' }}>
                {cargando ? 'Guardando...' : 'Publicar Emprendimiento'}
              </button>
            </form>
          </div>

          <div className="grid-org">
            {emprendimientos.map((emp) => (
              <div className="card" key={emp.id} style={{ opacity: emp.activo ? 1 : 0.6 }}>
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>{emp.nombre}</h3>
                    <span className="category-badge badge-compostaje">{emp.activo ? 'Activo' : 'Pausado'}</span>
                  </div>
                  <p className="info-p" style={{ marginTop: '6px' }}><strong>{emp.rubro}</strong> · {emp.barrio}</p>
                  <p className="info-p">{emp.descripcion}</p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button type="button" onClick={() => toggleActivoEmp(emp.id, emp.activo)} className="btn-filter">
                      {emp.activo ? 'Pausar' : 'Activar'}
                    </button>
                    <button type="button" onClick={() => eliminarEmp(emp.id)} className="btn-filter" style={{ color: '#dc2626' }}>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GESTIÓN DE NOVEDADES + PUSH ONESIGNAL */}
      {tabAdmin === 'novedades' && (
        <div>
          <div className="proximamente-card" style={{ textAlign: 'left', borderStyle: 'solid', padding: '20px' }}>
            <h3 style={{ marginBottom: '12px' }}>+ Nueva Campaña o Novedad</h3>
            <form onSubmit={crearNovedad} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                placeholder="Título de la novedad *"
                value={nuevaNov.titulo}
                onChange={(e) => setNuevaNov({ ...nuevaNov, titulo: e.target.value })}
                required
                style={{ padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
              />
              <textarea
                placeholder="Descripción o detalles (fechas, lugar, qué llevan) *"
                rows="3"
                value={nuevaNov.descripcion}
                onChange={(e) => setNuevaNov({ ...nuevaNov, descripcion: e.target.value })}
                required
                style={{ padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
              />
              <input
                type="text"
                placeholder="Enlace opcional (ej: Instagram o Google Maps)"
                value={nuevaNov.link}
                onChange={(e) => setNuevaNov({ ...nuevaNov, link: e.target.value })}
                style={{ padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
              />

              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Flyer o imagen de la novedad (ImageKit automático o URL):
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    subirImagen(e.target.files[0], 'novedades', (url) =>
                      setNuevaNov({ ...nuevaNov, imagen_url: url })
                    )
                  }
                  style={{ fontSize: '0.82rem', marginBottom: '6px' }}
                />
                <input
                  type="text"
                  placeholder="O pegá acá la URL de la imagen"
                  value={nuevaNov.imagen_url}
                  onChange={(e) => setNuevaNov({ ...nuevaNov, imagen_url: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  color: '#1b4332',
                  background: '#e8f5e9',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={enviarPushAlPublicar}
                  onChange={(e) => setEnviarPushAlPublicar(e.target.checked)}
                />
                <i className="fa-solid fa-bell"></i>
                <span>Enviar notificación push al celular al publicar</span>
              </label>

              <button type="submit" disabled={cargando} className="btn-filter active" style={{ justifyContent: 'center', padding: '12px' }}>
                {cargando ? 'Publicando...' : 'Publicar Novedad'}
              </button>
            </form>
          </div>

          <div className="grid-org">
            {novedades.map((nov) => (
              <div className="card" key={nov.id} style={{ opacity: nov.activa ? 1 : 0.6 }}>
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>{nov.titulo}</h3>
                    <span className="category-badge badge-reciclaje">{nov.activa ? 'Visible' : 'Oculta'}</span>
                  </div>
                  <p className="info-p" style={{ marginTop: '6px' }}>{nov.descripcion}</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                    <button
                      type="button"
                      disabled={enviandoPushId === nov.id}
                      onClick={() => dispararNotificacionPush(nov, true)}
                      className="btn-filter active"
                    >
                      <i className="fa-solid fa-bell"></i>{' '}
                      {enviandoPushId === nov.id ? 'Enviando...' : 'Enviar Push'}
                    </button>
                    <button type="button" onClick={() => toggleActivaNov(nov.id, nov.activa)} className="btn-filter">
                      {nov.activa ? 'Ocultar' : 'Mostrar'}
                    </button>
                    <button type="button" onClick={() => eliminarNov(nov.id)} className="btn-filter" style={{ color: '#dc2626' }}>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODERACIÓN DE CERO BASURA (DONACIONES Y PEDIDOS) */}
      {tabAdmin === 'donaciones' && (
        <div className="grid-org">
          {donaciones.length === 0 ? (
            <p style={{ color: '#64748b' }}>Todavía no hay publicaciones de vecinos.</p>
          ) : (
            donaciones.map((item) => (
              <div className="card" key={item.id}>
                {item.imagen_url && (
                  <div className="card-banner">
                    <img src={item.imagen_url} className="banner-img" alt={item.titulo} />
                  </div>
                )}
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                    <span className={`category-badge ${item.tipo === 'dono' ? 'badge-dono' : 'badge-busco'}`}>
                      {item.tipo === 'dono' ? 'Dono' : 'Busco'}
                    </span>
                    <span
                      className="category-badge"
                      style={{
                        background:
                          item.estado === 'aprobado'
                            ? '#dcfce7'
                            : item.estado === 'pendiente'
                            ? '#fef3c7'
                            : '#f1f5f9',
                        color:
                          item.estado === 'aprobado'
                            ? '#166534'
                            : item.estado === 'pendiente'
                            ? '#92400e'
                            : '#475569',
                      }}
                    >
                      {item.estado}
                    </span>
                  </div>

                  <h3 style={{ margin: '8px 0 4px 0' }}>{item.titulo}</h3>
                  <p className="info-p">{item.descripcion}</p>
                  <p className="info-p">
                    <i className="fa-solid fa-location-dot"></i> {item.barrio} ·{' '}
                    <i className="fa-brands fa-whatsapp"></i> {item.whatsapp}
                  </p>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {item.estado !== 'aprobado' && (
                      <button
                        type="button"
                        onClick={() => cambiarEstadoDonacion(item.id, 'aprobado')}
                        className="btn-filter active"
                      >
                        <i className="fa-solid fa-check"></i> Aprobar
                      </button>
                    )}
                    {item.estado === 'aprobado' && (
                      <button
                        type="button"
                        onClick={() => cambiarEstadoDonacion(item.id, 'entregado')}
                        className="btn-filter"
                      >
                        <i className="fa-solid fa-box-check"></i> Marcar Entregado
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => eliminarDonacion(item.id)}
                      className="btn-filter"
                      style={{ color: '#dc2626' }}
                    >
                      <i className="fa-solid fa-trash"></i> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}