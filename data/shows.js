import * as validation from "../validation.js";
import {ObjectId} from 'mongodb';
import {shows} from '../config/mongoCollections.js';
import axios from 'axios';

const getAllShows = async () => {
    let shows = undefined;
    try{
        shows = await axios.get(`https://api.tvmaze.com/shows`);
    }catch(e){
        throw e;
    }
    if (!shows || shows.data.length <= 0){throw "No shows found"}
    let arr = [];
    for (let x of shows.data){
        arr.push({name: x.name, apiId: x.id, plot: x.summary, rating: 0, genres: x.genres, rewatchPercent: 0, runtime: x.averageRuntime});
    }
    return arr;
}
const searchForShow = async(
    searchTerm
) => {

}
const find = async() =>{ //Don't Know What to Watch? Menu Function!

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
    let show = showCollection.findOne({apiId: id});
    if (show === null){

    }
    else{
        return show;
    }
}
const getSimilarShows = async () =>{

}
export default {getAllShows, searchForShow, sortByGenre, sortByRating, sortByRuntime, sortByRewatchPercent, getIndividualShow, getSimilarShows};