import { Container, Graphics } from "pixi.js";
import { hintColours } from "../../hintColours";
import { AnyRoom, RoomId } from "../../modelTypes";
import type { TextureId } from "../../sprites/pixiSpriteSheet";
import { makeClickPortal } from "./makeClickPortal";
import {
  RenderWorldOptions,
  xyzBlockPosition,
  paletteSwapFilters,
} from "./renderWorld";
import { spriteAtBlock } from "./spriteAtBlock";

export function* renderFloor(
  room: AnyRoom,
  options: RenderWorldOptions,
): Generator<Container, undefined, undefined> {
  const hasDoorTowards = !!room.doors.towards;
  const hasDoorRight = !!room.doors.right;

  const blockXMin = room.doors.right ? -0.5 : 0;
  const blockXMax = room.size.x + (room.doors.left ? 0.5 : 0);
  const blockYMin = room.doors.towards ? -0.5 : 0;
  const blockYMax = room.size.y + (room.doors.towards ? 0.5 : 0);

  const rightSide = xyzBlockPosition(blockXMin, blockYMax);
  const leftSide = xyzBlockPosition(blockXMax, blockYMin);
  const frontSide = xyzBlockPosition(blockXMin, blockYMin); // aka the origin
  const backSide = xyzBlockPosition(blockXMax, blockYMax); // aka the origin

  const { floor: floorType } = room;

  const floorContainer = new Container();

  if (floorType !== "none") {
    const floorTileTexture: TextureId =
      floorType === "deadly" ? "generic.floor.deadly" : `${floorType}.floor`;

    const tilesContainer = new Container();

    // each sprite covers enough graphics for 2 blocks. we only need to
    // render a sprite for the 'white' squares on the chessboard (render or
    // not according to a checkerboard pattern)
    for (let ix = -1; ix <= room.size.x; ix++) {
      for (let iy = (ix % 2) - 1; iy <= room.size.y; iy += 2) {
        tilesContainer.addChild(
          spriteAtBlock({ x: ix, y: iy }, floorTileTexture, {
            anchor: { x: 0.5, y: 1 },
          }),
        );
      }
    }

    const tilesMask = new Graphics()
      // Add the rectangular area to show
      .poly([frontSide, rightSide, backSide, leftSide], true)
      .fill(0xff0000)
      // use a stroke to draw more than is strictly on the floor for the purpose of extending
      // under the pixelated edges of other sprites that are otherdrawn - otherwise the edge
      // would be a very smooth diagonal on modern screens
      .stroke({ width: 8 });

    tilesContainer.addChild(tilesMask);
    tilesContainer.mask = tilesMask;

    floorContainer.addChild(tilesContainer);
  }

  const rightEdge = new Container();
  for (let ix = blockXMin; ix <= room.size.x; ix += 0.5) {
    rightEdge.addChild(
      spriteAtBlock(
        { x: ix, y: hasDoorTowards ? -0.5 : 0 },
        "generic.edge.towards",
        { pivot: { x: 7, y: 1 } },
      ),
    );
  }
  rightEdge.filters = paletteSwapFilters(hintColours[room.color].edges.right);
  const towardsEdge = new Container();
  for (let iy = blockYMin; iy <= room.size.y; iy += 0.5) {
    towardsEdge.addChild(
      spriteAtBlock(
        { x: hasDoorRight ? -0.5 : 0, y: iy },
        "generic.edge.right",
        { pivot: { x: 0, y: 1 } },
      ),
    );
  }
  towardsEdge.filters = paletteSwapFilters(
    hintColours[room.color].edges.towards,
  );
  if (room.roomBelow) {
    makeClickPortal(
      room.roomBelow as RoomId,
      options,
      ...[...towardsEdge.children, ...rightEdge.children],
    );
  }

  const edgeRightPoint = xyzBlockPosition(0, room.size.y);
  const edgeLeftPoint = xyzBlockPosition(room.size.x, 0);

  // rendering strategy differs slightly from original here - we don't render floors added in for near-side
  // doors all the way to their (extended) edge - we cut the (inaccessible) corners of the room off
  const floorMask = new Graphics()
    // Add the rectangular area to show
    .poly(
      [
        { x: frontSide.x, y: frontSide.y + 16 },
        { x: edgeRightPoint.x, y: edgeRightPoint.y + 16 },
        { x: edgeRightPoint.x, y: -999 },
        { x: edgeLeftPoint.x, y: -999 },
        { x: edgeLeftPoint.x, y: edgeLeftPoint.y + 16 },
      ],
      true,
    )
    .fill(0xffff00);

  floorContainer.addChild(floorMask);
  floorContainer.addChild(rightEdge);
  floorContainer.addChild(towardsEdge);
  floorContainer.mask = floorMask;

  yield floorContainer;
}