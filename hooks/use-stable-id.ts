import { useState, useEffect } from 'react';

let globalId = 0;

export function useStableId() {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    globalId += 1;
    setId(`radix-${globalId}`);
  }, []);

  return id;
}
