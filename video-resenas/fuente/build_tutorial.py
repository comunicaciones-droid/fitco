# Genera tutorial.html (video paso a paso para calificar la app) y tutorial_sfx.json (efectos de sonido).
# Uso: python3 build_tutorial.py
import json

DURATION = 47.0
SFX = []  # (tiempo, tipo, extra)


def sfx(t, kind, **kw):
    SFX.append(dict(t=round(t, 3), kind=kind, **kw))


STAR = 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z'
PLAY = ('<path fill="#00D7FE" d="M1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924z"/>'
        '<path fill="#00F076" d="M13.544 10.989l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973z"/>'
        '<path fill="#FF3A44" d="M13.544 13.056l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z"/>'
        '<path fill="#FFC900" d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594z"/>')
APPLE = ('M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 '
         '1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 '
         '3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559'
         '-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052'
         '-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701')


def play_icon(sz):
    return f'<svg width="{sz}" height="{sz}" viewBox="0 0 24 24">{PLAY}</svg>'


def apple_icon(sz, col='#fff'):
    return f'<svg width="{sz}" height="{sz}" viewBox="0 0 24 24"><path fill="{col}" d="{APPLE}"/></svg>'


def stars(n, size, d0=None, step=0.12, cls='star', color=None, gap=0, outline=None):
    """Fila de estrellas. d0=None => estrellas ya llenas (sin animación)."""
    out = []
    for i in range(n):
        st = f'--s:{size}px;margin-right:{gap}px;'
        if color:
            st += f'--sc:{color};'
        if outline:
            st += f'--so:{outline};'
        if d0 is None:
            st += '--d:-10s;'
        else:
            st += f'--d:{d0 + i * step:.2f}s;'
        out.append(f'<svg class="{cls}" style="{st}" viewBox="0 0 24 24"><path d="{STAR}"/></svg>')
    return ''.join(out)


def words(text, d0, step=0.08, cls='w'):
    """Separa en palabras animadas. *palabra* => resaltada."""
    out = []
    for i, w in enumerate(text.split(' ')):
        hl = w.startswith('*')
        w = w.strip('*')
        c = cls + (' gx' if hl else '')
        out.append(f'<span class="{c}" style="--d:{d0 + i * step:.2f}s">{w} </span>')
    return ''.join(out)


# Coordenadas: el teléfono va centrado; origen de la pantalla en el escenario
PH_L, PH_T = 230, 600
SC_X, SC_Y = PH_L + 18, PH_T + 18


def tap(t, x, y, kind='tap'):
    """Mano + círculo de toque en coordenadas de la pantalla del teléfono."""
    X, Y = SC_X + x, SC_Y + y
    sfx(t, 'tap')
    return (f'<div class="touch" style="left:{X}px;top:{Y}px;--d:{t:.2f}s"></div>'
            f'<div class="ripple" style="left:{X}px;top:{Y}px;--d:{t + .05:.2f}s"></div>'
            f'<div class="hand emoji" style="left:{X - 42}px;top:{Y - 8}px;--d:{t - .7:.2f}s">👆</div>')


def point(t0, t1, x, y):
    X, Y = SC_X + x, SC_Y + y
    return f'<div class="hand point emoji" style="left:{X - 42}px;top:{Y - 8}px;--d:{t0:.2f}s;--o:{t1:.2f}s">👆</div>'


def step_header(n, html, t_in, t_out):
    sfx(t_in, 'step')
    return f'''<div class="step" style="--d:{t_in:.2f}s;--o:{t_out:.2f}s">
  <div class="num">{n}</div><div class="stxt">{html}</div></div>'''


def typed(text, t0, step=0.16):
    out = []
    for i, ch in enumerate(text):
        out.append(f'<span class="ch" style="--d:{t0 + i * step:.2f}s">{ch}</span>')
        sfx(t0 + i * step, 'key')
    return ''.join(out)


