const API_URL = "http://localhost:4000";
let usuarioEditandoId = null;

// ------------------------------------------
// USUARIO QUE INICIÓ SESIÓN
// ------------------------------------------

const usuarioActual =
    JSON.parse(localStorage.getItem("usuarioActual"));

// Si nadie inició sesión, regresar al login
if (!usuarioActual) {
    window.location.href = "index.html";
}


// Mostrar nombre del usuario
const usuarioBienvenida =
    document.getElementById("usuarioBienvenida");

if (usuarioBienvenida) {
    usuarioBienvenida.textContent =
        `Hola, ${usuarioActual.name}`;
}


// ------------------------------------------
// FOTO DEL USUARIO
// ------------------------------------------

const fotoUsuario =
    document.getElementById("fotoUsuario");

if (fotoUsuario) {

    const fotosUsuarios = {
        andyzarateg: "fotos/andreagarcia.jpg",
        dannyslnss: "fotos/danielsalinas.jpeg",
        lilivislas: "fotos/liliaislas.jpeg"
    };
    fotoUsuario.src =
        fotosUsuarios[usuarioActual.username]
        || "fotos/default.jpg";

}

// ------------------------------------------
// OBTENER TODOS LOS USUARIOS
// ------------------------------------------

async function cargarUsuarios() {

    const tabla = document.getElementById("tablaUsuarios");
    const mensaje = document.getElementById("mensajeUsuarios");

    try {

        mensaje.className = "alert alert-info";
        mensaje.textContent = "Cargando usuarios...";

        const respuesta = await fetch(`${API_URL}/users`);

        if (!respuesta.ok) {
            throw new Error("No se pudieron obtener los usuarios.");
        }

        const usuarios = await respuesta.json();
        // Actualizamos estadísticas
        const totalUsuarios =
            document.getElementById("totalUsuarios");

        const promedioPuntos =
            document.getElementById("promedioPuntos");

        if (totalUsuarios) {
            totalUsuarios.textContent = usuarios.length;
        }

        const sumaPuntos = usuarios.reduce(
            (total, usuario) => total + Number(usuario.points),
            0
        );

        const promedio =
            usuarios.length > 0
                ? Math.round(sumaPuntos / usuarios.length)
                : 0;

        if (promedioPuntos) {
            promedioPuntos.textContent = promedio;
        }

        // Limpiamos la tabla antes de llenarla
        tabla.innerHTML = "";


        // Si no existen usuarios
        if (usuarios.length === 0) {

            mensaje.className = "alert alert-warning";

            mensaje.textContent =
                "Actualmente no existen usuarios registrados.";

            return;
        }


        // Recorremos los usuarios recibidos del backend
        usuarios.forEach(usuario => {

            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${usuario.id}</td>
                <td>${usuario.name}</td>
                <td>${usuario.age}</td>
                <td>${usuario.points}</td>
                <td>${usuario.username}</td>

                <td>
                    <button
                        class="btn btn-warning btn-sm me-2"
                        onclick="editarUsuario(${usuario.id})"
                    >
                        Editar
                    </button>

                    <button
                        class="btn btn-danger btn-sm"
                        onclick="eliminarUsuario(${usuario.id})"
                    >
                        Eliminar
                    </button>
                </td>
            `;

            tabla.appendChild(fila);
        });


        mensaje.className = "alert alert-success";

        mensaje.textContent =
            `Se cargaron ${usuarios.length} usuario(s) correctamente.`;


    } catch (error) {

        console.error("Error al obtener usuarios:", error);

        mensaje.className = "alert alert-danger";

        mensaje.textContent =
            "No fue posible conectarse con el backend.";
    }
}

// ------------------------------------------
// CARGAR USUARIO EN EL FORMULARIO PARA EDITAR
// ------------------------------------------

async function editarUsuario(id) {

    try {

        const respuesta = await fetch(`${API_URL}/users/${id}`);

        if (!respuesta.ok) {
            throw new Error("No se pudo obtener el usuario.");
        }

        const usuario = await respuesta.json();

        // Guardamos el ID del usuario que estamos editando
        usuarioEditandoId = usuario.id;

        // Llenamos el formulario con sus datos
        document.getElementById("nombreUsuario").value = usuario.name;
        document.getElementById("edadUsuario").value = usuario.age;
        document.getElementById("puntosUsuario").value = usuario.points;
        document.getElementById("usernameUsuario").value = usuario.username;

        // Por ahora dejamos password vacío
        document.getElementById("passwordUsuario").value = "";

        // Cambiamos la apariencia del botón
        const btnGuardar =
            document.getElementById("btnGuardarUsuario");

        btnGuardar.textContent = "Guardar cambios";
        btnGuardar.classList.remove("btn-success");
        btnGuardar.classList.add("btn-warning");

        // Mostramos botón cancelar
        document
            .getElementById("btnCancelarEdicion")
            .classList.remove("d-none");

        // Subimos al formulario
        document.getElementById("formUsuario").scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {

        console.error("Error al cargar usuario:", error);

        alert("No fue posible cargar los datos del usuario.");
    }
}

// ------------------------------------------
// ELIMINAR USUARIO
// ------------------------------------------

async function eliminarUsuario(id) {

    const confirmar = confirm(
        "¿Estás seguro de que deseas eliminar este usuario?"
    );

    if (!confirmar) {
        return;
    }

    try {

        const respuesta = await fetch(
            `${API_URL}/users/${id}`,
            {
                method: "DELETE"
            }
        );

        if (!respuesta.ok) {
            throw new Error("No se pudo eliminar el usuario.");
        }

        alert("Usuario eliminado correctamente.");

        // Recargamos la tabla
        await cargarUsuarios();

    } catch (error) {

        console.error("Error al eliminar usuario:", error);

        alert("Ocurrió un error al eliminar el usuario.");
    }
}
// ------------------------------------------
// CREAR O ACTUALIZAR USUARIO
// ------------------------------------------

const formUsuario = document.getElementById("formUsuario");

if (formUsuario) {

    formUsuario.addEventListener("submit", async function(evento) {

        evento.preventDefault();

        const datosUsuario = {
            name: document.getElementById("nombreUsuario").value,
            age: Number(document.getElementById("edadUsuario").value),
            points: Number(document.getElementById("puntosUsuario").value),
            username: document.getElementById("usernameUsuario").value,
            password: document.getElementById("passwordUsuario").value
        };

        try {

            let respuesta;

            // Si NO estamos editando, creamos un usuario
            if (usuarioEditandoId === null) {

                respuesta = await fetch(`${API_URL}/users`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(datosUsuario)
                });

            }

            // Si SÍ estamos editando, actualizamos el usuario
            else {

                respuesta = await fetch(
                    `${API_URL}/users/${usuarioEditandoId}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(datosUsuario)
                    }
                );
            }


            if (!respuesta.ok) {
                throw new Error("No se pudo guardar el usuario.");
            }


            if (usuarioEditandoId === null) {
                alert("Usuario creado correctamente.");
            } else {
                alert("Usuario actualizado correctamente.");
            }


            limpiarFormulario();

            await cargarUsuarios();


        } catch (error) {

            console.error("Error al guardar usuario:", error);

            alert("Ocurrió un error al guardar el usuario.");
        }

    });

}

