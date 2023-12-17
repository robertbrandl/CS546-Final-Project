import {dbConnection, closeConnection} from './config/mongoConnection.js';
import reviews from './data/reviews.js';
import users from './data/users.js';
import shows from './data/shows.js';
const db = await dbConnection();
await db.dropDatabase();

//Adds shows to the database
let show1 = await shows.getIndividualShow("31"); //Marvel's Agents of S.H.I.E.L.D.
const s1id = show1.apiId.toString();
let show2 = await shows.getIndividualShow("24"); //Hawaii Five-O
const s2id = show2.apiId.toString();
let show3 = await shows.getIndividualShow("40"); //Death Note
const s3id = show3.apiId.toString();
let show4 = await shows.getIndividualShow("19"); //Supernatural
const s4id = show4.apiId.toString();
let show5 = await shows.getIndividualShow("323"); //White Collar
const s5id = show5.apiId.toString();
let show6 = await shows.getIndividualShow("62068"); //The Rookie: Feds
const s6id = show6.apiId.toString();
let show7 = await shows.getIndividualShow("82"); //Game of Thrones
const s7id = show7.apiId.toString();
let show8 = await shows.getIndividualShow("169"); //Breaking Bad
const s8id = show8.apiId.toString();
let show9 = await shows.getIndividualShow("177"); //Pretty Little Liars
const s9id = show9.apiId.toString();
let show10 = await shows.getIndividualShow("65"); //Bones
const s10id = show10.apiId.toString();
let show11 = await shows.getIndividualShow("114"); //Survivor
const s11id = show11.apiId.toString();
let show12 = await shows.getIndividualShow("71"); //Dancing with the Stars
const s12id = show12.apiId.toString();
let show13 = await shows.getIndividualShow("244");
let show14 = await shows.getIndividualShow("74");
let show15 = await shows.getIndividualShow("8");
let show16 = await shows.getIndividualShow("53");
let show17 = await shows.getIndividualShow("70");


//Adds sample user information into the database
let user1 = await users.registerUser("Robert", "Brandl", "robert@gmail.com", "User1234!");
let u1id = await users.getUser("robert@gmail.com")
u1id = u1id._id.toString();
let user2 = await users.registerUser("Krystal", "Hong", "krystal@gmail.com", "User3456!");
let u2id = await users.getUser("krystal@gmail.com")
u2id = u2id._id.toString();
let user3 = await users.registerUser("Linette", "Santana Encarnacion", "linette@gmail.com", "User6789!");
let u3id = await users.getUser("linette@gmail.com")
u3id = u3id._id.toString();
let user4 = await users.registerUser("Sydney", "Linford", "sydney@gmail.com", "User1298!");
let u4id = await users.getUser("sydney@gmail.com")
u4id = u4id._id.toString();

//adds reviews for each show into the database
let review1 = await reviews.create(s2id, u2id, "Hawaii Five-O", "Krystal", "Hong", "An average detective show", 3, "This show is ok. This is something my parents would watch", false);
let review2 = await reviews.create(s1id, u2id, "Marvel's Agents of S.H.I.E.L.D.", "Krystal", "Hong", "For the Marvel fans!", 7, "Great show for those who like the Marvel movies.", true);
let review3 = await reviews.create(s3id, u2id, "Death Note", "Krystal", "Hong", "My first anime review", 8, "Every episode was exciting and suspenseful!", true);
let review4 = await reviews.create(s4id, u1id, "Supernatural", "Robert", "Brandl", "A show for paranormal/horror fans", 9, " I really enjoyed watching this show", true);
let review5 = await reviews.create(s5id, u1id, "White Collar", "Robert", "Brandl", "A procedural that's not boring", 10, "a great show with interesting characters and lots of fun", true);
let review6 = await reviews.create(s6id, u1id, "The Rookie: Feds", "Robert", "Brandl", "ok show, not as good as the original", 5, "I prefer the original to this show, although some of the characters are good.", true);
let review7 = await reviews.create(s7id, u3id, "Game of Thrones", "Linette", "Santana Encarnacion", "Best show ever! horrible ending :((", 10, "Story was incredible, loved all the character development.", true);
let review8 = await reviews.create(s8id, u3id, "Breaking Bad", "Linette", "Santana Encarnacion", "Great actors, too long ", 7, "Great story and development, just was too long for me, however the acting was great.", false);
let review9 = await reviews.create(s9id, u3id, "Pretty Little Liars", "Linette", "Santana Encarnacion", "Its not bad, very repetitive ", 4, "It had a strong start but then it became more of the same, kind of boring. ", false);
let review10 = await reviews.create(s10id, u4id, "Bones", "Sydney", "Linford", "good show but kinda messed up character development", 8, "procedural show that had good plots and overarching plot but some of the characters had development and then regressed", false);
let review11 = await reviews.create(s11id, u4id, "Survivor", "Sydney", "Linford", "my fav show!", 10, "the best reality tv show out there...", true);
let review12 = await reviews.create(s12id, u4id, "Dancing with the Stars", "Sydney", "Linford", "Not enough drama", 5, "kind of boring tbh", false);


console.log('Done seeding database');
await closeConnection();