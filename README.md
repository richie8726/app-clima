# ☁️ SkyCast

Aplicación web moderna para consultar el clima actual y pronóstico extendido de 5 días, desarrollada con **HTML, CSS y JavaScript** usando la API de [OpenWeatherMap](https://openweathermap.org/), desplegada en **Netlify** con funciones serverless.

## ✨ Funcionalidades

* 🔎 Búsqueda de ciudades y muestra del clima actual.
* 📊 Pronóstico extendido de **5 días**.
* 📍 Opción de usar la **geolocalización automática**.
* 🕒 Modo nocturno automático y manual.
* 🗂️ Historial de búsquedas recientes (se guarda en LocalStorage).
* 🎨 Fondo dinámico según el clima actual (soleado, nublado, lluvia, nieve, etc.).
* 📱 **Responsive Design**: usable en PC, tablets y móviles.

---

## 🚀 Instalación y uso (local)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tuusuario/skycast.git
cd skycast
```

### 2. Instalar dependencias

Este proyecto usa funciones en **Netlify** que requieren `node-fetch`.
Instalá las dependencias con:

```bash
npm install
```

### 3. Configurar variables de entorno

⚠️ La API Key ya no se guarda en `config.js`, sino como **variable de entorno** en Netlify.

Si querés probar localmente:

1. Creá un archivo `.env` en la raíz del proyecto.
2. Agregá tu API key:

   ```
   API_KEY=TU_API_KEY_DE_OPENWEATHERMAP
   ```

### 4. Ejecutar en local

Con el CLI de Netlify podés correr las funciones:

```bash
npm install -g netlify-cli
netlify dev
```

Esto abrirá la app en `http://localhost:8888` con soporte para las funciones serverless.

---

## 🌐 Deploy en Netlify

1. Subí el repositorio a GitHub.
2. Conectá el repo a tu cuenta de Netlify.
3. En **Site settings > Build & deploy > Environment variables**, agregá tu clave:

   ```
   API_KEY=TU_API_KEY_DE_OPENWEATHERMAP
   ```
4. Deploy automático al hacer `git push`.

👉 La API key queda segura en el servidor y **no se expone en el cliente**.

---

## 📸 Capturas

### Pantalla principal

![Pantalla principal](assets/screenshot-main.png)

### Pronóstico extendido

![Pronóstico](assets/screenshot-forecast.png)

---

## 🔒 Seguridad

* La API Key no está en el repositorio.
* Se maneja desde **variables de entorno en Netlify**.
* El cliente llama a `/.netlify/functions/weather` en lugar de conectarse directo a OpenWeatherMap.

---

## 🛠️ Tecnologías usadas

* HTML5 + CSS3 + JavaScript (Vanilla)
* Netlify Functions (serverless)
* OpenWeatherMap API
* Weather Icons
* Google Fonts

---

## 👨‍💻 Autor

Desarrollado por Ponce Ricardo Andrés 🚀
