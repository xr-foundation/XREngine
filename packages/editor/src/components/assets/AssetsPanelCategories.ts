import { defineState } from '@xrengine/hyperflux'

export const AssetsPanelCategories = defineState({
  name: 'AssetsPanelCategories',
  initial: {
    'Default Prefab': {},

    Model: {
      // NPC: {},
      // Avatar: {},
      // Animal: {},
      Template: {
        // Backdrop: {},
        // Stage: {}
      },
      Architectural: {
        Floor: {},
        Ceiling: {},
        Wall: {}
      },
      // 'Basic Shape': {
      //   Artistic: {},
      //   Primitive: {
      //     'Platonic Solid': {},
      //     Fractal: {}
      //   }
      // },
      Kit: {
        Gothic: {},
        Cottage: {},
        Scifi: {},
        Modern: {},
        Nature: {},
        Ecommerce: {},
        Noir: {}
      },
      Prop: {
        // Furniture: {
        //   Chairs: {},
        //   Showcase: {},
        //   Displays: {}
        // }
      }
      // Terrain: {}
    },
    Material: {
      // Standard: {
      //   Plastic: {},
      //   Glass: {},
      //   'Rough glass': {},
      //   Metal: {},
      //   Glow: {},
      //   Rubber: {},
      //   Water: {},
      //   Bubble: {},
      //   Diamond: {},
      //   Clay: {},
      //   'Car Paint': {},
      //   Wood: {},
      //   Stone: {},
      //   Dirt: {},
      //   Grass: {},
      //   Cloth: {},
      //   Bark: {},
      //   Snow: {}
      // },
      // Advanced: {
      //   Static: {},
      //   Animated: {}
      // }
    },
    Image: {
      // Background: {},
      // Texture: {
      //   Diffuse: {},
      //   'Normal Maps': {},
      //   Occlusion: {},
      //   Metalness: {},
      //   Roughness: {}
      // },
      // Tiling: {
      //   Diffuse: {},
      //   'Normal Map': {},
      //   Occlusion: {},
      //   Metalness: {},
      //   Roughness: {}
      // },
      // Sprite: {}
    },
    // Light: {},
    Video: {},
    Audio: {
      // Music: {},
      // 'Sound FX': {}
    },
    Particle: {
      // Smoke: {},
      // Fire: {},
      // Lightning: {},
      // Portal: {},
      // Sparkle: {}
    },
    Skybox: {
      // 'Time of Day': {
      //   Morning: {},
      //   Noon: {},
      //   Evening: {},
      //   Night: {}
      // },
      // Abstract: {},
      // 'Low Contrast': {},
      // 'High Contrast': {}
    },
    'Post Processing': {
      // Fog: {},
      // Cinematic: {}
    }
    // Agent: {},
    // Genre: {
    //   Office: {},
    //   Gothic: {},
    //   Scifi: {},
    //   Cottage: {},
    //   Modern: {},
    //   Luxury: {},
    //   Noir: {},
    //   Nature: {
    //     Jungle: {},
    //     Arctic: {},
    //     Boreal: {},
    //     Desert: {}
    //   },
    //   Holiday: {
    //     Passover: {},
    //     'St Patrick’s Day': {},
    //     'Yam Kippur': {},
    //     'Veteran’s Day': {}
    //   },
    //   Abstract: {},
    //   Fantasy: {}
    // }
  } as object
})
