const QRCodeStyling = window.QRCodeStyling;

const state = {
  type: "url",
  size: 1000,
  logo: null,
  logoMargin: 6,
  colors: {
    bg: "#FFFFFF",
    fg: "#0B0F1A",
    eyeFrame: "#0B0F1A",
    eyeCenter: "#0B0F1A",
    transparent: false
  },
  gradient: {
    enabled: false,
    start: "#0B0F1A",
    end: "#1F6FEB",
    mode: "linear-0"
  },
  shapes: {
    dots: "square",
    cornerSquare: "square",
    cornerDot: "square"
  }
};

const elements = {
  typeGrid: document.getElementById("type-grid"),
  preview: document.getElementById("qr-preview"),
  previewSize: document.getElementById("preview-size"),
  btnDownloadPng: document.getElementById("btn-download-png"),
  btnDownloadSvg: document.getElementById("btn-download-svg"),
  btnCopy: document.getElementById("btn-copy"),
  bgColor: document.getElementById("bg-color"),
  bgTransparent: document.getElementById("bg-transparent"),
  fgColor: document.getElementById("fg-color"),
  fgGradientEnabled: document.getElementById("fg-gradient-enabled"),
  fgGradientStart: document.getElementById("fg-gradient-start"),
  fgGradientEnd: document.getElementById("fg-gradient-end"),
  gradientControls: document.getElementById("gradient-controls"),
  eyeFrame: document.getElementById("eye-frame"),
  eyeCenter: document.getElementById("eye-center"),
  logo: document.getElementById("logo"),
  logoMargin: document.getElementById("logo-margin"),
  size: document.getElementById("size"),
  remainingCounter: document.getElementById("remaining-counter")
};

const getGradientConfig = () => {
  const colorStops = [
    { offset: 0, color: state.gradient.start },
    { offset: 1, color: state.gradient.end }
  ];
  if (state.gradient.mode === "radial-center") {
    return {
      type: "radial",
      rotation: 0,
      colorStops
    };
  }
  const rotationMap = {
    "linear-0": 0,
    "linear-45": Math.PI / 4,
    "linear-90": Math.PI / 2,
    "linear-135": (3 * Math.PI) / 4
  };
  return {
    type: "linear",
    rotation: rotationMap[state.gradient.mode] ?? 0,
    colorStops
  };
};

const getDotsOptions = () => {
  if (!state.gradient.enabled) {
    return {
      color: state.colors.fg,
      type: state.shapes.dots,
      gradient: null
    };
  }
  return {
    type: state.shapes.dots,
    gradient: getGradientConfig(),
    color: undefined
  };
};

const qrCode = new QRCodeStyling({
  width: state.size,
  height: state.size,
  data: "https://seusite.com",
  image: state.logo,
  dotsOptions: getDotsOptions(),
  cornersSquareOptions: {
    color: state.colors.eyeFrame,
    type: state.shapes.cornerSquare
  },
  cornersDotOptions: {
    color: state.colors.eyeCenter,
    type: state.shapes.cornerDot
  },
  backgroundOptions: {
    color: state.colors.bg
  },
  imageOptions: {
    margin: state.logoMargin,
    crossOrigin: "anonymous"
  }
});

qrCode.append(elements.preview);

const forms = Array.from(document.querySelectorAll(".form"));
const typeCards = Array.from(document.querySelectorAll(".type-card"));

const getValue = (id) => {
  const el = document.getElementById(id);
  if (!el) return "";
  if (el.type === "checkbox") return el.checked;
  return el.value.trim();
};

const getCheckedRadioValue = (name, fallback) => {
  const selected = document.querySelector(`input[name="${name}"]:checked`);
  return selected ? selected.value : fallback;
};

