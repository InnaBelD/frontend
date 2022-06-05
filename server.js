var express = require('express');
var app = express();
var axios  = require('axios');

const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const { response } = require('express');
//const asyncHandler = require ('express-async-handler');

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/'));
app.set('views', './');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieSession({
    name: 'session',
    keys: ['user_token','user_id','user_role']
}));

app.get('/', function(req, res) {  
    axios.get('https://zakupki-edu.site/api/okpd2').then(response =>{
        res.render('pages/main',{  role:  req.session.user_role, okpd2: response.data, providers: null, userId: req.session.user_id});
    })           
})

app.get('/login', function(req, res) {
    res.render('pages/login',{  role:  req.session.user_role, errorMes: req.query.error});
})

app.post('/login', function(req, res) {
    axios.post('https://zakupki-edu.site/api/user/signin', req.body).then(
        response => {
            req.session.user_token = response.data.token;
            req.session.user_id = response.data.id;
            req.session.user_role = response.data.role;
            res.redirect('/')
    })
    .catch(function (error) {
        if (error.response) {
            res.redirect(`/login?error=${error.response.data.errorMessage}`)
        } else if (error.request) {
            res.redirect(`/login?error=${error.request}`)
        } else {
            res.redirect(`/login?error=${error.message}`)
        }
      })
})


app.get('/logout', function (req, res) {
    
    try {
        req.session.user_token = null;
    req.session.user_id = null;
    req.session.user_role = null;
    res.redirect('/');

    } catch(e) {
        console.log(e);
        return res.status(500).json({ message: 'Connot logout user' });
    }
})

app.get('/registration', function(req, res) {
    res.render('pages/registration',{  role: req.session.user_role, errorMes: req.query.error});
})

app.post('/registration', function(req, res) {
    axios.post('https://www.zakupki-edu.site/api/user', req.body)
    .then(response =>  res.redirect('/login'))
    .catch(function (error) {
        if (error.response) {
            res.redirect(`/login?error=${error.response.data.errorMessage}`)
        } else if (error.request) {
            res.redirect(`/login?error=${error.request}`)
        } else {
            res.redirect(`/login?error=${error.message}`)
        }
      })   
})

app.get('/save_list', function(req, res) {
    res.render('pages/list',{  role:  req.session.user_role, errorMes: req.query.error});
})


app.get('/provider', function(req, res) {
    res.render('pages/provider',{  role:  req.session.user_role});
})

app.get('/account', function(req, res) {
    axios.get('https://zakupki-edu.site/api/user/'+req.session.user_id).then(response =>{
        axios.get('http://zakupki-edu.site/api/Coefficient/'+req.session.user_id).then(response1 =>{
             res.render('pages/account',{  role: req.session.user_role, nameUser: response.data, koefs: response1.data, errorMes: req.query.error});
        })
    })
})

app.post('/account1', function(req, res) {
    axios.post('http://zakupki-edu.site/api/user/changeUserProfile', 
    {id: req.session.user_id, email: req.body.email, 
        name: req.body.name, surname: req.body.surname,
        patronimic: req.body.patronimic, phone: req.body.phone })
    .then(response =>{
        res.redirect('/account');
    })
    .catch(function (error) {
        if (error.response) {
            res.redirect(`/login?error=${error.response.data.errorMessage}`)
        } else if (error.request) {
            res.redirect(`/login?error=${error.request}`)
        } else {
            res.redirect(`/login?error=${error.message}`)
        }
      })
})

app.post('/account', function(req, res) {
    axios.post('http://zakupki-edu.site/api/user/changePassword', 
    {id: req.session.user_id, password: req.body.password, newPassword: req.body.newPassword})
    .then(response =>{
        res.redirect('/account');
    })
    .catch(function (error) {
        if (error.response) {
            res.redirect(`/login?error=${error.response.data.errorMessage}`)
        } else if (error.request) {
            res.redirect(`/login?error=${error.request}`)
        } else {
            res.redirect(`/login?error=${error.message}`)
        }
      })
})

app.get('/admin', function(req, res) {
    axios.get('http://zakupki-edu.site/api/Coefficient/'+req.session.user_id).then(response =>{
        res.render('pages/admin',{  role: req.session.user_role, koefs: response.data, errorMes: req.query.error});
   })
})

app.get('/page', function(req, res) {
    res.render('pages/page');
})
app.get('/save_list_for_admin', function(req, res) {
    res.render('pages/save_list_for_admin',{role: req.session.user_role, errorMes: req.query.error});
})

app.get('/users', function(req, res){
    axios.get('https://zakupki-edu.site/api/user/GetUserList?userId='+req.session.user_id).then(response =>{
        res.render('pages/users',{role: req.session.user_role, users:response.data, errorMes: req.query.error});
    }) 
})


app.post('/users',function(req, res){
    axios.post('https://zakupki-edu.site/api/user/ChangeUserRole',{userId: req.session.user_id, changingId:req.body.changingId })
    .then(response =>{
        res.redirect('/users');
    }) 
    .catch(function (error) {
        if (error.response) {
            res.redirect(`/login?error=${error.response.data.errorMessage}`)
        } else if (error.request) {
            res.redirect(`/login?error=${error.request}`)
        } else {
            res.redirect(`/login?error=${error.message}`)
        }
      })
})


app.listen(9080);

