const apiKey = ""
const basePath = 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/'
const videoBasePath = "https://www.youtube.com/embed/"
let pageNumber = 1
let searching = false
let accumulatedResults = []
let currentText = ''

function turnOffDisplay(){
  document.getElementById("modalContent").style.display = "none"
  document.body.style.overflow = "auto"
  const movieTrailer = document.getElementById("movieTrailer")
  if(movieTrailer.style.display != "none"){
    toggleImage()
  }
}

function loadMore(){
  pageNumber += 1
  fetchMovies()
}

const getExtraInfo = async(movieId) =>{
  try{
    const response = await fetch('https://api.themoviedb.org/3/movie/' + movieId + '?api_key='+apiKey+'8&language=en-US&query='+currentText+'&page='+pageNumber);
    const loadData = await response.json()
    return [loadData.genres, loadData.runtime, loadData.homepage] 
  }
  catch(error){
    console.error("Error fetching extra movie data: " + error)
  }
}

const getMovieTrailer = async(movieId) =>{
  try{
    const response = await fetch('https://api.themoviedb.org/3/movie/' + movieId + '/videos?api_key='+apiKey+'8&language=en-US');
    const loadData = await response.json()
    let returnSrc
    loadData.results.forEach(
      trailerElement => {
        if(trailerElement.type == 'Trailer' || trailerElement.type == 'trailer'){
          returnSrc = trailerElement.key
        }
      }
    )
    return returnSrc
  }
  catch(error){
    console.error("Error fetching movie trailer: " + error)
  }
}

function showModal(movieContent){
  const modalDisplay = document.getElementById("modalContent")
  const movieCard = document.getElementById("movie-card")
  const subTitle = document.getElementById("subTitle")
  const extraInfo = document.getElementById("extraInfo")
  const summary = document.getElementById("summary")
  const exitButton = document.getElementById("close")
  const movieTrailer = document.getElementById("movieTrailer")
  document.body.style.overflow = "hidden"
  modalDisplay.style.display = "grid"
  movieCard.src = basePath + movieContent.backdrop_path
  movieCard.alt = movieContent.title + " preview image"
  movieCard.addEventListener("click", toggleImage)
  subTitle.innerHTML = movieContent.title
  summary.innerHTML = movieContent.overview
  exitButton.addEventListener("click", turnOffDisplay)
  getExtraInfo(movieContent.id).then((additionalInfo)=>{
    subTitle.href = additionalInfo[2]
    let genres = ''
    for(let i = 0; i < additionalInfo[0].length; i++){
      if(i != 0)
        genres += (", " + additionalInfo[0][i].name)
      else
        genres += additionalInfo[0][i].name
    }
    extraInfo.innerHTML = genres + " | " + additionalInfo[1] + "mins | Release Date: " + movieContent.release_date + " | Rating: " + movieContent.vote_average
    
    getMovieTrailer(movieContent.id).then((trailerSrc) =>{
      movieTrailer.src = videoBasePath + trailerSrc
      movieTrailer.alt = movieContent.title + " YouTube trailer"
    })
 
  })
}

function toggleImage(){
  const movieCard = document.getElementById("movie-card")
  const movieTrailer = document.getElementById("movieTrailer")
  
  if(movieCard.style.display != "none"){
    movieCard.style.animation = "fadeOut 0.6s"
    setTimeout(() => {
      movieCard.style.display = "none"
      movieTrailer.style.display = "block"
    },600)
  }
  else{
    movieCard.style.animation = ""
    movieCard.style.display = "block"
    movieTrailer.style.display = "none"
  }
}

const fetchMovies = async() =>{
  try{
    let response
    if(searching){
      response = await fetch('https://api.themoviedb.org/3/search/movie?api_key='+apiKey+'8&language=en-US&query='+currentText+'&page='+pageNumber);
    }
    else{
      response = await fetch('https://api.themoviedb.org/3/movie/now_playing?api_key='+apiKey+'8&language=en-US&page='+pageNumber);
    }
    const loadData = await response.json()
    const myGrid = document.getElementById("movies-grid")
    if(pageNumber == 1)
      myGrid.innerHTML = ``
    for (let i = 0; i < loadData.results.length; i++){
      myGrid.innerHTML += `
      <div class = "newMovie">
        <h2 class = "movie-title"> ${loadData.results[i].title} </h2>
        <img src = "${basePath + loadData.results[i].poster_path}" class = "movie-poster" alt = "${loadData.results[i].title} poster that opens popup when clicked">
        <h3 class = "movie-votes">${loadData.results[i].vote_average}</h3>
      </div>`
    }
    const movies = document.querySelectorAll(".movie-poster")
    accumulatedResults = accumulatedResults.concat(loadData.results)
    for (let i = 0; i < accumulatedResults.length; i++){
      movies[i].addEventListener("click", () => showModal(accumulatedResults[i]))
    }
    
  }
  catch(error){
    console.error("Error fetching movie data: " + error)
  }
}

window.onload = function () {
  fetchMovies()  
  const loadButton = document.getElementById("load-more-movies-btn")
  loadButton.addEventListener("click", loadMore)
}

function searchResult(event){
  event.preventDefault();
  const userText = document.getElementById("searchBar").value
  if(userText.length){
    currentText = userText
    pageNumber = 1
    searching = true
    accumulatedResults = []
    fetchMovies()
  }
}

function goToMain(){
  if(searching){
    pageNumber = 1
    accumulatedResults = []
    searching = false
    fetchMovies()
  }
}
