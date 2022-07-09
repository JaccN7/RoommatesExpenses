const express = require('express');
// Crear instancia de express
const app = express();
const fs = require('fs');
const port = process.env.PORT || 3000;
//Importar UUID (Universally Unique IDentifier)
const { v4: uuidv4 } = require('uuid');
const nuevoRoommate = require('./api/modules/getRoommate');
const nuevoGasto = require('./api/modules/getIdRoommate');

let roommatesJSON = JSON.parse(fs.readFileSync('./registroJSON/roommates.json', 'utf8'));
let gastosJSON = JSON.parse(fs.readFileSync('./registroJSON/gastos.json', 'utf8'));
//Asignar objeto roommate al arreglo 
let arrayRoommates = roommatesJSON;
//Asignar objeto gasto al arreglo
let arrayGastos = gastosJSON;

//Control de acceso para permitir todos los origenes
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Method', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

//Archivos Estaticos
app.use('/public', express.static('public'));
/* app.use('/css', express.static(__dirname + 'public/css'));
app.use('/js', express.static(__dirname + 'public/js'));
app.use('/img', express.static(__dirname + 'public/img')); */

// Rutas
app.get('/' || ' ', (req, res) => {
    fs.readFile('./views/index.html', 'utf8', (err, html) => {
        if (err) {
            res.status(404).send('Error 404: No se encontró el archivo');
            throw err;
        }
        res.end(html);
    });
});

// Rutas Roommates
//Obtener todos los roommates
app.get('/roommates', (req, res, next) => {
    res.end(JSON.stringify(roommatesJSON));
});
//Agregar un roommate
app.post('/roommates', (req, res, next) => {
    req.on('data', () => {
        res.json({ result: 'OK' });
    });
    req.on('end', () => {
        nuevoRoommate()
            .then((nombre) => {
                res.json({ nombre });
                const roommate = {
                    id: uuidv4(),
                    nombre,
                    debe: '',
                    recibe: ''
                }
                arrayRoommates.push(roommate);
                fs.writeFile('./registroJSON/roommates.json', JSON.stringify(roommatesJSON), () => {
                    res.json({ resultado: "Se agrego un nuevo roommate" }).end();
                });
            })
            .catch((err) => {
                res.json({ err });
            });
    })
});

//Rutas para gastos
//Obtener todos los gastos
app.get('/gastos', (req, res, next) => {
    res.end(JSON.stringify(gastosJSON));
});
//Agregar un gasto
app.post('/gastos', (req, res, next) => {
    let body;
    req.on('data', (data) => {
        body = JSON.parse(data);
    });

    req.on('end', () => {
        const gasto = {
            id: uuidv4(),
            nombreRoommate: body.nombreRoommate,
            descripcion: body.descripcion,
            monto: body.monto
        }

        arrayGastos.push(gasto);

        fs.writeFile('./registroJSON/gastos.json', JSON.stringify(gastosJSON), () => {
            res.json({ resultado: "Se añadio un nuevo gasto" }).end();
        });
    })

});
//Eliminar un gasto
app.delete('/gastos/:id', (req, res, next) => {
    const { id } = url.parse(req.url, true).query;

    gastosJSON.gastos = gastos.filter((g) => g.id !== id);

    fs.writeFileSync('./archivos/gastos.json', JSON.stringify(gastosJSON, null, 1));
    res.end();
});
//Actualizar un gasto
app.put('/gastos/:id', (req, res, next) => {

});

//Control errores
app.use((req, res, next) => {
    const error = new Error('Se ha producido un error');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    fs.readFile('./views/error404.html', 'utf8', (err, html) => {
        if (err) {
            throw err;
        }
        res.end(html);
    });
});

//Escuchando el servidor en el puerto 3000
app.listen(port, function () {
    console.log(`Servidor escuchando en el puerto ${port}`);
});