import { Container } from "pixi.js";
import { PlanetName, RoomJson, wallTextureId } from "../../modelTypes";
import type { TextureId } from "../../sprites/pixiSpriteSheet";
import { makeClickPortals } from "./makeClickPortal";
import { RenderOptions } from "../gameMain";
import { renderDoor } from "./renderDoor";
import { createSprite } from "./createSprite";
import { moveSpriteToBlock } from "./moveSpriteToBlock";

export function* renderWalls<RoomId extends string>(
  room: RoomJson<PlanetName, RoomId>,
  options: RenderOptions<RoomId>,
): Generator<Container, undefined, undefined> {
  // sprites for wall on x-axis (left wall):
  const leftDoor = room.doors.left;
  for (let i = room.size.y - 1; i >= 0; i--) {
    if (leftDoor?.ordinal === i - 1) {
      yield* makeClickPortals(
        leftDoor.toRoom,
        options,
        renderDoor(room, leftDoor, "left"),
      );
      i--;
    } else {
      const textureId = wallTextureId(
        room.planet,
        room.walls.left[i],
        "left",
      ) as TextureId;
      yield moveSpriteToBlock(
        { x: room.size.x, y: i },
        createSprite({
          anchor: { x: 0, y: 1 },
          texture: textureId,
        }),
      );
    }
  }

  // sprites for wall on y-axis (right wall):
  const awayDoor = room.doors.away;
  for (let i = room.size.x - 1; i >= 0; i--) {
    if (awayDoor?.ordinal === i - 1) {
      yield* makeClickPortals(
        awayDoor.toRoom,
        options,
        renderDoor(room, awayDoor, "away"),
      );
      i--;
    } else {
      const textureId = wallTextureId(
        room.planet,
        room.walls.away[i],
        "away",
      ) as TextureId;
      yield moveSpriteToBlock(
        { x: i, y: room.size.y },
        createSprite({
          anchor: { x: 1, y: 1 },
          texture: textureId,
        }),
      );
    }
  }
}
