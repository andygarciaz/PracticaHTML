// Esperamos a que el documento cargue
document.addEventListener('DOMContentLoaded', function() {
    
    // Seleccionamos el formulario de login
    const loginForm = document.getElementById('formularioLogin');
    
    // Verificamos si estamos en la página de login antes de agregar el evento
    if(loginForm) {
        loginForm.addEventListener('submit', async function(evento) {
            evento.preventDefault(); // Esto evita que la página se recargue sola al dar clic
            
            // Obtenemos lo que el usuario escribió
            const usuarioIngresado = document.getElementById('usuario').value;
            const passwordIngresado = document.getElementById('contrasena').value;
            
            // Validamos las credenciales (puedes cambiar "admin" y "1234" por lo que quieras)
            try {
                const respuesta = await fetch("http://localhost:4000/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username: usuarioIngresado,
                        password: passwordIngresado
                    })
                });

                const datos = await respuesta.json();

                if (respuesta.ok && datos.login) {
                    // Guardamos información básica del usuario en el navegador
                    localStorage.setItem("usuarioActual", JSON.stringify(datos.user));

                    // Redirigimos al perfil
                    window.location.href = "profile.html";
                } else {
                    alert(datos.message || "Usuario o contraseña incorrectos.");
                }
            } catch (error) {
                console.error("Error al conectar con el backend:", error);

                alert("No se pudo conectar con el servidor.");
            }
        });
    }
    // --- PARTE 3: Lógica del Formulario ---
    
    // 1. Radio Buttons para mostrar/ocultar
    const radioMostrar = document.getElementById('radioMostrar');
    const radioOcultar = document.getElementById('radioOcultar');
    const contenidoOculto = document.getElementById('contenidoOculto');

    if (radioMostrar && radioOcultar) {
        radioMostrar.addEventListener('change', () => contenidoOculto.style.display = 'block');
        radioOcultar.addEventListener('change', () => contenidoOculto.style.display = 'none');
    }

    // 2. Checkboxes para activar botón
    const check1 = document.getElementById('check1');
    const check2 = document.getElementById('check2');
    const btnActivar = document.getElementById('btnActivar');

    if (check1 && check2) {
        const validarChecks = () => {
            // El botón se habilita SOLO si ambos están marcados (true)
            btnActivar.disabled = !(check1.checked && check2.checked);
        };
        check1.addEventListener('change', validarChecks);
        check2.addEventListener('change', validarChecks);
    }

    // 3. Dropdowns con JSON de Países y Regiones
    const selectPais = document.getElementById('pais');
    const selectRegion = document.getElementById('region');

    if (selectPais && selectRegion) {
        // Simulación del JSON 
        const countryRegionData = [
            { countryName: "México", regions: ["Nuevo León", "Jalisco", "Ciudad de México"] },
            { countryName: "Canadá", regions: ["Ontario", "Quebec", "Columbia Británica"] },
            { countryName: "Japón", regions: ["Tokio", "Osaka", "Kioto"] }
        ];

        // Llenar el primer menú (Países)
        countryRegionData.forEach(pais => {
            const opcion = document.createElement('option');
            opcion.value = pais.countryName;
            opcion.textContent = pais.countryName;
            selectPais.appendChild(opcion);
        });

        // Detectar cambio de país para llenar las regiones
        selectPais.addEventListener('change', function() {
            // Limpiar las regiones anteriores
            selectRegion.innerHTML = '<option value="">Selecciona una región...</option>';
            
            // Buscar las regiones del país elegido
            const paisSeleccionado = countryRegionData.find(p => p.countryName === this.value);
            
            if (paisSeleccionado) {
                paisSeleccionado.regions.forEach(region => {
                    const opcion = document.createElement('option');
                    opcion.value = region;
                    opcion.textContent = region;
                    selectRegion.appendChild(opcion);
                });
            }
        });
    }
    // Función opcional para cuando le den clic al botón ya habilitado
    if (btnActivar) {
        btnActivar.addEventListener('click', function() {
            alert("¡Formulario enviado con éxito!");
        });
    }
});