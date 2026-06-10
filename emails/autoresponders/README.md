# Sistema de Autoresponders · Macrogen Iberoamérica

12 emails branded · 4 triggers · 3 emails drip cada uno · Día 0 + Día 3 + Día 7.

---

## Mapa de archivos

| Trigger | Día 0 | Día 3 | Día 7 |
|---|---|---|---|
| **🧬 NGS Explorador** (cotizador.html → "Hablar con especialista") | `ngs-explorador-d0.html` | `ngs-explorador-d3.html` | `ngs-explorador-d7.html` |
| **✉️ Formulario contacto general** (contacto.html) | `contacto-d0.html` | `contacto-d3.html` | `contacto-d7.html` |
| **🎟️ Promo NUEVO10** (?promo=NUEVO10) | `nuevo10-d0.html` | `nuevo10-d3.html` | `nuevo10-d7.html` |
| **📬 Newsletter signup** (newsletter.html) | `newsletter-d0.html` | `newsletter-d3.html` | `newsletter-d7.html` |

**12 emails totales** · diseño dark-futuristic con grid teal · responsive single-column 600px · MSO/Outlook bulletproof · merge tags Brevo + Formspree.

---

## Estrategia de plataforma (recomendada)

| Día | Plataforma | Razón |
|---|---|---|
| **Día 0 · Inmediato** | **Formspree autoresponder** | Se dispara en milisegundos al enviar form, sin dependencia de webhook. Máxima velocidad para confirmar al lead. |
| **Día 3 · Drip** | **Brevo automation** | Drip requiere "esperar X días" + segmentación por trigger. Brevo lo hace nativo. |
| **Día 7 · Drip** | **Brevo automation** | Mismo workflow Brevo que Día 3. |

El puente: **Formspree → Brevo via webhook** mete al lead a una **lista Brevo segmentada por trigger** justo después del Día 0.

---

## Setup paso a paso

### PARTE A · Formspree autoresponder (Día 0 inmediato)

**1. Acceder a Formspree dashboard**
- URL: https://formspree.io/forms/xaqvkoaw/settings/autoresponder (cambia ID si tienes otros forms)
- Plan necesario: Free permite 1 autoresponder por form; Gold permite ilimitados

**2. Configurar un form por trigger**
Crear 4 endpoints separados en Formspree (uno por trigger) o usar 1 con campo `_trigger` y enrutar después:

| Trigger | Form ID sugerido | Endpoint en HTML |
|---|---|---|
| NGS Explorador | `xaqvkoaw` (actual) | `cotizador.html` form submit |
| Contacto general | crear nuevo, ej. `xpzlkbyw` | `contacto.html` form submit |
| NUEVO10 | mismo que contacto + hidden field `?promo=NUEVO10` | `?promo=NUEVO10` query string |
| Newsletter | crear nuevo, ej. `mvgrpoqy` | `newsletter.html` form submit |

**3. Pegar HTML autoresponder en Formspree**
- Settings → Autoresponder → Enable
- Subject: usar la línea del `<title>` de cada email
- HTML body: copiar/pegar TODO el contenido del archivo `.html`
- Reply-to: `info-spain@macrogen.com` (o `info-chile@` según trigger)

**4. Merge tags Formspree**
Los archivos usan merge tags Brevo `{{contact.FIRSTNAME | default : "..."}}` por defecto. Para Formspree, reemplaza:

```
{{contact.FIRSTNAME | default : "Investigador/a"}}  →  {{name}}
{{params.APP | default : "..."}}                     →  {{aplicacion}}
{{params.LIBRARY | default : "..."}}                 →  {{libreria}}
{{params.PLATFORM | default : "..."}}                →  {{plataforma}}
{{params.READ | default : "..."}}                    →  {{read}}
{{params.TAT | default : "..."}}                     →  {{tat}}
{{unsubscribe}}                                       →  (eliminar, Formspree free no soporta unsubscribe)
{{mirror}}                                            →  (eliminar)
```

**Tip:** Usa "Find & Replace" en VSCode antes de pegar en Formspree.

