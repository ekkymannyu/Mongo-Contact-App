const express = require('express');
const expressLayouts = require('express-ejs-layouts');
require('./utils/db');
const { body, validationResult, check } = require('express-validator')
const methodoverride = require('method-override');
const Contact = require('./model/contact');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

const app = express();
const port = 3000;
//Konfigurasi flash
app.use(cookieParser('secret'));
app.use(session({
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(flash());

//Setup Method Override
app.use(methodoverride('_method'));

// Gunakan ejs
app.set('view engine','ejs');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Halaman Home
app.get('/', (req, res) => {
  const mahasiswa = [
    {
      nama: "Muh Reski Saputra",
      nim: "60200120075",
      jurusan:"Teknik Informatika"
    }
  ];
  res.render('index',
    {
      layout: 'layouts/main-layouts',
      title: 'Halaman Home',
      mahasiswa
    }
  );
});

//Halaman About
app.get('/about',(req,res)=>{
    // res.send('Ini adalah halaman about');
    // res.sendFile('./about.html',{root: __dirname});
    res.render('about',
        {
           layout: 'layouts/main-layouts', 
            title: 'Halaman About'
        });
});

//Halaman contact
app.get('/contact',async (req,res)=>{
  // Contact.find().then((contact) => {
  //   res.send(contact);
  // })

    const contacts = await Contact.find();
    res.render('contact',
        {
            layout: 'layouts/main-layouts',
            title: 'Halaman Contact',
            contacts,
            msg: req.flash('msg'),
        });
});

//Halaman Tambah data Contact
app.get('/contact/add', (req, res) => {
    res.render('add-contact',
        {
            layout: 'layouts/main-layouts',
            title: 'Halaman Tambah Contact'
        });
})

// Proses Tambah Data Contact
app.post('/contact', [
    body('nama').custom(async(value) => {
      const duplikat = await Contact.findOne({ nama: value });
        if (duplikat) {
            throw new Error('Nama Kontak sudah ada boskuuu');
        }
        return true;
    }),
    check('email','Email Tidak Valid!').isEmail(),
    check('nohp','No Hp tidak Valid!').isMobilePhone('id-ID')
    ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('add-contact',
            {
                layout: 'layouts/main-layouts',
                title: 'Halaman Tambah Contact',
                errors: errors.array()
            });
    } else {
      Contact.insertMany(req.body ,(error, result) => {
        //kirimkan flash message
        req.flash('msg', 'Data Contact Berhasil Ditambahkan');
        res.redirect('/contact');
      });

    }
});

//Proses Delete Contact
// app.get('/contact/delete/:id', async (req, res) => {
//   const contact = await Contact.findOne({ _id: req.params.id });

//   //Jika contact tidak ada
//   if (!contact) {
//     res.status(404);
//     res.send('<h1>404 NOT FOUND</h1>');
//   } else {
//     Contact.deleteOne({ _id: contact._id }).then((result) => {
//       //kirimkan flash message
//         req.flash('msg', 'Data Contact Berhasil Dihapus');
//         res.redirect('/contact');
//     });
//   }
// });

app.delete('/contact', (req, res) => {
      Contact.deleteOne({ _id: req.body.id }).then((result) => {
      //kirimkan flash message
        req.flash('msg', 'Data Contact Berhasil Dihapus');
        res.redirect('/contact');
    });
});

//Halaman Form ubah data contact
app.get('/contact/edit/:id', async (req, res) => {
  const contact = await Contact.findOne({ _id: req.params.id });
  res.render('edit-contact',
    {
      layout: 'layouts/main-layouts',
      title: 'Halaman Ubah Data Contact',
      contact
    })
});

//Proses ubah data
app.put('/contact', [
  body('nama').custom(async (value, { req }) => {
    const duplikat = await Contact.findOne({ nama: value });
    if (value !== req.body.namaLama && duplikat) {
      throw new Error('Nama Kontak sudah ada boskuuu');
    }
    return true;
  }),
  check('email', 'Email Tidak Valid!').isEmail(),
  check('nohp', 'No Hp tidak Valid!').isMobilePhone('id-ID')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('edit-contact',
      {
        layout: 'layouts/main-layouts',
        title: 'Halaman Ubah Data Contact',
        errors: errors.array(),
        contact: req.body
      });
  } else {
    Contact.updateOne(
      { _id: req.body._id },
      {
        $set: {
          nama: req.body.nama,
          email: req.body.email,
          nohp: req.body.nohp,
        }
      },
    ).then((result) => {
      //kirimkan flash message
      req.flash('msg', 'Data Contact Berhasil Diubah');
      res.redirect('/contact');
    });


  };
});

// Halaman detail contact
app.get('/contact/:id', async (req, res) => {
    // const contact = findContact(req.params.nama);
    const contact = await Contact.findOne({_id: req.params.id});
    res.render('detail',
        {
            layout: 'layouts/main-layouts',
            title: 'Halaman Detail Contact',
            contact,
        });
});



app.listen(port, () => {
  console.log(`Mongo Contact App | listening at http://localhost:${port}`);
});