def platform_scene(kind, T):
    """kind = 'ios' | 'android'; T = inicio de la escena. Cada paso dura 5 s."""
    ios = kind == 'ios'
    s1, s2, s3, end = T + 1.0, T + 6.0, T + 11.0, T + 16.0
    blue = '#0a7aff' if ios else '#01875f'
    chip = (f'{apple_icon(46)}<div><small>Si tienes iPhone</small><b>App Store</b></div>' if ios else
            f'{play_icon(46)}<div><small>Si tienes Android</small><b>Google Play</b></div>')
    sfx(T + .2, 'pop')
    sfx(T + .3, 'whooshUp')
    h = []
    h.append(f'<div class="scene" style="--start:{T}s;--len:{end - T + .01:.2f}s;background:var(--n)">')
    h.append('<div class="orb" style="width:760px;height:760px;left:160px;top:900px;background:rgba(29,205,159,.30)"></div><div class="dots"></div>')
    # barra de progreso tipo historias
    h.append('<div class="prog">' + ''.join(
        f'<div><i style="--d:{a:.2f}s;--len:{b - a:.2f}s"></i></div>' for a, b in ((s1, s2), (s2, s3), (s3, end))) + '</div>')
    h.append(f'<div class="chip popin" style="--d:{T + .2:.2f}s">{chip}</div>')

    if ios:
        h1 = 'Abre la <b>App Store</b> y busca <b class="g">“Fitco”</b>'
        h2 = 'Entra a la app y desliza hasta <b class="g">“Calificaciones y reseñas”</b>'
        h3 = 'Toca la <b class="g">5.ª estrella</b> ⭐ y luego <b class="g">“Enviar”</b>'
    else:
        h1 = 'Abre <b>Google Play</b> y busca <b class="g">“Fitco”</b>'
        h2 = 'Entra a la app y desliza hasta <b class="g">“Calificar esta app”</b>'
        h3 = 'Toca la <b class="g">5.ª estrella</b> ⭐ y luego <b class="g">“Publicar”</b>'
    h.append(step_header(1, h1, s1, s2))
    h.append(step_header(2, h2, s2, s3))
    h.append(step_header(3, h3, s3, end + 1))

    # ---------- teléfono ----------
    h.append(f'<div class="abs" style="left:{PH_L}px;top:{PH_T}px;animation:phoneUp .8s var(--ease) {T + .35:.2f}s both">')
    sfx(T + .35, 'whoosh')
    h.append('<div class="phone"><div class="screen">')
    h.append(f'<div class="sbbg"></div><div class="island"></div><div class="sb">9:41</div><div class="sbr">▂▄▆ ᯤ ▭</div>')

    # Pantalla A: búsqueda
    h.append(f'<div class="scr" style="animation:outL .5s var(--ease) {s2:.2f}s forwards">')
    if ios:
        h.append('<div class="abs" style="top:100px;left:32px;font-size:50px;font-weight:800">Buscar</div>')
        fy = 190
        h.append(f'<div class="abs field ios" style="top:{fy}px"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#8a8f99" stroke-width="2.6" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="7"/><path d="M16 16l5 5"/></svg>'
                 f'<span class="ph" style="--o:{s1 + 1.5:.2f}s">Juegos, apps y más</span><span class="typed">{typed("Fitco", s1 + 1.5)}</span></div>')
        ry = 300
    else:
        h.append('<div class="abs" style="top:92px;left:28px;display:flex;align-items:center;gap:12px;font-size:34px;font-weight:500;color:#5f6368">' + play_icon(44) + 'Google Play</div>')
        fy = 170
        h.append(f'<div class="abs field and" style="top:{fy}px"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#5f6368" stroke-width="2.6" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="7"/><path d="M16 16l5 5"/></svg>'
                 f'<span class="ph" style="--o:{s1 + 1.5:.2f}s">Buscar apps y juegos</span><span class="typed">{typed("Fitco", s1 + 1.5)}</span></div>')
        ry = 290
    # resultado
    icon_bg = 'linear-gradient(145deg,#2a8f8a,#1f6f6e)' if ios else 'linear-gradient(145deg,#2fe0c0,#04c6c9)'
    btn = ('<div class="pill" style="background:#0a7aff">Abrir</div>' if ios else
           '<div class="pill" style="background:#01875f">Abrir</div>')
    sub = 'Salud y fitness' if ios else 'FITCO · 4.5 ★'
    h.append(f'<div class="abs result2" style="top:{ry}px;--d:{s1 + 2.6:.2f}s">'
             f'<div class="ic" style="background:{icon_bg}"><img src="logo_icon.png"></div>'
             f'<div style="flex:1"><div style="font-size:32px;font-weight:700">FITCO</div><div style="font-size:22px;color:#80868b">{sub}</div></div>{btn}</div>')
    sfx(s1 + 2.6, 'pop')
    for i in range(3):
        h.append(f'<div class="abs thumb" style="top:{ry + 150}px;left:{28 + i * 182}px;--d:{s1 + 2.8 + i * .08:.2f}s">'
                 f'<i style="top:30px;width:60%"></i><i style="top:60px;width:80%"></i><i style="top:120px;height:44px"></i><i style="top:180px;height:44px"></i><i style="top:240px;height:44px"></i></div>')
    h.append('</div>')  # fin pantalla A

    # Pantalla B/C: ficha de la app
    h.append(f'<div class="scr" style="transform:translateX(100%);animation:inR .5s var(--ease) {s2:.2f}s forwards">')
    sfx(s2, 'swipe')
    h.append(f'<div class="abs" style="left:0;right:0;top:0;height:1900px;animation:scrollUp 1.1s cubic-bezier(.6,0,.2,1) {s2 + 1.3:.2f}s both">')
    sfx(s2 + 1.3, 'scroll')
    h.append('<div class="abs back" style="top:90px;left:28px">‹</div>' if ios else
             '<div class="abs" style="top:92px;left:30px;font-size:44px;color:#3c4043">←</div>')
    h.append(f'<div class="abs ic" style="top:170px;left:30px;width:170px;height:170px;border-radius:{40 if ios else 36}px;background:{icon_bg}"><img src="logo_icon.png" style="width:125px"></div>')
    if ios:
        h.append('<div class="abs" style="top:180px;left:230px;font-size:42px;font-weight:800">FITCO</div>'
                 '<div class="abs" style="top:240px;left:230px;font-size:24px;color:#8a8f99">FITCO S.A.C.</div>'
                 '<div class="abs pill" style="top:290px;left:230px;background:#0a7aff">Abrir</div>')
        h.append('<div class="abs inforow" style="top:390px">'
                 '<div><small>EDAD</small><b>9+</b><small>Años</small></div>'
                 '<div><small>CATEGORÍA</small><b>#114</b><small>Salud y fitness</small></div>'
                 '<div><small>DESARROLLADOR</small><b>👤</b><small>FITCO S.A.C.</small></div></div>')
        h.append('<div class="abs" style="top:540px;left:30px;font-size:34px;font-weight:800">Novedades ›</div>'
                 '<div class="abs" style="top:595px;left:30px;font-size:22px;color:#8a8f99">Versión 5.4.23</div>'
                 '<div class="abs" style="top:630px;left:30px;font-size:24px">Mejoras visuales.</div>'
                 '<div class="abs" style="top:720px;left:30px;font-size:34px;font-weight:800">Vista previa</div>')
    else:
        h.append('<div class="abs" style="top:180px;left:230px;font-size:46px;font-weight:600">FITCO</div>'
                 '<div class="abs" style="top:245px;left:230px;font-size:28px;color:#01875f;font-weight:600">FITCO</div>')
        h.append('<div class="abs inforow and" style="top:380px">'
                 '<div><b>4.5 ★</b><small>234 opiniones</small></div>'
                 '<div><b style="font-size:24px;border:2px solid #3c4043;padding:0 6px">E</b><small>Todo público</small></div>'
                 '<div><b>100 k+</b><small>Descargas</small></div></div>'
                 '<div class="abs" style="top:500px;left:30px;right:30px;height:70px;border-radius:14px;background:#01875f;color:#fff;font-size:28px;font-weight:600;display:grid;place-items:center">Abrir</div>'
                 '<div class="abs" style="top:620px;left:30px;font-size:32px;font-weight:600">Información de la app →</div>'
                 '<div class="abs" style="top:670px;left:30px;right:30px;font-size:22px;color:#5f6368;line-height:1.4">Reserva tus clases, compra membresías y gestiona tu gimnasio.</div>')
    for i in range(3):
        h.append(f'<div class="abs thumb" style="top:790px;left:{28 + i * 182}px;opacity:1;animation:none">'
                 f'<i style="top:30px;width:60%"></i><i style="top:60px;width:80%"></i><i style="top:120px;height:44px"></i><i style="top:180px;height:44px"></i><i style="top:240px;height:44px"></i></div>')
    # sección de calificar (en y≈1100 antes del scroll; scroll = -600)
    if ios:
        h.append('<div class="abs" style="top:1110px;left:30px;font-size:34px;font-weight:800">Calificaciones y reseñas ›</div>'
                 '<div class="abs" style="top:1180px;left:30px;font-size:24px;color:#3c4043">Toca para calificar:</div>'
                 f'<div class="abs" style="top:1168px;left:286px;white-space:nowrap">{stars(5, 50, s3 + .55, .1, "ostar", blue, 4)}</div>'
                 '<div class="abs" style="top:1260px;left:30px;font-size:26px;color:#0a7aff;font-weight:500">✎ Escribir una reseña</div>'
                 '<div class="abs" style="top:1320px;left:30px;font-size:26px;color:#0a7aff;font-weight:500">ⓘ Soporte de la app</div>')
        hl = (20, 555, 544, 90)  # x,y,w,h tras scroll
        star5 = (286 + 4 * 54 + 25, 568 + 25)
    else:
        h.append('<div class="abs" style="top:1080px;left:30px;font-size:34px;font-weight:600">Calificar esta app</div>'
                 '<div class="abs" style="top:1130px;left:30px;font-size:23px;color:#5f6368">Cuéntanos lo que piensas</div>'
                 f'<div class="abs" style="top:1180px;left:38px;white-space:nowrap">{stars(5, 64, s3 + .55, .1, "ostar", blue, 47, "#5f6368")}</div>'
                 '<div class="abs" style="top:1290px;left:30px;font-size:26px;color:#01875f;font-weight:600">Escribir una opinión</div>')
        hl = (20, 565, 544, 100)
        star5 = (38 + 4 * 111 + 32, 580 + 32)
    h.append('</div>')  # fin contenido desplazable
    # resaltado de la zona de estrellas
    x, y, w, hh = hl
    h.append(f'<div class="abs hlbox" style="left:{x}px;top:{y}px;width:{w}px;height:{hh}px;--d:{s2 + 2.5:.2f}s;--o:{s3 + .3:.2f}s"></div>')
    sfx(s2 + 2.5, 'ding', note=84)

    # hoja / diálogo para enviar
    sheet_t = s3 + 1.6
    if ios:
        h.append(f'<div class="abs sheet" style="top:330px;--d:{sheet_t:.2f}s">'
                 '<div style="display:flex;justify-content:space-between;align-items:center;font-size:23px;padding:26px 26px 18px">'
                 '<span style="color:#0a7aff">Cancelar</span><b style="font-size:24px">Escribir una reseña</b><b style="color:#0a7aff">Enviar</b></div>'
                 f'<div style="text-align:center;padding:10px 0 18px">{stars(5, 58, None, 0, "ostar", blue, 8)}</div>'
                 '<div style="margin:0 26px;border-top:1px solid #e3e5ea;padding:20px 0;font-size:26px;font-weight:600">'
                 f'{typed("¡Excelente app!", sheet_t + .7, .07)}</div>'
                 '<div style="margin:0 26px;border-top:1px solid #e3e5ea;padding:20px 0;font-size:23px;color:#a0a5ae">Reseña (opcional)</div></div>')
        send = (520, 330 + 46)
    else:
        h.append(f'<div class="abs sheet and" style="top:360px;--d:{sheet_t:.2f}s">'
                 f'<div style="display:flex;gap:18px;align-items:center;padding:30px 30px 10px"><div class="ic" style="width:70px;height:70px;border-radius:16px;background:{icon_bg}"><img src="logo_icon.png" style="width:50px"></div>'
                 '<div><b style="font-size:28px">FITCO</b><div style="font-size:20px;color:#5f6368">Calificar esta app</div></div></div>'
                 f'<div style="padding:16px 30px;white-space:nowrap">{stars(5, 60, None, 0, "ostar", blue, 30, "#5f6368")}</div>'
                 '<div style="margin:6px 30px;border:2px solid #01875f;border-radius:10px;height:150px;padding:16px;font-size:24px">'
                 f'{typed("¡Excelente app!", sheet_t + .7, .07)}</div>'
                 '<div style="display:flex;justify-content:flex-end;padding:24px 30px"><div class="pill" style="background:#01875f;font-size:26px;padding:16px 40px">Publicar</div></div></div>')
        send = (450, 360 + 420)
    h.append(f'<div class="abs toast" style="--d:{s3 + 4.2:.2f}s">✓ {"¡Reseña enviada!" if ios else "¡Opinión publicada!"}</div>')
    h.append('</div>')  # fin pantalla B
    h.append('</div></div></div>')  # screen, phone, wrapper

    # gestos (en el escenario, encima del teléfono)
    h.append(tap(s1 + 1.0, 290, fy + 34))
    h.append(tap(s1 + 3.9, 250, ry + 60))
    h.append(point(s2 + 2.6, s3 + .3, star5[0], star5[1] + 30))
    h.append(tap(s3 + .45, star5[0], star5[1]))
    for i in range(5):
        sfx(s3 + .55 + i * .1, 'ding', note=[76, 79, 81, 84, 88][i])
    sfx(sheet_t, 'whooshUp')
    h.append(tap(s3 + 3.75, *send))
    sfx(s3 + 4.2, 'success')
    h.append('</div>')
    return '\n'.join(h)


