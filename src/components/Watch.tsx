import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import axios from 'axios';
import './Watch.css';

interface MediaDbEntry {
  tmdb_id: number;
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

        // On filtre les données corrompues AVANT de faire les appels API
        const validMediaFromDb = mediaFromDb.filter(item => {
          const id = Number(item.tmdb_id);
          return id && !isNaN(id);
        });

        const mediaInfoPromises = validMediaFromDb.map(async (item: MediaDbEntry) => {
          try {
            const mediaType = item.media_type.toLowerCase();
            const response = await axios.get(
              `https://api.themoviedb.org/3/${mediaType}/${item.tmdb_id}?api_key=${TMDB_API_KEY}&language=fr-FR`
            );
            return {
              ...item,
              title: mediaType === 'movie' ? response.data.title : response.data.name,
              poster_path: response.data.poster_path,
              release_date: mediaType === 'movie' ? response.data.release_date : response.data.first_air_date,
            };
          } catch (error) {
            // En cas d'erreur (ex: ID non trouvé), on crée un item de remplacement
            console.error(`Erreur pour TMDB ID ${item.tmdb_id}:`, error);
            return {
              ...item,
              title: `ID Invalide: ${item.tmdb_id}`,
              poster_path: '', // Forcera l'affichage du placeholder
              release_date: '',
            };
          }
        });

        const allMedia: Media[] = await Promise.all(mediaInfoPromises);

        setToWatchList(allMedia.filter(m => m.status === 'to-watch'));
        setWatchedList(allMedia.filter(m => m.status === 'watched'));

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
                src={media.poster_path ? `https://image.tmdb.org/t/p/w200${media.poster_path}` : 'https://via.placeholder.com/200x300'}
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