const escapeWifiValue = (value) => value.replace(/([\\;,:"])/g, "\\$1");

const buildPayload = () => {
  switch (state.type) {
    case "url":
      return getValue("url") || "https://seusite.com";
    case "text":
      return getValue("text") || "Olá!";
    case "location": {
      const lat = getValue("lat");
      const lng = getValue("lng");
      if (!lat || !lng) return "geo:-23.561684,-46.655981";
      return `geo:${lat},${lng}`;
    }
    case "phone":
      return getValue("phone") ? `tel:${getValue("phone")}` : "tel:+5511900000000";
    case "email": {
      const to = getValue("email");
      const subject = encodeURIComponent(getValue("email-subject"));
      const body = encodeURIComponent(getValue("email-body"));
      if (!to) return "mailto:contato@email.com";
      const params = [];
      if (subject) params.push(`subject=${subject}`);
      if (body) params.push(`body=${body}`);
      return `mailto:${to}${params.length ? `?${params.join("&")}` : ""}`;
    }
    case "sms": {
      const to = getValue("sms");
      const body = getValue("sms-body");
      if (!to) return "SMSTO:+5511900000000:Olá";
      return `SMSTO:${to}:${body}`;
    }
    case "bitcoin": {
      const addr = getValue("btc");
      const amount = getValue("btc-amount");
      if (!addr) return "bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
      return amount ? `bitcoin:${addr}?amount=${amount}` : `bitcoin:${addr}`;
    }
    case "paypal": {
      const user = getValue("paypal");
      const amount = getValue("paypal-amount");
      const currency = getValue("paypal-currency");
      if (!user) return "https://paypal.me/seunome";
      const base = amount ? `https://paypal.me/${user}/${amount}` : `https://paypal.me/${user}`;
      return currency ? `${base}?currency=${currency}` : base;
    }
    case "vcard": {
      const name = getValue("vcard-name");
      const org = getValue("vcard-org");
      const phone = getValue("vcard-phone");
      const email = getValue("vcard-email");
      const fn = name || "Seu Nome";
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${fn}`,
        `FN:${fn}`
      ];
      if (org) lines.push(`ORG:${org}`);
      if (phone) lines.push(`TEL:${phone}`);
      if (email) lines.push(`EMAIL:${email}`);
      lines.push("END:VCARD");
      return lines.join("\n");
    }
    case "whatsapp": {
      const number = getValue("whats");
      const msg = encodeURIComponent(getValue("whats-msg"));
      if (!number) return "https://wa.me/5511900000000";
      return msg ? `https://wa.me/${number}?text=${msg}` : `https://wa.me/${number}`;
    }
    case "wifi": {
      const ssid = getValue("wifi-ssid");
      const pass = getValue("wifi-pass");
      const type = getValue("wifi-type");
      const hidden = getValue("wifi-hidden");
      if (!ssid) return "WIFI:T:WPA;S:MinhaRede;P:senha;H:false;;";
      const auth = type === "nopass" ? "nopass" : type;
      const escapedSsid = escapeWifiValue(ssid);
      const escapedPass = escapeWifiValue(pass);
      const parts = [`T:${auth}`, `S:${escapedSsid}`];
      if (auth !== "nopass" && escapedPass) {
        parts.push(`P:${escapedPass}`);
      }
      parts.push(`H:${hidden ? "true" : "false"}`);
      return `WIFI:${parts.join(";")};;`;
    }
    case "zoom":
      return getValue("zoom") || "https://zoom.us/j/123456789";
    default:
      return "https://seusite.com";
  }
};

const updatePreview = () => {
  const payload = buildPayload();
  elements.previewSize.textContent = `${state.size} x ${state.size} px`;
  elements.bgColor.disabled = state.colors.transparent;
  elements.fgColor.disabled = state.gradient.enabled;
  elements.gradientControls.classList.toggle("is-hidden", !state.gradient.enabled);

  qrCode.update({
    width: state.size,
    height: state.size,
    data: payload,
    image: state.logo || undefined,
    dotsOptions: getDotsOptions(),
    cornersSquareOptions: {
      color: state.colors.eyeFrame,
      type: state.shapes.cornerSquare
    },
    cornersDotOptions: {
      color: state.colors.eyeCenter,
      type: state.shapes.cornerDot
    },
    backgroundOptions: {
      color: state.colors.transparent ? "transparent" : state.colors.bg
    },
    imageOptions: {
      margin: state.logoMargin,
      crossOrigin: "anonymous"
    }
  });
};

const setActiveType = (type) => {
  state.type = type;
  typeCards.forEach((card) => {
    card.classList.toggle("is-active", card.dataset.type === type);
  });
  forms.forEach((form) => {
    form.classList.toggle("is-hidden", form.dataset.form !== type);
  });
  updatePreview();
};

const bindRadioSelects = () => {
  const selectContainers = Array.from(document.querySelectorAll(".radio-select"));

  const syncSelect = (container) => {
    const checked = container.querySelector('input[type="radio"]:checked');
    if (!checked) return;
    const option = checked.closest(".radio-select-option");
    const labelEl = container.querySelector(".radio-select-label");
    const previewEl = container.querySelector(".radio-select-preview");
    const optionLabel = option?.querySelector("span");
    const optionShape = option?.querySelector(".shape");

    if (labelEl && optionLabel) {
      labelEl.textContent = optionLabel.textContent;
    }
    if (previewEl && optionShape) {
      previewEl.className = optionShape.className;
    }
  };

  selectContainers.forEach((container) => {
    const trigger = container.querySelector(".radio-select-trigger");
    const options = Array.from(container.querySelectorAll('input[type="radio"]'));

    syncSelect(container);

    trigger?.addEventListener("click", (event) => {
      event.stopPropagation();
      selectContainers.forEach((other) => {
        if (other !== container) other.classList.remove("is-open");
      });
      container.classList.toggle("is-open");
    });

    options.forEach((radio) => {
      radio.addEventListener("change", () => {
        syncSelect(container);
        container.classList.remove("is-open");
      });
    });
  });

  document.addEventListener("click", () => {
    selectContainers.forEach((container) => container.classList.remove("is-open"));
  });
};

const bindInputs = () => {
  document.querySelectorAll("input, textarea, select").forEach((input) => {
    const handler = () => {
      const nextGradientEnabled = elements.fgGradientEnabled.checked;
      let nextFg = elements.fgColor.value;
      let nextGradientStart = elements.fgGradientStart.value;
      const nextGradientEnd = elements.fgGradientEnd.value;

      if (nextGradientEnabled) {
        // When gradient is enabled, gradient start becomes the source of truth.
        if (!state.gradient.enabled) {
          nextGradientStart = nextFg;
          elements.fgGradientStart.value = nextGradientStart;
        }
        nextFg = nextGradientStart;
        elements.fgColor.value = nextFg;
      } else {
        // When gradient is disabled, first-plane color is the source of truth.
        if (state.gradient.enabled) {
          nextFg = nextGradientStart;
          elements.fgColor.value = nextFg;
        }
        nextGradientStart = nextFg;
        elements.fgGradientStart.value = nextGradientStart;
      }

      state.colors.bg = elements.bgColor.value;
      state.colors.fg = nextFg;
      state.colors.eyeFrame = elements.eyeFrame.value;
      state.colors.eyeCenter = elements.eyeCenter.value;
      state.colors.transparent = elements.bgTransparent.checked;
      state.gradient.enabled = nextGradientEnabled;
      state.gradient.start = nextGradientStart;
      state.gradient.end = nextGradientEnd;
      state.gradient.mode = getCheckedRadioValue("gradient-mode", "linear-0");
      state.shapes.dots = getCheckedRadioValue("dots-type", "square");
      state.shapes.cornerSquare = getCheckedRadioValue("corner-square", "square");
      state.shapes.cornerDot = getCheckedRadioValue("corner-dot", "square");
      state.logoMargin = Number(elements.logoMargin.value);
      const rawSize = Number(elements.size.value || 1000);
      const clampedSize = Math.min(2000, Math.max(200, rawSize));
      if (clampedSize !== rawSize) {
        elements.size.value = String(clampedSize);
      }
      state.size = clampedSize;
      elements.bgColor.disabled = state.colors.transparent;
      updatePreview();
    };
    input.addEventListener("input", handler);
    input.addEventListener("change", handler);
  });

  elements.logo.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      state.logo = null;
      updatePreview();
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      state.logo = reader.result;
      updatePreview();
    };
    reader.readAsDataURL(file);
  });

  elements.btnDownloadPng.addEventListener("click", async () => {
    const canProceed = await consumeQuota();
    if (!canProceed) return;
    qrCode.download({ extension: "png" });
  });
  elements.btnDownloadSvg.addEventListener("click", async () => {
    const canProceed = await consumeQuota();
    if (!canProceed) return;
    qrCode.download({ extension: "svg" });
  });

  elements.btnCopy.addEventListener("click", async () => {
    const payload = buildPayload();
    try {
      await navigator.clipboard.writeText(payload);
      elements.btnCopy.textContent = "Copiado!";
      setTimeout(() => {
        elements.btnCopy.textContent = "Copiar conteúdo";
      }, 1500);
    } catch {
      elements.btnCopy.textContent = "Não foi possível copiar";
      setTimeout(() => {
        elements.btnCopy.textContent = "Copiar conteúdo";
      }, 1500);
    }
  });
};

const bindTypeGrid = () => {
  elements.typeGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".type-card");
    if (!button) return;
    setActiveType(button.dataset.type);
  });
};

const consumeQuota = async () => {
  if (window.__qrUser?.unlimited) return true;

  try {
    const response = await fetch("/api/qr/consume", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        payload: buildPayload()
      })
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "Nao foi possivel registrar a geracao.");
      return false;
    }
    if (elements.remainingCounter && typeof data.remaining === "number") {
      elements.remainingCounter.textContent = String(data.remaining);
    }
    return true;
  } catch {
    alert("Falha ao validar seu limite mensal.");
    return false;
  }
};

bindTypeGrid();
bindRadioSelects();
bindInputs();
setActiveType("url");
updatePreview();
