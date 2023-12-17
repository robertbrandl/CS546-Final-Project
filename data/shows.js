import * as validation from "../validation.js";
import {ObjectId} from 'mongodb';
import {shows} from '../config/mongoCollections.js';
import {reviews} from '../config/mongoCollections.js';
import {users} from '../config/mongoCollections.js';
import axios from 'axios';

const getAllShows = async () => {
    let showsres = undefined;
    try{
        showsres = await axios.get(`https://api.tvmaze.com/shows`);
    }catch(e){
        throw "500"+e;
    }
    if (!showsres || showsres.data.length <= 0){throw "404No shows found"}
    let arr = [];
    const showCollection = await shows();
    for (let x of showsres.data){
        let show = await showCollection.findOne({apiId: x.id});
        if (show !== null){
            if (show.averageRating === 0){
                arr.push({name: x.name, apiId: x.id, plot: x.summary.replace(/<[^>]*>/g, ''), rating: show.averageRating, genres: x.genres, rewatchPercent: show.rewatchPercent, averageRuntime: x.averageRuntime == null ? x.runtime : x.averageRuntime, check: true});
            }
            else{
                arr.push({name: x.name, apiId: x.id, plot: x.summary.replace(/<[^>]*>/g, ''), rating: show.averageRating, genres: x.genres, rewatchPercent: show.rewatchPercent, averageRuntime: x.averageRuntime == null ? x.runtime : x.averageRuntime, check: false});
            }
            
        }
        else{
            arr.push({name: x.name, apiId: x.id, plot: x.summary.replace(/<[^>]*>/g, ''), rating: 0, genres: x.genres, rewatchPercent: 0, averageRuntime: x.averageRuntime == null ? x.runtime : x.averageRuntime, check: true});
        }
    }
    return arr;
}
const searchForShow = async(
    searchTerm
) => {
    let term = validation.checkString(searchTerm);
    let showsres = undefined;
    try{
        showsres = await axios.get(`https://api.tvmaze.com/search/shows?q=${term}`);
    }catch(e){
        throw e;
    }
    if (!showsres || showsres.data.length <= 0){throw "No matching shows found"}
    let arr = [];
    const showCollection = await shows();
    for (let x of showsres.data){
        x = x.show;
        let show = await showCollection.findOne({apiId: x.id});
        if (show !== null){
            if (show.averageRating === 0){
                arr.push({name: x.name, apiId: x.id, plot: x.summary ? x.summary.replace(/<[^>]*>/g, '') : '', rating: show.averageRating, genres: x.genres, rewatchPercent: show.rewatchPercent, averageRuntime: x.averageRuntime == null ? x.runtime : x.averageRuntime, check: true});
            }
            else{
                arr.push({name: x.name, apiId: x.id, plot: x.summary ? x.summary.replace(/<[^>]*>/g, '') : '', rating: show.averageRating, genres: x.genres, rewatchPercent: show.rewatchPercent, averageRuntime: x.averageRuntime == null ? x.runtime : x.averageRuntime, check: false});
            }
            
        }
        else{
            arr.push({name: x.name, apiId: x.id, plot: x.summary ? x.summary.replace(/<[^>]*>/g, '') : '', rating: 0, genres: x.genres, rewatchPercent: 0, averageRuntime: x.averageRuntime == null ? x.runtime : x.averageRuntime, check: true});
        }
    }
    return arr;
}
const findMenu = async(genre, maxRuntime, minAverageRating) => {
    genre = validation.checkString(genre);
    if (maxRuntime === null || maxRuntime === undefined) {
        throw new Error('maxRuntime is not valid');
    }

    if (minAverageRating === null || minAverageRating === undefined) {
        throw new Error('minAverageRating is not valid');
    }

    if (typeof maxRuntime !== 'number' || isNaN(maxRuntime) || maxRuntime === Infinity || maxRuntime < 0 || maxRuntime > 1000) {
        throw new Error('Please enter a valid number for maxRuntime between 0 and 1000');
    }

    if (typeof minAverageRating !== 'number' || isNaN(minAverageRating) || minAverageRating === Infinity || minAverageRating < 0 || minAverageRating > 10) {
        throw new Error('Please enter a valid number for minAverageRating between 0 and 10');
    }

    const allShows = await getAllShows();
    let matchingShows = [];
    for (let show of allShows) {
      if (show.genres.includes(genre) && show.averageRuntime <= maxRuntime && show.rating >= minAverageRating) {
        matchingShows.push(show);
      }
      if (matchingShows.length >= 5) {
        break;
      }
    }
    return matchingShows.slice(0, 5);
  };
