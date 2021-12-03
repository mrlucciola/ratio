// // utils
// import createTheme from "@mui/material/styles/createTheme";
// import { Palette } from "@mui/material/styles/createPalette";
// import { PaletteProps, ThemeOptions, Theme } from "@mui/system";

// export interface ThemeOpts {
//   palette?: PaletteOptions,
// }
// interface IPalette extends Palette {
//   components: {
//     MuiButtonBase: {
//       defaultProps: {
//         disableRipple: boolean,
//       },
//     },
//     MuiButton: {
//       styleOverrides: {
//         root: {
//           textTransform: string,
//         },
//       },
//     },
//     MuiLink: {
//       defaultProps: {
//         underline: string,
//       },
//       color: string,
//     },
//   },
//   overrides: {},
//   palette: {
//     primary: {
//       main: string,
//       contrastText: string,
//     },
//     secondary: {
//       main: string,
//       contrastText: string,
//     },
//     background: {
//       default: string,
//     },
//     grey: {
//       lightBg: string,
//       darkBg: string,
//     },
//   },
// }

// interface ITheme extends Theme {
//   palette: IPalette;
// }
// interface IThemeOptions extends ThemeOptions {
//   palette: IPalette;
// }
// export const baseTheme = createTheme(
//   // options?: IThemeOptions,
//   {
  
//   components: {
//     MuiButtonBase: {
//       defaultProps: {
//         disableRipple: true,
//       },
//     },
//     MuiButton: {
//       styleOverrides: {
//         root: {
//           textTransform: "unset",
//         },
//       },
//     },
//     MuiLink: {
//       defaultProps: {
//         underline: "none",
//       },
//       color: "#111111",
//     },
//   },
//   overrides: {},
//   palette: {
//     primary: {
//       main: "#f6f6ff",
//       contrastText: "#1b1b1c",
//     },
//     secondary: {
//       main: "#fff",
//       contrastText: "#f6f6ff",
//     },
//     background: {
//       default: "#fff",
//     },
//     grey: {
//       lightBg: "#707079",
//       darkBg: "#b1b1bd",
//     },
//   },
// } as ThemeOptions);
