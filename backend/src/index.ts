import colors from 'colors'
import server from './server'



const port = process.env.PORT || 4000

server.listen (port, () =>{
    console.log(colors.magenta.bold ("Servidor funcionando en el puerto :"), port)
})

interface Product  {
    id: number
    price: number
    name : string
}

type FullProduct = Product &{
    image: string
}

interface ProductID {
    id: Product['id']
}

let product : Product = {
    id: 1,
    price: 30,
    name: "Tablet"
}

let product2 : FullProduct = {
    id: 1,
    price: 30,
    name: "Tablet",
    image: "product.jpg"
}

const numbers = [10,20,30]