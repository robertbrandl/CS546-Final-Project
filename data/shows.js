import * as validation from "../validation.js";
import {ObjectId} from 'mongodb';
import {shows} from '../config/mongoCollections.js';
import axios from 'axios';

const getAllShows = async () => {
    let showsres = undefined;
    try{
        showsres = await axios.get(`https://api.tvmaze.com/shows`);
    }catch(e){
        throw e;
    }
    if (!showsres || showsres.data.length <= 0){throw "No shows found"}
    let arr = [];
    const showCollection = await shows();
    for (let x of showsres.data){
        let show = await showCollection.findOne({apiId: x.id});
        if (show !== null){
            if (show.averageRating === 0){
                arr.push({name: x.name, apiId: x.id, plot: x.summary, rating: show.averageRating, genres: x.genres, rewatchPercent: show.rewatchPercent, runtime: x.averageRuntime, check: true});
            }
            else{
                arr.push({name: x.name, apiId: x.id, plot: x.summary, rating: show.averageRating, genres: x.genres, rewatchPercent: show.rewatchPercent, runtime: x.averageRuntime, check: false});
            }
            
        }
        else{
            arr.push({name: x.name, apiId: x.id, plot: x.summary, rating: 0, genres: x.genres, rewatchPercent: 0, runtime: x.averageRuntimex, check: true});
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
        let show = await showCollection.findOne({apiId: x.id});
        if (show !== null){
            if (show.averageRating === 0){
                arr.push({name: x.name, apiId: x.id, plot: x.summary, rating: show.averageRating, genres: x.genres, rewatchPercent: show.rewatchPercent, runtime: x.averageRuntime, check: true});
            }
            else{
                arr.push({name: x.name, apiId: x.id, plot: x.summary, rating: show.averageRating, genres: x.genres, rewatchPercent: show.rewatchPercent, runtime: x.averageRuntime, check: false});
            }
            
        }
        else{
            arr.push({name: x.name, apiId: x.id, plot: x.summary, rating: 0, genres: x.genres, rewatchPercent: 0, runtime: x.averageRuntimex, check: true});
        }
    }
    return arr;

//use axios with 
}
const findMenu = async(
    //params
) =>{ //Don't Know What to Watch? Menu Function
    //1) add input parameters
    //2) error check the parameters
    //3) run getAllShows to get show array
    //4) find matching shows (up to 5) by iterating over the result from 3
    //for genre and runtime, just check those keys
    // --> to access the actors for the dropdown, use axios and https://api.tvmaze.com/shows/:apiId/cast for each show
    //then save the cast in a variable, like let cast = result.data and iterate through each element in cast, like x.person.name and see if it matches the top actors entered in the menu
    //5) return array with up to 5 show objects like in getAllShows
}
const sortByGenre = async () => {

}
const sortByRuntime = async () => {

}
const sortByRating = async () => {

}
const sortByRewatchPercent = async () => {

}
const getIndividualShow = async (
    apiId
) =>{
    let id = validation.checkString(apiId);
    const showCollection = await shows();
    let show = await showCollection.findOne({apiId: id});
    if (show === null){
        let res = undefined;
        try{
            res = await axios.get(`https://api.tvmaze.com/shows/${apiId}`);
        }catch(e){
            throw e;
        }
        if (!res || res.data.length <= 0){throw "No show found with that apiId"}
        let cast = undefined;
        try{
            cast = await axios.get(`https://api.tvmaze.com/shows/${apiId}/cast`);
        }catch(e){
            throw e;
        }
        if (!cast || cast.data.length <= 0){throw "No show found with that apiId"}
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
        if (!crew || crew.data.length <= 0){throw "No show found with that apiId"}
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
            plot: res.data.summary,
            averageRating: 0,
            genres: res.data.genres,
            rewatchPercent: 0,
            averageRuntime: res.data.averageRuntime,
            leadActors: actorArr,
            directors: directors,
            producers: producers,
            reviews: []
        };
        const insertInfo = await showCollection.insertOne(newShow);
        if (!insertInfo.acknowledged || !insertInfo.insertedId)
            throw 'Could not add show';
        const newId = insertInfo.insertedId.toString();
        const show = await showCollection.findOne({_id: new ObjectId(newId)});
        return show;
    }
    else{
        return show;
    }
}
const getSimilarShows = async () =>{

}
export default {getAllShows, searchForShow, sortByGenre, sortByRating, sortByRuntime, sortByRewatchPercent, getIndividualShow, getSimilarShows, findMenu};