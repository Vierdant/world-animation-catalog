![App Preview](./assets/application_preview.png)

<p align="center">
  <a href="https://gtaw-ac.netlify.app/" target="_blank">
    <img src="https://img.shields.io/netlify/dacd955c-95ec-48bd-a97d-f25f65a864ad?style=flat-square&logo=netlify&label=Website" alt="Netlify" />
  </a>
  <a href="https://github.com/vierdant/world-animation-catalog/releases" target="_blank">
    <img src="https://img.shields.io/github/downloads/vierdant/world-animation-catalog/total?style=flat-square&label=Downloads" alt="GitHub Downloads" />
  </a>
  <a href="https://github.com/vierdant/world-animation-catalog/releases/latest" target="_blank">
    <img src="https://img.shields.io/github/v/release/vierdant/world-animation-catalog?display_name=tag&style=flat-square&label=Latest" alt="GitHub Release" />
  </a>
</p>

# World Animation Catalog

A comprehensive, searchable catalog of in-game and custom animations for GTA: World, designed to enhance immersion and elevate roleplay experiences. Whether you're a veteran player or newcomer, this application provides an efficient way to browse, preview, and discover animations contributed by the vibrant GTA:W community.

## The Problem

Every roleplayer has experienced this frustration: you're in the perfect moment for a specific animation, but you either don't know it exists or can't remember the command. The in-game animation system works well for favorites and basics, but without extensive testing and memorization, you're left thinking:

> *"I wish I knew what that animation looked like—I would've used it here."*

Hours spent scrolling through menus, testing animations, and enduring awkward mid-scene pauses just to find the right gesture shouldn't be part of the roleplay experience.

## The Solution

This application eliminates that friction entirely. It delivers a seamless, native desktop experience featuring instant search, visual previews, smart organization, and persistent favorites. Built specifically for roleplayers who care about getting the details right.

## ✨ Features

### Core Functionality
- **🔍 Advanced Search**: Find animations by name, command, or tags with intelligent filtering
- **🏷️ Tag Autocomplete**: Fast, intuitive searching with `tag:` prefix support
- **❤️ Favorites System**: Personal collection stored locally (separate from in-game favorites)
- **👀 Visual Previews**: See exactly what each animation looks like before using it
- **📋 One-Click Copy**: Click any animation to copy its command instantly

### Content & Filtering
- **🔞 Adult Content Toggle**: Optional filtering for sensitive content
- **📱 Responsive Design**: Works seamlessly on desktop and mobile
- **🌐 Live Data**: Always up-to-date animation catalog hosted on GitHub
- **⚡ Performance Optimized**: Lightning-fast search and smooth interactions

### Data Management
- **📤 Export/Import**: Backup and share your favorites and settings
- **💾 Local Storage**: Your preferences persist between sessions
- **🔄 Real-time Updates**: Automatic synchronization with the latest animation data

## 🌐 Access Options

### Web Version (Recommended)
No installation required! Access the full-featured web version instantly:

**[🚀 Launch Web App](https://gtaw-ac.netlify.app/)**

Perfect for:
- Quick lookups during gameplay
- Sharing with friends
- Trying before installing
- Cross-platform compatibility

### Desktop Application
For the ultimate experience, download our native desktop app:

1. Visit the [**Releases Page**](https://github.com/Vierdant/world-animation-catalog/releases)
2. Download the latest installer for your platform
3. Run the installer and follow the setup wizard

**Note**: Windows may show a security warning since we don't have a Microsoft certificate. The application is completely safe and open source.

## 🎯 How to Use

1. **Search**: Type any animation name, command, or use `tag:` for specific categories
2. **Filter**: Toggle adult content, favorites-only view, or search within results
3. **Preview**: Click any animation card to see a full preview image
4. **Copy**: Click the copy button to grab the `/anim` command instantly
5. **Favorite**: Star animations you use frequently for quick access
6. **Export**: Back up your favorites or share them with friends

## 🛠️ Technical Details

### Built With
- **Frontend**: Svelte + TypeScript for reactive UI
- **Desktop**: Tauri for native app packaging
- **Search**: Fuse.js for intelligent fuzzy search
- **Hosting**: Netlify for web deployment
- **Data**: GitHub-hosted JSON for animation catalog

### Performance Features
- **Smart Caching**: Intelligent result caching for instant repeat searches
- **Lazy Loading**: Images load on demand for optimal performance
- **Debounced Search**: Smooth search experience without overwhelming requests
- **Virtual Scrolling**: Handle thousands of animations without performance loss

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🐛 Bug Reports & Feature Requests
- Open an [issue](https://github.com/Vierdant/world-animation-catalog/issues) with detailed information
- Include steps to reproduce for bugs
- Check existing issues before creating new ones

### 🎭 Animation Data
- Submit new animations via pull request
- Help with tagging and categorization
- Report missing or incorrect animations

### 💻 Code Contributions
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with descriptive messages: `git commit -m 'Add amazing feature'`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a pull request with a clear description

## 🏗️ Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Rust](https://www.rust-lang.org/tools/install) (for desktop app)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites) (for desktop app)

### Quick Start
```bash
# Clone the repository
git clone https://github.com/Vierdant/world-animation-catalog.git
cd world-animation-catalog

# Install dependencies
npm install

# Development servers
npm run dev          # Web version (recommended for development)
npm run tauri dev    # Desktop app version
```


## 📊 Data Source

All animation metadata is maintained in a GitHub-hosted JSON file within this repository. The data includes:
- Animation commands
- Tag categories
- Preview images
- Descriptions and metadata

**Important**: This catalog is community-maintained and not directly linked to the game. Updates require manual contribution from volunteers.

## 🙏 Contributors

Special thanks to our amazing contributors who make this project possible:

- **[niamoore](https://forum.gta.world/en/profile/104280-niamoore/)** - Animation images & animation tags lists

Want to see your name here? Check out our [contributing guidelines](#-contributing)!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

- **Vierdant/[Locker](https://forum.gta.world/en/profile/104259-locker/)** is not affiliated with Rockstar Games, GTA-related projects, or GTA:W development teams
- This application was created independently in spare time for the community
- Animation preview images are used for visual context and identification purposes only
- All trademarks belong to their respective owners

## 🌟 Acknowledgments

- Inspired by the creativity and passion of the GTA:W roleplay community
- Built with love for roleplayers who appreciate attention to detail
- Thanks to all the animation creators and the community that makes GTA:W special

---

<p align="center">
  <strong>Made with ❤️ for the GTA:W Community</strong><br>
  <a href="https://gtaw-ac.netlify.app/">Try the Web App</a> • 
  <a href="https://github.com/Vierdant/world-animation-catalog/issues">Report Issues</a> • 
  <a href="https://github.com/Vierdant/world-animation-catalog/releases">Download Desktop App</a>
</p>