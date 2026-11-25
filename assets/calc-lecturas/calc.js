/* Calculadora de lecturas · recursos/calculadora-de-lecturas.html
   Convierte Gb y lecturas entre configuraciones NGS manteniendo el mismo número de fragmentos.
   El idioma lo decide el selector del sitio (i18n.js): aquí solo se lee la preferencia guardada
   y se escucha el evento i18n:applied. El bloque lleva translate="no" y trae sus cuatro
   diccionarios, así que Google Translate no lo toca. */
(function () {
  "use strict";
  var CFG = [
    { n: "50SE", L: 50, t: "SE" }, { n: "75SE", L: 75, t: "SE" }, { n: "100SE", L: 100, t: "SE" }, { n: "50PE", L: 50, t: "PE" },
    { n: "75PE", L: 75, t: "PE" }, { n: "100PE", L: 100, t: "PE" }, { n: "150PE", L: 150, t: "PE" }, { n: "250PE", L: 250, t: "PE" }
  ];
  CFG.forEach(function (c) { c.b = c.L * (c.t === "PE" ? 2 : 1); });
  var byName = {}; CFG.forEach(function (c) { byName[c.n] = c; });

  var T = {
    es: {
      loc: "es-CL", crumb1: "Recursos", crumb2: "Calculadora de lecturas", eyebrow: "Herramienta NGS · gratis, sin registro",
      heroA: "Calculadora de lecturas:", heroB: "convierte Gb entre configuraciones.",
      lead: "Convierte Gb entre configuraciones de secuenciación (150PE, 100PE, 100SE…) manteniendo el mismo número de fragmentos. Útil para planificar un proyecto o comparar cotizaciones entre configuraciones.",
      calcT: "Conversión", calcP: "El resultado se actualiza al instante mientras eliges.",
      s1: "Origen", s1h: "La que ya tienes", s2: "Cantidad", s2h: "En Gb o lecturas", unitReads: "Lecturas (M)", qtyAria: "Cantidad", dec: "Disminuir", inc: "Aumentar",
      s3: "Destino", s3h: "La que quieres comparar", swap: "Intercambiar origen y destino", resLabel: "Equivale a",
      sentence: "<b>{q} {u}</b> en <b>{o}</b> = <b>{r} Gb</b> en <b>{d}</b>",
      copyText: "{q} {u} en {o} {eq} {r} Gb en {d} ({ro} M → {rd} M lecturas, mismo número de fragmentos).", eq1: "equivale a", eqN: "equivalen a",
      stReadsO: "Lecturas origen", stReadsD: "Lecturas destino", stFactor: "Factor", diag: "Qué se lee de cada fragmento",
      copy: "Copiar resultado", copied: "Copiado al portapapeles", copyFail: "Selecciona la frase y cópiala", reset: "Volver al ejemplo",
      err: "Escribe un número mayor que 0.", hint: "Leído como decimal: {a}. Para miles, escribe {b}.", readsUnit: "M lecturas",
      howT: "Cómo usarla", howP: "Tres pasos. No hace falta pulsar ningún botón para calcular.",
      h1t: "Elige el origen", h1p: "Toca tu configuración de partida, por ejemplo 150PE.",
      h2t: "Escribe la cantidad", h2p: "Escribe los Gb, o cambia a Lecturas (M). También puedes usar + / − o las cantidades rápidas.",
      h3t: "Elige el destino", h3p: "Toca la configuración que quieres comparar. El número grande es la cantidad equivalente.",
      tip1: "<span><b>Atajo:</b> toca una fila de la tabla o una celda de la matriz para cargar esa conversión.</span>",
      tip2: "<span><b>Intercambiar</b> invierte origen y destino y usa el resultado como nueva cantidad.</span>",
      tip3: "<span><b>Copiar resultado</b> deja una frase lista para pegar en un correo, un informe o una solicitud de cotización.</span>",
      tblT: "Todas las configuraciones", tblP: "Equivalencias de {q} {u} en {o}. Toca una fila para elegirla como destino.", useAs: "Usar {n} como destino",
      c1: "Configuración", c2: "Longitud (bp)", c3: "Tipo", c4: "Bases / fragmento", c5: "Factor", c7: "Lecturas (M)",
      pillO: "Origen", pillD: "Destino",
      mxT: "Matriz de factores", mxP: "Fila = origen, columna = destino. Multiplica los Gb de origen por el factor. Toca una celda para usarla.", mxCorner: "Origen \\ Destino",
      mT: "Cómo se calcula", mP: "Se asume el mismo número de fragmentos (clusters) secuenciados. Solo cambia cuántas bases se leen de cada uno.",
      m1t: "Bases por fragmento", m1c: "PE = 2 × longitud · SE = 1 × longitud",
      m2t: "Gb de destino", m2c: "Gb destino = Gb origen × (bases destino ÷ bases origen)", m2p: "150PE → 100SE: 3 Gb × 100 / 300 = 1 Gb",
      m3t: "Lecturas", m3c: "Lecturas (M) = Gb × 1000 ÷ longitud de lectura", m3p: "En PE se cuentan ambos extremos: 3 Gb en 150PE = 20 M lecturas.",
      foot: "Herramienta gratuita de Macrogen para la comunidad científica. Los valores son equivalencias teóricas: la configuración final se confirma al cotizar tu proyecto.",
      ctaExplore: "Abrir NGS Explorador", ctaQuote: "Solicitar cotización"
    },
    en: {
      loc: "en-US", crumb1: "Resources", crumb2: "Read Calculator", eyebrow: "NGS tool · free, no sign-up",
      heroA: "Read Calculator:", heroB: "convert Gb between configurations.",
      lead: "Convert Gb between sequencing configurations (150PE, 100PE, 100SE…) while keeping the same number of fragments. Useful for planning a project or comparing quotes across configurations.",
      calcT: "Conversion", calcP: "The result updates as you choose.",
      s1: "Source", s1h: "The one you have", s2: "Amount", s2h: "In Gb or reads", unitReads: "Reads (M)", qtyAria: "Amount", dec: "Decrease", inc: "Increase",
      s3: "Target", s3h: "The one to compare", swap: "Swap source and target", resLabel: "Equals",
      sentence: "<b>{q} {u}</b> at <b>{o}</b> = <b>{r} Gb</b> at <b>{d}</b>",
      copyText: "{q} {u} at {o} {eq} {r} Gb at {d} ({ro} M → {rd} M reads, same number of fragments).", eq1: "equals", eqN: "equals",
      stReadsO: "Source reads", stReadsD: "Target reads", stFactor: "Factor", diag: "What is read from each fragment",
      copy: "Copy result", copied: "Copied to clipboard", copyFail: "Select the sentence and copy it", reset: "Back to example",
      err: "Enter a number greater than 0.", hint: "Read as a decimal: {a}. For thousands, type {b}.", readsUnit: "M reads",
      howT: "How to use it", howP: "Three steps. There is no button to press to calculate.",
      h1t: "Pick the source", h1p: "Tap your starting configuration, e.g. 150PE.",
      h2t: "Type the amount", h2p: "Enter Gb, or switch to Reads (M). You can also use + / − or the quick amounts.",
      h3t: "Pick the target", h3p: "Tap the configuration you want to compare. The big number is the equivalent amount.",
      tip1: "<span><b>Shortcut:</b> tap a table row or a matrix cell to load that conversion.</span>",
      tip2: "<span><b>Swap</b> flips source and target and uses the result as the new amount.</span>",
      tip3: "<span><b>Copy result</b> gives you a sentence ready to paste into an email, a report or a quote request.</span>",
      tblT: "All configurations", tblP: "Equivalents of {q} {u} at {o}. Tap a row to make it the target.", useAs: "Use {n} as target",
      c1: "Configuration", c2: "Read length (bp)", c3: "Type", c4: "Bases / fragment", c5: "Factor", c7: "Reads (M)",
      pillO: "Source", pillD: "Target",
      mxT: "Factor matrix", mxP: "Row = source, column = target. Multiply source Gb by the factor. Tap a cell to use it.", mxCorner: "Source \\ Target",
      mT: "How it is calculated", mP: "The same number of fragments (clusters) is assumed. Only the number of bases read from each one changes.",
      m1t: "Bases per fragment", m1c: "PE = 2 × length · SE = 1 × length",
      m2t: "Target Gb", m2c: "Target Gb = source Gb × (target bases ÷ source bases)", m2p: "150PE → 100SE: 3 Gb × 100 / 300 = 1 Gb",
      m3t: "Reads", m3c: "Reads (M) = Gb × 1000 ÷ read length", m3p: "PE counts both ends: 3 Gb at 150PE = 20 M reads.",
      foot: "A free Macrogen tool for the scientific community. Values are theoretical equivalents: the final configuration is confirmed when your project is quoted.",
      ctaExplore: "Open NGS Explorer", ctaQuote: "Request a quote"
    },
    pt: {
      loc: "pt-PT", crumb1: "Recursos", crumb2: "Calculadora de leituras", eyebrow: "Ferramenta NGS · gratuita, sem registo",
      heroA: "Calculadora de leituras:", heroB: "converta Gb entre configurações.",
      lead: "Converta Gb entre configurações de sequenciação (150PE, 100PE, 100SE…) mantendo o mesmo número de fragmentos. Útil para planear um projeto ou comparar orçamentos entre configurações.",
      calcT: "Conversão", calcP: "O resultado atualiza-se de imediato enquanto escolhe.",
      s1: "Origem", s1h: "A que já tem", s2: "Quantidade", s2h: "Em Gb ou leituras", unitReads: "Leituras (M)", qtyAria: "Quantidade", dec: "Diminuir", inc: "Aumentar",
      s3: "Destino", s3h: "A que quer comparar", swap: "Trocar origem e destino", resLabel: "Equivale a",
      sentence: "<b>{q} {u}</b> em <b>{o}</b> = <b>{r} Gb</b> em <b>{d}</b>",
      copyText: "{q} {u} em {o} {eq} {r} Gb em {d} ({ro} M → {rd} M leituras, mesmo número de fragmentos).", eq1: "equivale a", eqN: "equivalem a",
      stReadsO: "Leituras origem", stReadsD: "Leituras destino", stFactor: "Fator", diag: "O que se lê de cada fragmento",
      copy: "Copiar resultado", copied: "Copiado para a área de transferência", copyFail: "Selecione a frase e copie-a", reset: "Voltar ao exemplo",
      err: "Introduza um número maior que 0.", hint: "Lido como decimal: {a}. Para milhares, escreva {b}.", readsUnit: "M leituras",
      howT: "Como usar", howP: "Três passos. Não é preciso carregar em nenhum botão para calcular.",
      h1t: "Escolha a origem", h1p: "Toque na configuração de partida, por exemplo 150PE.",
      h2t: "Escreva a quantidade", h2p: "Introduza os Gb ou mude para Leituras (M). Também pode usar + / − ou os valores rápidos.",
      h3t: "Escolha o destino", h3p: "Toque na configuração que quer comparar. O número grande é a quantidade equivalente.",
      tip1: "<span><b>Atalho:</b> toque numa linha da tabela ou numa célula da matriz para carregar essa conversão.</span>",
      tip2: "<span><b>Trocar</b> inverte origem e destino e usa o resultado como nova quantidade.</span>",
      tip3: "<span><b>Copiar resultado</b> deixa uma frase pronta para colar num email, num relatório ou num pedido de orçamento.</span>",
      tblT: "Todas as configurações", tblP: "Equivalências de {q} {u} em {o}. Toque numa linha para a escolher como destino.", useAs: "Usar {n} como destino",
      c1: "Configuração", c2: "Comprimento (bp)", c3: "Tipo", c4: "Bases / fragmento", c5: "Fator", c7: "Leituras (M)",
      pillO: "Origem", pillD: "Destino",
      mxT: "Matriz de fatores", mxP: "Linha = origem, coluna = destino. Multiplique os Gb de origem pelo fator. Toque numa célula para a usar.", mxCorner: "Origem \\ Destino",
      mT: "Como se calcula", mP: "Assume-se o mesmo número de fragmentos (clusters) sequenciados. Só muda quantas bases se leem de cada um.",
      m1t: "Bases por fragmento", m1c: "PE = 2 × comprimento · SE = 1 × comprimento",
      m2t: "Gb de destino", m2c: "Gb destino = Gb origem × (bases destino ÷ bases origem)", m2p: "150PE → 100SE: 3 Gb × 100 / 300 = 1 Gb",
      m3t: "Leituras", m3c: "Leituras (M) = Gb × 1000 ÷ comprimento de leitura", m3p: "Em PE contam-se as duas extremidades: 3 Gb em 150PE = 20 M leituras.",
      foot: "Ferramenta gratuita da Macrogen para a comunidade científica. Os valores são equivalências teóricas: a configuração final confirma-se no orçamento do seu projeto.",
      ctaExplore: "Abrir NGS Explorador", ctaQuote: "Pedir orçamento"
    },
    ko: {
      loc: "ko-KR", crumb1: "리소스", crumb2: "리드 계산기", eyebrow: "NGS 도구 · 무료, 가입 불필요",
      heroA: "리드 계산기:", heroB: "구성 간 Gb를 환산하세요.",
      lead: "동일한 fragment 수를 기준으로 시퀀싱 구성(150PE, 100PE, 100SE…) 간 Gb를 환산합니다. 프로젝트를 계획하거나 구성별 견적을 비교할 때 활용하세요.",
      calcT: "환산", calcP: "선택하는 즉시 결과가 바뀝니다.",
      s1: "기준 구성", s1h: "현재 구성", s2: "수량", s2h: "Gb 또는 리드", unitReads: "리드 (M)", qtyAria: "수량", dec: "줄이기", inc: "늘리기",
      s3: "환산 구성", s3h: "비교할 구성", swap: "기준과 환산 구성 바꾸기", resLabel: "환산 결과",
      sentence: "<b>{o}</b> <b>{q} {u}</b> = <b>{d}</b> <b>{r} Gb</b>",
      copyText: "{o} {q} {u} = {d} {r} Gb (리드 {ro} M → {rd} M, 동일 fragment 수 기준).", eq1: "", eqN: "",
      stReadsO: "기준 리드", stReadsD: "환산 리드", stFactor: "계수", diag: "fragment당 읽는 염기",
      copy: "결과 복사", copied: "클립보드에 복사됨", copyFail: "문장을 선택해 복사하세요", reset: "예시로 되돌리기",
      err: "0보다 큰 숫자를 입력하세요.", hint: "소수로 읽었습니다: {a}. 천 단위라면 {b}(으)로 입력하세요.", readsUnit: "M 리드",
      howT: "사용 방법", howP: "세 단계면 끝납니다. 계산 버튼은 따로 없습니다.",
      h1t: "기준 구성 선택", h1p: "기준이 되는 구성을 누르세요. 예: 150PE.",
      h2t: "수량 입력", h2p: "Gb를 입력하거나 리드 (M)로 전환하세요. + / − 버튼이나 빠른 수량도 쓸 수 있습니다.",
      h3t: "환산 구성 선택", h3p: "비교할 구성을 누르세요. 큰 숫자가 환산된 수량입니다.",
      tip1: "<span><b>바로가기:</b> 비교표의 행이나 계수 표의 셀을 누르면 해당 환산이 바로 적용됩니다.</span>",
      tip2: "<span><b>바꾸기</b>는 기준과 환산 구성을 맞바꾸고, 결과값을 새 수량으로 씁니다.</span>",
      tip3: "<span><b>결과 복사</b>를 누르면 메일, 보고서, 견적 요청서에 붙여 넣을 문장이 복사됩니다.</span>",
      tblT: "전체 구성 비교", tblP: "{o} {q} {u} 기준 환산값. 행을 누르면 환산 구성으로 선택됩니다.", useAs: "{n}을(를) 환산 구성으로 선택",
      c1: "구성", c2: "리드 길이 (bp)", c3: "유형", c4: "fragment당 염기", c5: "계수", c7: "리드 (M)",
      pillO: "기준", pillD: "환산",
      mxT: "환산 계수 표", mxP: "행 = 기준, 열 = 환산 구성. 기준 Gb에 계수를 곱하세요. 셀을 누르면 바로 적용됩니다.", mxCorner: "기준 \\ 환산",
      mT: "계산 방법", mP: "시퀀싱되는 fragment(cluster) 수는 같다고 가정합니다. fragment마다 읽는 염기 수만 달라집니다.",
      m1t: "fragment당 염기 수", m1c: "PE = 2 × 리드 길이 · SE = 1 × 리드 길이",
      m2t: "환산 Gb", m2c: "환산 Gb = 기준 Gb × (환산 염기 수 ÷ 기준 염기 수)", m2p: "150PE → 100SE: 3 Gb × 100 / 300 = 1 Gb",
      m3t: "리드 수", m3c: "리드 (M) = Gb × 1000 ÷ 리드 길이", m3p: "PE는 양쪽 리드를 모두 셉니다: 150PE 3 Gb = 20 M 리드.",
      foot: "과학 커뮤니티를 위한 Macrogen의 무료 도구입니다. 이론적 환산값이며, 최종 구성은 프로젝트 견적 시 확정됩니다.",
      ctaExplore: "NGS 서비스 살펴보기", ctaQuote: "견적 요청"
    }
  };

  var DEF = { o: "150PE", d: "100PE", q: 3, unit: "gb" };
  var S = { o: DEF.o, d: DEF.d, q: DEF.q, unit: DEF.unit, lang: "es", ready: false };
  var has = function (obj, k) { return typeof k === "string" && Object.prototype.hasOwnProperty.call(obj, k); };
  // misma prioridad que i18n.js: ?lang= y después la preferencia guardada
  try { var ul = new URLSearchParams(location.search).get("lang"); if (has(T, ul)) S.lang = ul; else { var sl = localStorage.getItem("mc_lang"); if (has(T, sl)) S.lang = sl; } } catch (e) {}
  // i18n.js recarga la página al cambiar de idioma: lo que el visitante eligió se guarda en la sesión
  var KEY = "rc_state";
  try {
    var saved = JSON.parse(sessionStorage.getItem(KEY) || "null");
    if (saved && has(byName, saved.o) && has(byName, saved.d) && typeof saved.q === "number" && isFinite(saved.q) && saved.q > 0 && (saved.unit === "gb" || saved.unit === "reads")) {
      S.o = saved.o; S.d = saved.d; S.q = saved.q; S.unit = saved.unit;
    }
  } catch (e) {}

  var $ = function (id) { return document.getElementById("rc-" + id); };
  var smooth = function () { return matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"; };
  // tras elegir en la tabla o en la matriz, la vista y el foco van al resultado (render() rehace las filas)
  // (en una columna el panel queda bajo el formulario: ahí se lleva a la vista el panel, no la sección)
  var toResult = function () {
    var res = document.querySelector(".rc-result");
    var target = getComputedStyle(res).position === "sticky" ? document.getElementById("calculadora") : res;
    target.scrollIntoView({ behavior: smooth(), block: "start" });
    try { res.focus({ preventScroll: true }); } catch (e) {}
  };

  function L() { return T[S.lang]; }
  function fmt(x, max) {
    if (!isFinite(x)) return "–";
    var m = max == null ? (Math.abs(x) >= 100 ? 1 : Math.abs(x) >= 10 ? 2 : 3) : max;
    return new Intl.NumberFormat(L().loc, { maximumFractionDigits: m }).format(x);
  }
  // lo que se escribe en el campo va sin separador de miles, para que se pueda volver a leer
  function fmtIn(x) { return new Intl.NumberFormat(L().loc, { maximumFractionDigits: 4, useGrouping: false }).format(x); }
  function fill(s, o) { return s.replace(/\{(\w+)\}/g, function (_, k) { return o[k] != null ? o[k] : ""; }); }
  // Un solo punto o una sola coma es siempre el signo decimal, en cualquier idioma («1.5» y «1,5»
  // valen 1,5): el campo nunca se escribe con separador de miles. Con los dos signos a la vez, el
  // último es el decimal («1.234,5» y «1,234.5»); un signo repetido en grupos de tres es de miles
  // («1.234.567»). Si la entrada también podía ser «miles» («1.500»), S.amb guarda esa lectura
  // para avisar bajo el campo cómo se leyó.
  function parseQty(v) {
    S.amb = null;
    v = String(v).replace(/[\s  ]/g, "");
    if (!/^[\d.,]+$/.test(v)) return NaN;
    v = v.replace(/[.,]$/, "");                       // «2.» a medio escribir vale 2
    var nDot = v.split(".").length - 1, nCom = v.split(",").length - 1, dec = "";
    if (nDot && nCom) {
      dec = v.lastIndexOf(".") > v.lastIndexOf(",") ? "." : ",";
      if (v.split(dec).length !== 2) return NaN;
    } else if (nDot + nCom === 1) {
      dec = nDot ? "." : ",";
      if (/^[1-9]\d{0,2}[.,]\d{3}$/.test(v)) S.amb = parseInt(v.replace(dec, ""), 10);
    } else if (nDot + nCom > 1) {
      if (!/^[1-9]\d{0,2}([.,]\d{3})+$/.test(v)) return NaN;
    }
    v = v.split("").map(function (c) { return c === dec ? "." : (c === "." || c === "," ? "" : c); }).join("");
    return /^\d*\.?\d+$/.test(v) ? parseFloat(v) : NaN;
  }
  function gbSource() { return S.unit === "gb" ? S.q : S.q * byName[S.o].L / 1000; }
  function unitLabel() { return S.unit === "gb" ? "Gb" : L().readsUnit; }
  // quita el ruido de coma flotante (0,9999999999998 → 1) sin recortar decimales reales (13,3333…)
  var tidy = function (x) { var r = Math.round(x * 1e6) / 1e6; return Math.abs(x - r) <= Math.abs(x) * 1e-9 ? r : x; };

  // región viva única: anuncia la frase del resultado (con pausa, para no leer cada tecla) o un aviso
  var liveT;
  function announce(txt, now) {
    var el = $("live"); if (!el) return;
    clearTimeout(liveT);
    if (now) { el.textContent = ""; liveT = setTimeout(function () { el.textContent = txt; }, 40); }
    else liveT = setTimeout(function () { if (el.textContent !== txt) el.textContent = txt; }, 500);
  }

  function buildChips(box, key) {
    CFG.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "rc-chip"; b.dataset.n = c.n;
      b.innerHTML = c.n + "<small>" + c.b + " bp</small>";
      b.addEventListener("click", function () { S[key] = c.n; render(); });
      box.appendChild(b);
    });
  }
  function buildPresets() {
    var box = $("presets"); box.innerHTML = "";
    var vals = S.unit === "gb" ? [1, 3, 6, 10, 30] : [10, 20, 40, 100];
    vals.forEach(function (v) {
      var b = document.createElement("button"); b.type = "button";
      b.textContent = fmt(v) + " " + (S.unit === "gb" ? "Gb" : "M");
      b.addEventListener("click", function () { S.q = v; $("qty").value = fmtIn(v); render(); });
      box.appendChild(b);
    });
  }
  function drawReads(el, c, cls) {
    var W = 600, scale = (W / 2 - 8) / 250, len = c.L * scale, y = 6, h = 10, tip = 8;
    var s = '<rect class="rc-dna" x="0" y="' + (y + 3.5) + '" width="' + W + '" height="3" rx="1.5"/>';
    s += poly([[0, y], [len - tip, y], [len, y + h / 2], [len - tip, y + h], [0, y + h]], cls);
    if (c.t === "PE") s += poly([[W, y], [W - len + tip, y], [W - len, y + h / 2], [W - len + tip, y + h], [W, y + h]], cls);
    el.innerHTML = s;
  }
  function poly(p, cls) { return '<polygon class="' + cls + '" points="' + p.map(function (q) { return q.join(","); }).join(" ") + '"/>'; }

  function applyLang() {
    var t = L();
    // los bloques con translate="no" declaran su idioma real, aunque <html lang> diga otra cosa
    document.querySelectorAll(".rc, .rc-hero").forEach(function (el) { el.setAttribute("lang", S.lang); });
    document.querySelectorAll("[data-rc]").forEach(function (el) { var k = el.getAttribute("data-rc"); if (t[k] != null) el.innerHTML = t[k]; });
    $("qty").setAttribute("aria-label", t.qtyAria);
    $("minus").setAttribute("aria-label", t.dec);
    $("plus").setAttribute("aria-label", t.inc);
    $("chipsO").setAttribute("aria-label", t.s1);
    $("chipsD").setAttribute("aria-label", t.s3);
    $("unitSeg").setAttribute("aria-label", t.s2h);
    $("mxBody").parentNode.setAttribute("aria-label", t.mxT);
    if (isFinite(S.q)) $("qty").value = fmtIn(S.q);
    buildPresets();
  }

  function render() {
    var t = L(), o = byName[S.o], d = byName[S.d];
    var ok = isFinite(S.q) && S.q > 0;
    $("stepper").classList.toggle("rc-bad", !ok);
    $("qty").setAttribute("aria-invalid", String(!ok));
    $("err").textContent = ok ? "" : t.err;
    $("hint").textContent = ok && S.amb ? fill(t.hint, { a: fmt(S.q, 4) + " " + unitLabel(), b: fmtIn(S.amb) }) : "";
    document.querySelectorAll("#rc-chipsO .rc-chip").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.n === S.o)); });
    document.querySelectorAll("#rc-chipsD .rc-chip").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.n === S.d)); });
    document.querySelectorAll("#rc-unitSeg button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.unit === S.unit)); });

    var gbO = gbSource(), f = d.b / o.b, gbD = gbO * f, rO = gbO * 1000 / o.L, rD = gbD * 1000 / d.L;
    var v = { q: fmt(S.q, 4), u: unitLabel(), o: o.n, d: d.n, r: ok ? fmt(gbD) : "–", ro: fmt(rO), rd: fmt(rD), eq: fmt(S.q, 4) === fmt(1, 4) ? t.eq1 : t.eqN };
    $("resVal").textContent = ok ? fmt(gbD) : "–";
    $("resCfg").textContent = d.n;
    $("sentence").innerHTML = ok ? fill(t.sentence, v) : "";
    $("stO").textContent = ok ? fmt(rO) + " M" : "–";
    $("stD").textContent = ok ? fmt(rD) + " M" : "–";
    $("stF").textContent = "×" + fmt(f, 4);
    drawReads($("dgO"), o, "rc-rd-o"); drawReads($("dgD"), d, "rc-rd-d");
    $("dgOn").textContent = o.n; $("dgDn").textContent = d.n;
    $("dgOb").textContent = o.b + " bp"; $("dgDb").textContent = d.b + " bp";
    $("tblP").textContent = fill(t.tblP, v);

    var tb = $("tbody"); tb.innerHTML = "";
    CFG.forEach(function (c) {
      var fc = c.b / o.b, g = gbO * fc, tr = document.createElement("tr");
      tr.className = "rc-pick" + (c.n === S.o ? " rc-is-o" : "") + (c.n === S.d ? " rc-is-d" : "");
      var tags = (c.n === S.o ? '<span class="rc-tag rc-tag-o">' + t.pillO + "</span>" : "") + (c.n === S.d ? '<span class="rc-tag rc-tag-d">' + t.pillD + "</span>" : "");
      // el botón da a la fila nombre, estado y foco de teclado; el clic en cualquier celda sirve para el ratón
      var btn = '<button type="button" class="rc-rowbtn" aria-pressed="' + (c.n === S.d) + '" aria-label="' + fill(t.useAs, { n: c.n }) + '">' + c.n + "</button>";
      tr.innerHTML = "<td>" + btn + tags + "</td><td>" + c.L + "</td><td>" + c.t + "</td><td>" + c.b + "</td><td>" + fmt(fc, 4) + "</td><td>" + (ok ? fmt(g) : "–") + "</td><td>" + (ok ? fmt(g * 1000 / c.L) : "–") + "</td>";
      tr.addEventListener("click", function () { S.d = c.n; render(); toResult(); });
      tb.appendChild(tr);
    });

    var h = "<tr><th>" + t.mxCorner + "</th>";
    CFG.forEach(function (c) { h += '<th class="' + (c.n === S.d ? "rc-hl" : "") + '">' + c.n + "</th>"; });
    $("mxHead").innerHTML = h + "</tr>";
    var mb = $("mxBody"); mb.innerHTML = "";
    CFG.forEach(function (r) {
      var tr = document.createElement("tr");
      var th = document.createElement("th"); th.textContent = r.n; if (r.n === S.o) th.className = "rc-hl"; tr.appendChild(th);
      CFG.forEach(function (c) {
        var td = document.createElement("td"), fv = c.b / r.b, sel = r.n === S.o && c.n === S.d;
        if (fv === 1) td.className = "rc-one";
        if (sel) td.className = "rc-cell-sel";
        var b = document.createElement("button"); b.type = "button"; b.textContent = fmt(fv, 3);
        b.setAttribute("aria-label", r.n + " → " + c.n + ": ×" + fmt(fv, 4));
        b.setAttribute("aria-pressed", String(sel));
        b.tabIndex = sel ? 0 : -1;                    // una sola parada de tabulador; dentro se mueve con las flechas
        b.addEventListener("click", function () { S.o = r.n; S.d = c.n; render(); toResult(); });
        td.appendChild(b); tr.appendChild(td);
      });
      mb.appendChild(tr);
    });
    S.copyText = ok ? fill(t.copyText, v) : "";
    if (ok) { try { sessionStorage.setItem(KEY, JSON.stringify({ o: S.o, d: S.d, q: S.q, unit: S.unit })); } catch (e) {} }
    if (S.ready) announce(ok ? $("sentence").textContent : t.err);
  }

  buildChips($("chipsO"), "o"); buildChips($("chipsD"), "d");
  document.addEventListener("i18n:applied", function (e) {
    var l = e.detail && e.detail.lang;
    if (has(T, l) && l !== S.lang) { S.lang = l; applyLang(); render(); }
  });
  $("qty").addEventListener("input", function () { S.q = parseQty(this.value); render(); });
  $("qty").addEventListener("blur", function () { if (isFinite(S.q) && S.q > 0) this.value = fmtIn(S.q); });
  // cualquier otra forma de fijar la cantidad (botones, cambio de unidad, intercambio) borra el aviso
  var clearAmb = function () { S.amb = null; };
  ["minus", "plus", "swap", "reset", "presets", "unitSeg"].forEach(function (id) { $(id).addEventListener("click", clearAmb, true); });
  function bump(dir) {
    var step = S.unit === "gb" ? (S.q >= 10 ? 1 : 0.5) : (S.q >= 100 ? 10 : 5);
    var base = isFinite(S.q) ? S.q : 0;
    if (dir < 0 && base > 0 && base <= step) return;   // por debajo de un paso, «−» no sube la cantidad
    S.q = Math.max(step, Math.round((base + dir * step) / step) * step);
    $("qty").value = fmtIn(S.q); render();
  }
  $("minus").addEventListener("click", function () { bump(-1); });
  $("plus").addEventListener("click", function () { bump(1); });
  document.querySelectorAll("#rc-unitSeg button").forEach(function (b) {
    b.addEventListener("click", function () {
      if (S.unit === b.dataset.unit) return;
      var gb = gbSource(); S.unit = b.dataset.unit;
      if (isFinite(gb)) { S.q = tidy(S.unit === "gb" ? gb : gb * 1000 / byName[S.o].L); $("qty").value = fmtIn(S.q); }
      buildPresets(); render();
    });
  });
  $("swap").addEventListener("click", function () {
    var gbD = gbSource() * byName[S.d].b / byName[S.o].b, tmp = S.o; S.o = S.d; S.d = tmp;
    if (isFinite(gbD) && gbD > 0) { S.q = tidy(S.unit === "gb" ? gbD : gbD * 1000 / byName[S.o].L); $("qty").value = fmtIn(S.q); }
    render();
  });
  $("reset").addEventListener("click", function () { S.o = DEF.o; S.d = DEF.d; S.q = DEF.q; S.unit = DEF.unit; $("qty").value = fmtIn(S.q); buildPresets(); render(); });
  $("copy").addEventListener("click", function () {
    var el = $("toast"), txt = S.copyText; if (!txt) return;
    var done = function (m) { el.textContent = m; el.hidden = false; announce(m, true); clearTimeout(S.tt); S.tt = setTimeout(function () { el.hidden = true; if ($("live").textContent === m) $("live").textContent = ""; }, 2200); };
    var fail = function () { try { var r = document.createRange(); r.selectNodeContents($("sentence")); var s = getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) {} done(L().copyFail); };
    try { navigator.clipboard.writeText(txt).then(function () { done(L().copied); }, fail); } catch (e) { fail(); }
  });
  // matriz: flechas, Inicio y Fin mueven el foco entre celdas
  $("mxBody").addEventListener("keydown", function (e) {
    var b = e.target, td = b.parentNode;
    if (b.tagName !== "BUTTON" || td.tagName !== "TD" || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    var tr = td.parentNode, rows = this.rows, r = [].indexOf.call(rows, tr), c = [].indexOf.call(tr.cells, td), last = tr.cells.length - 1;
    if (e.key === "ArrowRight") c = Math.min(last, c + 1);
    else if (e.key === "ArrowLeft") c = Math.max(1, c - 1);
    else if (e.key === "ArrowDown") r = Math.min(rows.length - 1, r + 1);
    else if (e.key === "ArrowUp") r = Math.max(0, r - 1);
    else if (e.key === "Home") c = 1;
    else if (e.key === "End") c = last;
    else return;
    e.preventDefault();
    var next = rows[r].cells[c].firstChild;
    if (next !== b) { b.tabIndex = -1; next.tabIndex = 0; next.focus(); }
  });

  applyLang(); render(); S.ready = true;
})();
