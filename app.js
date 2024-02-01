const express = require('express');
const bodyParser = require('body-parser');
const mariadb = require('mariadb');
const helmet = require('helmet');
require('dotenv').config({ path: 'sec.env' });


const app = express();
const port = 3000;
app.use(express.static('./'))

const pool = mariadb.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	connectionLimit: process.env.DB_CONNECTION_LIMIT 
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet());

app.get('/', (req, res) => {
	res.send('página de inicio');
});

app.get('/login', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

app.post('/login', async (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	let conn;
	try {
		conn = await pool.getConnection();

		const rows = await conn.query('SELECT * FROM usuarios WHERE username = ? AND password = ?', [username, password]);

		if (rows.length > 0) {
		res.send('Inicio de sesión exitoso');
		} else {
		res.send('Credenciales incorrectas');
		}
	} catch (err) {
		console.error('Error al realizar la consulta:', err);
		res.status(500).send('Error interno del servidor');
	} finally {
		if (conn) {
		conn.release();
		}
	}
});

// Iniciar el servidor
app.listen(port, () => {
console.log(`Servidor escuchando en http://localhost:${port}`);
});
