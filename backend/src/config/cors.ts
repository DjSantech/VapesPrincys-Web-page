import {CorsOptions} from 'cors'

export const corsConfig: CorsOptions = {
    origin: function(origin,callback) {
        const whiteList = [process.env.FRONT_END_URL]
        if (origin === ){
            callback(null,true)
        } else {
            callback(new Error('Error de cors'))
        }
    }
}