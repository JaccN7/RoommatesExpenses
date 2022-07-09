//Consumir API con AXIOS (Obtener un nombre y apellido)
const axios = require('axios');

const getRoommate = async () => {

    let res = await axios.get('https://randomuser.me/api/');

    let nombre = `${res.data.results[0].name.first} ${res.data.results[0].name.last}`;
    
    return nombre;
}

module.exports = getRoommate;