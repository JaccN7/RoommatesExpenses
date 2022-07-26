const express = require('express');
// Crear instancia de express
const app = express();
const fs = require('fs');
const port = process.env.PORT || 3000;
//Importar UUID (Universally Unique IDentifier)
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const nuevoRoommate = require('./api/modules/getRoommate');
const sendMail = require('./api/modules/mailer');
const { urlencoded } = require('body-parser');

let roommatesJSON = JSON.parse(fs.readFileSync('./registroJSON/roommates.json', 'utf8'));
let gastosJSON = JSON.parse(fs.readFileSync('./registroJSON/gastos.json', 'utf8'));
//Asignar objeto roommate al arreglo 
let arrayRoommates = roommatesJSON;
//Asignar objeto gasto al arreglo
let arrayGastos = gastosJSON;

//Control de acceso para permitir todos los origenes
app.use(cors());
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
app.use(urlencoded({ extended: true }));
app.use(express.json());

// Rutas
//Cargar HTML
app.get('/' || ' ', (req, res) => {
    try {
        fs.readFile('./views/index.html', 'utf8', (err, html) => {
            res.status(200).end(html);
        });
    } catch (error) {
        res.status(404).send('Error 404: No se encontró el archivo');
    }
});

//Ruta sendMail
app.post('/sendMail', (req, res) => {
    sendMail();
    res.status(200).send('Correo enviado');
});

// Rutas Roommates
//Obtener todos los roommates
app.get('/roommates', (req, res, next) => {
    try {
        res.status(200).end(JSON.stringify(roommatesJSON));
    } catch (error) {
        res.status(404).send('Error 404: No se encontraron registros');
    }
});

//Obtener un roommate por id
app.get('/roommates/:id', (req, res, next) => {
    try {
        let id = req.params.id;
        let roommate = roommatesJSON.find(roommate => roommate.id == id);
        res.status(200).end(JSON.stringify(roommate));
    } catch (error) {
        res.status(404).send('Error 404: No existe un roommate con ese id');
    }
});

//Agregar un roommate
app.post('/roommates', (req, res, next) => {
    try {
        req.on('data', () => {
            res.status(200).json({ result: 'OK' });
        });
        req.on('end', () => {
            nuevoRoommate()
                .then((nombre) => {
                    const roommate = {
                        id: uuidv4(),
                        nombre,
                        debe: '',
                        haber: '',
                        saldo: '',
                    };
                    arrayRoommates.push(roommate);
                    fs.writeFile('./registroJSON/roommates.json', JSON.stringify(roommatesJSON), () => {
                        res.status(200).json({ resultado: "Se agrego un nuevo roommate" }).end();
                    });
                });
        });
    } catch (error) {
        res.status(400).send('Error 404: No se pudo agregar el roommate');
    }
});

//Eliminar un roommate
app.delete('/roommates/:id', (req, res, next) => {
    try {
        const id = req.params.id;
        const index = arrayRoommates.findIndex((element) => element.id === id);
        arrayRoommates.splice(index, 1);
        fs.writeFile('./registroJSON/roommates.json', JSON.stringify(roommatesJSON), () => {
            res.status(200).json({ resultado: "Se elimino un roommate" }).end();
        });
    } catch (error) {
        res.status(500).json({ err }).end();
    }
});

//Actualizar roommate
app.put('/roommates/:id', (req, res, next) => {
    try {
        const id = req.params.id;
        let body;
        req.on('data', (data) => {
            body = JSON.parse(data);
            body.id = id;
        });
        req.on('end', () => {
            //obtener posicion del gasto
            roommatesJSON = roommatesJSON.map((element) => {
                if (element.id === body.id) {
                    return body;
                }
                return element;
            });
            //sobreescribir el archivo
            fs.writeFile('./registroJSON/roommates.json', JSON.stringify(roommatesJSON), () => {
                res.status(200).json({ resultado: "Se actualizaron los datos de un roommate" }).end();

            });
        });
    } catch (error) {
        res.status(500).json({ err }).end();
    }
});

