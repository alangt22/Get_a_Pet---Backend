const Pet = require('../models/Pet')
const path = require('path');
const fs = require('fs');

// helpers
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')
const objectId = require('mongoose').Types.ObjectId

module.exports = class PetController {
    // create a pet
    static async create(req, res) {
        const {name, age, weight, color} = req.body
        const images = req.files

        const available = true

        // upload images

        // validation
        if(!name) {
            res.status(422).json({message: "O nome e obrigatorio!"})
            return
        }

        if(!age) {
            res.status(422).json({message: "A idade e obrigatoria!"})
            return
        }

        if(!weight) {
            res.status(422).json({message: "O peso e obrigatorio!"})
            return
        }

        if(!color) {
            res.status(422).json({message: "A cor e obrigatoria!"})
            return
        }
        if(images.lenght === 0) {
            res.status(422).json({message: "A imagem e obrigatoria!"})
            return
        }
        //get pet owner
        const token = getToken(req)
        const user = await getUserByToken(token)

        //create a pet
        const pet = new Pet ({
            name,
            age,
            weight,
            color,
            available,
            images: [],
            user: {
                _id: user._id,
                name: user.name,
                image: user.image,
                phone: user.phone,
            },
        }) 

        images.map((image) => {
            pet.images.push(image.filename)
        })

        try {
            const newPet = await pet.save()
            res.status(201).json({message: "Pet cadastrado com sucesso!", newPet})
        } catch (error) {
            res.status(500).json({message:error})
        }
    }

    static async getAll(req, res) {
        const pets = await Pet.find().sort('-createdAt')

        res.status(200).json({pets: pets,})
    }

    static async getAllUserPets(req, res) {
        //get user
        const token = getToken(req)
        const user = await getUserByToken(token)

        const pets = await Pet.find({'user._id': user._id}).sort('-createdAt')

        res.status(200).json({pets})
    }

    static async getAllUserAdoptions(req, res) {
        //get user
        const token = getToken(req)
        const user = await getUserByToken(token)

        const pets = await Pet.find({'adopter._id': user._id}).sort('-createdAt')

        res.status(200).json({pets})   
    }

    static async getPetById(req, res) {
        const id = req.params.id

        if(!objectId.isValid(id)) {
            res.status(422).json({message: "ID invalido!"})
            return   
        }
        // check if pet exists
        const pet = await Pet.findOne({_id: id})

        if(!pet) {
            res.status(404).json({message: "Pet não encontrado"})
            return  
        }

        res.status(200).json({pet: pet})
    }

    static async removePetById(req, res) {
        const id = req.params.id;
    
        // Check if id is valid
        if (!objectId.isValid(id)) {
            return res.status(422).json({ message: "ID inválido!" });
        }
    
        // Check if pet exists
        const pet = await Pet.findOne({ _id: id });
    
        if (!pet) {
            return res.status(404).json({ message: "Pet não encontrado" });
        }
    
        // Get user from token and check if the logged-in user is the owner of the pet
        const token = getToken(req);
        const user = await getUserByToken(token);
    
        if (pet.user._id.toString() !== user._id.toString()) {
            return res.status(422).json({ message: "Você não tem permissão para remover este pet" });
        }
    
        // Remove images associated with the pet
        if (pet.images && pet.images.length > 0) {
            pet.images.forEach((image) => {
                const imagePath = path.join(__dirname, `../public/images/pets/${image}`);
                
                // Check if the image exists and delete it
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            });
        }
    
        // Delete the pet from the database
        await Pet.findByIdAndDelete(id);
        
        return res.status(200).json({ message: "Pet removido com sucesso!" });
    }
    

    static async updatePet(req, res) {
        const id = req.params.id
        const {name, age, weight, color, available} = req.body
        const images = req.files
        const updateData = {}
        // check if pet exists
        const pet = await Pet.findOne({_id: id})

        if(!pet) {
            res.status(404).json({message: "Pet não encontrado"})
            return  
        }

        // check if loged in user registered the pet
        const token = getToken(req)
        const user = await getUserByToken(token)

        if(pet.user._id.toString() !== user._id.toString()) {
            res.status(422).json({message: "Houve um problema em processar sua solicitação, tente novamente mais tarde"})
            return   
        }

        // validation
        if(!name) {
            res.status(422).json({message: "O nome e obrigatorio!"})
            return
        } else {
            updateData.name = name
        }

        if(!age) {
            res.status(422).json({message: "A idade e obrigatoria!"})
            return
        } else {
            updateData.age = age
        }

        if(!weight) {
            res.status(422).json({message: "O peso e obrigatorio!"})
            return
        } else {
            updateData.weight = weight
        }

        if(!color) {
            res.status(422).json({message: "A cor e obrigatoria!"})
            return
        } else {
            updateData.color = color
        }


        if (images.length > 0) {
            updateData.images = [];  
            
            if (pet.images && pet.images.length > 0) {
                pet.images.forEach((oldImage) => {
    
                    const oldImagePath = path.join(__dirname, `../public/images/pets/${oldImage}`);
        
                    
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);  
                    }
                });
            }
        
           
            images.forEach((image) => {
                updateData.images.push(image.filename);
            });
        }
        


        await Pet.findByIdAndUpdate(id, updateData)
        res.status(200).json({message: 'Pet atualizado com sucesso'})
    }

    static async schedule(req, res) {
        const id = req.params.id
        // check if pet exists
        const pet = await Pet.findOne({_id: id})

        if(!pet) {
            res.status(404).json({message: "Pet não encontrado"})
            return  
        }
        // check if user register pet
        const token = getToken(req)
        const user = await getUserByToken(token)

        if(pet.user._id.equals(user._id)) {
            res.status(422).json({message: "Você não pode agendar visita com seu proprio Pet!"})
            return   
        }
        // check if user has already shchedule a visit
        if(pet.adopter) {
            if(pet.adopter._id.equals(user._id)) {
                res.status(422).json({message: "Você ja agendou uma visita para esse Pet!"})
                return     
            }
        }

        // add user to pet
        pet.adopter = {
            _id: user._id,
            name: user.name,
            image: user.image
        }

        await Pet.findByIdAndUpdate(id, pet)
        res.status(200).json({message: `Avisita foi agendada com sucesso, entre em contato com ${pet.user.name} pelo telefone ${pet.user.phone}`})
    }

    static async concludeAdoption(req, res) {
        const id = req.params.id
        // check if pet exists
        const pet = await Pet.findOne({_id: id})

        if(!pet) {
            res.status(404).json({message: "Pet não encontrado"})
            return  
        }

        // check if loged in user registered the pet
        const token = getToken(req)
        const user = await getUserByToken(token)

        if(pet.user._id.toString() !== user._id.toString()) {
            res.status(422).json({message: "Houve um problema em processar sua solicitação, tente novamente mais tarde"})
            return   
        }

        pet.available = false

        await Pet.findByIdAndUpdate(id, pet)
        res.status(200).json({message: 'Parabéns, o ciclo de adoção foi finalizado com sucesso!'})
    }
}
