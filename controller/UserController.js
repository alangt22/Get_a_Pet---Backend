const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const path = require('path');
const fs = require('fs');

// helpers
const createUserToken = require('../helpers/create-user-token')
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')


module.exports = class UserController {
    static async register(req, res) {
        const { name, email, phone, password, confirmPassword} = req.body

        // validations
        if(!name) {
            res.status(422).json({message: 'O nome é obrigatório'})
            return
        }

        if(!email) {
            res.status(422).json({message: 'O e-mail é obrigatório'})
            return
        }

        if(!phone) {
            res.status(422).json({message: 'O telefone é obrigatório'})
            return
        }

        if(!password) {
            res.status(422).json({message: 'A senha é obrigatório'})
            return
        }

        if(!confirmPassword) {
            res.status(422).json({message: 'A confirmação de senha é obrigatório'})
            return
        }

        if(password !== confirmPassword) {
            res.status(422).json({message: 'A senha e a confirmação de senha devem ser iguais!'})
            return
        }
        // check if user ecists
        const userExists = await User.findOne({email: email})

        if(userExists) {
            res.status(422).json({message: 'Por favor utilize outro e-mail'})
            return
        }

        // create password
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)

        // create a user
        const user = new User({
            name,
            email,
            phone,
            password: passwordHash,
        })

        try {

            const newUser  = await user.save()
            
            await createUserToken(newUser, req, res)
        } catch (error) {
            res.status(500).json({message: error})
        }

    }

    static async login(req, res) {
        const {email, password} = req.body

        if(!email) {
            res.status(422).json({message: 'O e-mail é obrigatório'})
            return
        }

        if(!password) {
            res.status(422).json({message: 'A senha é obrigatório'})
            return
        }
        // check user exists
        const user = await User.findOne({email: email})

        if(!user) {
            res.status(422).json({message: 'Não há usuario cadastrado com esse e-mail'})
            return
        }

        // check if passwors match with db paassword
        const checkPassword = await bcrypt.compare(password, user.password)

        if(!checkPassword){
            res.status(422).json({message: 'Senha invalida'})
            return
        }

        await createUserToken(user, req, res)
    }

static async checkUser(req, res) {
    let currentUser;

    if(req.headers.authorization) {
        const token = getToken(req);
        const decoded = jwt.verify(token, 'nossosecret');

        currentUser = await User.findById(decoded.id);

        // Certifique-se de que o campo "image" está sendo enviado
        currentUser.password = undefined;

    } else {
        currentUser = null;
    }

    res.status(200).send(currentUser);
}


    static async getUserById(req, res) {
        const id = req.params.id

        const user = await User.findById(id).select('-password')

        if(!user) {
            res.status(422).json({message: 'Usuario não encontrado'})
            return
        }
        res.status(200).json(user)
    }

    static async editUser(req, res) {
        const id = req.params.id
        // check user exists
        const token = getToken(req)
        const user = await getUserByToken(token)
        const {name, email, phone, password, confirmPassword} = req.body
    
        if (req.file) {
            if(user.image) {
                // Defina o caminho da imagem antiga
                const oldImagePath = path.join(__dirname, `../public/images/users/${user.image}`)

                // Verifique se o arquivo existe antes de tentar removê-lo
                if(fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath)  // Remova o arquivo antigo
                }
            }

            // Atribua a nova imagem
            user.image = req.file.filename
        }

        // validation
        if(!name) {
            res.status(422).json({message: 'O nome é obrigatório'})
            return
        }
        user.name = name

        if(!email) {
            res.status(422).json({message: 'O e-mail é obrigatório'})
            return
        }
        // check if email has already taken
        const userExists = await User.findOne({email: email})

        if(user.email !== email && userExists) {
            res.status(422).json({message: 'Por favor utilize outro e-mail'})
            return
        }
        user.email = email

        if(!phone) {
            res.status(422).json({message: 'O telefone é obrigatório'})
            return
        }
        user.phone = phone

        if(password != confirmPassword) {
            res.status(422).json({message: 'As senhas não conferem'})
            return
        } else if( password === confirmPassword && password != null) {
            // create password
            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(password, salt)

            user.password = passwordHash
        }

        try {
            // return user updated  data
            await User.findByIdAndUpdate(
                {_id: user.id},
                {$set: user},
                {new: true},
            )

            res.status(200).json({message: 'Usuario atualizado com sucesso!'})
        } catch (error) {

            res.status(500).json({message: error})
            return
        }

    }
} 