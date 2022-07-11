let tableRoommates = document.querySelector('.tableRoommates');
tableRoommates.innerHTML = '';
let tableGastos = document.querySelector('.tableGastos');
tableGastos.innerHTML = '';
let selectRoommate = document.querySelector('.selectRoommate');
let btnAgregarRoommate = document.querySelector('.agregarRoommate');
let btnAgregarGasto = document.querySelector('.agregarGasto');
let datosForm = document.querySelectorAll('.datosForm');

window.addEventListener("load", function () {
    cargarDatos();
    console.log("DOM cargado");
});

btnAgregarRoommate.addEventListener('click', function () {
    console.log("Añadiendo un roommate");
    agregarRoommate();
});

btnAgregarGasto.addEventListener('click', function () {
    console.log("Añadiendo un gasto");
    agregarGasto();
});

//Mostrar datos existentes de roommates y gastos al cargar el DOM
const cargarDatos = async () => {
    //Cargar datos de los roommates
    try {
        const response = await fetch('http://127.0.0.1:3000/roommates');
        const resJson = await response.json();
        for (let i = 0; i < resJson.length; i++) {
            //Tabla de roommates
            tableRoommates.innerHTML += (`
                <tr>
                    <td>${resJson[i].nombre}</td>
                    <td class="text-danger">${resJson[i].debe ? resJson[i].debe : "-"}</td>
                    <td class="text-success">${resJson[i].haber ? resJson[i].haber : "-"}</td> 
                </tr>`);
            //Lista desplegable de roommates en columna de agregar gastos
            selectRoommate.innerHTML += (` <option value="${resJson[i].id}">${resJson[i].nombre}</option>`);
        }
    } catch (error) {
        console.log(error);
    }
    //Cargar datos de los gastos
    try {
        const response = await fetch('http://127.0.0.1:3000/gastos');
        const resJson = await response.json();
        for (let i = 0; i < resJson.length; i++) {
            tableGastos.innerHTML += (`
        <tr>
            <td>${resJson[i].nombreRoommate}</td>
            <td>${resJson[i].descripcion}</td>
            <td>${resJson[i].monto}</td>
            <td align-items-center justify-content-between">
            <!-- al hacer click en los botones de editar y borrar, pasamos el valor del id como argumento a una funcion-->
                <i class="fa-solid fa-pen-to-square" onclick="editarGasto('${resJson[i].id}')"></i>
                <i class="fas fa-trash-alt text-danger" onclick="eliminarGasto('${resJson[i].id}')" ></i>
            </td>
        </tr>
    `);
        }
    } catch (error) {
        console.log(error);
    }
};

//Limpiar tablas y inputs cada vez que se agrega un nuevo roommate o gasto
const limpiar = () => {
    tableRoommates.innerHTML = '';
    selectRoommate.innerHTML = '';
    tableGastos.innerHTML = '';
    datosForm[0].value = '';
    datosForm[1].value = '';
}

//Agregar un roommate
const agregarRoommate = async () => {
    try {
        await fetch("http://127.0.0.1:3000/roommates", { method: "POST" });
        limpiar();
        cargarDatos()
    } catch (error) {
        console.error(error);
    }
}

//Agregar un gasto
const agregarGasto = async () => {
    try {
        let select = selectRoommate.value;
        let text = selectRoommate.options[selectRoommate.selectedIndex].innerText;
        datosForm.values();
        await fetch("http://127.0.0.1:3000/gastos", {
            method: "POST",
            body: JSON.stringify({
                idRoommate: select,
                nombreRoommate: text,
                descripcion: datosForm[0].value,
                monto: datosForm[1].value
            })
        })
        actualizarMontos(select);
        limpiar();
        cargarDatos();
    } catch (error) {
        console.error(error);
    }
}

//Actualizar debe y haber de un roommate cuando se presente un cambio en los gastos
const actualizarMontos = async (id) => {
    //OBTENER VALORE ORIGINALES DE DEBE Y HABER
    try {
        const response = await fetch("http://127.0.0.1:3000/roommates/" + id);
        const nombre = await response.json();
        console.log(nombre);
    } catch (error) {
        console.log(error);
    }

}

const editarGasto = async (id) => {
    console.log("Editando un gasto");
};

const eliminarGasto = async (id) => {
    console.log("Eliminando un gasto");
    await fetch("http://127.0.0.1:3000/gastos/" + id, {
        method: "DELETE"
    })
        .then(() => {
            console.log(id)
            limpiar();
            cargarDatos();
        })
        .catch(error => {
            console.error(error);
        });
};