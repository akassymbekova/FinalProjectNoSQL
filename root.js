const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');
const chalk = require('chalk');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: 'yourSecretKey', resave: false, saveUninitialized: false }));


const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        default: uuidv4,
        unique: true
    },
    firstName: String,
    lastName: String,
    username: { type: String, unique: true, sparse: true },
    email: { type: String, unique: false },
    gender: String,
    age: Number,
    password: String,
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
});

userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const User = mongoose.model('User', userSchema);

const tvSchema = new mongoose.Schema({
    name: String,
    url: String,
    images: { type: [String], default: [] },
    specifications: {
        "Screen Size": String,
        "Resolution": String,
        "Technology": String,
        "Color": String,
        "Aspect Ratio": String,
        "Peculiarities": String,
        "Complete": String,
        "Guarantee": String
    },
    category: { type: String, default: 'TV' }
});

const mixerSchema = new mongoose.Schema({
    name: String,
    url: String,
    images: { type: [String], default: [] },
    specifications: {
        "Mixer Type": String,
        "Mugs": String,
        "Complete": String,
        "The number of nozzles": String,
        "Color": String,
        "Guarantee": String,
    },
    category: { type: String, default: 'Mixer' }
});

const washingMachineSchema = new mongoose.Schema({
    name: String,
    url: String,
    images: { type: [String], default: [] },
    specifications: {
        "Dimensions": String,
        "Max Load (Washing)": String,
        "Programs": String,
        "Load Type": String,
        "Weight": String,
        "Color": String,
        "Door Color": String,
        "Guarantee": String
    },
    category: { type: String, default: 'Washing Machine' }
});

const fridgeSchema = new mongoose.Schema({
    name: String,
    url: String,
    images: { type: [String], default: [] },
    specifications: {
        "Refrigerator Type": String,
        "Total Volume": String,
        "Compressor Type": String,
        "Color": String,
        "Weight": String,
        "Peculiarities": String,
        "Complete": String,
        "Guarantee": String
    },
    category: { type: String, default: 'Fridge' }
});

const robotVacuumCleanerSchema = new mongoose.Schema({
    name: String,
    url: String,
    images: { type: [String], default: [] },
    specifications: {
        "Cleaning Type": String,
        "Suction Power": String,
        "Cleaning Zone Limiter": String,
        "Complete": String,
        "Weight": String,
        "Color": String,
        "Guarantee": String
    },
    category: { type: String, default: 'Robot Vacuum Cleaner' }
});

const TV = mongoose.model('TV', tvSchema);
const Mixer = mongoose.model('Mixer', mixerSchema);
const WashingMachine = mongoose.model('WashingMachine', washingMachineSchema);
const Fridge = mongoose.model('Fridge', fridgeSchema);
const RobotVacuumCleaner = mongoose.model('RobotVacuumCleaner', robotVacuumCleanerSchema);


app.use(async (req, res, next) => {
    if (req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            if (user) {
                req.user = user;
                res.locals.user = user;
            } else {
                req.user = null;
                res.locals.user = null;
            }
        } catch (err) {
            console.error('Error when retrieving user:', err);
            req.user = null;
            res.locals.user = null;
        }
    } else {
        req.user = null;
        res.locals.user = null;
    }
    next();
});


function isAuthenticated(req, res, next) {
    if (req.user) {
        return next();
    } else {
        res.redirect('/login'); 
    }
}


async function getProducts() {
    try {
        return await TV.find().lean();
    } catch (err) {
        console.error("Error fetching products:", err);
        return [];
    }
}

app.get('/', async (req, res) => {
    const user = req.user || null;
    const products = await getProducts();
    res.render('home', { user, products, page: 'home' });
});


app.get('/products', async (req, res) => {
    try {
        const tvProducts = await TV.find();
        const mixerProducts = await Mixer.find();
        const washingMachineProducts = await WashingMachine.find();
        const fridgeProducts = await Fridge.find();
        const robotVacuumCleanerProducts = await RobotVacuumCleaner.find();
        console.log('TV Products:', tvProducts);
        console.log('Mixer Products:', mixerProducts);
        console.log('Washing Machine Products:', washingMachineProducts);
        console.log('Fridge Products:', fridgeProducts);
        console.log('Robot Vacuum Cleaner Products:', robotVacuumCleanerProducts);
        const products = [...tvProducts, ...mixerProducts, ...washingMachineProducts, ...fridgeProducts, ...robotVacuumCleanerProducts];
        res.render('products', { page: 'products', products, user: req.user });
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).send('Error fetching products');
    }
});


app.get('/product/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        let product = await TV.findById(productId);
        if (!product) {
            product = await Mixer.findById(productId);
        }
        if (!product) {
            product = await WashingMachine.findById(productId);
        }
        if (!product) {
            product = await Fridge.findById(productId);
        }
        if (!product) {
            product = await RobotVacuumCleaner.findById(productId);
        }
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.render('product', { page: 'product', product, user: req.user });
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).send('Error fetching product');
    }
});

