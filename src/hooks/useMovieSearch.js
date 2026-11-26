import { useState, useEffect } from 'react';

export function useMovieSearch(query) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query || query.trim() === '') {
      setMovies([]);
      setError(null);
      return;
    }

    const fetchMovies = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
          throw new Error('Errore nella risposta del server');
        }

        const data = await response.json();
        setMovies(data);
      } catch (err) {
        setError("Ops, connessione assente o server non raggiungibile.");
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchMovies, 400);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return { movies, loading, error };
}