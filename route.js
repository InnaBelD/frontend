const Router = require('express');
const router = new Router();

router.post("/createUser", UserController.createUser);

class UserController{
    async getOneUser(id_user){
        try {
            const user = await UserModel.findOne({_id: id_user});
            return user;
        } catch(e) {
            console.log(e);
            return 'Connot get user';
        }
    }

    async getUsers(req){
        try {
            const users = await UserModel.find();

            let orders = await orderController.getAllOrder();
            let userOrders = [];
            for(let i=0;i<users.length;i++){
                userOrders.push({...users[i]._doc,
                    count: orders.filter(order => order.id_user._id.equals(users[i]._id)).length});
            }
            return userOrders;
        } catch(e) {
            console.log(e);
            return 'Connot get users';
        }
    }

    async createUser(req, res){
        try{
            const {nickname, e_mail, password} = req.body;

            if (!e_mail || !password  || !nickname) {
                res.redirect('/error?errorMessage=Your_data_is_empty');
                return;
            }

            if((await UserModel.find({e_mail: e_mail})).length>0 || (await UserModel.find({nickname: nickname})).length>0){
                return res.status(406).json({ message: 'Such a user already exists' });
            }
            else{
                const hashPassword = bcrypt.hashSync(password, 7);
                const result = await UserModel.create({nickname: nickname, e_mail: e_mail, password: hashPassword });
                basketController.createBasket(result._id)
                res.redirect('/login');
                return;
            }
        }catch(e) {
            console.log(e);
            return res.status(500).json({ message: 'Connot create user' });
        }
    }

    async updateUser(req, res){ 
        try {
            const { name, surname, patronymic, nickname, e_mail, phone, age, gender } = req.body;
            const _id = req.session.user_token;
            if (!name || !surname || !phone || !nickname || !e_mail || !gender) {
                return res.status(500).json({ message: 'Заполните обязательные поля'});
            }
            if (!patronymic && !age){
                const result = await UserModel.updateOne({_id:_id}, {$set: {name: name, surname:surname, nickname:nickname, e_mail:e_mail, phone: phone, gender: gender}}) ;
            }
            else if(!patronymic){
                const result = await UserModel.updateOne({_id:_id}, {$set: {name: name, surname:surname, nickname:nickname, e_mail:e_mail, phone: phone, gender: gender, age:age}}) ;
            }
            else if(!age){
                const result = await UserModel.updateOne({_id:_id}, {$set: {name: name, surname:surname, patronymic:patronymic, nickname:nickname, e_mail:e_mail, phone: phone, gender: gender}}) ;
            }
            else{
                const result = await UserModel.updateOne({_id:_id}, {$set: {name: name, surname:surname, patronymic:patronymic, nickname:nickname, e_mail:e_mail, phone: phone, gender: gender, age: age}}) ;
            }
            return res.redirect('/account')
        }catch(e) {
            console.log(e);
            return res.status(500).json({ message: 'Connot update user'});
        }
    }

    async updateUserForAdmin(req, res){ 
        try {
            let { id_user, is_admin } = req.body;
            if(is_admin === "on") {is_admin= true} else {is_admin = false}

            const user = await UserModel.updateOne({_id: id_user},{$set:{ is_admin: is_admin}});
            return res.redirect('/all_users');
        } catch (e) {
            console.log(e);
            return res.status(500).json({ message: 'Connot make user  admin' });
        }
    }

    async updatePassword(req, res) {
        try {
            const { old_password, new_password} = req.body;
            const id_user = req.session.user_token;
            let old_pass = await UserModel.findOne({_id: id_user});

            if(!bcrypt.compareSync( old_password, old_pass.password)){
                return res.redirect('/error?errorMessage=Password%20is%20incorrect');
            }
            
            const hashPassword = bcrypt.hashSync(new_password, 7);
            old_pass.password = hashPassword;
            old_pass.save();
            return res.redirect('/account');
        } catch (e) {
            console.log(e);
            return res.status(500).json({ message: 'Connot update user' });
        }
    }

    async login(req, res){
        try {
            const { e_mail, password } = req.body;

            if (!e_mail || !password) {
                res.redirect('/error?errorMessage=Your_data_is_empty');
                return;
            }

            let user = await UserModel.findOne({ e_mail: e_mail });

            if (!user) {
                res.redirect('/error?errorMessage=User%20not%20found');
                return;
            }

            if (!bcrypt.compareSync(password, user.password)) {
                res.redirect('/error?errorMessage=Password%20is%20incorrect');
                return;
            }

            req.session.user_token = user._id;
            req.session.basket = [];
            res.redirect("/account");
            
        } catch (e) {
            console.log(e);
            return res.status(500).json({ message: 'Connot find user' });
        }
    }

    async logoutUser(req, res){
        try {
            req.session.user_token = null;
            req.session.basket = null;
            res.redirect('/');

        } catch(e) {
            console.log(e);
            return res.status(500).json({ message: 'Connot logout user' });
        }
    }

}

module.exports = new UserController();