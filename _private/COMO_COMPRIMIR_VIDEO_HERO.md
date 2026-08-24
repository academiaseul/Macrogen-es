# Cómo comprimir el video hero · 17MB → ~3MB

**Tiempo total: 5-10 minutos**
**Costo: 0€ (todas las opciones gratuitas)**

## Por qué hay que comprimirlo

| Métrica | 17MB actual | Target ~3MB | Por qué importa |
|---|---|---|---|
| iOS Safari autoplay (cellular) | ❌ Bloqueado | ✅ Funciona | Apple bloquea autoplay >10MB en datos móviles |
| Largest Contentful Paint | ~4-6s | ~1-1.5s | Google penaliza SEO si LCP > 2.5s |
| Vercel bandwidth gratis | 5.880 visitas/mes | 33.000 visitas/mes | A 17MB te quedas sin tier free rápido |
| Mobile data plans | 17MB descargados | 3MB descargados | El usuario te lo agradece |

---

## Opción A · HandBrake (GUI, recomendado) · 8 minutos

HandBrake es gratis, oficial, sin marca de agua, y produce calidad profesional.

### Instalación

1. Descarga desde **https://handbrake.fr/downloads.php**
2. Click en "Download HandBrake X.X.X" para Windows
3. Instala normalmente (next, next, finish)

### Configuración exacta

1. Abre HandBrake
2. Click **"Open Source"** arriba a la izquierda → selecciona tu archivo `14774636_1920_1080_30fps.mp4` (donde lo tengas)
3. En **"Save As"** abajo: pon `dna-hero.mp4` y elige guardarlo en una carpeta donde lo encuentres fácil (ej. Desktop)

4. **Pestaña "Summary"**:
   - Format: **MP4**
   - ✅ Web Optimized (importante — pone metadata al inicio para streaming)
   - ❌ Align A/V Start (déjalo desmarcado)

5. **Pestaña "Dimensions"**:
   - Resolution Limit: **HD 720p (1280×720)** ← reduce de 1920x1080, ahorra mucho peso
   - Anamorphic: None
   - Cropping: Automatic

6. **Pestaña "Video"**:
   - Video Encoder: **H.264 (x264)**
   - Framerate (FPS): **24** (Constant Framerate) ← baja de 30, ahorra ~20%
   - Quality: **Constant Quality, RF 24** ← este es el dial mágico (RF más alto = más compresión, más bajo = más calidad). RF 24 es el sweet spot para hero videos.
   - Encoder Preset: **Slow** (sí, "Slow" — produce mejor compresión pero tarda más en codificar; vale la pena los 2 min extra)
   - Encoder Profile: **Main**
   - Encoder Level: **Auto**
   - Encoder Tune: déjalo por defecto

7. **Pestaña "Audio"**:
   - Click en **"Reset"** y luego elimina TODAS las pistas de audio (botón "−" o similar)
   - El hero está muted, no necesita audio → ahorra ~2MB
   - Si no te deja eliminar, configura: Codec = "AAC", Bitrate = "32 kbps" (mínimo posible)

8. **Pestaña "Subtitles"**: déjalo vacío

9. Click **"Start Encode"** arriba

10. Espera 2-5 minutos (depende de tu CPU)

11. Cuando termine, ve a la carpeta donde guardaste `dna-hero.mp4` y verifica el tamaño:
    - ✅ Si pesa entre **2-5 MB** estás perfecto
    - ⚠️ Si pesa más de 5 MB, vuelve a HandBrake y sube RF a 26 o 28
    - ⚠️ Si pesa menos de 1 MB, baja RF a 22 (estás perdiendo calidad innecesaria)

12. Copia el `dna-hero.mp4` final a:
    ```
    C:\Users\Chingu\Documents\Claude\Projects\Macrogen-es\assets\video\dna-hero.mp4
    ```
    Sobrescribe el de 17MB que ya tienes ahí.

13. Push a GitHub Desktop → Vercel deploy → test en celular

---

## Opción B · CloudConvert online · 3 minutos

Si no quieres instalar nada. Limitación: gratis hasta 1GB/día (más que suficiente para 1 video).

