import { useEffect, useRef, useState } from 'react'
import { Application } from 'pixi.js';
import { renderRoom } from './renderRoom';

/** 
 * React wrapper to give a space to pixi.js and start the rest of the game engine
 */
export const Game = () => {

  const appRef = useRef<Application>();
  const [gameArea, setGameArea] = useState<HTMLDivElement | null>(null);

  useEffect(() => {

    if (gameArea === null)
      return;

    const go = async () => {
      const app = new Application();
      await app.init({ background: '#000000', resizeTo: window });
      gameArea.appendChild(app.canvas);
      appRef.current = app;

      renderRoom(app);
    }

    go();

    return () => {
      console.log('unmounting');
      if (appRef.current === undefined)
        return;

      gameArea.removeChild(appRef.current.canvas);
      appRef.current.destroy();
    }
  }, [gameArea]);

  return (
    <div className='h-screen w-screen bg-slate-700' id="game" ref={setGameArea} />
  )
}

