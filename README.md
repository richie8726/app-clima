# ☁️ SkyCast

Aplicación web moderna para consultar el clima actual y pronóstico extendido de 5 días, desarrollada con **HTML, CSS y JavaScript** usando la API de [OpenWeatherMap](https://openweathermap.org/).

## ✨ Funcionalidades

- 🔎 Búsqueda de ciudades y muestra del clima actual.
- 📊 Pronóstico extendido de **5 días**.
- 📍 Opción de usar la **geolocalización automática**.
- 🕒 Modo nocturno automático y manual.
- 🗂️ Historial de búsquedas recientes (se guarda en LocalStorage).
- 🎨 Fondo dinámico según el clima actual (soleado, nublado, lluvia, nieve, etc.).
- 📱 **Responsive Design**: usable en PC, tablets y móviles.

---

## 🚀 Instalación y uso

### 1. Clonar el repositorio
```bash
git clone https://github.com/tuusuario/skycast.git
cd skycast
```

### 2. Crear archivo `config.js`
⚠️ **Importante**: este archivo **no se sube a GitHub** por seguridad.  
En la raíz del proyecto (donde está `index.html`), crear un archivo llamado `config.js` con este contenido:

```javascript
// config.js (NO subir a GitHub)
const API_KEY = "TU_API_KEY_DE_OPENWEATHERMAP";
```

### 3. Obtener tu API Key
1. Registrate gratis en [OpenWeatherMap](https://home.openweathermap.org/users/sign_up).
2. En tu panel de usuario, copiá tu **API Key**.
3. Pegala en el `config.js` que creaste.

### 4. Abrir la app
Solo abrí el archivo `index.html` en tu navegador favorito.  
No necesitas instalar nada más 🚀

---

## 📸 Capturas

### Pantalla principal
![Pantalla principal](assets/screenshot-main.png)

### Pronóstico extendido
![Pronóstico](assets/screenshot-forecast.png)

---

## 🔒 Seguridad de la API Key

¿Por qué el `config.js` no se sube a GitHub?
- Evita que tu clave quede pública y otros la usen sin permiso.
- Cada persona que use el proyecto debe crear su propio `config.js`.

Si accidentalmente subís tu clave, podés:
1. Revocarla desde el panel de OpenWeatherMap.
2. Generar una nueva.

👉 Para evitar subir el archivo `config.js`, agregá un archivo llamado **`.gitignore`** en la raíz del proyecto con este contenido:

```gitignore
# Ignorar la configuración privada de la API
config.js

# Archivos del sistema
.DS_Store
Thumbs.db
```

---

## 🛠️ Tecnologías usadas

- HTML5 + CSS3 + JavaScript (Vanilla)
- OpenWeatherMap API
- Weather Icons
- Google Fonts

---

## 👨‍💻 Autor

Desarrollado por Ponce Ricardo Andrés 🚀