//Rutas para gastos
//Obtener todos los gastos
app.get('/gastos', (req, res, next) => {
    try {
        res.status(200).end(JSON.stringify(gastosJSON));
    } catch (error) {
        res.status(404).send('Error 404: No se encontraron registros');
    }
});

//Agregar un gasto
app.post('/gastos', (req, res, next) => {
    try {
        let body;
        req.on('data', (data) => {
            body = JSON.parse(data);
        });
        req.on('end', () => {
            const gasto = {
                id: uuidv4(),
                idRoommate: body.idRoommate,
                nombreRoommate: body.nombreRoommate,
                tipoOperacion: body.tipoOperacion,
                descripcion: body.descripcion,
                monto: body.monto
            }
            arrayGastos.push(gasto);
            fs.writeFile('./registroJSON/gastos.json', JSON.stringify(gastosJSON), () => {
                res.status(200).json({ resultado: "Se añadio un nuevo gasto" }).end();
            });
        })
    } catch (error) {
        res.status(500).json({ err }).end();
    }
});

//Obtener gastos por ID
app.get('/gastos/:id', (req, res, next) => {
    try {
        const id = req.params.id;
        let gasto = gastosJSON.find((element) => element.id === id);
        res.json(gasto);
        res.status(200).end(JSON.stringify(gasto));
    } catch (error) {
        res.status(404).send('Error 404: No se encontraron registros');
    }
});

//Obtener gastos de un roommate (Buscar por ID de roommate)
app.get('/gastosroommate/:id', (req, res, next) => {
    try {
        const id = req.params.id;
        let gastos = gastosJSON.filter((element) => element.idRoommate === id);
        res.status(200).json(gastos);
    } catch (error) {
        res.status(404).json({ message: "No hay gastos para este roommate" });
    }
});

//Eliminar un gasto (Utilizando el id del gasto)
app.delete('/gastos/:id', (req, res, next) => {
    try {
        const id = req.params.id;
        const idRoommate = gastosJSON.find((element) => element.id === id).idRoommate;
        const index = gastosJSON.findIndex((element) => element.id === id);
        arrayGastos.splice(index, 1);
        fs.writeFile('./registroJSON/gastos.json', JSON.stringify(gastosJSON), () => {
            res.status(200).json({ message: "Se elimino un gasto", idRoommate: idRoommate}).end();
        });
    } catch (error) {
        res.status(500).json({ err }).end();
    }
});

//Eliminar todos los gastos de un roommate (Utilizando el id del Roommate)
app.delete('/gastosroommate/:id', (req, res, next) => {
    try {
        const id = req.params.id;
        //eliminar todos los gastos asociados al roommate
        gastosJSON = gastosJSON.filter((element) => element.idRoommate !== id);
        fs.writeFile('./registroJSON/gastos.json', JSON.stringify(gastosJSON), () => {
            res.status(200).json({ resultado: "Se eliminaron todos los gastos de un roommate" }).end();
        })
    } catch (error) {
        res.status(500).json({ err }).end();
    }
});

//Actualizar un gasto (Utilizando el id del gasto)
app.put('/gastos/:id', (req, res, next) => {
    try {
        const id = req.params.id;
        let body;
        req.on('data', (data) => {
            body = JSON.parse(data);
            body.id = id;
        });
        req.on('end', () => {
            //obtener posicion del gasto
            gastosJSON = gastosJSON.map((element) => {
                if (element.id === body.id) {
                    return body;
                }
                return element;
            });
            //sobreescribir el archivo
            fs.writeFile('./registroJSON/gastos.json', JSON.stringify(gastosJSON), () => {
                res.status(200).json({ resultado: "Se actualizo un gasto" }).end();
            });
        });
    } catch (error) {
        res.status(500).json({ err }).end();
    }
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
    console.log(`Servidor escuchando en el puerto ${port} ruta principal: http://localhost:${port}/`);
});