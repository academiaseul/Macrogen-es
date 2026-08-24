# Cómo crear Google Analytics 4 + Microsoft Clarity

**Tiempo total: 12-15 minutos**
**Costo: 0€/mes (ambas son gratuitas para siempre)**

Una vez tengas los IDs (los pasos 6 y 11 abajo), pásamelos y los inyecto en las 22 páginas. Mientras tanto, ya dejé el código preparado con los placeholders `G-PLACEHOLDER` y `CLARITY-PLACEHOLDER` — cuando reemplaces, los analytics empiezan a registrar datos automáticamente.

---

## Parte 1 · Google Analytics 4 (7 minutos)

GA4 es la herramienta gratuita de Google que muestra cuántos visitantes llegan, de dónde vienen, qué páginas ven, qué buscan, qué CTAs convierten, etc.

### Pasos

1. Abre **https://analytics.google.com/** en una pestaña nueva.

2. Inicia sesión con la cuenta de Google que quieras usar para administrar el sitio (recomendado: una cuenta corporativa tipo `marketing@macrogen.com` o tu correo personal — luego puedes invitar a más usuarios).

3. Click en **"Empezar a medir"** (botón azul grande).

4. Configura la **Cuenta**:
   - Nombre de cuenta: `Macrogen Iberoamérica`
   - Acepta los términos de uso
   - Click **Siguiente**

5. Configura la **Propiedad**:
   - Nombre de propiedad: `macrogen-es.com`
   - Zona horaria: `(GMT-04:00) Santiago` (o Madrid, da igual — luego puedes cambiarla)
   - Moneda: `Dólar estadounidense (USD)` (más universal para reportes)
   - Click **Siguiente**

6. Configura **Detalles del negocio**:
   - Sector: `Ciencia` o `Salud y medicina`
   - Tamaño: `Pequeño - 1-10 empleados` (luego se actualiza solo)
   - Click **Siguiente**

7. **Objetivos comerciales**:
   - Marca: ✅ "Generar oportunidades de venta", ✅ "Examinar el comportamiento de los usuarios"
   - Click **Crear**
   - Acepta los términos del servicio

8. Configura el **Stream de datos**:
   - Plataforma: **Web**
   - URL del sitio web: `https://macrogen-es.com` (sin barra al final)
   - Nombre del flujo: `Macrogen Iberoamérica Web`
   - Deja activado "Medición mejorada" (clicks, scrolls, descargas, etc.)
   - Click **Crear stream**

9. **¡Aquí está tu ID!** En la pantalla siguiente verás:
   - **ID de medición**: algo como `G-XXXXXXXXXX` (10 caracteres después de `G-`)
   - Cópialo y pásamelo

---

## Parte 2 · Microsoft Clarity (5 minutos)

Clarity es como tener una cámara que graba (anonimizado) cómo cada visitante usa el sitio: dónde hace click, qué scrollea, dónde se frustra. Gratis para siempre, sin límite de tráfico.

### Pasos

1. Abre **https://clarity.microsoft.com/** en una pestaña nueva.

2. Click **"Get started"** (botón azul arriba derecha).

3. Inicia sesión con cuenta de Microsoft, Google o Facebook (la que prefieras administrar).

4. Click **"Create new project"** o **"+ New project"**.

5. Configura el proyecto:
   - **Name**: `Macrogen Iberoamérica`
   - **Website URL**: `https://macrogen-es.com`
   - **Site category**: `Healthcare` o `Science`
   - Click **Create**

6. En la pantalla siguiente verás 3 opciones de instalación. **Elige "Install tracking code manually"** (la tercera opción).

7. Verás un código JavaScript que empieza con:
   ```html
   <script type="text/javascript">
       (function(c,l,a,r,i,t,y){...})(window, document, "clarity", "script", "XXXXXXXXXX");
   </script>
   ```

8. **¡Aquí está tu ID!** Es la cadena entre comillas al final, algo como `r1k2j3l4m5` (10 caracteres alfanuméricos). Cópialo y pásamelo.

---

## Parte 3 · Qué hago yo después

Cuando me pases los 2 IDs:

```
GA4: G-XXXXXXXXXX
Clarity: r1k2j3l4m5
```

Yo reemplazo los placeholders en las 22 páginas con un find-and-replace masivo (toma 1 minuto). Después tú haces commit + push en GitHub Desktop, Vercel deploya automáticamente, y en 5-10 minutos GA4 empezará a mostrar datos en tiempo real bajo "Reports → Realtime".

---

## Bonus · Lo que verás los primeros días

**GA4 (necesita 24-48h para datos completos):**
- Cuántos visitantes únicos llegan al día
- De qué países (España vs Chile vs Perú vs otros)
- De qué fuentes (Google búsqueda, LinkedIn, directo, etc.)
- Qué páginas ven más
- Tiempo promedio en sitio
- Tasa de rebote
- Conversiones (envíos del formulario contacto)

**Clarity (datos al instante):**
- Heatmaps: dónde la gente hace click más
- Scrollmaps: hasta dónde scrollean en cada página
- Session recordings: video anonimizado de sesiones reales (oro puro para detectar fricción UX)
- Rage clicks: dónde la gente clickea repetido por frustración
- Dead clicks: dónde clickean algo que NO es interactivo

---

## Pregunta frecuente

**¿Esto cumple con GDPR / Ley 21.719 Chile?**
Sí, siempre que tengas el cookie banner activo (lo configuro después con Cookiebot gratis). Los visitantes pueden rechazar tracking; si rechazan, GA4 + Clarity respetan el opt-out y no graban nada.

**¿Puedo invitar a Jay Kim, Cha-sh y otros del equipo?**
Sí, en GA4: Admin → Property Access Management → Add users. En Clarity: Settings → Team. Recomiendo darles rol "Viewer" para reportes, "Editor" solo a quien cambia configuración.