const filterByGenre = async (filteredGenre, s) => {
    filteredGenre = validation.checkString(filteredGenre)
    let allgenres = ['Comedy', 'History', 'Sports', 'Horror', 'Adventure', 'Crime', 'Supernatural', 'Action', 'Anime', 'Science-Fiction', 'Drama', 'Legal', 'Thriller', 'Fantasy', 'Family', 'War', 'Medical', 'Espionage', 'Romance', 'Music', 'Western', 'Mystery'];
    allgenres = allgenres.map(element => element.toLowerCase());
    if (!allgenres.includes(filteredGenre.toLowerCase())){ throw "Genre name is not valid";}
    let shows = s;
    if (s.length == 0) throw "Cannot sort no shows!"
    let filtered = shows.filter(show => {
        return show.genres.some(genre => genre.toLowerCase() === filteredGenre.toLowerCase())
    })
    if (!filtered || filtered.length <= 0){throw "No shows with that genre"}
    return filtered
}
const sortByFeature = async(feature, order, s) => {
    let shows = s;
    if (s.length == 0) throw "Cannot sort no shows!"
    feature = validation.checkString(feature)
    order = validation.checkString(order)
    if(feature.toLowerCase() === "runtime" && order.toLowerCase() == "descending"){
        shows.sort((a, b) => b.averageRuntime - a.averageRuntime)
    }
    else if(feature.toLowerCase() === "runtime" && order.toLowerCase() == "ascending"){
        shows.sort((a, b) => a.averageRuntime - b.averageRuntime)
    }
    else if(feature.toLowerCase() === "rating" && order.toLowerCase() == "descending"){
        shows.sort((a, b) => b.rating - a.rating)
    }
    else if(feature.toLowerCase() === "rating" && order.toLowerCase() == "ascending"){
        shows.sort((a, b) => a.rating - b.rating)
    }
    else if(feature.toLowerCase() === "rewatch" && order.toLowerCase() == "descending"){
        shows.sort((a, b) => b.rewatchPercent - a.rewatchPercent)
    }
    else if(feature.toLowerCase() === "rewatch" && order.toLowerCase() == "ascending"){
        shows.sort((a, b) => a.rewatchPercent - b.rewatchPercent)
    }else{
        throw `Not a valid search feature`
    }
    return shows
}

