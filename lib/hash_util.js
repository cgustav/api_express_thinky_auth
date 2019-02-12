const bcrypt = require('bcryptjs')


module.exports = {
    hashThis: async (value) => {
        try {
            let salt = await bcrypt.genSalt()
            let hashed = await bcrypt.hash(value, salt)

            return hashed
        } catch (error) {
            console.log('bcrypt cannot hash', error)
            return undefined
        }
    },
    /*
    hashCompare: async (password) => {

    }
    */
}