//------------------------------------------------------------------
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    model: String
  });
  mongoose.model('Product', productSchema);
  

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{
      productId: { type: mongoose.Schema.Types.ObjectId, refPath: 'products.model', required: true },
      quantity: { type: Number, required: true },
      model: { type: String, required: true, enum: ['TV', 'Mixer', 'WashingMachine', 'Fridge', 'RobotVacuumCleaner'] }
    }],
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Completed', 'Cancelled'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
  });
  
  orderSchema.pre('save', function(next) {
    this.products.forEach(product => {
      console.log(`product.model: ${product.model}`);
    });
    next();
  });
  

const Order = mongoose.model('Order', orderSchema);

app.post('/order', isAuthenticated, async (req, res) => {
    console.log('Полученные данные:', req.body);
  
    const userId = req.user._id;
    const products = Object.keys(req.body)
      .filter(key => key.startsWith('products'))
      .reduce((acc, key) => {
        const [_, index, field] = key.split(/[\[\]]/).filter(Boolean);
  
        if (!acc[index]) {
          acc[index] = {};
        }
  
        acc[index][field] = req.body[key];
        return acc;
      }, []);
  
    products.forEach(product => {
      
      switch (product.category) {
        case 'TV':
          product.model = 'TV';
          break;
        case 'Mixer':
          product.model = 'Mixer';
          break;
        case 'Washing Machine':
          product.model = 'WashingMachine';
          break;
        case 'Fridge':
          product.model = 'Fridge';
          break;
        case 'Robot Vacuum Cleaner':
          product.model = 'RobotVacuumCleaner';
          break;
        default:
          product.model = ''; 
      }
    });
  
    let totalPrice = req.body.totalPrice;
  
    if (!totalPrice || isNaN(totalPrice)) {
      totalPrice = products.reduce((sum, product) => sum + (product.price || 0), 0);
      if (isNaN(totalPrice) || totalPrice === 0) {
        totalPrice = 0;
      }
    }
  
    console.log('Преобразованные данные продуктов:', products);
    console.log('Итоговая цена:', totalPrice);
  
    if (!products || products.length === 0) {
      return res.status(400).send('No products specified in the order');
    }
  
    try {
      const newOrder = new Order({
        userId,
        products,
        totalPrice
      });
  
      const savedOrder = await newOrder.save();
      console.log('Сохраненный заказ:', savedOrder);
      res.redirect('/orders'); 
    } catch (err) {
      console.error('Error creating order:', err.message);
      console.error('Stack trace:', err.stack);
      res.status(500).send('Error placing order');
    }
});
  
app.get('/orders', isAuthenticated, async (req, res) => {
    try {
      const orders = await Order.find({ userId: req.user._id }).populate('products.productId');
      res.render('orders', { orders, page: 'orders' });
    } catch (err) {
      console.error('Error fetching orders:', err);
      res.status(500).send('Error fetching orders');
    }
});

app.get('/orders/delete/:id', isAuthenticated, async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).send('Order not found');
        }
        res.redirect('/orders');
    } catch (err) {
        console.error('Error deleting order:', err);
        res.status(500).send('Error deleting order');
    }
});

//---------------------------------------------------------------------------------------------------------

app.post('/update-product/:id', async (req, res) => {
    const productId = req.params.id;
    const images = req.body.images ? req.body.images.split(',').map(img => img.trim()) : [];

    try {
        await TV.findByIdAndUpdate(productId, { images });
        res.redirect('/products');
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).send('Error updating product');
    }
});

app.post('/create-product', async (req, res) => {
    const { category, name, url, images, ...specifications } = req.body;

    
    specifications.Color = Array.isArray(specifications.Color) ? specifications.Color.filter(Boolean).join('') : specifications.Color;
    specifications.Complete = Array.isArray(specifications.Complete) ? specifications.Complete.filter(Boolean).join('') : specifications.Complete;
    specifications.Guarantee = Array.isArray(specifications.Guarantee) ? specifications.Guarantee.filter(Boolean).join('') : specifications.Guarantee;
    specifications.Weight = Array.isArray(specifications.Weight) ? specifications.Weight.filter(Boolean).join('') : specifications.Weight;

    try {
        let product;
        const imagesArray = typeof images === 'string' ? images.split(',').map(img => img.trim()) : [];

        if (category === 'TV') {
            product = new TV({
                name: Array.isArray(name) ? name[0] : name,
                url: Array.isArray(url) ? url[0] : url,
                images: imagesArray,
                specifications
            });
        } else if (category === 'Mixer') {
            product = new Mixer({
                name: Array.isArray(name) ? name[0] : name,
                url: Array.isArray(url) ? url[0] : url,
                images: imagesArray,
                specifications
            });
        } else if (category === 'Washing Machine') {
            product = new WashingMachine({
                name: Array.isArray(name) ? name[0] : name,
                url: Array.isArray(url) ? url[0] : url,
                images: imagesArray,
                specifications
            });
        } else if (category === 'Fridge') {
            product = new Fridge({
                name: Array.isArray(name) ? name[0] : name,
                url: Array.isArray(url) ? url[0] : url,
                images: imagesArray,
                specifications
            });
        } else if (category === 'Robot Vacuum Cleaner') {
            product = new RobotVacuumCleaner({
                name: Array.isArray(name) ? name[0] : name,
                url: Array.isArray(url) ? url[0] : url,
                images: imagesArray,
                specifications
            });
        }

        console.log('Product Created:', product);
        await product.save();
        res.redirect('/products');
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).send(`Error creating product: ${err.message}`);
    }
});

