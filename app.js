const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())
const dbpath = path.join(__dirname, 'moviesData.db')

let database = null

const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB Error ${error.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const movieDbObjectToResponse = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}
const convertDirectorDbObjectToResponseObject = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

app.get('/movies/', async (request, response) => {
  const getSqliteQuery = `
  SELECT * FROM movie;`
  movieData = await database.all(getSqliteQuery)
  response.send(movieData)
})

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const getSqliteQuery = `
  INSERT INTO
    movie (director_id,movie_name,lead_actor)
  VALUES
  (
    '${directorId}',
    '${movieName}',
    '${leadActor}'
    );`
  const dbRespons = await database.run(getSqliteQuery)
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getSqliteQuery = `
  SELECT * FROM movie WHERE movie_id = ${movieId};`
  const movieData = await database.all(getSqliteQuery)
  response.send(movieDbObjectToResponse(movieData))
})

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const putSqlquery = `
  UPDATE
  movie
  SET
  director_id = '${directorId}',
  movie_name = '${movieName}',
  lead_actor = '${leadActor}'
  WHERE
  movie_id = ${movieId};`
  const movieData = await database.run(putSqlquery)

  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const putSqlquery = `
  DELETE FROM
  movie
  WHERE
  movie_id = ${movieId};`
  await database.run(putSqlquery)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const getSqliteQuery = `
    SELECT
      *
    FROM
      director;`
  const movieData = await database.all(getSqliteQuery)
  response.send(movieData)
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorMovieQuery = `
  SELECT 
  director_name
  FROM 
  director INNER JOIN movie
  ON director.director_id = movie.director_id
  WHERE
  director.director_id = '${directorId})';`
  const movies = await database.all(getDirectorMovieQuery)
  response.send(movies)
})

module.exports = app
