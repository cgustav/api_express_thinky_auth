const {
    think,
    type,
    r
} = require('../../config/database');

const bcrypt = require('bcrypt');

const user_schema = think.createModel(
    'users', {
        id: type.string(),
        name: type.string().max(255),
        username: type.string().max(50),
        email: type.string().max(200),
        birthdate: type.date(),
        auth: {
            password: type.string(),
        },
        createdAt: type.date().default(r.now())
    }
);


user_schema.init = function(model) {

    model.hasMany(models.identities, 'identities', 'id', 'user_id')

    model.pre('save', async function(next) {
        if (!this.auth.password) next()
        else this.auth.password = await bcrypt.hash(this.auth.password, 10)
        next()
    })

    // model.define('comparePassword', async function(password) {
    //     return await bcrypt.compare(password, this.auth.password);
    // })

}

//returns user object without auth
user_schema.logIn = async function(username, password) {

    let _user = await this.getUserBy('username', username)
    if (!_user) return null
    let match = await bcrypt.compare(password, _user.auth.password)

    if (match) {
        delete _user.auth
        return _user

    } else return null
}

user_schema.getView = async(username) => {
    try {

        return await r.db('ozen_db').table('users').filter(r.row('username').eq(username))
            .nth(0)
            .without('auth')
            .merge(function(user) {
                return {
                    identities: r.db('ozen_db').table('identities')
                        .getAll(user('id'), {
                            index: 'user_id'
                        })
                        .without(['createdAt', 'id', 'user_id'])
                        .coerceTo('array')
                };
            });

    } catch (error) {
        if (error.msg === "Index out of bounds: 0") return null;
        else throw new Error("Internal DB ERROR."); // or return error
    }
}

user_schema.getAllView = async() => {

    try {

        return await r.db('ozen_db').table('users')
            .without('auth')
            .merge(function(user) {
                return {
                    identities: r.db('ozen_db').table('identities')
                        .getAll(user('id'), {
                            index: 'user_id'
                        })
                        .without(['createdAt', 'id', 'user_id'])
                        .coerceTo('array')
                };
            });

    } catch (error) {
        throw new Error("Internal DB ERROR.")
    }
}

user_schema.getUserBy = async(criteria, value) => {
    try {
        if (criteria === "password") return null
        else return await r.db('ozen_db').table('users').filter(r.row(criteria).eq(value)).nth(0);
    } catch (error) {
        //console.log(error)
        if (error.msg === "Index out of bounds: 0") return null;
        else throw new Error("Internal DB ERROR."); // or return error
    }
}

//Event Emitters

user_schema.docAddListener('saved', (doc) => {
    console.log('[log] user created: (', doc.username, ')', '(', doc.id, ')')
});

user_schema.addListener('retrieved', function(doc) {
    doc.retrieved = new Date();
});


module.exports = user_schema;