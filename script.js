// script.js
const apiKey = 'a2fe9da'; // Replace with your OMDb API key
const searchBar = document.getElementById('searchBar');
const movieGrid = document.getElementById('movieGrid');
const genreFilter = document.getElementById('genreFilter');

// Fetch and display recommended movies
async function fetchRecommendedMovies(genre = '') {
    try {
        const url = `http://www.omdbapi.com/?s=${genre || 'popular'}&apikey=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.Response === "True") {
            displayMovies(data.Search);
        } else {
            displayError(data.Error);
        }
    } catch (error) {
        displayError("Failed to fetch movie data. Please try again later.");
    }
}

// Display movies on the page
function displayMovies(movies) {
    movieGrid.innerHTML = ''; // Clear existing movies
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movieCard');
        movieCard.innerHTML = `
            <img src="${movie.Poster}" alt="${movie.Title}">
            <h3>${movie.Title}</h3>
            <p>Year: ${movie.Year}</p>
            <p>Type: ${movie.Type}</p>
        `;
        movieGrid.appendChild(movieCard);
    });
}

// Display error messages
function displayError(message) {
    movieGrid.innerHTML = `<p class="error">${message}</p>`;
}

// Search for movies
searchBar.addEventListener('keyup', async (e) => {
    if (e.target.value.length > 2) {
        const query = e.target.value;
        fetchRecommendedMovies(query);
    }
});

// Filter movies by genre
genreFilter.addEventListener('change', async (e) => {
    const genre = e.target.value;
    fetchRecommendedMovies(genre);
});

// Load recommended movies on page load
fetchRecommendedMovies();