app.post('/edit-product/:id', async (req, res) => {
    const productId = req.params.id;
    const { category, name, url, images, ...specifications } = req.body;

    try {
        const imagesArray = typeof images === 'string' ? images.split(',').map(img => img.trim()) : [];

        const updateData = {
            name: Array.isArray(name) ? name[0] : name,
            url: Array.isArray(url) ? url[0] : url,
            images: imagesArray,
            specifications
        };

        if (category === 'TV') {
            await TV.findByIdAndUpdate(productId, updateData);
        } else if (category === 'Mixer') {
            await Mixer.findByIdAndUpdate(productId, updateData);
        } else if (category === 'Washing Machine') {
            await WashingMachine.findByIdAndUpdate(productId, updateData);
        } else if (category === 'Fridge') {
            await Fridge.findByIdAndUpdate(productId, updateData);
        } else if (category === 'Robot Vacuum Cleaner') {
            await RobotVacuumCleaner.findByIdAndUpdate(productId, updateData);
        }

        res.redirect('/products');
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).send(`Error updating product: ${err.message}`);
    }
});

app.post('/delete-product/:id', async (req, res) => {
    const productId = req.params.id;
    const { category } = req.body;

    try {
        if (category === 'TV') {
            await TV.findByIdAndDelete(productId);
        } else if (category === 'Mixer') {
            await Mixer.findByIdAndDelete(productId);
        } else if (category === 'Washing Machine') {
            await WashingMachine.findByIdAndDelete(productId);
        } else if (category === 'Fridge') {
            await Fridge.findByIdAndDelete(productId);
        } else if (category === 'Robot Vacuum Cleaner') {
            await RobotVacuumCleaner.findByIdAndDelete(productId);
        }

        res.redirect('/products');
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).send(`Error deleting product: ${err.message}`);
    }
});

async function createAdmin() {
    const adminUsernames = process.env.ADMIN_USERS.split(',');
    const adminPasswords = process.env.ADMIN_PASSWORDS.split(',');

    for (let i = 0; i < adminUsernames.length; i++) {
        const username = adminUsernames[i];
        const password = adminPasswords[i];
        const adminExists = await User.findOne({ username });

        if (!adminExists) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const admin = new User({
                username,
                password: hashedPassword,
                isAdmin: true,
            });
            try {
                await admin.save();
                console.log(`Admin ${username} created`);
            } catch (err) {
                console.log(`Error creating admin ${username}:`, err);
            }
        } else {
            console.log(`Admin ${username} already exists`);
        }
    }
}

createAdmin().then(() => console.log('Admin check complete'));
async function adminLogin(req, res) {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).send('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).send('Invalid password');
    }

    req.session.userId = user._id;
    req.user = user;
    res.locals.user = user;

    if (user.isAdmin) {
        return res.redirect('/admin');
    }
    res.redirect('/');
}

app.post('/login', async (req, res) => {
try {
    await adminLogin(req, res);
} catch (err) {
    res.status(500).send('Error logging in');
}
});

app.use(async (req, res, next) => {
    if (req.session.userId) {
    try {
        const user = await User.findById(req.session.userId);
        if (user) {
        req.user = user;
        res.locals.user = user;
        }
    } catch (err) {
        console.error('Error retrieving user:', err);
    }
    }
    next();
});

function isAdmin(req, res, next) {
    console.log('Session:', req.session);
    console.log('User:', req.user);
    if (req.session.userId === 'admin' || (req.session.userId && req.user && req.user.isAdmin)) {
        return next();
    } else {
        res.status(403).send('Access denied');
    }
}

app.get('/admin', isAdmin, async (req, res) => {
    try {
    const users = await User.find();
    res.render('admin', { user: req.user, users: users, page: 'admin' });
    } catch (err) {
    console.log('Error fetching users:', err);
    res.status(500).send('Internal Server Error');
    }
});