# ------------------------------------------------------------------
parts = []

# ESCENA 1: introducción (0 - 6.5)
sfx(0.05, 'whoosh')
sfx(0.2, 'pop')
parts.append(f'''
<div class="scene" style="--start:0s;--len:6.51s;background:var(--n)">
 <div class="orb" style="width:700px;height:700px;left:-260px;top:-160px;background:rgba(29,205,159,.45)"></div>
 <div class="orb" style="width:620px;height:620px;right:-260px;bottom:120px;background:rgba(29,205,159,.3);animation-delay:-4s"></div>
 <div class="dots"></div>
 <div class="ringfx" style="left:540px;top:900px;--d:0s"></div>
 <img class="abs popin" src="logo.png" style="left:390px;top:170px;width:300px;--d:.2s">
 <div class="abs" style="left:60px;right:60px;top:390px;text-align:center;color:var(--g);font-size:60px;font-weight:800">{words('¡Hola, promotor Fitco!', .6, .1)}<span class="w emoji" style="--d:1.0s"><span class="wave">👋</span></span></div>
 <div class="abs" style="left:70px;right:70px;top:500px;text-align:center;color:#fff;font-size:58px;font-weight:700;line-height:1.2">{words('Ayúdanos a crecer calificando la app de Fitco con', 1.4, .09)}</div>
 <div class="abs" style="left:0;right:0;top:720px;text-align:center;white-space:nowrap">{stars(5, 120, 2.5, .14, 'star', '#1dcd9f', 10)}</div>
 <div class="abs" style="left:0;right:0;top:880px;text-align:center"><span class="popin" style="--d:3.3s;display:inline-block;background:var(--g);color:var(--n);font-size:46px;font-weight:800;border-radius:999px;padding:12px 44px">5 estrellas</span></div>
 <div class="abs" style="left:60px;right:60px;top:1060px;text-align:center;color:#fff;font-size:48px;font-weight:600">{words('Te mostramos cómo, *paso* *a* *paso*', 3.9, .09)}<span class="w emoji" style="--d:4.4s"><span style="display:inline-block;animation:floaty 1s ease-in-out infinite">👇</span></span></div>
 <div class="abs" style="left:0;right:0;top:1200px;display:flex;justify-content:center;gap:22px">
  <div class="badge popin" style="--d:4.7s">{apple_icon(54)}<div><small>iPhone</small><b>App Store</b></div></div>
  <div class="badge popin" style="--d:4.85s">{play_icon(54)}<div><small>Android</small><b>Google Play</b></div></div>
 </div>
</div>''')
for i in range(5):
    sfx(2.5 + i * .14, 'ding', note=[72, 76, 79, 84, 88][i])
