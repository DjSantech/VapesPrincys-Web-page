import type {Request,Response} from 'express' 
import User from "../models/user" 
import {validationResult} from 'express-validator'
import { checkPassword, hashPassword } from '../utils/auth'
import slug from 'slug'
import { generateJWT } from '../utils/jwt'


export const createAccount = async (req : Request, res: Response) =>
{   
    


    const {email,password} = req.body
    const userExists = await User.findOne({email})

    if(userExists){
        const error = new Error("Un usuario ya esta registrado con ese gmail")
        return res.status(409).json({error: error.message})
    } else {

    }
    
    const handle = slug(req.body.handle, '')
    const handleExists = await User.findOne({handle})
    if(handleExists){
        const error = new Error("Handle de usuario no disponible")
        return res.status(409).json({error: error.message})
    } else {
        console.log('Nombre de usuario disponible')
    }
    


    const user = new User(req.body)
    user.password = await hashPassword(password)
    user.handle = await handle

    await user.save()
    
    res.status(201).send('Registo creado correctamente')
}


export const login = async (req: Request, res: Response ) => {
    
  
   
    const {email,password} = req.body
    const user = await User.findOne({email})

    //Recibar si el usuario existe
    if(!user){
        const error = new Error("Este usuario no existe")
        return res.status(404).json({error: error.message})
    } 
    //verificacion de password
    // const contraseña = user.password
    const isPasswordCorrect = await checkPassword(password,user.password)
    
    if (!isPasswordCorrect) {
        const error = new Error("La contraseña ingresada es incorrecta")
        return res.status(401).json({error:error.message})
    }

    generateJWT(user)

    res.send("Autenticado...")

}