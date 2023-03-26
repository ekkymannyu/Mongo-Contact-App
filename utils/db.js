const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/db_mahasiswa', {
  userNewParser: true,
  userUnifiedTopology: true,
  useCreateIndex: true,
});



// //Menambah 1 Data

// const contact1 = new Contact({
//   nama: 'Nur Aprilia',
//   nohp: '0812343213',
//   email: 'nurap@gmail.com'
// })

// //Simpan ke Collection
// contact1.save().then((contact) => console.log(contact));









