# 🌦️ Meteorologi

Aplicación web moderna para consultar el clima actual y el pronóstico extendido de 5 días.
Desarrollada con **HTML, CSS y JavaScript**, usando la API de [OpenWeatherMap](https://openweathermap.org/) y desplegada en **Netlify** con funciones serverless.

---

## ✨ Funcionalidades

* 🔎 Búsqueda de ciudades y muestra del clima actual.
* 🌤️ Íconos animados en **SVG** (sol girando, nubes flotando, lluvia y nieve animadas).
* 📊 Pronóstico extendido de **5 días**.
* 🌗 Modo día/noche automático.
* 📍 Opción de usar la **geolocalización automática**.
* 🎨 Fondo dinámico con gradientes animados según el clima.
* 📱 Diseño **responsive**, adaptable a PC, tablets y móviles.

---

## 🚀 Instalación y uso local

### 1. Clonar el repositorio

```bash
git clone https://github.com/tuusuario/meteorologi.git
cd meteorologi
```

### 2. Instalar dependencias

El proyecto usa funciones en **Netlify** con `node-fetch` para acceder a la API del clima.

```bash
npm install
```

### 3. Configurar variables de entorno

En **Netlify** (o localmente en `.env`):

```
API_KEY=TU_API_KEY_DE_OPENWEATHERMAP
```

### 4. Ejecutar en modo desarrollo

```bash
npm install -g netlify-cli
netlify dev
```

Esto ejecutará la app en `http://localhost:8888` con soporte para las funciones serverless.

---

## 🌐 Deploy en Netlify

1. Subí el proyecto a GitHub.

2. Conectalo con Netlify.

3. En **Site settings → Build & deploy → Environment variables**, agregá:

   ```
   API_KEY=TU_API_KEY_DE_OPENWEATHERMAP
   ```

4. ¡Listo! Cada `git push` actualizará tu sitio automáticamente.

---

## 📸 Capturas

### Pantalla principal

![Pantalla principal](assets/screenshot-main.png)

### Pronóstico extendido

![Pronóstico](assets/screenshot-forecast.png)

---

## 🔒 Seguridad

* La API Key no se guarda en el cliente.
* Se maneja como variable de entorno en Netlify.
* Las peticiones a la API pasan por la función `/.netlify/functions/weather`.

---

## 🛠️ Tecnologías usadas

* HTML5 + CSS3 + JavaScript (Vanilla)
* Netlify Functions (Serverless)
* OpenWeatherMap API
* SVG Animations
* Google Fonts

---

## 👨‍💻 Autor

Desarrollado por **Ricardo Andrés Ponce** 🚀
