let tableRoommates = document.querySelector('.tableRoommates');
tableRoommates.innerHTML = '';
let tableGastos = document.querySelector('.tableGastos');
tableGastos.innerHTML = '';
let selectRoommate = document.querySelector('.selectRoommate');
let btnAgregarRoommate = document.querySelector('.agregarRoommate');
let btnAgregarGasto = document.querySelector('.agregarGasto');
let btnAgregarAbono = document.querySelector('.agregarAbono');
let datosForm = document.querySelectorAll('.datosForm');

//EVENTOS
window.addEventListener("load", function () {
    cargarDatos();
});

btnAgregarRoommate.addEventListener('click', function () {
    agregarRoommate();
});

btnAgregarGasto.addEventListener('click', function () {
    let descripcion = "Gasto"
    if(datosForm[0].value != '' && datosForm[1].value != ''){
    agregarGasto(descripcion);
    }
});

btnAgregarAbono.addEventListener('click', function () {
    let descripcion = "Abono";
    if(datosForm[0].value != '' && datosForm[1].value != ''){
    agregarAbono(descripcion);
    }
});

//MOSTRAR DATOS DE ROOMMATES Y GASTOS
const cargarDatos = async () => {
    //CARGAR ROOMMATES
    try {
        limpiar();
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
                    <td class="text-success saldo">${resJson[i].saldo ? resJson[i].saldo : "-"}</td>
                </tr>`);
            //LISTA DESPLEGABLE DE ROOMMATES EN COLUMNA DE AGREGAR GASTOS
            selectRoommate.innerHTML += (` <option value="${resJson[i].id}">${resJson[i].nombre}</option>`);
        }
    } catch (error) {
        console.error(error);
    }
    //CARGAR GASTOS DE LOS ROOMMATES
    try {
        const response = await fetch('http://127.0.0.1:3000/gastos');
        const resJson = await response.json();
        for (let i = 0; i < resJson.length; i++) {
            tableGastos.innerHTML += (`
            <tr>
                <td style="display:none"><input value="${resJson[i].idRoommate}" class="form-control inputIDRoommate inputUpdate"/>${resJson[i].nombreRoommate}</td>
                <td><input value="${resJson[i].nombreRoommate}" disabled="true" class="form-control inputNombre inputUpdate"/></td>
                <td style="display:none"><input value="${resJson[i].tipoOperacion}" class="form-control inputTipoOpt inputUpdate"/></td>
                <td><input value="${resJson[i].descripcion}" disabled="true" class="form-control inputDescripcion inputUpdate"/></td>
                <td><input value="${resJson[i].monto}" disabled="true" class="form-control inputMonto inputUpdate"/></td>
                <td align-items-center justify-content-between">
                    <i class="fa-solid fa-pen-to-square edit text-primary" onclick="editarGasto('${resJson[i].id}')"></i>
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
};

//AGREGAR UN ROOMMATE
const agregarRoommate = async () => {
    try {
        await fetch("http://127.0.0.1:3000/roommates", { method: "POST" });
        cargarDatos()
    } catch (error) {
        console.error(error);
    }
};

//ELIMINAR UN ROOMMATE
const eliminarRoommate = async (id) => {
    try {
        await fetch("http://127.0.0.1:3000/roommates/" + id, {
            method: "DELETE"
        });
        await fetch("http://127.0.0.1:3000/gastosroommate/" + id, {
            method: "DELETE"
        });
        await cargarDatos();
    } catch (error) {
        console.error(error);
    }
};

//AGREGAR UN GASTO
const agregarGasto = async (mensaje) => {
    try {
        let select = selectRoommate.value;
        let text = selectRoommate.options[selectRoommate.selectedIndex].innerText;
        datosForm.values();
        let monto;
        if (mensaje === "Gasto") {
            monto = parseInt(datosForm[1].value);
        }
        let descripcion = `${mensaje}: ${datosForm[0].value}`;
        await fetch("http://127.0.0.1:3000/gastos", {
            method: "POST",
            body: JSON.stringify({
                idRoommate: select,
                nombreRoommate: text,
                tipoOperacion: mensaje,
                descripcion: descripcion,
                monto: monto
            })
        });
        await actualizarMontos(select);
    } catch (error) {
        console.error(error);
    }
};

const agregarAbono = async (mensaje) => {
    try {
        let select = selectRoommate.value;
        let text = selectRoommate.options[selectRoommate.selectedIndex].innerText;
        datosForm.values();
        let monto;
        if (mensaje === "Abono") {
            monto = parseInt(datosForm[1].value);
        }
        let descripcion = `${mensaje}: ${datosForm[0].value}`;
        await fetch("http://127.0.0.1:3000/gastos", {
            method: "POST",
            body: JSON.stringify({
                idRoommate: select,
                nombreRoommate: text,
                tipoOperacion: mensaje,
                descripcion: descripcion,
                monto: monto
            })
        });
        await actualizarMontos(select);
    } catch (error) {
        console.error(error);
    }
}

//ACTUALIZAR MONTOS (DEBE Y HABER) DE UN ROOMMATE
const actualizarMontos = async (id) => {
    //OBTENER MONTOS DE LOS GASTOS DEL ROOMMATE
    try {
        const response = await fetch('http://127.0.0.1:3000/gastosroommate/' + id);
        const resJson = await response.json();
        let debe = 0, haber = 0, saldo = 0;
        let nombre = resJson[0].nombreRoommate;
        let idRoommate = resJson[0].idRoommate;
        for (let i = 0; i < resJson.length; i++) {
            if (resJson[i].tipoOperacion === "Gasto") {
                debe += parseInt(resJson[i].monto);
            }
            if (resJson[i].tipoOperacion === "Abono") {
                haber += parseInt(resJson[i].monto);
            }
        }
        saldo = haber - debe;

        //ACTUALIZAR MONTOS DE LOS ROOMMATES

        await fetch("http://127.0.0.1:3000/roommates/" + id, {
            method: "PUT",
            body: JSON.stringify({
                id: idRoommate,
                nombre: nombre,
                debe,
                haber,
                saldo
            })
        });
        await cargarDatos();
    } catch (error) {
        console.error(error);
    }
}

//EDITAR UN GASTO
const editarGasto = async (id) => {
    let inputIDRoommate = document.querySelectorAll(".inputIDRoommate");
    let inputNombre = document.querySelectorAll(".inputNombre");
    let inputTipoOpt = document.querySelectorAll(".inputTipoOpt");
    let inputDescripcion = document.querySelectorAll(".inputDescripcion");
    let inputMonto = document.querySelectorAll(".inputMonto");
    let btnEdit = document.querySelectorAll(".edit");
    let monto;
    let posicion = 0;
    try {
        const response = await fetch('http://127.0.0.1:3000/gastos');
        const resJson = await response.json();

        for (let i = 0; i < resJson.length; i++) {
            resJson[i].id == id ? posicion = i : posicion;
        }
        if (inputDescripcion[posicion].disabled == true) {
            inputDescripcion[posicion].disabled = false;
            inputMonto[posicion].disabled = false;
            btnEdit[posicion].classList.remove("fa-pen-to-square", "text-primary");
            btnEdit[posicion].classList.add("fa-check", "text-success");
        } else {
            inputDescripcion[posicion].disabled = true;
            inputMonto[posicion].disabled = true;
            btnEdit[posicion].classList.remove("fa-check", "text-success");
            btnEdit[posicion].classList.add("fa-pen-to-square", "text-primary");
        }
        monto = parseInt(inputMonto[posicion].value)
        //Al obtener los valores modificados, se envian a la API
        const respuesta = await fetch("http://127.0.0.1:3000/gastos/" + id, {
            method: "PUT",
            body: JSON.stringify({
                id: id,
                idRoommate: inputIDRoommate[posicion].value,
                nombreRoommate: inputNombre[posicion].value,
                tipoOperacion: inputTipoOpt[posicion].value,
                descripcion: inputDescripcion[posicion].value,
                monto: monto
            })
        });
        const respuestaJson = await respuesta.json();
        const roommateId = respuestaJson.idRoommate;
        const montoOriginal = respuestaJson.montoOriginal;
        if (montoOriginal != monto) {
            await actualizarMontos(roommateId); 
        }
        console.log(montoOriginal);
    } catch (error) {
        console.error(error);
    }
};

//ELIMINAR UN GASTO
const eliminarGasto = async (id) => {
    try {
        const result = await fetch("http://127.0.0.1:3000/gastos/" + id, {
            method: "DELETE"
        });
        const resJson = await result.json();
        const roommateId = resJson.idRoommate;
        if (roommateId) {
            await actualizarMontos(roommateId);
        } 
    } catch (error) {
        console.error(error);
    }
};