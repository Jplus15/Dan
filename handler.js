/**
 * Manejador principal del stream de video
 */
class StreamHandler {
    /**
     * @param {Object} config - ConfiguraciÃ³n inicial
     */
    constructor(config) {
        this.player = null;
        this.config = {
            containerId: 'player',
            errorContainer: 'error-message',
            theme: {
                colors: {
                    active: "#e50914",      // Color Netflix
                    inactive: "#ffffff",
                    background: "transparent"
                }
            },
            ...config
        };
    }

    /**
     * Construye la URL del proxy
     */
    buildProxyUrl(streamUrl) {
        return `/?proxy=1&url=${encodeURIComponent(streamUrl)}`;
    }

    /**
     * Inicializa el stream
     */
    async initializeStream(playerData) {
        try {
            const { streamUrl, metadata } = playerData;
            if (!streamUrl) throw new Error('URL no proporcionada');

            const proxyUrl = this.buildProxyUrl(streamUrl);
            await this.setupPlayer(proxyUrl, metadata);
        } catch (error) {
            console.error('Error al inicializar stream:', error);
        }
    }

    /**
     * Configura el reproductor
     */
    async setupPlayer(proxyUrl, metadata = {}) {
        const playerInstance = jwplayer(this.config.containerId).setup({
            // ConfiguraciÃ³n bÃ¡sica
            width: "100%",
            height: "100%",
            aspectratio: "16:9",
            controls: true,
            sharing: true,
            displaytitle: true,
            displaydescription: true,
            abouttext: "WishDirect Player",
            aboutlink: "#",

            // ReproducciÃ³n y volumen
            autostart: true,
            mute: false,
            volume: 100,
            startmuted: false,

            // Tema y apariencia
            skin: {
                name: "netflix"
            },
            ...this.config.theme,

            // ConfiguraciÃ³n tÃ©cnica
            stretching: "uniform",
            primary: "html5",
            hlshtml: true,
            preload: "auto",
            file: proxyUrl,
            type: "hls",

            // Controles - Removemos explÃ­citamente rewind
            controlbar: {
                elements: ['play', 'progress', 'duration', 'volume', 'fullscreen']
            },

            // Desactivar caracterÃ­sticas por defecto
            features: {
                rewind: false,  // Desactivar botÃ³n de retroceso por defecto
                forward: false  // Desactivar botÃ³n de avance por defecto
            },

            // Agregar configuraciÃ³n del logo
            logo: {
                file: "/assets/images/logo.png",  // Ruta a tu logo
                position: "top-right",
                margin: "20",
                hide: false,
                link: "#",
                width: "150",   // ancho en pÃ­xeles
                height: "90"    // alto en pÃ­xeles
            },
        });

        // Forzar volumen despuÃ©s de la inicializaciÃ³n
        playerInstance.on('ready', function() {
            playerInstance.setMute(false);
            playerInstance.setVolume(100);
        });

        // Manejador de errores
        playerInstance.on('error', function(e) {
            console.error('Error del reproductor:', e);
        });

        // Configurar eventos cuando el player estÃ¡ listo
        playerInstance.on("ready", function() {
            const playerContainer = playerInstance.getContainer();
            const controlbar = playerContainer.querySelector(".jw-button-container");
            
            // Remover botones por defecto de forma mÃ¡s agresiva
            const defaultButtons = controlbar.querySelectorAll(".jw-icon-rewind, .jw-icon-forward");
            defaultButtons.forEach(button => button.remove());
            
            // BotÃ³n de retroceder personalizado
            const rewindButton = document.createElement("div");
            rewindButton.className = "jw-icon jw-icon-inline jw-button-color jw-reset custom-rewind-btn";
            rewindButton.innerHTML = "âŸ²10";
            rewindButton.onclick = () => playerInstance.seek(Math.max(0, playerInstance.getPosition() - 10));
            
            // BotÃ³n de adelantar personalizado
            const forwardButton = document.createElement("div");
            forwardButton.className = "jw-icon jw-icon-inline jw-button-color jw-reset custom-forward-btn";
            forwardButton.innerHTML = "10âŸ³";
            forwardButton.onclick = () => playerInstance.seek(playerInstance.getPosition() + 10);
            
            // Insertar botones despuÃ©s del botÃ³n de play
            const playButton = controlbar.querySelector(".jw-icon-playback");
            controlbar.insertBefore(rewindButton, playButton.nextSibling);
            controlbar.insertBefore(forwardButton, rewindButton.nextSibling);
        });

        this.player = playerInstance;
        return playerInstance;
    }
}
