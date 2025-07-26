import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import axios from 'axios';
import './Watch.css';

interface MediaDbEntry {
  tmdb_id: number | string;
  media_type: 'MOVIE' | 'TV';
  abg_date: string;
  status: 'to-watch' | 'watched';
}

interface Media extends MediaDbEntry {
  title: string;
  poster_path: string;
  release_date: string;
}

const TMDB_API_KEY = '65324c4619d7c9fbe7ebe9467e16d8eb';

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  try {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const date = new Date(dateString);
    // On s'assure que la date est valide. new Date(null) donne une date invalide.
    if (isNaN(date.getTime())) return 'N/A';
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (error) {
    return dateString; // Retourne la date originale en cas d'erreur
  }
};

const Watch: React.FC = () => {
  const [toWatchList, setToWatchList] = useState<Media[]>([]);
  const [watchedList, setWatchedList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllMedia = async () => {
      setLoading(true);
      try {
        const { data: mediaFromDb, error } = await supabase
          .from('media')
          .select('*');

        if (error) throw error;

        const mediaInfoPromises = mediaFromDb.map(async (item: MediaDbEntry) => {
          const numericId = Number(item.tmdb_id);

          // Si l'ID est un vrai nombre, on contacte TMDB
          if (!isNaN(numericId) && numericId > 0) {
            try {
              let mediaType = item.media_type.toLowerCase();
              if (mediaType === 'tvshow') {
                mediaType = 'tv'; // Correction pour l'API TMDB qui attend "tv" et non "tvshow"
              }
          const response = await axios.get(
                `https://api.themoviedb.org/3/${mediaType}/${numericId}?api_key=${TMDB_API_KEY}&language=fr-FR`
          );
          return {
            ...item,
            title: mediaType === 'movie' ? response.data.title : response.data.name,
            poster_path: response.data.poster_path,
            release_date: mediaType === 'movie' ? response.data.release_date : response.data.first_air_date,
              };
            } catch (error) {
              console.error(`Erreur pour TMDB ID ${item.tmdb_id}:`, error);
              return {
                ...item,
                title: `ID Invalide: ${item.tmdb_id}`,
                poster_path: '',
                release_date: '',
              };
            }
          }

          // Si l'ID est une chaîne de caractères (un titre personnalisé), on crée un placeholder
          return {
            ...item,
            title: String(item.tmdb_id),
            poster_path: '',
            release_date: '',
          };
        });

        const allMedia: Media[] = await Promise.all(mediaInfoPromises);

        // Tri pour la liste "Vu"
        const watched = allMedia.filter(m => m.status === 'watched');
        
        // Helper pour parser les dates custom "jour-Mois-année"
        const monthMap: { [key: string]: number } = {
          "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5, 
          "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
        };
        const parseCustomDate = (dateStr: string) => {
          if (!dateStr) return new Date(0);
          const parts = dateStr.split('-');
          if (parts.length !== 3) return new Date(0);
          const day = parseInt(parts[0], 10);
          const month = monthMap[parts[1]];
          const year = parseInt(parts[2], 10);
          if (isNaN(day) || month === undefined || isNaN(year)) return new Date(0);
          return new Date(year, month, day);
        };

        watched.sort((a, b) => {
          const dateA = parseCustomDate(a.abg_date);
          const dateB = parseCustomDate(b.abg_date);
          return dateB.getTime() - dateA.getTime(); // Tri décroissant
        });
        
        // Mélange pour la liste "À regarder" (Fisher-Yates shuffle)
        const toWatch = allMedia.filter(m => m.status === 'to-watch');
        for (let i = toWatch.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [toWatch[i], toWatch[j]] = [toWatch[j], toWatch[i]];
        }

        setToWatchList(toWatch);
        setWatchedList(watched);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMedia();
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  const renderMediaList = (list: Media[], title: string) => (
    <div className="media-list">
      <h1>{title}</h1>
      <div className="media-grid">
        {list.map((media) => (
          <div key={`${media.media_type}-${media.tmdb_id}`} className="media-card-frame">
            <div className="media-card">
              <img
                src={media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : 'https://via.placeholder.com/200x300'}
                alt={media.title}
              />
              <div className="media-card-info">
                <h3>{media.title}</h3>
                <div className="media-card-dates">
                  {media.release_date && <p>Sortie: {formatDate(media.release_date)}</p>}
                  {media.status === 'watched' && media.abg_date && (
                    <p>Vu le: {media.abg_date}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="watch-container">
      {renderMediaList(toWatchList, 'À regarder')}
      <div className="evolved-separator"></div>
      {renderMediaList(watchedList, 'Vu')}
    </div>
  );
};

export default Watch;