const getIndividualShow = async (
    apiId
) =>{
    let id = validation.checkString(apiId);
    let numId = parseInt(id);
    if (typeof numId !== "number" || isNaN(numId) || numId === Infinity) throw "Api Id is not valid";
    const showCollection = await shows();
    let show = await showCollection.findOne({apiId: numId});
    if (show === null){
        let res = undefined;
        try{
            res = await axios.get(`https://api.tvmaze.com/shows/${apiId}`);
        }catch(e){
            throw "500"+e;
        }
        if (!res || res.data.length <= 0){throw "404No show found with that apiId"}
        let cast = undefined;
        try{
            cast = await axios.get(`https://api.tvmaze.com/shows/${apiId}/cast`);
        }catch(e){
            throw e;
        }
        if (!cast || cast.data.length < 0){throw "404No show found with that apiId"}
        let actorArr = [];
        for (let x of cast.data){
            actorArr.push(x.person.name);
        }
        actorArr = actorArr.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });
        let crew = undefined;
        try{
            crew = await axios.get(`https://api.tvmaze.com/shows/${apiId}/crew`);
        }catch(e){
            throw e;
        }
        if (!crew || crew.data.length < 0){throw "404No show found with that apiId"}
        let directors = [];
        let producers = [];
        for (let x of crew.data){
            if (x.type.toLowerCase().indexOf("producer") >= 0){
                producers.push(x.person.name);
            }
            else if (x.type.toLowerCase().indexOf("director") >= 0){
                directors.push(x.person.name);
            }
        }
        producers = producers.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });
        directors = directors.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });
        let newShow = 
        {
            name: res.data.name,
            apiId: res.data.id,
            plot: res.data.summary.replace(/<[^>]*>/g, ''),
            averageRating: 0,
            genres: res.data.genres,
            rewatchPercent: 0,
            averageRuntime: res.data.averageRuntime == null ? res.data.runtime : res.data.averageRuntime,
            leadActors: actorArr,
            directors: directors,
            producers: producers,
            reviews: []
        };
        const insertInfo = await showCollection.insertOne(newShow);
        if (!insertInfo.acknowledged || !insertInfo.insertedId)
            throw '500Could not add show';
        const newId = insertInfo.insertedId.toString();
        const show = await showCollection.findOne({_id: new ObjectId(newId)});
        return show;
    }
    else{
        return show;
    }
}
const getReviewsForShow = async (
    show
)=>{
    let revs = show.reviews;
    const reviewCollection = await reviews();
    let arr = [];
    for (let x of revs){
        let review = undefined;
        if (typeof x === "string"){
            review = await reviewCollection.findOne({_id: new ObjectId(x)});
        }
        else{
            review = await reviewCollection.findOne({_id: x});
        }
        arr.push(review);
    }
    return arr;
}

