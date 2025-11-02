'use client';
import { useEffect, useState } from 'react';
import { Technique } from '../types';
import { fetchTechniques } from '../api/fetchTechniques';

export function useTechniques() {
  const [data, setData] = useState<Technique[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchTechniques()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
