// Requires
var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');


// Inicializar variables
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// default options
app.use(fileUpload());


app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de colección
    var tiposValidos = [ 'hospitales', 'medicos', 'usuarios' ];

    if ( tiposValidos.indexOf(tipo) < 0 ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colleción no válida',
            errors: {mensaje: 'Los tipos de colecciones válidas son: ' + tiposValidos.join(', ')}
        });
    }

    if ( !req.files ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó ningún archivo',
            errors: {mensaje: 'Debe seleccionar una imagen'}
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[ nombreCortado.length -1 ];

    // Sólo éstas extensiones son válidas
    var extensionesValidas = [ 'png', 'jpg', 'gif', 'jpeg' ];

    if ( extensionesValidas.indexOf(extensionArchivo) < 0 ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: {mensaje: 'Las extensiones válidas son: ' + extensionesValidas.join(', ')}
        });
    }


    // Nombre de Archivo válido
    // 12312312321-123.png
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv( path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo( tipo, id, nombreArchivo, res );

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido',
        //     extensionArchivo: extensionArchivo
        // });
    });
});

function subirPorTipo( tipo, id, nombreArchivo, res ) {

    if (tipo === 'usuarios') {
        
        Usuario.findById( id, ( err, usuario ) => {

            var pathViejo = './uploads/usuarios/' + usuario.img;
            
            if ( err ) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Upload image - Error al buscar usuario',
                    errors: err
                });
            }
    
            if ( !usuario ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Upload image - El usuario con el id: ' + id + ' no existe',
                    errors: { message: 'No existe un usuario con ese ID' }
                });
            }

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo, ( err ) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al eliminar la imagen del usuario',
                            errors: err
                        });
                    }
                });
            }

            usuario.img = nombreArchivo;

            usuario.save( ( err, usuarioActualizado ) => {

                if ( err ) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Upload image - Error al actualizar usuario',
                        errors: err
                    });
                }
    
                usuarioActualizado.password = ';0)';
        
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });

        });
    }

    if (tipo === 'medicos') {

        Medico.findById( id, ( err, medico ) => {

            var pathViejo = './uploads/medicos/' + medico.img;
            
            if ( err ) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Upload image - Error al buscar médico',
                    errors: err
                });
            }
    
            if ( !medico ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Upload image - El médico con el id: ' + id + ' no existe',
                    errors: { message: 'No existe un médico con ese ID' }
                });
            }

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo, ( err ) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al eliminar la imagen del médico',
                            errors: err
                        });
                    }
                });
            }

            medico.img = nombreArchivo;

            medico.save( ( err, medicoActualizado ) => {

                if ( err ) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Upload image - Error al actualizar médico',
                        errors: err
                    });
                }
    
                medicoActualizado.password = ';0)';
        
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de médico actualizada',
                    medico: medicoActualizado
                });
            });

        });
        
    }

    if (tipo === 'hospitales') {
        
        Hospital.findById( id, ( err, hospital ) => {

            var pathViejo = './uploads/hospitales/' + hospital.img;
            
            if ( err ) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Upload image - Error al buscar hospital',
                    errors: err
                });
            }
    
            if ( !hospital ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Upload image - El hospital con el id: ' + id + ' no existe',
                    errors: { message: 'No existe un hospital con ese ID' }
                });
            }

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo, ( err ) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al eliminar la imagen del hospital',
                            errors: err
                        });
                    }
                });
            }

            hospital.img = nombreArchivo;

            hospital.save( ( err, hospitalActualizado ) => {

                if ( err ) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Upload image - Error al actualizar hospital',
                        errors: err
                    });
                }
    
                hospitalActualizado.password = ';0)';
        
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            });

        });
    }

}

module.exports = app;