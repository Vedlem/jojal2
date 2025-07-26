import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import type { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js';

// Interfaces and helper functions
interface MediaDbEntry {
  id: number;
  tmdb_id: number;
  media_type: 'MOVIE' | 'TV';
  abg_date: string | null;
  status: 'to-watch' | 'watched';
}

const formatToString = (item: Partial<MediaDbEntry>): string => {
  return `${item.media_type} ${item.tmdb_id}${item.abg_date ? ' ' + item.abg_date : ''}`;
};

const parseFromString = (line: string, status: 'to-watch' | 'watched'): Partial<MediaDbEntry> => {
  const [type, id, date] = line.trim().split(' ');
  return {
    media_type: type.toUpperCase() as 'MOVIE' | 'TV',
    tmdb_id: parseInt(id, 10),
    abg_date: date || null,
    status: status,
  };
};

const Durin: React.FC = () => {
  // State for user's unique presence info, created only once.
  const [presenceInfo] = useState({
    key: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    joined_at: Date.now(),
  });

  const [initialData, setInitialData] = useState<MediaDbEntry[]>([]);
  const [toWatchText, setToWatchText] = useState('');
  const [watchedText, setWatchedText] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [isLocked, setIsLocked] = useState(false); // True if I'm a spectator

  useEffect(() => {
    // Data fetching logic
    const fetchAndSetData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('media').select('*');
        if (error) throw error;
        
        setInitialData(data);
        setToWatchText(data.filter(item => item.status === 'to-watch').map(formatToString).join('\n'));
        setWatchedText(data.filter(item => item.status === 'watched').map(formatToString).join('\n'));

      } catch (error) {
        setMessage(`Erreur de chargement: ${(error as Error).message}`);
        setMessageType('error');
      } finally {
        setLoading(false);
      }
    };
    fetchAndSetData();

    // Real-time Presence Logic
    const channel: RealtimeChannel = supabase.channel('durin-presence', {
      config: {
        presence: {
          key: presenceInfo.key,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state: RealtimePresenceState = channel.presenceState();
        
        const users = Object.entries(state)
          .map(([key, presences]) => {
            const joinedAt = (presences[0] as any)?.joined_at;
            return {
              key,
              joined_at: typeof joinedAt === 'number' ? joinedAt : 0,
            };
          })
          .filter(user => user.joined_at > 0);

        if (users.length <= 1) {
          setIsLocked(false);
          return;
        }

        const firstUser = users.reduce((earliest, current) => 
          current.joined_at < earliest.joined_at ? current : earliest
        );
        
        // Lock the page if I am NOT the first user
        setIsLocked(firstUser.key !== presenceInfo.key);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ joined_at: presenceInfo.joined_at });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [presenceInfo]);

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    setMessageType(null);

    try {
      const toWatchLines = toWatchText.split('\n').filter(l => l.trim() !== '');
      const watchedLines = watchedText.split('\n').filter(l => l.trim() !== '');

      const toWatchItems = toWatchLines.map(line => parseFromString(line, 'to-watch'));
      const watchedItems = watchedLines.map(line => parseFromString(line, 'watched'));

      // Vérification des doublons
      const watchedKeys = new Set(watchedItems.map(item => `${item.media_type}-${item.tmdb_id}`));
      const conflictingItems = toWatchItems.filter(item => watchedKeys.has(`${item.media_type}-${item.tmdb_id}`));

      if (conflictingItems.length > 0) {
        const conflictList = conflictingItems.map(item => `${item.media_type} ${item.tmdb_id}`).join(', ');
        setMessage(`Erreur : L'oeuvre suivante est présente dans les deux listes : ${conflictList}. Veuillez la retirer d'une des deux listes.`);
        setMessageType('error');
        setLoading(false);
        return; // Bloque la sauvegarde
      }

      const newDbState = [...toWatchItems, ...watchedItems];

      // Upsert
      const { error: upsertError } = await supabase.from('media').upsert(newDbState, {
        onConflict: 'media_type, tmdb_id',
      });
      if (upsertError) throw upsertError;

      // Suppression
      const newDbKeys = new Set(newDbState.map(item => `${item.media_type}-${item.tmdb_id}`));
      const itemsToDelete = initialData.filter(
        initialItem => !newDbKeys.has(`${initialItem.media_type}-${initialItem.tmdb_id}`)
      );
      
      if (itemsToDelete.length > 0) {
        const idsToDelete = itemsToDelete.map(item => item.id);
        const { error: deleteError } = await supabase.from('media').delete().in('id', idsToDelete);
        if (deleteError) throw deleteError;
      }

      setMessage('Sauvegarde réussie !');
      setMessageType('success');
      // Re-synchronisation de l'état local
      const { data: updatedData } = await supabase.from('media').select('*');
      if (updatedData) setInitialData(updatedData);

    } catch (error) {
      setMessage(`Erreur lors de la sauvegarde: ${(error as Error).message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !initialData.length) {
    return <div>Chargement des données...</div>;
  }

  return (
    <div style={{ width: '100%' }}>
      <h1>Durin - Modification</h1>
      
      {isLocked ? (
        <p style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
          Un pote à toi utilise déjà cette page, dis lui de fermer son onglet
        </p>
      ) : (
        message && <p style={{ color: messageType === 'error' ? '#ff6b6b' : '#69f0ae', fontWeight: 'bold' }}>{message}</p>
      )}

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <div>
          <h2>À regarder</h2>
          <div style={{ textAlign: 'left', color: '#ccc', fontSize: '0.9em', marginBottom: '5px' }}>
            <p style={{ margin: '2px 0' }}>Ex: <code>MOVIE 763215</code></p>
            <p style={{ margin: '2px 0' }}>Ex: <code>TV 1396</code></p>
          </div>
          <textarea
            rows={20}
            cols={60}
            value={toWatchText}
            onChange={(e) => setToWatchText(e.target.value)}
            disabled={loading || isLocked}
          />
        </div>
        <div>
          <h2>Vu</h2>
          <div style={{ textAlign: 'left', color: '#ccc', fontSize: '0.9em', marginBottom: '5px' }}>
            <p style={{ margin: '2px 0' }}>Ex: <code>MOVIE 763215 02-Aug-2002</code></p>
            <p style={{ margin: '2px 0' }}>Ex: <code>TV 1396 15-Oct-2024</code></p>
          </div>
          <textarea
            rows={20}
            cols={60}
            value={watchedText}
            onChange={(e) => setWatchedText(e.target.value)}
            disabled={loading || isLocked}
          />
        </div>
      </div>
      <button onClick={handleSave} disabled={loading || isLocked} style={{ marginTop: '10px' }}>
        {loading ? 'Sauvegarde en cours...' : 'Sauvegarder les modifications'}
      </button>
    </div>
  );
};

export default Durin; 