import { useEffect, useRef, useState } from 'react'
import { Application } from 'pixi.js';
import { renderWorld } from './renderWorld';
import { resize } from './resize';
import { tick } from './tick';
import { simpleRoom } from './simpleRoom';

/** 
 * React wrapper to give a space to pixi.js and start the rest of the game engine
 */
export const Game = () => {

  const appRef = useRef<Application>();
  const [gameArea, setGameArea] = useState<HTMLDivElement | null>(null);

  /*useResizeObserver(gameArea, () => {
    console.log('resize obs callback', appRef.current)
    return appRef.current !== undefined && resize(appRef.current);
  });*/
  useEffect(() => {

    if (gameArea === null)
      return;

    const go = async () => {
      const app = new Application();
      await app.init({ background: '#000000', resizeTo: window });
      // todo: load assets in parallel with init
      gameArea.appendChild(app.canvas);
      appRef.current = app;

      resize(app);
      app.ticker.add(() => tick(app));

      renderWorld(app, simpleRoom('blacktooth', 7, 5));
    }

    go();

    return () => {
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