1. Ve a **https://cloudconvert.com/mp4-converter**
2. Click "Select File" → sube tu `14774636_1920_1080_30fps.mp4`
3. Click el ícono de **engranaje ⚙️** al lado del archivo (settings)
4. Configura:
   - Video Codec: **H.264**
   - Video Resolution: **1280x720**
   - Video Quality: **CRF 24**
   - Audio Codec: **None** (o si no aparece, deja AAC y bitrate 32 kbps)
   - Frame Rate: **24**
5. Click **"Convert"**
6. Espera ~1 min
7. Click **"Download"** del archivo resultado
8. Renómbralo a `dna-hero.mp4`
9. Copia a `assets/video/dna-hero.mp4` en el proyecto
10. Push

---

## Opción C · ffmpeg (CLI, si te gusta la terminal) · 1 comando

Si tienes ffmpeg instalado (chocolatey, scoop, o winget en Windows):

```bash
ffmpeg -i "14774636_1920_1080_30fps.mp4" \
  -vcodec libx264 \
  -profile:v main \
  -crf 24 \
  -preset slow \
  -vf "scale=1280:720" \
  -r 24 \
  -an \
  -movflags +faststart \
  dna-hero.mp4
```

Explicación de las flags:
- `-vcodec libx264` → H.264 codec (compatible iOS Safari)
- `-profile:v main` → perfil Main para máxima compatibilidad
- `-crf 24` → calidad constante 24 (sweet spot)
- `-preset slow` → mejor compresión a costa de tiempo
- `-vf "scale=1280:720"` → bajar a 720p
- `-r 24` → 24 fps
- `-an` → quitar audio (la "n" de "no audio")
- `-movflags +faststart` → mover metadata al inicio (streaming-friendly)

---

## Bonus · Crear versión .webm para Chrome/Firefox/Edge (opcional)

WebM con codec VP9 es ~30% más pequeño que H.264 para misma calidad. Si ofreces ambos formatos, los usuarios de Chrome/Firefox/Edge cargan el .webm (más rápido) y los de Safari/iOS cargan el .mp4 (compatible).

Con HandBrake: misma config pero en pestaña "Summary" → Format: **WebM** y en Video → Encoder: **VP9**.

Después en `index.html` cambias el `<video>` así:

```html
<video class="hero-video" autoplay muted loop playsinline ...>
  <source src="assets/video/dna-hero.webm" type="video/webm">
  <source src="assets/video/dna-hero.mp4" type="video/mp4">
</video>
```

El navegador elige automáticamente el primer formato que soporte.

---

## Bonus · Crear poster image · 1 minuto

El hero ya está configurado para usar `assets/img/hero-poster.jpg` como imagen mientras el video carga (o si falla en mobile data). Para crearla:

1. Abre el video original en el reproductor de Windows
2. Pausa en el frame que más te guste (segundo 2-3 suele ser bueno)
3. Print Screen (PrtSc) o usa la herramienta Recortes (Win+Shift+S)
4. Pega en Paint o Photos
5. Recorta solo el área del video (sin la barra del player)
6. Guarda como JPG, calidad media, en:
   ```
   C:\Users\Chingu\Documents\Claude\Projects\Macrogen-es\assets\img\hero-poster.jpg
   ```

Esto evita el "flash negro" mientras el video bufferea.

---

## Cómo verificar que quedó bien

Después de copiar el `dna-hero.mp4` comprimido y pushear:

1. **Test 1 (size):** click derecho en el archivo → Propiedades. Debe pesar entre **2-5 MB**.
2. **Test 2 (codec):** abre en VLC → Tools → Codec Information → debe decir **H.264 / AVC** y **No audio** (o muy bajo).
3. **Test 3 (mobile):** abre macrogen-es.com en tu celular CON datos celulares (no wifi). El video debería arrancar en 1-2 segundos máximo.
4. **Test 4 (LCP):** ve a https://pagespeed.web.dev/ → pega macrogen-es.com → corre el test. Mobile LCP debería ser <2.5s (verde).

---

## Si tienes problemas

Pásame:
- El nuevo tamaño después de comprimir
- Captura de pantalla del PageSpeed Insights resultado
- Si en el celular sigue siendo imagen estática: nombre exacto del modelo + iOS/Android version

Y te ajusto los parámetros.
