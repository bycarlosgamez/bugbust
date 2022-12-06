const express = require('express');
const app = express();
const path = require('path');
const ejsmate = require('ejs-mate');
const catchAsync = require('./helpers/catchAsync');
const methodOverride = require('method-override');
const connectDB = require('./config/database');
const Ticket = require('./models/ticket');

// Allows us to hace acces to varialves in our .env file
require('dotenv').config({ path: './config/.env' });

// Connects our DB to server
connectDB();

app.engine('ejs', ejsmate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public')); // to use public files
app.use(express.urlencoded({ extended: true })); // to parse req.body
app.use(express.json()); // to convert to json
app.use(methodOverride('_method')); // to use put or delete methods from form

// homepage
app.get('/', (req, res) => {
  res.render('home');
});

// see all tickets
app.get(
  '/tickets',
  catchAsync(async (req, res, next) => {
    const tickets = await Ticket.find({});
    res.render('tickets/index', { tickets });
  })
);

// create new ticket
app.get('/tickets/new', (req, res) => {
  res.render('tickets/new');
});

app.post(
  '/tickets',
  catchAsync(async (req, res) => {
    const ticket = new Ticket(req.body.ticket);
    console.log(ticket);
    await ticket.save();
    res.redirect(`/tickets/${ticket._id}`);
  })
);

// see individual ticket by id
app.get(
  '/tickets/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const ticket = await Ticket.findById(id);
    res.render('tickets/show', { ticket });
  })
);

// edit existing ticket
app.get(
  '/tickets/:id/edit',
  catchAsync(async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);
    res.render('tickets/edit', { ticket });
  })
);

app.put(
  '/tickets/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const ticket = await Ticket.findByIdAndUpdate(id, { ...req.body.ticket });
    res.redirect(`/tickets/${ticket._id}`);
  })
);

// delete ticket
app.delete(
  '/tickets/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Ticket.findByIdAndRemove(id);
    res.redirect(`/tickets`);
  })
);

app.use((err, req, res, next), () => {
  res.send('Something went wrong');
});

app.listen(process.env.PORT, () => {
  console.log(`App running on port: ${process.env.PORT}`);
});
