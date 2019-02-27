const isEmpty = require('../../lib/queryValidator')
const {
    r,
    think
} = require('../../config/database');

const {
    user
} = require('../models/index')

const user_controller = {

    list: async(req, res) => {
        let data = await user.getAllView()

        return res.status(200).json(data)
    },

    search: async(req, res) => {

        let username = req.param('username')
        try {

            let data = await user.getView(username)

            if (!data) return res.sendStatus(404)
            else return res.status(200).send(data) //found

        } catch (error) {
            console.log('controller ERROR: ', error)
            res.status(500).send("Internal Error")
        }
    },

    create: async(req, res) => {
        try {

            let created_user = {}

            let container = {
                username,
                password,
                email,
                name
            } = req.body

            if (isEmpty(username, password)) return res.status(400).send("Empty username or password")
            if (isEmpty(email)) return res.status(400).send("Empty email")

            let p1 = user.getUserBy('username', username);
            let p2 = user.getUserBy('email', email);
            let search = await Promise.all([p1, p2])

            if (search[0] || search[1])
                return res.status(409).send('Username or email already exists!')

            created_user = await new user(container).save()
            delete created_user.password

            return res.status(201).json({
                    title: 'User created',
                    content: created_user
                }) //created!


        } catch (error) {
            console.log(error)
            return res.sendStatus(500) //Internal error
        }

    },

    update: async(req, res) => {
        try {


            let credentials = req.auth_user
            let username = req.params.username

            let data = await user.getUserBy('username', username)

            if (!data) return res.sendStatus(404) //Not found

            if (credentials.username != username) {
                if (!data.isDeveloper) return res.sendStatus(403) //Forbidden
            }

            if (data.isDisabled || !data.isActive) return res.sendStatus(404) //TODO not found

            let body = req.body
            let container = require('../../lib/fieldParser')(body, res)

            if (container === null) return; //stop context code 
            //error responses came from fieldParser function

            let match_user
            if (container.username) {
                match_user = await user.getUserBy('username', container.username)

                if (match_user)
                    return res.status(400).send("input username already exists")

            } else if (container.email) {
                match_user = await user.getUserBy('email', container.email)

                if (match_user)
                    return res.status(400).send("input email already exists")
            }

            console.log('El container es :', container)

            container.lastUpdateAt = new Date();
            container.isVerified = false;

            await user.update(data.id, container)

            //let refreshToken = 
            let response = {
                message: "user updated",
                at: new Date()
            }

            return res.status(200).send(response)


        } catch (error) {
            console.log(error)
            return res.sendStatus(500)
        }

    },

    delete: async(req, res) => {

        let credentials = req.auth_user
        let username = req.params.username

        let data = await user.getUserBy('username', username)

        if (!data) return res.sendStatus(404) //User Not found

        if (credentials.username != username) {
            if (!data.isDeveloper) return res.sendStatus(403) //Forbidden
        }

        if (data.isDisabled || !data.isActive) return res.sendStatus(404) //TODO conflict (409)
        let container = {
            isActive: false,
            lastUpdateAt: new Date()
        }

        await user.update(data.id, container)

        //let refreshToken = 
        let response = {
            message: "this user account is now inactive",
            at: new Date()
        }

        return res.status(200).send(response)

    }


};

module.exports = user_controller;