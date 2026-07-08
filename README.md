Read this in: [🇬🇧 English](README_ENG.md)

<p align="center">
  <img src="https://github.com/ningyo-sitizen/BebasPustaka/blob/master/public/logso.png" alt="alt text" />
</p>



## PENGANTAR

File ini berisi tentang bagaimana developer membuat, mengisi, melakukan development project

## RINGKASAN DESAIN

Sistem ini menyediakan alur verifikasi "bebas pustaka" untuk mahasiswa, memenuhi persyaratan administrasi perpustakaan, dan menyediakan dashboard untuk pustakawan untuk mencatat status. Arsitektur terpisah menjadi:

- **Backend**: Node.js + Express.js, MySQL.
- **Frontend**: React.js.
- **Styling**: Tailwind CSS, utility-first components.

## 📁STRUKTUR FILE PROJECT BEBAS KOMPEN

BACKEND + FRONTEND

<pre>/bebas-pustaka-system
│
├── /server
│   ├── /src
│   │   ├── /config
│   │   ├── /controllers
│   │   ├── /public
│   │   ├── /routes
│   │   ├── /middlewares
│   │   ├── /node_modules
│   │   
│   ├── app.js
│   ├── config.js
│   ├── package.json
│   ├── package-lock.json
│   ├── .env
│   └── .gitignore
│
└── [README.md](http://readme.md/) </pre>

## Format file harus sesuai dengan fungsinya

**Pengertian:**

File harus disimpan dengan ekstensi dan isi yang sesuai dengan jenis kodenya agar mudah dikenali dan dijalankan oleh sistem.

**Right ✅**

- File JavaScript disimpan dengan `.js`
- File CSS disimpan dengan `.css`

```
✅ style.css → berisi kode CSS
✅ app.js → berisi kode JavaScript

```

**Wrong ❌**

```
❌ style.js → berisi kode CSS
❌ app.txt → berisi kode JavaScript

```

Setiap codingan tidak boleh ada yang typo atau kelebihan/kekurangan symbol

**Pengertian:**

Pastikan tidak ada kesalahan pengetikan atau tanda baca yang hilang karena bisa menyebabkan error saat dijalankan.

**Right ✅**

```jsx
let totalPrice = price * quantity;

```

**Wrong ❌**

```jsx
let totalPrice = price * quantity  // lupa titik koma
let totalPrice = pirce * quantity; // typo pada 'price'

```

Boleh menggunakan template tetapi harus tetep mencantumkan source nya

**Pengertian:**

Jika menggunakan kode dari internet atau template, tuliskan sumbernya sebagai bentuk etika dan transparansi.

**Right ✅**

```jsx
// Source: https://www.w3schools.com/js/js_examples.asp
function calculateArea(radius) {
  return Math.PI * radius * radius;
}

```

**Wrong ❌**

```jsx
function calculateArea(radius) {
  return Math.PI * radius * radius;
}
// Tidak mencantumkan sumber padahal dari website lain

```

Gunakan indentasi yang konsisten 

**Pengertian:**

Indentasi membantu membaca struktur program dengan rapi. Gunakan spasi atau tab secara konsisten.

**Right ✅**

```jsx
if (userLoggedIn) {
  showDashboard();
} else {
  showLoginPage();
}

```

**Wrong ❌**

```jsx
if (userLoggedIn){
showDashboard();
    }else{
 showLoginPage();
}

```

Penamaan variable menggunakan camelCase

**Pengertian:**

Gunakan gaya **camelCase** (huruf pertama kecil, huruf pertama kata berikutnya besar) untuk penamaan variabel agar mudah dibaca dan seragam.

**Right ✅**

```jsx
let totalAmount;
let studentName;

```

**Wrong ❌**

```jsx
let Total_Amount;   // menggunakan underscore
let student_name;   // tidak camelCase
let totalamount;    // tidak jelas pemisahan katanya

```

Gunakan komentar untuk menjelaskan bagian kode yang rumit

**Pengertian:**

Tambahkan komentar (`//` atau `/* ... */`) untuk menjelaskan logika atau fungsi yang sulit dipahami agar orang lain (atau diri sendiri di masa depan) mengerti.

**Right ✅**

```jsx
// Menghitung rata-rata nilai siswa
let average = totalScore / totalStudents;

```

**Wrong ❌**

```jsx
let average = totalScore / totalStudents; // tidak ada komentar padahal penting

```

Simpan file dalam struktur folder yang jelas

**Pengertian:**

Gunakan struktur folder sesuai fungsi (misalnya: `models/`, `controllers/`, `views/`, `assets/`) agar mudah mencari file dan menghindari kekacauan proyek.

**Right ✅**

```
/project
│
├── /controllers
│   └── userController.js
├── /models
│   └── userModel.js
└── /views
    └── userView.html

```

**Wrong ❌**

```
/project
│
├── controller1.js
├── view1.html
├── data.js
├── coba.js
└── fix2.js

```

Hindari duplikasi kode

**Pengertian:**

Jangan menulis kode yang sama berulang-ulang. Gunakan fungsi atau modul agar kode efisien dan mudah dikelola.

**Right ✅**

```jsx
function calculateDiscount(price, discountRate) {
  return price - (price * discountRate);
}

// Panggil fungsi
let finalPrice = calculateDiscount(100000, 0.1);

```

**Wrong ❌**

```jsx
let discount1 = 100000 - (100000 * 0.1);
let discount2 = 200000 - (200000 * 0.1);
let discount3 = 300000 - (300000 * 0.1);

```
