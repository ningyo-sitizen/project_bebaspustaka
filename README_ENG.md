
Read this in: [🇮🇩 Bahasa Indonesia](README.md)

---

<p align="center">
  <img src="https://github.com/ningyo-sitizen/BebasPustaka/blob/master/public/logso.png" alt="alt text" />
</p>

## INTRODUCTION
This file contains guidelines on how developers create, populate, and conduct project development.
## DESIGN SUMMARY

This system provides a "library clearance" (bebas pustaka) verification workflow for students, fulfills library administrative requirements, and provides a dashboard for librarians to record status. The architecture is separated into:

- **Backend**: Node.js + Express.js, MySQL.
- **Frontend**: React.js.
- **Styling**: Tailwind CSS, utility-first components.

## 📁 PROJECT FILE STRUCTURE: BEBAS KOMPEN

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
│   │   │   
│   ├── app.js
│   ├── config.js
│   ├── package.json
│   ├── package-lock.json
│   ├── .env
│   └── .gitignore
│
└── README.md </pre>

## File formats must match their function

**Definition:**
Files must be saved with extensions and content that match their code type so they can be easily recognized and executed by the system.

**Right ✅**
- JavaScript files are saved with `.js`
- CSS files are saved with `.css`

```
✅ style.css → berisi kode CSS
✅ app.js → berisi kode JavaScript

```

**Wrong ❌**

```
❌ style.js → berisi kode CSS
❌ app.txt → berisi kode JavaScript

```
Every piece of code must be free of typos and missing/extra symbols
Definition:
Ensure there are no typographical errors or missing punctuation, as these can cause runtime or compilation errors.

Right ✅
```
let totalPrice = price * quantity;
```

Wrong ❌
```

let totalPrice = price * quantity  // missing semicolon
let totalPrice = pirce * quantity; // typo in 'price'
Using templates is allowed, but the source must always be cited
```

Definition:
If you use code from the internet or a template, write down the source as a form of ethics and transparency.

Right ✅

// Source: [https://www.w3schools.com/js/js_examples.asp](https://www.w3schools.com/js/js_examples.asp)
```

function calculateArea(radius) {
  return Math.PI * radius * radius;
}
```

Wrong ❌

```

function calculateArea(radius) {
  return Math.PI * radius * radius;
}
```

// Source not cited despite using code from another website
Use consistent indentation
Definition:
Indentation helps in reading the program structure neatly. Use spaces or tabs consistently.

Right ✅

```

if (userLoggedIn) {
  showDashboard();
} else {
  showLoginPage();
}
```

Wrong ❌

```

if (userLoggedIn){
showDashboard();
    }else{
 showLoginPage();
}
```

Variable naming should use camelCase
Definition:
Use the camelCase style (lowercase first letter, uppercase first letter of subsequent words) for variable naming to ensure readability and uniformity.

Right ✅

```

let totalAmount;
let studentName;
```

Wrong ❌

```
let Total_Amount;   // uses uppercase and underscore
let student_name;   // snake_case, not camelCase
let totalamount;    // word separation is unclear
```

Use comments to explain complex parts of the code
Definition:
Add comments (// or /* ... */) to explain complex logic or functions so that others (or your future self) can understand it easily.

Right ✅

```

// Calculate the average score of students
let average = totalScore / totalStudents;
```

Wrong ❌

```
let average = totalScore / totalStudents; // no comment provided despite being important
```

Store files in a clear folder structure
Definition:
Use a folder structure based on functions (e.g., models/, controllers/, views/, assets/) to make it easier to locate files and avoid project clutter.

Right ✅

/project
│
├── /controllers
│   └── userController.js
├── /models
│   └── userModel.js
└── /views
    └── userView.html
Wrong ❌

/project
│
├── controller1.js
├── view1.html
├── data.js
├── coba.js
└── fix2.js
Avoid code duplication
Definition:
Do not write the same code repeatedly. Use functions or modules to keep the code efficient and easy to maintain.

Right ✅

```

function calculateDiscount(price, discountRate) {
  return price - (price * discountRate);
}

// Call function
let finalPrice = calculateDiscount(100000, 0.1);
```

Wrong ❌

```

let discount1 = 100000 - (100000 * 0.1);
let discount2 = 200000 - (200000 * 0.1);
let discount3 = 300000 - (300000 * 0.1);
```