**5. Hidden fields requeridos en cada form HTML**
Para que las merge tags funcionen, los `<form>` deben tener inputs ocultos:

```html
<!-- cotizador.html · form de "Hablar con especialista" -->
<input type="hidden" name="aplicacion" value="WGS">       <!-- inyecta JS -->
<input type="hidden" name="libreria" value="TruSeq PCR-free">
<input type="hidden" name="plataforma" value="NovaSeq X Plus 25B">
<input type="hidden" name="read" value="150PE">
<input type="hidden" name="tat" value="5-7 semanas">
<input type="hidden" name="_trigger" value="ngs-explorador">

<!-- contacto.html -->
<input type="hidden" name="_trigger" value="contacto-general">

<!-- contacto.html?promo=NUEVO10 -->
<input type="hidden" name="_trigger" value="nuevo10">  <!-- inyecta JS si query=promo -->
<input type="hidden" name="codigo_promo" value="NUEVO10">

<!-- newsletter.html -->
<input type="hidden" name="_trigger" value="newsletter">
```

---

### PARTE B · Brevo automation (Día 3 + Día 7 drip)

**1. Crear cuenta Brevo + listas segmentadas**
- URL: https://app.brevo.com/contact/list
- Crear 4 listas separadas:
  - `NGS Explorador Leads`
  - `Contacto General Leads`
  - `NUEVO10 Promo Leads`
  - `Newsletter Subscribers`

**2. Crear template para cada email Día 3 + Día 7**
- Marketing → Templates → New Template
- Pegar HTML del archivo correspondiente (ej. `ngs-explorador-d3.html`)
- Guardar 8 templates en total (4 triggers × 2 emails)

**3. Crear 4 automation workflows**
- Marketing → Automations → New Workflow
- Workflow por cada trigger:

```
Workflow: NGS Explorador Drip
├── Trigger: Contact added to list "NGS Explorador Leads"
├── Wait 3 days
├── Send template: ngs-explorador-d3
├── Wait 4 days (acumula 7 días desde Day 0)
└── Send template: ngs-explorador-d7
```

Repetir para los otros 3 triggers.

**4. Webhook Formspree → Brevo (puente Día 0 → Drip)**

En Formspree → Form Settings → Integrations → Webhooks:

```
POST https://api.brevo.com/v3/contacts
Headers:
  api-key: <tu_brevo_api_key>
  Content-Type: application/json

Body (mapeado desde form data):
{
  "email": "{{email}}",
  "attributes": {
    "FIRSTNAME": "{{name}}",
    "TRIGGER": "{{_trigger}}",
    "APP": "{{aplicacion}}",
    "LIBRARY": "{{libreria}}",
    "PLATFORM": "{{plataforma}}",
    "PROMO_CODE": "{{codigo_promo}}"
  },
  "listIds": [<id_lista_segun_trigger>]
}
```

**Alternativa más simple sin webhook:** Zapier conector `Formspree → Brevo Add Contact to List` con filtro por `{{_trigger}}`.

---

## Subject lines optimizados

| Email | Subject sugerido | Tasa apertura esperada |
|---|---|---|
| `ngs-explorador-d0` | ✅ Tu configuración NGS llegó · cotización en <24h | 65-75% (transactional) |
| `ngs-explorador-d3` | 📊 3 sample reports antes de tu cotización | 40-50% |
| `ngs-explorador-d7` | 🎓 De cotización a publicación en Nature Comms | 28-35% |
| `contacto-d0` | ✉️ Recibimos tu mensaje · respuesta <24h hábiles | 60-70% |
| `contacto-d3` | 📁 11 sample reports + 13 certificados · todo en 1 hub | 32-40% |
| `contacto-d7` | 🚀 10% OFF con NUEVO10 · CES · NGS · Síntesis | 35-45% |
| `nuevo10-d0` | 🎟️ NUEVO10 activo · 10% OFF hasta 31 ago | 55-65% |
| `nuevo10-d3` | 🎟️ ¿En cuál de los 3 servicios usarás NUEVO10? | 30-40% |
| `nuevo10-d7` | ⏰ NUEVO10 vence en ~10 semanas · bloquéalo ahora | 35-45% |
| `newsletter-d0` | 📬 Bienvenido al newsletter Macrogen Iberoamérica | 50-60% |
| `newsletter-d3` | 📊 Top 3 recursos más descargados de Q2 2026 | 25-35% |
| `newsletter-d7` | 🤖 NUEVO10 + AI Hub Songdo · 2 novedades | 28-38% |

