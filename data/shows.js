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
const sortByGenre = async () => {

}
const sortByRuntime = async () => {

}
const sortByRating = async () => {

}
const sortByRewatchPercent = async () => {

}
const getIndividualShow = async () =>{

}
const getSimilarShows = async () =>{

}
export default {getAllShows, searchForShow, sortByGenre, sortByRating, sortByRuntime, sortByRewatchPercent, getIndividualShow, getSimilarShows};