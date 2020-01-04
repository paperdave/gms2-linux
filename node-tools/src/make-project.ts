import { PathLike } from "fs";
import * as fse from 'fs-extra';
import { join, dirname } from "path";
import { uuid } from "./utils/uuid";

interface IViewModel {
  id: string,
  modelName: "GMFolder",
  mvc: "1.1",
  /** Identical to id */
  name: string,
  children: string[],
  filterType: string,
  folderName: string,
  isDefaultView: boolean,
  localisedFolderName: string;
};
interface IResource {
  id: string,
  modelName: string,
}

/**
* Generates a blank gamemaker project, as the IDE does. Does
* not require GameMaker Studio 2 installed on the running machine.
* @param yyp_path Path to the non existing .yyp file
*/
export async function makeBlankProject(yyp_path: PathLike) {
  const guid = uuid();

  const yyp = {
      id: uuid(),
      modelName: "GMProject",
      mvc: "1.0",
      IsDnDProject: false,
      configs: [],
      option_ecma: false,
      parentProject: {
          id: uuid(),
          modelName: "GMProjectParent",
          mvc: "1.0",
          alteredResources: [
              {
                  Key: "ed6a955d-5826-4f98-a450-10b414266c27",
                  Value: {
                      configDeltas: [
                          "inherited"
                      ],
                      id: uuid(),
                      resourcePath: "options\\main\\options_main.yy",
                      resourceType: "GMMainOptions"
                  }
              }
          ],
          hiddenResources: [

          ],
          projectPath: "${base_project}"
      },
      resources: [],
      script_order: [],
      tutorial: "",
  };

  const mainOptions = `1.0.0←ed6a955d-5826-4f98-a450-10b414266c27←ed6a955d-5826-4f98-a450-10b414266c27|{
      "option_gameguid": "${guid}"
  }←1225f6b0-ac20-43bd-a82e-be73fa0b6f4f|{
      "targets": 29263750006690030
  }←7b2c4976-1e09-44e5-8256-c527145e03bb|{
      "targets": 29263750006690030
  }`;

  await fse.mkdirs(join(dirname(yyp_path.toString()), "options", "main", "inherited"));
  await fse.writeFile(join(dirname(yyp_path.toString()), "options", "main", "inherited", "options_main.inherited.yy"), mainOptions);
  
  
  function makeRoom(name: string) {

      const roomJSON = {
          name: name,
          id: uuid(),
          creationCodeFile: "",
          inheritCode: false,
          inheritCreationOrder: false,
          inheritLayers: false,
          instanceCreationOrderIDs: [],
          IsDnD: false,
          layers: [
              {
                  __type: "GMRInstanceLayer_Model:#YoYoStudio.MVCFormat",
                  name: "Instances",
                  id: uuid(),
                  depth: 0,
                  grid_x: 32,
                  grid_y: 32,
                  hierarchyFrozen: false,
                  hierarchyVisible: true,
                  inheritLayerDepth: false,
                  inheritLayerSettings: false,
                  inheritSubLayers: false,
                  inheritVisibility: false,
                  instances: [],
                  layers: [],
                  m_parentID: "00000000-0000-0000-0000-000000000000",
                  m_serialiseFrozen: false,
                  modelName: "GMRInstanceLayer",
                  mvc: "1.0",
                  userdefined_depth: false,
                  "visible": true
              },
              {
                  __type: "GMRBackgroundLayer_Model:#YoYoStudio.MVCFormat",
                  name: "Background",
                  id: uuid(),
                  animationFPS: 15,
                  animationSpeedType: "0",
                  colour: { Value: 4278190080 },
                  depth: 100,
                  grid_x: 32,
                  grid_y: 32,
                  hierarchyFrozen: false,
                  hierarchyVisible: true,
                  hspeed: 0,
                  htiled: false,
                  inheritLayerDepth: false,
                  inheritLayerSettings: false,
                  inheritSubLayers: false,
                  inheritVisibility: false,
                  layers: [],
                  m_parentID: "00000000-0000-0000-0000-000000000000",
                  m_serialiseFrozen: false,
                  modelName: "GMRBackgroundLayer",
                  mvc: "1.0",
                  spriteId: "00000000-0000-0000-0000-000000000000",
                  stretch: false,
                  userdefined_animFPS: false,
                  userdefined_depth: false,
                  visible: true,
                  vspeed: 0,
                  vtiled: false,
                  x: 0,
                  "y": 0
              }
          ],
          modelName: "GMRoom",
          parentId: "00000000-0000-0000-0000-000000000000",
          physicsSettings: {
              id: uuid(),
              inheritPhysicsSettings: false,
              modelName: "GMRoomPhysicsSettings",
              PhysicsWorld: false,
              PhysicsWorldGravityX: 0,
              PhysicsWorldGravityY: 10,
              PhysicsWorldPixToMeters: 0.1,
              mvc: "1.0"
          },
          roomSettings: {
              id: uuid(),
              Height: 768,
              inheritRoomSettings: false,
              modelName: "GMRoomSettings",
              persistent: false,
              mvc: "1.0",
              Width: 1024
          },
          mvc: "1.0",
          views: [],
          viewSettings: {
              id: uuid(),
              clearDisplayBuffer: true,
              clearViewBackground: false,
              enableViews: false,
              inheritViewSettings: false,
              modelName: "GMRoomViewSettings",
              mvc: "1.0"
          }
      };
      for (let i = 0; i < 8; i++) {
          roomJSON.views.push(
              {
                  id: uuid(),
                  modelName: "GMRView",
                  mvc: "1.0", 
                  hborder: 32,
                  hport: 768,
                  hspeed: -1,
                  hview: 768,
                  inherit: false,
                  objId: "00000000-0000-0000-0000-000000000000",
                  vborder: 32,
                  visible: false,
                  vspeed: -1,
                  wport: 1024,
                  wview: 1024,
                  xport: 0, 
                  xview: 0,
                  yport: 0,
                  yview: 0
              },

          )
      }
      return roomJSON;
  }

  function makeView(folderName, filterType, localisedFolderName, children: ({ id: string })[]) {
      const id = uuid();
      return {
          id: id,
          modelName: "GMFolder",
          mvc: "1.1",
          name: id,
          children: children.map(x => x.id),
          filterType: filterType,
          folderName: folderName,
          isDefaultView: filterType === "root",
          localisedFolderName: localisedFolderName
      };
  }

  /**
   * Pushes a resource to the yyp json, and writes the file
   * @param resource 
   * @param path 
   */
  async function pushResource(resource: IResource, path) {
      await fse.mkdirs(dirname(join(dirname(yyp_path.toString()), path)));
      await fse.writeFile(join(dirname(yyp_path.toString()), path), JSON.stringify(resource));
      yyp.resources.push({
          Key: resource.id,
          Value: {
              id: uuid(),
              resourcePath: path,
              resourceType: resource.modelName
          }
      });
  }
  async function pushViewResource(resource: IResource) {
      await pushResource(resource, "views\\" + resource.id + ".yy");
  }
  async function pushRoomResource(resource: IResource & { name: string }) {
      await pushResource(resource, "rooms\\" + resource.name + "\\" + resource.name + ".yy");
  }

  const room0 = makeRoom("room0");

  const view_options = makeView("options", "GMOptions", "ResourceTree_Options", [
      // main options
      { id: "ed6a955d-5826-4f98-a450-10b414266c27" },
  ]);

  const view_sprites = makeView("sprites", "GMSprite", "ResourceTree_Sprites", []);
  const view_tilesets = makeView("tilesets", "GMTileSet", "ResourceTree_Tilesets", []);
  const view_sounds = makeView("sounds", "GMSound", "ResourceTree_Sounds", []);
  const view_paths = makeView("paths", "GMPath", "ResourceTree_Paths", []);
  const view_fonts = makeView("fonts", "GMFont", "ResourceTree_Fonts", []);
  const view_timelines = makeView("timelines", "GMTimeline", "ResourceTree_Timelines", []);
  const view_scripts = makeView("scripts", "GMScript", "ResourceTree_Scripts", []);
  const view_shaders = makeView("shaders", "GMShader", "ResourceTree_Shaders", []);
  const view_objects = makeView("object", "GMObject", "ResourceTree_Objects", []);
  const view_rooms = makeView("rooms", "GMRoom", "ResourceTree_Rooms", [ room0 ]);
  const view_notes = makeView("notes", "GMNotes", "ResourceTree_Notes", []);
  const view_datafiles = makeView("datafiles", "GMIncludedFile", "ResourceTree_IncludedFiles", []);
  const view_extensions = makeView("extensions", "GMExtension", "ResourceTree_Extensions", []);
  const view_configs = makeView("configs", "GMConfig", "ResourceTree_Configs", []);

  const view_root = makeView("Default", "root", "", [
      view_sprites,
      view_tilesets,
      view_sounds,
      view_paths,
      view_scripts,
      view_shaders,
      view_fonts,
      view_timelines,
      view_objects,
      view_rooms,
      view_notes,
      view_datafiles,
      view_extensions,
      view_options,
      view_configs
  ]);

  await pushRoomResource(room0);
  await pushViewResource(view_sprites);
  await pushViewResource(view_tilesets);
  await pushViewResource(view_sounds);
  await pushViewResource(view_paths);
  await pushViewResource(view_scripts);
  await pushViewResource(view_shaders);
  await pushViewResource(view_fonts);
  await pushViewResource(view_timelines);
  await pushViewResource(view_objects);
  await pushViewResource(view_rooms);
  await pushViewResource(view_notes);
  await pushViewResource(view_datafiles);
  await pushViewResource(view_extensions);
  await pushViewResource(view_options);
  await pushViewResource(view_configs);
  await pushViewResource(view_root);
  
  await fse.writeFile(yyp_path.toString(), JSON.stringify(yyp));
}