const match = (array1, array2, currId) => {
    let arr = []
    for (let obj1 of array1) {
      for (let obj2 of array2) {
        if (obj1.apiId === obj2.apiId && obj1.apiId !== currId) {
          arr.push(obj1);
        }
        }
    }
    return arr;
}
const getSimilarShows = async (
    show
) =>{
    const showCollection = await shows();
    let simshows = [];
    let genMatches = await showCollection.find({genres: {$in: show.genres}}).toArray();
    let actorMatches = await showCollection.find({leadActors: {$in: show.leadActors}}).toArray();
    let dirMatches = await showCollection.find({directors: {$in: show.directors}}).toArray();
    let prodMatches = await showCollection.find({producers: {$in: show.producers}}).toArray();
    let runtimeMatches = await showCollection.find({averageRuntime: show.averageRuntime}).toArray();
    let res1 = match(genMatches, actorMatches, show.apiId);
    let res2 = match(genMatches, dirMatches, show.apiId);
    let res3 = match(genMatches, prodMatches, show.apiId);
    let res4 = match(actorMatches, prodMatches, show.apiId);
    let res5 = match(genMatches, runtimeMatches, show.apiId);
    let res6 = match(actorMatches, runtimeMatches, show.apiId);
    let res7 = match(actorMatches, dirMatches, show.apiId);
    let res8 = match(dirMatches, prodMatches, show.apiId);
    let res9 = match(dirMatches, runtimeMatches, show.apiId);
    let res10 = match(prodMatches, runtimeMatches, show.apiId);
    for (let x of res1){ simshows.push(x)}
    for (let x of res2){ simshows.push(x)}
    for (let x of res3){ simshows.push(x)}
    for (let x of res4){ simshows.push(x)}
    for (let x of res5){ simshows.push(x)}
    for (let x of res6){ simshows.push(x)}
    for (let x of res7){ simshows.push(x)}
    for (let x of res8){ simshows.push(x)}
    for (let x of res9){ simshows.push(x)}
    for (let x of res10){ simshows.push(x)}
    for (let x of genMatches){ simshows.push(x)}
    simshows = simshows.filter((shows, index, array) => index === array.findIndex((p) => p.apiId === shows.apiId));
    simshows = simshows.filter((p) => p.apiId !== show.apiId);
    if (simshows.length < 5){
        let allshows = await getAllShows();
        for (let x of allshows){
            if (simshows.length < 5){
                let id = x.apiId;
                let castcrew = undefined;
                try{
                    castcrew = await axios.get(`https://api.tvmaze.com/shows/${id}?embed[]=crew&embed[]=cast`);
                }catch(e){
                    throw e;
                }
                if (castcrew){
                    let actorArr = [];
                    for (let x of castcrew.data._embedded.cast){
                        actorArr.push(x.person.name);
                    }
                    actorArr = actorArr.filter((value, index, self) => {
                        return self.indexOf(value) === index;
                    });
                        let directors = [];
                        let producers = [];
                        for (let x of castcrew.data._embedded.crew){
                            if (x.type.toLowerCase().indexOf("producer") >= 0){
                                producers.push(x.person.name);
                            }
                            else if (x.type.toLowerCase().indexOf("director") >= 0){
                                directors.push(x.person.name);
                            }
                        }
                        producers = producers.filter((value, index, self) => {
                            return self.indexOf(value) === index;
                        });
                        directors = directors.filter((value, index, self) => {
                            return self.indexOf(value) === index;
                        });
                        if (show.leadActors.some((num) => actorArr.includes(num)) && show.apiId !== x.apiId){
                            if (show.genres.some((num) => x.genres.includes(num))){
                                simshows.push(x);
                            }
                        }
                        if (show.directors.some((num) => directors.includes(num)) && show.apiId !== x.apiId){
                            if (show.genres.some((num) => x.genres.includes(num))){
                                simshows.push(x);
                            }
                        }
                        if (show.producers.some((num) => producers.includes(num)) && show.apiId !== x.apiId){
                            if (show.genres.some((num) => x.genres.includes(num))){
                                simshows.push(x);
                            }
                        }
                        if (show.leadActors.some((num) => actorArr.includes(num)) && show.apiId !== x.apiId){
                            if (show.directors.some((num) => directors.includes(num)) && show.apiId !== x.apiId){
                                simshows.push(x);
                            }
                        }
                        if (show.leadActors.some((num) => actorArr.includes(num)) && show.apiId !== x.apiId){
                            if (show.producers.some((num) => producers.includes(num)) && show.apiId !== x.apiId){
                                simshows.push(x);
                            }
                        }
                        if (show.producers.some((num) => producers.includes(num)) && show.apiId !== x.apiId){
                            if (show.directors.some((num) => directors.includes(num)) && show.apiId !== x.apiId){
                                simshows.push(x);
                            }
                        }
                        if (show.genres.some((num) => x.genres.includes(num)) && show.apiId !== x.apiId && show.averageRuntime == x.averageRuntime){
                            simshows.push(x);
                        }
                        if (show.genres.some((num) => x.genres.includes(num)) && show.apiId !== x.apiId){
                            simshows.push(x);
                        }
                        if (show.leadActors.some((num) => actorArr.includes(num)) && show.apiId !== x.apiId){
                            simshows.push(x);
                        }
                        if (show.directors.some((num) => directors.includes(num)) && show.apiId !== x.apiId){
                            simshows.push(x);
                        }
                        if (show.producers.some((num) => producers.includes(num)) && show.apiId !== x.apiId){
                            simshows.push(x);
                        }
                }
                simshows = simshows.filter((show, index, array) => index === array.findIndex((p) => p.apiId === show.apiId));
                simshows = simshows.filter((p) => p.apiId !== show.apiId);
            }
        }
    }
    if (simshows.length > 10){
        simshows = simshows.slice(0, 10);
    }
    return simshows;
}

const getUserSimiliarShows = async (
    emailAddress
) => {
    let email = validation.checkString(emailAddress);
    email = email.toLowerCase();
    const userCollection = await users();
    let foundUser = await userCollection.findOne({emailAddress: email});
    return foundUser.shows;
}
export default {getAllShows, searchForShow, filterByGenre, sortByFeature, getIndividualShow, getSimilarShows, findMenu, getReviewsForShow, getUserSimiliarShows};
