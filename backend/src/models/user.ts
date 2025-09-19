import mongoose, {Schema} from "mongoose";
import slug from 'slug'

interface User {
    handle: string
    name: string
    email: string
    password: string
}

const userSchema = new Schema ({
    handle : {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    name : {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
        trim: true
    }


})

const User = mongoose.model<User>('user', userSchema)

export default User