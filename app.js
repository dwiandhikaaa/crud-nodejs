const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const {loadContact,findContact,addContact,cekDuplikat,deleteContact, updateContacts} = require('./utils/contacts');
const { body, validationResult, check } = require('express-validator');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const app = express();
const port = 3000;


//gunkan ejs
app.set('view engine', 'ejs');

//third-party middleware
app.use(expressLayouts);


//bull-in middleware
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

//konfigurasi flash
app.use(cookieParser('secret'));
app.use(session({
    cookie: {maxAge:6000},
    secret: 'secret',
    resave: true,
    saveUninitialized: true,

})
);

app.use(flash());


app.get('/', (req, res) => {

    const mahasiswa =[
        {
           nama: 'andhika dwi',
           email: 'andhika@gmail.com' 
        },
        {
            nama: 'doddy fernanda',
            email: 'dodyfer@gmail.com' 
         },
         {
            nama: 'lianalis',
            email: 'lianalis@gmail.com' 
         }

    ];

res.render('index',{ 
    NAMA: 'Andhika Dwi', 
    title:"halaman home",
    mahasiswa,
    layout: 'layouts/main-layout'
});
});
app.get('/about', (req, res) => {
res.render('about', {
    layout: 'layouts/main-layout',
     title: 'ini halaman about',
    });
});

app.get('/contact', (req, res) => {

    const contacts = loadContact();
res.render('contact' , {
    layout: 'layouts/main-layout',
     title: 'ini halaman contact',
     contacts,
     msg: req.flash('msg'),
    });
});

//form tambah halamann
app.get('/contact/add', (req, res)=>{
    res.render('add-contact',{
        title:'form tambah data contact',
        layout:'layouts/main-layout',
    });
});

//proses data contact
app.post('/contact', [
    body('nama').custom((value)=>{
        const duplikat = cekDuplikat(value);
        if(duplikat){
            throw new Error('Nama contact sudah digunakan!');
        }
        return true;
    }),
    check('email','Email tidak valid').isEmail(),
    check('nohp','no hp tidak valid').isMobilePhone('id-ID')
],
    (req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        
 // return res.status(400).json({ errors: errors.array()});
        res.render('add-contact',{
        title: 'Form tambah data contact',
        layout: 'layouts/main-layout',
        errors:errors.array(),
        });
    }else{
    addContact(req.body);
    //kirimikan flash messege
    req.flash('msg','Data contact berhasil ditambah!');
    res.redirect('/contact');
}
});
//proses delete contact
app.get('/contact/delete/:nama', (req,res)=>{
    const contact = findContact(req.params.nama);

//jika contact tidak ada
if(!contact){
    res.status(404);
    res.send('<h1>404</h1>');

}else{
    deleteContact(req.params.nama);
    req.flash('msg','Data contact berhasil dihapus!');
    res.redirect('/contact');   
}
});

//form edit data 
app.get('/contact/edit/:nama', (req, res)=>{
    const contact = findContact(req.params.nama);

    res.render('edit-contact',{
        title:'form edit data contact',
        layout:'layouts/main-layout',
        contact,
    });
});

//proses edit data
app.post('/contact/update', [
    body('nama').custom((value, {req})=>{
        const duplikat = cekDuplikat(value);
        if(value !== req.body.oldNama && duplikat){
            throw new Error('Nama contact sudah digunakan!');
        }
        return true;
    }),
    check('email','Email tidak valid').isEmail(),
    check('nohp','no hp tidak valid').isMobilePhone('id-ID')
],
    (req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
 // return res.status(400).json({ errors: errors.array()});
        res.render('edit-contact',{
        title: 'Form edit   data contact',
        layout: 'layouts/main-layout',
        errors:errors.array(),
        contact:req.body,
        });
    }else{
    updateContacts(req.body);

//kirimikan flash messege 
    req.flash('msg','Data contact berhasil diubah!');
    res.redirect('/contact');

}
});
app.post('/contact/update', (req, res)=>{
    res.send(req.body);
    
});



app.get('/contact/:nama', (req, res) => {
    const contact = findContact(req.params.nama);

res.render('detail' , {
    layout: 'layouts/main-layout',
     title: 'ini halaman detail contact',
     contact,
    });
});
    app.use('/', (req, res)=>{
        res.status('404');
        res.send('<h1>404</h1>');
    });  


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