// ------------------------------------------
// LIMPIAR FORMULARIO
// ------------------------------------------

function limpiarFormulario() {

    formUsuario.reset();

    usuarioEditandoId = null;

    const btnGuardar =
        document.getElementById("btnGuardarUsuario");

    btnGuardar.textContent = "Agregar usuario";

    btnGuardar.classList.remove("btn-warning");
    btnGuardar.classList.add("btn-success");

    document
        .getElementById("btnCancelarEdicion")
        .classList.add("d-none");
}

// ------------------------------------------
// CANCELAR EDICIÓN
// ------------------------------------------

const btnCancelarEdicion =
    document.getElementById("btnCancelarEdicion");

if (btnCancelarEdicion) {

    btnCancelarEdicion.addEventListener(
        "click",
        limpiarFormulario
    );

}
// ------------------------------------------
// BOTÓN ACTUALIZAR
// ------------------------------------------

const btnActualizar = document.getElementById("btnActualizar");

if (btnActualizar) {

    btnActualizar.addEventListener("click", cargarUsuarios);

}

// ------------------------------------------
// CERRAR SESIÓN
// ------------------------------------------

const btnCerrarSesion =
    document.getElementById("btnCerrarSesion");

if (btnCerrarSesion) {

    btnCerrarSesion.addEventListener("click", function() {

        localStorage.removeItem("usuarioActual");

        window.location.href = "index.html";

    });

}


// ------------------------------------------
// CARGAR USUARIOS AL ABRIR LA PÁGINA
// ------------------------------------------

document.addEventListener("DOMContentLoaded", cargarUsuarios);