import { ZxSpectrumColor } from "./originalGame";

export const directions = ['away', 'towards', 'left', 'right'] as const;
export type Direction = (typeof directions)[number];
export const planets = ['blacktooth', 'moonbase', 'market', 'bookworld', 'penitentiary', 'safari', 'egyptus'] as const;
export type Planet = (typeof planets)[number]

type FloorType = 'normal' | 'deadly' | 'none';

export type Room = {
    id: string,
    /* width in game blocks. this is the integer unit of room size and different from the width in pixels */
    blockWidth: number,
    /* depth in game blocks. this is the integer unit of room size and different from the width in pixels */
    blockDepth: number,
    planet: Planet,
    floorType: FloorType,
    roomAbove?: Room,
    roomBelow?: Room
    zxSpectrumColor: ZxSpectrumColor,
}