---

## KPIs a trackear

| Métrica | Cómo medir | Benchmark Macrogen |
|---|---|---|
| **Open rate D0** | Brevo Reports → Open % | >55% (transactional) |
| **Open rate D3/D7** | Brevo Reports → Open % | >25% (drip nurture) |
| **CTR botón CTA** | UTMs en links + GA4 | >8% transactional, >3% drip |
| **Conversion rate** | Lead → cotización formal enviada | 35-50% para NGS Explorador, 20-30% para contacto general |
| **Unsubscribe rate** | Brevo Reports → Unsubscribes | <0.5% por email (sano), >2% = revisar copy |
| **Time-to-reply especialista** | Tiempo desde D0 hasta primer email manual | <24h hábiles SLA |

UTM tracking sugerido para los links de los emails:

```
?utm_source=brevo&utm_medium=email&utm_campaign={trigger}-{day}
```

Ejemplo: `https://macrogen-es.com/cotizador.html?utm_source=brevo&utm_medium=email&utm_campaign=ngs-explorador-d3`

---

## Personalización por hub geográfico

Si quieres que las firmas + teléfonos en el footer cambien según región del lead (Madrid vs Santiago), agrega lógica condicional Brevo:

```html
{% if contact.COUNTRY in ["ES", "PT"] %}
  <p>Tu hub: <strong>Madrid</strong> · +34 911 138 378 · info-spain@macrogen.com</p>
{% elif contact.COUNTRY in ["CL", "PE", "AR", "CO", "MX"] %}
  <p>Tu hub: <strong>Santiago</strong> · +56 9 5845 1395 · info-chile@macrogen.com</p>
{% else %}
  <p>Hubs: Madrid 🇪🇸 + Santiago 🇨🇱</p>
{% endif %}
```

Requiere atributo `COUNTRY` en contactos Brevo (puebla desde el select de contacto.html).

---

## A/B testing recomendado (primeros 30 días)

| Variable | Versión A | Versión B | Meta |
|---|---|---|---|
| Subject D0 NGS Explorador | "Tu configuración NGS llegó" | "Cotización lista en <24h" | Mayor open rate |
| CTA Día 3 | "Ver 11 sample reports →" | "Descargar reports gratis →" | Mayor CTR |
| Día 7 contacto | "10% OFF" emoji 🚀 | "10% OFF" sin emoji | Mayor reply rate |

Brevo soporta A/B testing nativo en Marketing → Campaigns → A/B Test.

---

## Calendario de revisión

- **Semana 2**: revisar open rate D0 — debe ser >55%. Si <40%, revisar inbox placement (SPF/DKIM/DMARC).
- **Semana 4**: revisar reply rate manual de los especialistas — debe ser <24h hábiles. Si excede, escalar volumen o revisar SLA interno.
- **Mes 3**: revisar conversion rate D0→cotización formal por trigger. Optimizar el trigger con peor conversión.

---

## Próximos pasos sugeridos (Fase 2)

1. **Día 14 cierre suave** — añadir un 4to email por trigger con CTA final (~10 semanas dev)
2. **Re-engagement de leads fríos** — workflow Brevo para leads sin abrir en 30 días
3. **Encuesta post-cotización NPS** — automatización Brevo para clientes que cotizaron pero no pidieron, preguntando porqué
4. **Multi-idioma** — replicar los 12 emails en EN, PT, KO usando el sistema i18n.js como base de copy

---

## Soporte técnico

- **Brevo docs**: https://help.brevo.com/hc/en-us
- **Formspree docs**: https://help.formspree.io/
- **Macrogen Iberoamérica · marketing@macrogen-es.com** (cuando se configure)

Última actualización: 10 jun 2026
