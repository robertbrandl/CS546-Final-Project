import {dbConnection, closeConnection} from './config/mongoConnection.js';
import reviews from './data/reviews.js';
import users from './data/users.js';
import shows from './data/shows.js';
const db = await dbConnection();
await db.dropDatabase();

//Adds shows to the database
let show1 = await shows.getIndividualShow(31); //Marvel's Agents of S.H.I.E.L.D.
const s1id = show1._id.toString();
let show2 = await shows.getIndividualShow(24); //Hawaii Five-O
const s2id = show2._id.toString();
let show3 = await shows.getIndividualShow(40); //Death Note
const s3id = show3._id.toString();
let show4 = await shows.getIndividualShow(19); //Supernatural
const s4id = show4._id.toString();
let show5 = await shows.getIndividualShow(323); //White Collar
const s5id = show5._id.toString();
let show6 = await shows.getIndividualShow(62068); //The Rookie: Feds
const s6id = show6._id.toString();
let show7 = await shows.getIndividualShow(82); //Game of Thrones
const s7id = show7._id.toString();
let show8 = await shows.getIndividualShow(169); //Breaking Bad
const s8id = show8._id.toString();
let show9 = await shows.getIndividualShow(177); //Pretty Little Liars
const s9id = show9._id.toString();

//Adds sample user information into the database
let user1 = await users.registerUser("Robert", "Brandl", "robert@gmail.com", "User1234!");
let u1id = await users.getUser("robert@gmail.com")._id.toString();
let user2 = await users.registerUser("Krystal", "Hong", "krystal@gmail.com", "User3456!");
let u2id = await users.getUser("krystal@gmail.com")._id.toString();
let user3 = await users.registerUser("Linette", "Santana Encarnacion", "linette@gmail.com", "User6789!");
let u3id = await users.getUser("linette@gmail.com")._id.toString();
let user4 = await users.registerUser("Sydney", "Linford", "sydney@gmail.com", "User1298!");
let u4id = await users.getUser("sydney@gmail.com")._id.toString();

//adds reviews for each show into the database
let review1 = await reviews.create();
let review2 = await reviews.create();
let review3 = await reviews.create();
let review4 = await reviews.create();
let review5 = await reviews.create();
let review6 = await reviews.create();
let review7 = await reviews.create();
let review8 = await reviews.create();
let review9 = await reviews.create();


console.log('Done seeding database');
await closeConnection();