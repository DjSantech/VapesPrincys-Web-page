import colors from 'colors'
import mongoose, { connect } from "mongoose";


export const connectDB = async () => {
    try{
        const {connection} = await mongoose.connect(process.env.MONGO_URI)
        const url = `${connection.host}:${connection.host}:`
        console.log(colors.cyan.bold ("mongoDB conectado en:"),url)

    }
    catch (error) {
        console.log(colors.bgRed.white(error.message));
            process.exit(1)
        
    }
}