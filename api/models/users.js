const {
    think,
    type,
    r
} = require('../../config/database')



const user_schema = think.createModel(
    'users', {
        id: type.string().uuid(4),
        name: type.string().max(255),
        username: type.string().max(20),
        email: type.string().max(200),
        birthdate: type.date(),
        auth: {
            password: type.string(),
        },
        createdAt: type.date().default(r.now())
    }
)

user_schema.getView = async function (username) {

    const users = await this.filter({
        username
    })

    if (users.length) {
        delete users[0].auth
        return users[0]
    }

    return null
}

user_schema.getAllView = async function (username) {

    const users = await this.filter({
        username
    })

    if (users.length) {
        delete users[0].auth
        return users[0]
    }

    return null
}

user_schema.getUserByUsername = async function (username) {

    const users = await this.filter({
        username
    })

    if (users.length) return users[0]

    return null
}

/*
user_schema.comparePasswords = (password) => {

}
*/

user_schema.docAddListener('saved', function (user) {
    console.log('[log] user created')

});

user_schema.addListener('retrieved', function (doc) {

    doc.retrieved = new Date();
});


module.exports = user_schema;