sfx(3.3, 'pop')
sfx(4.7, 'pop')
sfx(4.85, 'pop')

parts.append(platform_scene('ios', 6.5))
parts.append(platform_scene('android', 22.5))

# ESCENA 4: alumnos (38.5 - 43.3)
C = 38.5
sfx(C + .3, 'whoosh')
parts.append(f'''
<div class="scene" style="--start:{C}s;--len:4.81s;background:var(--g)">
 <div id="hearts"></div>
 <div class="abs" style="left:60px;right:60px;top:250px;text-align:center;color:#fff;font-size:52px;font-weight:700">{words('Y no olvides…', C + .3, .1)}<span class="w emoji" style="--d:{C + .5:.2f}s">💡</span></div>
 <div class="abs" style="left:50px;right:50px;top:350px;text-align:center;color:var(--n);font-size:62px;font-weight:800;line-height:1.15;letter-spacing:-1px">{words('Incentiva a tus alumnos a que también califiquen la app con', C + .7, .08)}</div>
 <div class="abs" style="left:0;right:0;top:640px;text-align:center;white-space:nowrap">{stars(5, 120, C + 1.7, .12, 'star', '#ffffff', 10)}</div>
 <div class="abs bubble" style="left:60px;top:860px;max-width:640px;opacity:0;animation:slideL .55s var(--back) {C + 2.4:.2f}s both"><div class="bst">★★★★★</div>¡Reservar mis clases es súper fácil!</div>
 <div class="abs bubble" style="right:60px;top:1060px;max-width:600px;opacity:0;animation:slideR .55s var(--back) {C + 2.8:.2f}s both"><div class="bst">★★★★★</div>Me encanta la app <span class="emoji">💪</span></div>
 <div class="abs bubble" style="left:110px;top:1260px;max-width:640px;opacity:0;animation:slideL .55s var(--back) {C + 3.2:.2f}s both"><div class="bst">★★★★★</div>Todo desde mi celular <span class="emoji">📲</span></div>
</div>''')
for i in range(5):
    sfx(C + 1.7 + i * .12, 'ding', note=[76, 79, 81, 84, 88][i])
