<a id="readme-top"></a>

[![Contributors](https://img.shields.io/github/contributors/GGORG0/MapKom.svg?style=for-the-badge)](https://github.com/GGORG0/MapKom/graphs/contributors)
[![Forks](https://img.shields.io/github/forks/GGORG0/MapKom.svg?style=for-the-badge)](https://github.com/GGORG0/MapKom/network/members)
[![Stargazers](https://img.shields.io/github/stars/GGORG0/MapKom.svg?style=for-the-badge)](https://github.com/GGORG0/MapKom/stargazers)
[![Issues](https://img.shields.io/github/issues/GGORG0/MapKom.svg?style=for-the-badge)](https://github.com/GGORG0/MapKom/issues)
[![License](https://img.shields.io/github/license/GGORG0/MapKom.svg?style=for-the-badge)](https://github.com/GGORG0/MapKom/blob/master/LICENSE.txt)

<br />
<div align="center">
  <a href="https://github.com/GGORG0/MapKom">
    <img src="https://github.com/GGORG0/MapKom/raw/refs/heads/master/assets/logo-text.svg" alt="Logo" width="640" height="160">
  </a>

<h3 align="center">MapKom</h3>

  <p align="center">
    Public transport on a map
    <br />
    <br />
    <a href="https://github.com/GGORG0/MapKom/issues/new?labels=bug&template=bug-report.md&title=%5BBUG%5D%3A+">Report Bug</a>
    &middot;
    <a href="https://github.com/GGORG0/MapKom/issues/new?labels=city+bug&template=city-bug.md&title=%5BCB%5D%3A+">Report City Bug</a>
    &middot;
    <a href="https://github.com/GGORG0/MapKom/issues/new?labels=enhancement&template=feature-request.md&title=%5BFR%5D%3A+">Request Feature</a>
    &middot;
    <a href="https://github.com/GGORG0/MapKom/issues/new?labels=city+request&template=city-request.md&title=%5BCR%5D%3A+">Request City</a>
  </p>
</div>

## About The Project

This is an ~~all-in-one~~ (soon™) app for ~~all~~ your public transport needs in Wrocław, Poland. (and maybe more cities later on!)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Features

There is still a lot to do, but once it is all finished, I guarantee you'll love this app!
Stay tuned for updates!

- 📱 Runs natively on **Android, ~~iOS~~ (currently broken) and ~~the web~~ (currently broken)**
- 👀 Beautiful **Material Design 3** and Material You look
- 🗺️ Smooth and snappy **vector map** (no black squares while scrolling around!)
- 🦀 Blazingly **fast backend**, written in Rust
- 🧩 An **extensible and modular** design, allowing for easy addition of new cities
- 🛰️ **Real-time location and heading markers** for public transport vehicles, updated every **5 seconds** and streamed to you **instantly**
- 📡 **Redundant location sources** to ensure reliability, because Wrocław is known for breaking one while leaving the others working
- ~~🧭 **Routing** between stops, with **transfer support** and **live updates** along your journey~~
- ~~📈 **Live route view** for each vehicle~~
- ~~🕑 Vehicle **delay calculation** and stop **arrival time prediction**~~
- ~~📜 **Schedule** viewer~~
- ~~🚏 A list of **upcoming arrivals/departures** at a stop~~
- ~~📍 Location marker **filtering** by line and vehicle model for a clearer map view~~
- ~~🚍️ Explore vehicle **information, specs and photos**~~
- ~~🔎 Vehicle, line and stop **search**~~
- [💬 More?](https://github.com/GGORG0/MapKom/issues/new?labels=enhancement&template=feature-request.md&title=%5BFR%5D%3A+)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

- [![React.js](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
- [![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
- [![Material Design 3](https://img.shields.io/badge/Material_Design_3-757575?style=for-the-badge&logo=materialdesign&logoColor=white)](https://m3.material.io/)
- [![MapLibre](https://img.shields.io/badge/MapLibre-396CB2?style=for-the-badge&logo=maplibre&logoColor=white)](https://maplibre.org/)
- [![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-7EBC6F?style=for-the-badge&logo=openstreetmap&logoColor=white)](https://www.openstreetmap.org/)
- [![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
- [![Rust](https://img.shields.io/badge/Rust-e57300?style=for-the-badge&logo=rust&logoColor=black)](https://rust-lang.org/)
- [![Swagger & OpenAPI](https://img.shields.io/badge/Swagger_%26_OpenAPI-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Working Locally

This project is separated into two parts: the backend (Rust) and the frontend (React Native/Expo).

If you use VSCode, you can open the `mapkom.code-workspace` workspace for ease of use.

### Backend

0. [Install Rust](https://rustup.rs/)
1. Clone the repo and go into the `mapkom_server` directory.
   ```sh
   git clone https://github.com/GGORG0/MapKom.git
   cd mapkom_server/
   ```
2. Run the project with
   ```sh
   cargo run
   ```

### Frontend

**Note**: This project **will not** run in Expo Go. You will have to use a development build.

0. Install the prerequisites:
   - Both
     - [Node.js](https://nodejs.org/)
     - [Yarn v4 (Berry)](https://yarnpkg.com/getting-started/install) - **Note**: You also need to follow the _Updating Yarn_ section in the linked documentation page to upgrade from Yarn Classic to Yarn Berry
   - iOS
     - [Physical device](https://docs.expo.dev/get-started/set-up-your-environment/?platform=ios&device=physical&mode=development-build&buildEnv=local)
     - [Simulator](https://docs.expo.dev/get-started/set-up-your-environment/?platform=ios&device=simulated&mode=development-build&buildEnv=local)
   - Android
     - [Physical device](https://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=physical&mode=development-build&buildEnv=local)
     - [Emulator](https://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=simulated&mode=development-build&buildEnv=local)
1. Clone the repo and go into the `mapkom_client` directory.
   ```sh
   git clone https://github.com/GGORG0/MapKom.git
   cd mapkom_client/
   ```
2. Install npm dependencies
   ```sh
   yarn install
   ```
3. Generate the native files
   ```sh
   yarn expo prebuild --clean
   ```
4. Connect your device and run the project

   ```sh
   # For Android
   yarn expo run:android

   # For iOS
   yarn expo run:ios
   ```

5. You can also run the Metro bundler (development server) by itself if you don't want to recompile/reinstall the app
   ```sh
   yarn expo start -d
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributing

Any contributions you make, like a small feature addition, support for a new city or new translations, would be greatly appreciated.

If you have any suggestions you'd like to see implemented, please make a [feature request](https://github.com/GGORG0/MapKom/issues/new?labels=enhancement&template=feature-request.md&title=%5BFR%5D%3A+).

Don't forget to give the project a star if you enjoyed it. Thanks!

### Translating

This project uses [react-i18next](https://react.i18next.com/).
The translation files are stored in `mapkom_client/lib/i18n/*.json`.

You can use the amazing [i18n-ally](https://github.com/lokalise/i18n-ally/) VSCode extension to help you with translating the project easily. You'll need to open the `mapkom.code-workspace` workspace to get all the correct settings applied.

There will be [Weblate](https://weblate.org/) support coming soon!

### Adding support for a new city

MapKom uses a modular architecture to allow you to more-or-less easily add support for a new city.

Every city has its backend code in the `cities` directory. You can search for `wroclaw` in the entire project to see roughly what you need to implement to add a new city.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Top contributors:

<a href="https://github.com/GGORG0/MapKom/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=GGORG0/MapKom" alt="contrib.rocks image" />
</a>

## License

Distributed under the GNU GPL v3 license. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

GGORG - GGORG0+mapkom@protonmail.com

More contact options ([Matrix](https://matrix.to/#/@ggorg:matrix.org) preferred) can be found on [my website](https://ggorg.xyz).

You can also create an [issue](https://github.com/GGORG0/MapKom/issues) or [discussion](https://github.com/GGORG0/MapKom/discussions) for topics that can be discussed publicly, like feature or city requests.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
