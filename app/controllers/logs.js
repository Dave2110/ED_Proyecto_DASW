
const User = require('./user_schema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SECRET_KEY = 'mi_clave_secreta'; 


exports.register = async (req, res) => {
    const { nombre, apellidos, email, password, role } = req.body;

    try {
        
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
        }

        
        const hashedPassword = await bcrypt.hash(password, 10);

        
        const newUser = new User({
            nombre,
            apellidos,
            email,
            password: hashedPassword,
            role: role || 'user', 
        });

        
        await newUser.save();

        
        const token = jwt.sign({ id: newUser._id, role: newUser.role }, SECRET_KEY, { expiresIn: '1h' });

        res.status(201).json({ message: 'Usuario registrado exitosamente', token });
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        
        const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

        res.json({ message: 'Inicio de sesión exitoso', token });
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};


exports.verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); 

    if (!token) {
        return res.status(403).json({ message: 'Acceso denegado' });
    }

    try {
        
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; 
        next(); 
    } catch (error) {
        console.error('Error al verificar el token:', error);
        res.status(400).json({ message: 'Token inválido' });
    }
};