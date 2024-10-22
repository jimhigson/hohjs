import { join } from "node:path";
import { ItemConfig, ItemType, UnknownItem } from "../../src/Item";
import {
  LooseDoorMap,
  map,
  convertXYZ,
  convertDirection,
} from "./convertCampaign";
import { convertRoomId } from "./convertRoomId";
import { Xml2JsonRoom, roomNameFromXmlFilename } from "./readToJson";
import chalk from "chalk";

export const convertItems = (
  roomName: string,
  xml2JsonRoom: Xml2JsonRoom,
  doorMap: LooseDoorMap,
): UnknownItem[] => {
  return xml2JsonRoom.items
    .map((item): UnknownItem | undefined => {
      const position = convertXYZ(item, xml2JsonRoom, doorMap);

      if (
        item.kind.includes("shaft") ||
        item.kind.includes("capital") ||
        item.kind.includes("door")
      ) {
        return undefined;
      }

      switch (item.kind) {
        case "teleport": {
          const roomOnMap = map[roomName];
          const destination = roomOnMap.teleport;

          if (destination === undefined) {
            throw new Error("teleporter with no destination");
          }

          return {
            type: "teleporter",
            config: {
              toRoom: convertRoomId(roomNameFromXmlFilename(destination)),
            },
            position,
          };
        }

        case "bars-ns":
        case "bars-ew":
          return {
            type: "barrier",
            config: {
              axis: item.kind === "bars-ns" ? "y" : "x",
            },
            position,
          };

        case "cylinder":
        case "brick1":
        case "brick2": {
          const styleConversion: Record<
            typeof item.kind,
            ItemConfig["block"]["style"]
          > = {
            brick1: "artificial",
            brick2: "organic",
            cylinder: "tower",
          };

          return {
            type: "block",
            config: {
              style: styleConversion[item.kind],
            },
            position,
          };
        }

        case "toaster":
        case "spikes":
        case "vulcano": {
          return {
            type: "deadly-block",
            config: {
              style: item.kind === "vulcano" ? "volcano" : item.kind,
            },
            position,
          };
        }

        case "conveyor": {
          return {
            type: "conveyor",
            config: {
              direction: convertDirection(item.orientation),
            },
            position,
          };
        }

        case "extra-life":
        case "high-jumps":
        case "donuts":
        case "horn":
        case "shield":
        case "handbag": {
          const conversions: Record<
            typeof item.kind,
            ItemConfig["pickup"]["gives"]
          > = {
            horn: "hooter",
            handbag: "bag",
            "high-jumps": "jumps",
            "extra-life": "extra-life",
            shield: "shield",
            donuts: "donuts",
          };

          return {
            type: "pickup",
            config: {
              gives: conversions[item.kind],
            },
            position,
          };
        }

        case "mortal-fish":
        case "reincarnation-fish": {
          return {
            type: "fish",
            config: {
              alive: item.kind === "reincarnation-fish",
            },
            position,
          };
        }

        case "trampoline": {
          return {
            type: "spring",
            config: {},
            position,
          };
        }

        case "elevator": {
          return {
            type: "lift", // HoH is a British game :-)
            config: { top: parseInt(item.top), bottom: parseInt(item.bottom) },
            position,
          };
        }

        case "remote-control": {
          return {
            type: "joystick",
            config: {},
            position,
          };
        }

        case "cap":
        case "sandwich":
        case "stool": {
          const conversions: Record<
            typeof item.kind,
            ItemConfig["movable-block"]["style"]
          > = {
            cap: "puck",
            stool: "anvil",
            sandwich: "sandwich",
          };

          return {
            type: "movable-block",
            config: { style: conversions[item.kind] },
            position,
          };
        }

        case "book":
          return {
            type: "book",
            config: { slider: item.class === "freeitem" },
            position,
          };

        case "drum":
        case "another-portable-brick": {
          return {
            type: "portable-block",
            config: { style: item.kind === "drum" ? "drum" : "cube" },
            position,
          };
        }

        case "charles-robot": {
          return {
            type: "charles",
            config: {},
            position,
          };
        }

        case "switch": {
          return {
            type: "switch",
            config: {},
            position,
          };
        }

        case "siren":
        case "monkey":
        case "elephant":
        case "helicopter-bug":
        case "imperial-guard":
        case "imperial-guard-head":
        case "diver": {
          const baddieConversions: Record<
            typeof item.kind,
            ItemConfig["baddie"]["which"]
          > = {
            "helicopter-bug": "helicopter-bug",
            "imperial-guard": "cyberman",
            "imperial-guard-head": "cyberman",
            siren: "dalek",
            diver: "american-football-head",
            monkey: "monkey",
            elephant: "elephant",
          };

          const defaultStartDirection = "left";
          return {
            type: "baddie",
            config: {
              which: baddieConversions[item.kind],
              startDirection:
                item.kind === "diver" || item.kind === "imperial-guard-head"
                  ? convertDirection(item.orientation)
                  : defaultStartDirection,
              charging: item.kind === "imperial-guard-head",
            },
            position,
          };
        }

        case "puppy":
          return {
            type: "hush-puppy",
            config: {},
            position,
          };

        case "ball":
          return {
            type: "ball",
            config: {},
            position,
          };

        default:
          console.warn(
            `not converting ${chalk.yellow(item.kind)} in room ${chalk.green(roomName)}`,
          );
          //item.kind satisfies never;
          return undefined;
      }
    })
    .filter((x): x is UnknownItem => x !== undefined);
};