for k in (2.4, 2.8, 3.2):
    sfx(C + k, 'pop')

# ESCENA 5: cierre (43.3 - 47)
E = 43.3
sfx(E + .3, 'pop')
parts.append(f'''
<div class="scene" style="--start:{E}s;--len:3.71s;background:var(--n)">
 <div class="orb" style="width:700px;height:700px;left:190px;top:500px;background:rgba(29,205,159,.35)"></div>
 <div class="dots"></div>
 <div class="ringfx" style="left:540px;top:720px;--d:{E + .3:.2f}s"></div>
 <div class="abs popin" style="left:150px;top:560px;width:780px;height:320px;border-radius:60px;background:#fff1;border:2px solid #ffffff22;display:grid;place-items:center;--d:{E + .3:.2f}s"><img src="logo.png" style="width:600px"></div>
 <div class="abs" style="left:60px;right:60px;top:960px;text-align:center;color:#fff;font-size:62px;font-weight:800;line-height:1.15">{words('¡Gracias por ayudarnos a *crecer!*', E + .7, .1)}<span class="w emoji" style="--d:{E + 1.2:.2f}s"><span style="display:inline-block;animation:floaty .9s ease-in-out infinite">💚</span></span></div>
 <div class="abs" style="left:0;right:0;top:1180px;display:flex;justify-content:center;gap:22px">
  <div class="badge popin" style="--d:{E + 1.5:.2f}s;background:#fff;color:var(--n)">{play_icon(54)}<div><small>DISPONIBLE EN</small><b>Google Play</b></div></div>
  <div class="badge popin" style="--d:{E + 1.65:.2f}s;background:#fff;color:var(--n)">{apple_icon(50, '#192242')}<div><small>Descárgalo en el</small><b>App Store</b></div></div>
 </div>
</div>''')
sfx(E + 1.5, 'pop')
sfx(E + 1.65, 'pop')
sfx(E + 1.9, 'chime')

