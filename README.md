>  Manifest your dreams on the open social spatial web.

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Background](#background)
- [Demos](#demos)
- [Project API](#project-api)
  - [Library of XREngine Projects](#library-of-xrengine-projects)
  - [Create your own projects](#create-your-own-projects)
- [Launch XREngine with Control Center Install - ***RECOMMENDED***](#launch-xrengine-engine-with-control-center-install---recommended)
  - [Use Metaverse Control Plane Managment GUI](#use-metaverse-control-plane-managment-gui)
- [Advanced Development Install](#advanced-development-install)
  - [Pre-Requisites](#pre-requisites)
  - [Getting Started](#getting-started)
- [Usage](#usage)
  - [Documentation](#documentation)
- [Contributing](#contributing)
  - [Let's build it together](#lets-build-it-together)
  - [Join our Discord  ](#join-our-discord--)
  - [Sponsorship ](#sponsorship-)
- [License](#license)

## Background

https://user-images.githubusercontent.com/507127/142818955-51d7757f-a432-45da-8f8f-56037358ad58.mp4

We ([XREngine](https://github.com/xr-foundation)) believe that the Metaverse, 
Web AR, VR, and XR should be easy.

We want a Star Trek future where participating in immersive communication 
technology and shared simulations should be as easy and natural as making a website.

- Includes a self-deployable platform, UI, worlds, avatars, and games
- Fully customizable for any kind of game, social experience, event or spatial web app
- User management, avatars and inventory with optional blockchain integration (see our Blockchain-in-a-Box repo)
- Social features like chat, groups, friends, blocking and moderation
- Complete world editing and administration
- 2D, 3D and XR Avatars with full inverse kinematics and facial expressions
- Fully networked physics using Rapier Physics
- Voice and video over WebRTC
- Instant login and location sharing with phone number or email
- Modular- Use the engine, server, client, editor and scalable devops infrastructure as needed
- OAuth login with Facebook, Google, Steam, Github or instant login with email or phone
- WebGL client deployable to iOS, Android and desktop
- Free, open source, CPAL licensed

## Project API

### [Library of XREngine Projects](https://github.com/xr-foundation/project-manifest)

Create composable plug-ins for XREngine experiences with the Projects API

## Launch XREngine with Control Center Install - ***RECOMMENDED***

### [Use Metaverse Control Plane Managment GUI](https://github.com/xr-foundation/xrengine-launcher)

Best for simple self hosting, advanced editor content creation, and XRProject Pack Project development.

## Advanced Development Install

### Pre-Requisites

To install XREngine locally, the following pre-reqs are required.

* Linux (many of us develop on Ubuntu), Mac OS X, or Windows (we recommend WSL2)
* Node.js v16 or later (we recommend installing via [`nvm`](https://github.com/nvm-sh/nvm)
  or [`asdf`](https://github.com/asdf-vm/asdf).)
* C++ (for `node-gyp`), Python >=3.6 + [PIP](https://pypi.org/project/pip/), `make`
  and other build tools, for compiling Mediasoup.
  Although most of XREngine is written in TypeScript, it uses a [Mediasoup](https://mediasoup.org/)
  engine for WebRTC conferencing. See the [Mediasoup install instructions](https://mediasoup.org/documentation/v3/mediasoup/installation/)
  for more details.
* Docker. (Although Docker is technically optional, running XREngine requires starting up
  half a dozen different services, and using Docker Compose will make your life dramatically
  easier.)
* MariaDB and Redis. (If you're using Docker, containers for MariaDB and Redis 
  will automatically be started up.)

### Getting Started

See the [Installation instructions](https://xr-foundation.github.io/xrengine-docs/manual/install/)
for more details.

## Usage

### Documentation

[WIP Aug 30, 2024]

## Contributing

* We expect contributors and community members to follow our
  [Code of Conduct](CODE_OF_CONDUCT.md).
* See the **[Contributing Guide](CONTRIBUTING.md)** and corresponding
  [wiki entry](https://github.com/xr-foundation/xrengine/wiki/Testing-&-Contributing)
  for more details.
* Version numbering of the XREngine monorepo follows the
  [Semantic versioning](http://semver.org/) approach.
* We use the [Prettier.io](https://prettier.io/) formatter for our code style.
* [Standard Readme](https://github.com/RichardLitt/standard-readme) for
  the README structure.

### Let's build it together

We believe that projects like this are extremely complex and difficult, and can 
only be built when large groups of people work together, out in the open. If you 
believe that your calling is to build a free, open network that everyone, 
everywhere can get value from, then you are welcome in our community, and we'll 
do our best to get you set up.

We are always hiring talented people who want to be leaders in what is to come. 
Inquire with anyone who seems like they know what's going on and they'll help 
you find who you need to talk to.

![msf-member-badge-small](https://user-images.githubusercontent.com/5104160/181168132-57a91f8b-16c9-45f0-a0ee-c89f8f018a80.png)

### [Join our Discord](https://discord.gg/xrfoundation)  [![Discord Chat](https://img.shields.io/discord/692672143053422678.svg)](https://discord.gg/xrfoundation)

## License
[MIT](LICENSE) - Copyright (c) 2021-2024 XRFoundation.