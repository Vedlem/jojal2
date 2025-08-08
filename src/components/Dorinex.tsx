import React, { useEffect, useState } from 'react';
import { Wheel } from 'react-custom-roulette';
import { supabase } from '../supabaseClient';
import axios from 'axios';
import './Dorinex.css';

const TMDB_API_KEY = '65324c4619d7c9fbe7ebe9467e16d8eb';

interface MediaFromDB {
  tmdb_id: number | string;
  media_type: 'MOVIE' | 'TV';
  title: string | null;
}

interface RouletteData {
  option: string;
  image?: {
    uri: string;
    offsetY?: number;
    sizeMultiplier?: number;
  };
  style?: {
    backgroundColor?: string;
    textColor?: string;
  };
}

const Dorinex: React.FC = () => {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [mediaList, setMediaList] = useState<RouletteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [winner, setWinner] = useState<RouletteData | null>(null);

  useEffect(() => {
    const fetchToWatchList = async () => {
      setLoading(true);
      try {
        const { data: mediaFromDb, error } = await supabase
          .from('media')
          .select('tmdb_id, media_type, title')
          .eq('status', 'to-watch');

        if (error) throw error;

        const mediaPromises = mediaFromDb.map(async (item: MediaFromDB) => {
          const numericId = Number(item.tmdb_id);
          let posterUrl = '';

          if (!isNaN(numericId) && numericId > 0) {
            try {
              const mediaType = item.media_type.toLowerCase() === 'tvshow' ? 'tv' : item.media_type.toLowerCase();
              const response = await axios.get(
                `https://api.themoviedb.org/3/${mediaType}/${numericId}?api_key=${TMDB_API_KEY}&language=fr-FR`
              );
              if (response.data.poster_path) {
                posterUrl = `https://image.tmdb.org/t/p/w200${response.data.poster_path}`;
              }
            } catch (err) {
              console.error(`Erreur pour TMDB ID ${item.tmdb_id}:`, err);
            }
          }

          return {
            option: item.title || String(item.tmdb_id),
            image: posterUrl ? { uri: posterUrl, offsetY: 375, sizeMultiplier: 0.45 } : undefined,
            style: { backgroundColor: '#1E272E', textColor: '#EAF0F1' },
          };
        });

        const formattedData = await Promise.all(mediaPromises);
        setMediaList(formattedData);

      } catch (error) {
        console.error('Erreur lors de la récupération des médias:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchToWatchList();
  }, []);

  const handleSpinClick = () => {
    if (!mustSpin && mediaList.length > 0) {
      const newPrizeNumber = Math.floor(Math.random() * mediaList.length);
      setPrizeNumber(newPrizeNumber);
      setWinner(null);
      setMustSpin(true);
    }
  };

  const onStopSpinning = () => {
    setMustSpin(false);
    setWinner(mediaList[prizeNumber]);
  };

  if (loading) {
    return <div className="loading-container">Chargement de la roue...</div>;
  }

  return (
    <div className="dorinex-container">
      <div className="wheel-wrapper">
        <div className="wheel-pointer"></div>
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={mediaList}
          fontSize={14}
          textDistance={60}
          outerBorderColor={'transparent'}
          outerBorderWidth={0}
          innerBorderColor={'transparent'}
          innerRadius={150} // Agrandir le cercle intérieur pour l'affiche
          innerBorderWidth={0}
          radiusLineColor={'transparent'}
          radiusLineWidth={0}
          startingOptionIndex={0}
          onStopSpinning={onStopSpinning}
          pointerProps={{
            style: { display: 'none' }
          }}
        />
        <div className="wheel-center-content">
          {winner ? (
            <img src={winner.image?.uri} alt={`Affiche de ${winner.option}`} className="winner-poster" />
          ) : (
            <span className="wheel-center-text">?</span>
          )}
        </div>
      </div>
      <button className="spin-button" onClick={handleSpinClick} disabled={mustSpin || mediaList.length === 0}>
        Dorinex🫲
      </button>
    </div>
  );
};

export default Dorinex;
