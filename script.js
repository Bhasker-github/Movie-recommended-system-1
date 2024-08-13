const apiKey = 'f9b5890533d21ca879c3052985798bfc';  // Your TMDb API key
const searchBar = document.getElementById('searchBar');
const searchSuggestions = document.getElementById('searchSuggestions');
const genreFilter = document.getElementById('genreFilter');
const releaseYearFilter = document.getElementById('releaseYearFilter');
const ratingFilter = document.getElementById('ratingFilter');
const ratingValue = document.getElementById('ratingValue');
const movieGrid = document.getElementById('movieGrid');
const loadMoreButton = document.getElementById('loadMore');
const movieModal = document.getElementById('movieModal');
const closeModal = document.getElementById('closeModal');
const movieDetails = document.getElementById('movieDetails');
const viewFavoritesButton = document.getElementById('viewFavorites');

let currentPage = 1;
let totalPages = 1;
let currentSearch = '';
let currentGenre = '';
let currentRating = 5;
let favoriteMovies = JSON.parse(localStorage.getItem('favoriteMovies')) || [];

// Fetch and display movies
async function fetchMovies(query = '', genre = '', rating = 5, year = '', page = 1) {
    const genreParam = genre ? `&with_genres=${genre}` : '';
    const yearParam = year ? `&primary_release_year=${year}` : '';
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US${genreParam}&page=${page}&vote_average.gte=${rating}${yearParam}&query=${query}`;

    try {
        showLoader();
        const response = await fetch(url);
        const data = await response.json();
        totalPages = data.total_pages;
        currentPage = page;
        displayMovies(data.results);
        updateLoadMoreButton();
    } catch (error) {
        displayError("Failed to fetch movie data. Please try again later.");
    } finally {
        hideLoader();
    }
}

// Display movies on the page
function displayMovies(movies) {
    movieGrid.innerHTML = ''; // Clear existing movies
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movieCard');
        movieCard.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>Year: ${movie.release_date.split('-')[0]}</p>
            <p>Rating: ${movie.vote_average}</p>
            <button onclick="displayMovieDetails(${movie.id})">Details</button>
            <button onclick="toggleFavorite(${movie.id})">Add to Favorites</button>
        `;
        movieGrid.appendChild(movieCard);
    });
}

// Display movie details in a modal
function displayMovieDetails(movieId) {
    fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US`)
        .then(response => response.json())
        .then(data => {
            movieDetails.innerHTML = `
                <h3>${data.title}</h3>
                <p><strong>Year:</strong> ${data.release_date.split('-')[0]}</p>
                <p><strong>Rating:</strong> ${data.vote_average}</p>
                <p><strong>Overview:</strong> ${data.overview}</p>
                <p><strong>Genre:</strong> ${data.genres.map(g => g.name).join(', ')}</p>
                <p><strong>Runtime:</strong> ${data.runtime} minutes</p>
                <img src="https://image.tmdb.org/t/p/w500${data.poster_path}" alt="${data.title}" style="width: 100%; border-radius: 10px;">
            `;
            movieModal.style.display = 'block';
        })
        .catch(() => {
            movieDetails.innerHTML = '<p>Failed to load movie details.</p>';
        });
}

// Toggle favorite status
function toggleFavorite(movieId) {
    if (favoriteMovies.includes(movieId)) {
        favoriteMovies = favoriteMovies.filter(id => id !== movieId);
    } else {
        favoriteMovies.push(movieId);
    }
    localStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies));
}

// Display favorites
function displayFavorites() {
    movieGrid.innerHTML = ''; // Clear existing movies
    favoriteMovies.forEach(movieId => {
        fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US`)
            .then(response => response.json())
            .then(movie => {
                const movieCard = document.createElement('div');
                movieCard.classList.add('movieCard');
                movieCard.innerHTML = `
                    <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
                    <h3>${movie.title}</h3>
                    <p>Year: ${movie.release_date.split('-')[0]}</p>
                    <p>Rating: ${movie.vote_average}</p>
                `;
                movieGrid.appendChild(movieCard);
            });
    });
}

// Update "Load More" button visibility
function updateLoadMoreButton() {
    loadMoreButton.style.display = (currentPage < totalPages) ? 'block' : 'none';
}

// Show loading indicator
function showLoader() {
    loadMoreButton.style.display = 'none';  // Hide "Load More" button while loading
}

// Hide loading indicator
function hideLoader() {
    // Loader is handled by the button visibility
}

// Display error message
function displayError(message) {
    movieGrid.innerHTML = `<p class="error">${message}</p>`;
}

// Load genre options
async function loadGenres() {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`);
        const data = await response.json();
        data.genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            genreFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load genres', error);
    }
}

// Search suggestions
async function fetchSearchSuggestions(query) {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        displaySearchSuggestions(data.results);
    } catch (error) {
        console.error('Failed to fetch search suggestions', error);
    }
}

function displaySearchSuggestions(suggestions) {
    searchSuggestions.innerHTML = '';
    suggestions.forEach(suggestion => {
        const div = document.createElement('div');
        div.textContent = suggestion.title;
        div.onclick = () => {
            searchBar.value = suggestion.title;
            fetchMovies(suggestion.title, currentGenre, currentRating, releaseYearFilter.value, 1);
        };
        searchSuggestions.appendChild(div);
    });
}

// Event listeners
searchBar.addEventListener('keyup', (e) => {
    if (e.target.value.length > 2) {
        currentSearch = e.target.value;
        fetchSearchSuggestions(currentSearch);
    } else {
        searchSuggestions.innerHTML = '';
    }
});

genreFilter.addEventListener('change', (e) => {
    currentGenre = e.target.value;
    fetchMovies(currentSearch, currentGenre, currentRating, releaseYearFilter.value, 1);
});

releaseYearFilter.addEventListener('input', () => {
    fetchMovies(currentSearch, currentGenre, currentRating, releaseYearFilter.value, 1);
});

ratingFilter.addEventListener('input', (e) => {
    currentRating = e.target.value;
    ratingValue.textContent = currentRating;
    fetchMovies(currentSearch, currentGenre, currentRating, releaseYearFilter.value, 1);
});

viewFavoritesButton.addEventListener('click', () => {
    displayFavorites();
});

loadMoreButton.addEventListener('click', () => {
    fetchMovies(currentSearch, currentGenre, currentRating, releaseYearFilter.value, currentPage + 1);
});

closeModal.addEventListener('click', () => {
    movieModal.style.display = 'none';
});

// Initial load
loadGenres();
fetchMovies();