app.post('/admin/add-user', isAdmin, async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email: email || undefined,
            password: hashedPassword,
        });

        await newUser.save();
        res.redirect('/admin');
    } catch (err) {
        if (err.code === 11000 && err.keyPattern.username) {
            return res.status(400).send('Username already exists');
        } else {
            console.error('Error adding user: ', err);
            res.status(500).send('Error adding user');
        }
    }
});

app.post('/admin/edit-user/:id', isAdmin, async (req, res) => {
    const userId = req.params.id;
    const { firstName, lastName, username, email, gender, age, password, isAdmin } = req.body;

    console.log('Received data:', req.body);

    try {
        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.firstName = firstName;
        user.lastName = lastName;
        user.username = username;
        user.email = email;
        user.gender = gender;
        user.age = age;
        user.isAdmin = isAdmin === 'on';

        if (hashedPassword) {
            user.password = hashedPassword;
        }

        await user.save();
        res.json({ success: true });
    } catch (err) {
        console.error('Error editing user:', err);
        res.status(500).json({ success: false, message: 'Error editing user' });
    }
});

app.post('/admin/delete-user/:id', isAdmin, async (req, res) => {
    const userId = req.params.id;
    
    try {
    await User.findByIdAndDelete(userId);
    res.redirect('/admin');
    } catch (err) {
    res.status(500).send('Error deleting user');
    }
});


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/login', (req, res) => {
    const user = req.session.userId;
    res.render('login', { page: 'login', user });
});

app.get('/signup', (req, res) => {
    const user = req.session.user || null;
    res.render('signup', { user, page: 'signup' });
});

app.post('/signup', async (req, res) => {
    const { firstName, lastName, username, email, gender, age, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        firstName,
        lastName,
        username,
        email,
        gender,
        age,
        password: hashedPassword,
    });

    try {
        await user.save();
        res.redirect('/login');
    } catch (err) {
        res.status(500).send('Error creating user');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
    return res.status(400).send('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
    return res.status(400).send('Invalid password');
    }

    req.session.userId = user._id;
    res.redirect('/');
});

app.get('/profile', async (req, res) => {
    const user = req.session.userId ? await User.findById(req.session.userId) : null;
    if (!user) {
    return res.redirect('/login');
    }
    res.render('profile', { user, page: 'profile' });
});

app.post('/updateProfile', async (req, res) => {
    const { username, firstName, lastName, email, gender, age, oldPassword, newPassword } = req.body;
    const user = await User.findById(req.session.userId);

    if (!user) {
        return res.status(400).send('User not found');
    }

    user.username = username;
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.gender = gender;
    user.age = age;

    if (oldPassword && newPassword) {
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (isMatch) {
            user.password = await bcrypt.hash(newPassword, 10);
        } else {
            return res.status(400).send('Incorrect old password');
        }
    }
    await user.save();
    res.status(200).send('Profile updated successfully');
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/');
        }

        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

app.post('/admin/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/');
        }

        res.clearCookie('connect.sid');
        res.redirect(req.body.redirectPath || '/admin/login');
    });
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/weather/data', async (req, res) => {
    try {
        const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
            params: {
                q: 'Astana',
                appid: process.env.OPENWEATHER_API_KEY,
                units: 'metric',
                lang: 'en'
            }
        });

        const weatherData = weatherResponse.data;
        const responseData = {
            temperature: weatherData.main.temp,
            description: weatherData.weather[0].description,
            icon: `http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`,
            coordinates: {
                latitude: weatherData.coord.lat,
                longitude: weatherData.coord.lon
            },
            feelsLike: weatherData.main.feels_like,
            humidity: weatherData.main.humidity,
            pressure: weatherData.main.pressure,
            windSpeed: weatherData.wind.speed,
            countryCode: weatherData.sys.country,
            rainVolume: weatherData.rain ? weatherData.rain['3h'] : 0
        };

        console.log("Weather data:", JSON.stringify(responseData, null, 2));

        res.json(responseData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching weather data' });
    }
});

const locations = [
    { name: 'Sulpak - Astana', latitude: 51.1284, longitude: 71.4304, description: 'A well-known electronics and home appliance store in Astana.'  },
    { name: 'Mechta - Astana', latitude: 51.0904, longitude: 71.3986, description: 'A popular home appliances and electronics retailer in Astana.' },
    { name: 'Technodom - Astana', latitude: 51.1692, longitude: 71.4016, description: 'Offers a variety of home appliances and electronics in Astana.' },
    { name: 'Alser - Astana', latitude: 51.1694, longitude: 71.4491, description: 'Provides home appliances, electronics, and gadgets in Astana.' }
];

app.get('/api/locations', (req, res) => {
    console.log("Requested locations:", JSON.stringify(locations, null, 2));
    res.json(locations);
});

app.get('/map', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Open http://localhost:${port} in your browser to access the application`);
});