WIPES = [(6.5, '#1dcd9f', '#192242'), (22.5, '#1dcd9f', '#192242'), (38.5, '#ffffff', '#1dcd9f'), (43.3, '#1dcd9f', '#192242')]
wipes = ''
for t, c1, c2 in WIPES:
    wipes += f'<div class="wipe" style="--d:{t - .42:.2f}s;background:{c1}"></div><div class="wipe" style="--d:{t - .34:.2f}s;background:{c2}"></div>\n'
    sfx(t - .42, 'wipe')

CSS = open('tutorial.css').read()
html = f'''<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Fitco Califica</title>
<style>{CSS}</style></head>
<body><div class="stage">
{''.join(parts)}
{wipes}
</div>
<script>
window.DURATION={DURATION};
let s=11;const rnd=()=>{{s=(s*16807)%2147483647;return s/2147483647}};
const hearts=document.getElementById('hearts');
for(let i=0;i<16;i++){{const e=document.createElement('div');e.className='heart';const sz=50+rnd()*80;
 e.innerHTML=`<svg width="${{sz}}" height="${{sz}}" viewBox="0 0 24 24"><path fill="${{i%3?'rgba(255,255,255,.5)':'rgba(25,34,66,.3)'}}" d="M12 21s-8.5-5.3-8.5-11.2A4.8 4.8 0 0112 6.7a4.8 4.8 0 018.5 3.1C20.5 15.7 12 21 12 21z"/></svg>`;
 e.style.cssText=`left:${{rnd()*1000}}px;--dur:${{3+rnd()*2}}s;--d:${{-rnd()*4}}s;--r:${{(rnd()*80-40)|0}}deg`;hearts.appendChild(e);}}
window.seek=t=>{{document.getAnimations().forEach(a=>{{a.pause();a.currentTime=t*1000}})}};
</script></body></html>'''
open('tutorial.html', 'w').write(html)
json.dump(dict(duration=DURATION, sfx=SFX, drops=[6.5, 22.5, 38.5]), open('tutorial_sfx.json', 'w'), indent=0)
print('ok', len(SFX), 'sfx')
