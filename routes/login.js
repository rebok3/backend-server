// Requires
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

// Inicializar variables
var app = express();

var Usuario = require('../models/usuario');

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// ======================
// Autentificación google
// ======================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}
app.post('/google', async(req, res) => {

    var token = req.body.token;
    var googleUser = await verify( token )
        .catch( e => {
            res.status(403).json({
                ok: false,
                mensaje: 'Token no válido'
            });
        });

    Usuario.findOne({ email: googleUser.email }, ( err, usuarioDB) => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }

        if ( usuarioDB ) {

            if ( usuarioDB.google === false ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autentificación normal'
                });
            } else {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    menu: getMenu(usuarioDB.role)
                });
            }
            
        } else {
            // El usuario no existe... hay que crearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ';0)';

            usuario.save( ( err, usuarioDB ) => {

                if ( err ) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al crear usuario',
                        errors: err
                    });
                }
        
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    menu: getMenu(usuarioDB.role)
                });
        
            });
        }
    });

    // res.status(200).json({
    //     ok: true,
    //     mensaje: 'OK Google!!!',
    //     googleUser: googleUser
    // });
});

// ======================
// Autentificación normal
// ======================
app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, ( err, usuarioDB ) => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }

        if ( !usuarioDB ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: { message: 'No existe un usuario con ese email'}
            });
        }

        if ( !bcrypt.compareSync( body.password, usuarioDB.password ) ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: { message: 'Password incorrecto'}
            });
        }


        // Crear un token
        usuarioDB.password = ';0)';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id,
            menu: getMenu(usuarioDB.role)
        });

    });   

});

function getMenu( ROLE ) {

    var menu = [
        {
            title: 'Principal',
            icon: 'mdi mdi-gauge',
            submenu: [
            { title: 'Dashboard', url: '/dashboard' },
            { title: 'ProgressBar', url: '/progress' },
            { title: 'Gráficas', url: '/graficas1' },
            { title: 'Promises', url: '/promises' },
            { title: 'RxJS', url: '/rxjs' }

            ]
        },
        {
            title: 'Admin',
            icon: 'mdi mdi-folder-lock-open',
            submenu: [
            // { title: 'Users', url: '/users' },
            { title: 'Doctors', url: '/doctors' },
            { title: 'Hospitals', url: '/hospitals' }

            ]
        }
    ];

    if ( ROLE === 'ADMIN_ROLE' ) {
        menu[1].submenu.unshift( { title: 'Users', url: '/users' } );
    }

    return menu;
}

module.exports = app;