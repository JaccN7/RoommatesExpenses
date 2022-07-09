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
    console.log("se esta intentando añadir un roommate");
    agregarRoommate();
});

btnAgregarGasto.addEventListener('click', function () {
    console.log("se esta intentando añadir un gasto");
    agregarGasto();

});

const cargarDatos = async () => {
    await fetch('https://roommate-expenses.herokuapp.com/roommates')
        .then(response => response.json()).then(json => {
            for (let i = 0; i < json.length; i++) {
                tableRoommates.innerHTML += (`
                <tr>
                    <td>${json[i].nombre}</td>
                    <td class="text-danger">${json[i].debe ? json[i].debe : "-"}</td>
                    <td class="text-success">${json[i].haber ? json[i].haber : "-"}</td> 
                </tr>`);
                selectRoommate.innerHTML += (`
                <option value="${json[i].nombre}">
                    ${json[i].nombre}
                </option>`);
            }
        })
        .catch(error => {
            console.error(error);
        });
    await fetch('https://roommate-expenses.herokuapp.com/gastos')
        .then(response => response.json()).then(resJson => {
            for (let i = 0; i < resJson.length; i++) {
                tableGastos.innerHTML += (`
                <tr>
                    <td>${resJson[i].nombreRoommate}</td>
                    <td>${resJson[i].descripcion}</td>
                    <td>${resJson[i].monto}</td>
                    <td align-items-center justify-content-between">
                        <i class="fa-solid fa-pen-to-square" onclick="editGasto('${resJson[i].id}')"></i>
                        <i class="fas fa-trash-alt text-danger" onclick="deleteGasto('${resJson[i].id}')" ></i>
                    </td>
                </tr>
            `)
            }
        })
        .catch(error => {
            console.log(error);
        });
};

const limpiar = async () => {
    tableRoommates.innerHTML = '';
    selectRoommate.innerHTML = '';
    tableGastos.innerHTML = '';
}

const agregarRoommate = async () => {
    await fetch("https://roommate-expenses.herokuapp.com/roommates", { method: "POST" })
        .then((res) => res.json())
        .then(() => {
            limpiar();
            cargarDatos()
        })
        .catch(error => {
            console.error(error);
        });
}

const agregarGasto = async () => {
    datosForm.values();
    await fetch("https://roommate-expenses.herokuapp.com/gastos", {
        method: "POST",
        body: JSON.stringify({
            nombreRoommate: datosForm[0].value,
            descripcion: datosForm[1].value,
            monto: datosForm[2].value
        })
    })
        .then(() => {
            limpiar();
            cargarDatos();
        })
        .catch(error => {
            console.error(error);
        });
}

const borrarGasto = async (id) => {
    await fetch("https://roommate-expenses.herokuapp.com/gasto?id=" + id, { method: "DELETE" })
        .then(() => {
            limpiar();
            cargarDatos();
        })
        .catch(error => {
            console.error(error);
        });
};