let tableRoommates = document.querySelector('.tableRoommates');
tableRoommates.innerHTML = '';
let tableGastos = document.querySelector('.tableGastos');
tableGastos.innerHTML = '';
let selectRoommate = document.querySelector('.selectRoommate');
let selectRoommateModal = document.querySelector('.roommatesSelectModal');
let optionModal = document.querySelectorAll('.optionModal');
let btnAgregarRoommate = document.querySelector('.agregarRoommate');
let btnAgregarGasto = document.querySelector('.agregarGasto');
let datosForm = document.querySelectorAll('.datosForm');

//EVENTOS
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

//MOSTRAR DATOS DE ROOMMATES Y GASTOS
const cargarDatos = async () => {
    //CARGAR ROOMMATES
    try {
        const response = await fetch('http://127.0.0.1:3000/roommates');
        const resJson = await response.json();
        for (let i = 0; i < resJson.length; i++) {
            //TABLA DE ROOMMATES
            tableRoommates.innerHTML += (`
                <tr>
                    <td>
                        <i class="fa-solid fa-xmark text-danger" onclick="eliminarRoommate('${resJson[i].id}')"></i>
                    </td>
                    <td>${resJson[i].nombre}</td>
                    <td class="text-danger">${resJson[i].debe ? resJson[i].debe : "-"}</td>
                    <td class="text-success">${resJson[i].haber ? resJson[i].haber : "-"}</td> 
                </tr>`);
            //LISTA DESPLEGABLE DE ROOMMATES EN COLUMNA DE AGREGAR GASTOS
            selectRoommate.innerHTML += (` <option value="${resJson[i].id}">${resJson[i].nombre}</option>`);
            //LISTA DESPLEGABLE DE ROOMMATES EN MODAL
            selectRoommateModal.innerHTML += (` <option value="${resJson[i].id}">${resJson[i].nombre}</option>`);
        }
    } catch (error) {
        console.log(error);
    }
    //CARGAS GASTOS DE LOS ROOMMATES
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
                <i class="fa-solid fa-pen-to-square" onclick="editarGasto('${resJson[i].id}')" data-toggle="modal" data-target="#exampleModal"></i>
                <i class="fas fa-trash-alt text-danger" onclick="eliminarGasto('${resJson[i].id}')" ></i>
            </td>
        </tr>
    `);
        }
    } catch (error) {
        console.error(error);
    }
};

//LIMPIAR TABLAS Y INPUTS
const limpiar = () => {
    tableRoommates.innerHTML = '';
    selectRoommate.innerHTML = '';
    tableGastos.innerHTML = '';
    datosForm[0].value = '';
    datosForm[1].value = '';
}

//AGREGAR UN ROOMMATE
const agregarRoommate = async () => {
    try {
        await fetch("http://127.0.0.1:3000/roommates", { method: "POST" });
        limpiar();
        cargarDatos()
    } catch (error) {
        console.error(error);
    }
}

//ELIMINAR UN ROOMMATE
const eliminarRoommate = async (id) => {
    try {
        console.log(`Eliminando roommate con id ${id}`);
        await fetch("http://127.0.0.1:3000/roommates/" + id, {
            method: "DELETE"
        });
        //Comprobar si existen gastos asociados al roommate que se va a eliminar
        const response = await fetch('http://127.0.0.1:3000/gastosroommate/' + id);
        if ( response.status != 200) {
            console.log("No hay gastos asociados al roommate que se va a eliminar");
        }else{
            console.log("Eliminar Gastos asociados al roommate con id: "+ id);
        await fetch("http://127.0.0.1:3000/gastosroommate/" + id, {
            method: "DELETE"
        }); 
        }
        limpiar();
        cargarDatos();
    } catch (error) {
        console.error(error);
    }
}

//AGREGAR UN GASTO
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
        await actualizarMontos(select);
        limpiar();
        cargarDatos();
    } catch (error) {
        console.error(error);
    }
}
//ACTUALIZAR MONTOS (DEBE Y HABER) DE UN ROOMMATE
const actualizarMontos = async (id) => {
    //OBTENER VALORES ORIGINALES DE DEBE Y HABER
    try {
        console.log(`Valor de id: ${id}`);
        const response = await fetch("http://127.0.0.1:3000/roommates/" + id);
        const resJson= await response.json();
        datosForm.values();
        let nombre = resJson.nombre;
        console.log(`Nombre: ${nombre}`);
        let debe = resJson.debe? resJson.debe : 0;
        let haber = resJson.haber? resJson.haber : 0;
        console.log(datosForm[1].value);
        let debenew = Number(datosForm[1].value);
        debe += debenew;
        /* let habernew = Number(datosForm[1].value); */ 
        console.log(`Debe: ${debe}, y es del tipo ${typeof debe}`);
        console.log(`Debe nuevo ${debenew}, y es del tipo ${typeof debenew}`);
        //ACTUALIZAR DEBE Y HABER
        await fetch("http://127.0.0.1:3000/roommates/" + id, {}, {
            method: "PUT",
            body: JSON.stringify({
                id: id,
                nombre: nombre,
                debe: debe,
                haber: haber
            })
        });
    } catch (error) {
        console.error(error);
    }

}

//EDITAR UN GASTO
const editarGasto = async (id) => {
    try {
        console.log("Editando un gasto");
        const response = await fetch("http://127.0.0.1:3000/gastos/" + id);
        const resJson = await response.json();
        console.log(resJson);
        datosForm[0].value = resJson.descripcion;
        datosForm[1].value = resJson.monto;
        selectRoommate.value = resJson.idRoommate;
        let nombre = resJson.nombreRoommate;
        limpiar();
        cargarDatos();
    } catch (error) {
        console.error(error);
    }
};

//ELIMINAR UN GASTO
const eliminarGasto = async (id) => {
    try {
        await fetch("http://127.0.0.1:3000/gastos/" + id, {
            method: "DELETE"
        });
        console.log(`Eliminando gasto con id ${id}`);
        limpiar();
        cargarDatos();
    } catch (error) {
        console.log(error);
    }
};