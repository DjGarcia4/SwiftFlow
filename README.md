# SwiftFlow 🚀

A modern, responsive typing test application built with Vue.js that helps users improve their typing speed and accuracy with beautiful animations and real-time feedback.

![SwiftFlow Demo](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=for-the-badge&logo=vue.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite)

## ✨ Features

### 🎯 Core Functionality

- **Real-time Typing Test**: Practice with Spanish text passages
- **Live Statistics**: WPM, Accuracy, and Time tracking
- **Multiple Text Passages**: 4 different Spanish texts covering various topics
- **Progress Tracking**: Visual progress bar and character highlighting

### 🎮 Interactive Controls

- **Play/Pause**: Auto-pause after 3 seconds of inactivity
- **Navigation**: Previous/Next text passages
- **Restart**: Reset current text and statistics
- **Auto-resume**: Continue typing to automatically resume from pause

### 🎨 Visual Experience

- **Beautiful Animations**: Smooth card entrance/exit animations
- **Confetti Celebration**: Canvas-confetti library for completion celebration
- **Responsive Design**: Works perfectly on desktop and mobile
- **Dark Theme**: Modern dark UI with gradient backgrounds
- **Real-time Feedback**: Color-coded character highlighting (correct/incorrect)

### 📊 Statistics & Analytics

- **Words Per Minute (WPM)**: Real-time calculation
- **Accuracy Percentage**: Character-by-character accuracy tracking
- **Error Count**: Total number of typing errors
- **Time Tracking**: Elapsed time with automatic timer
- **Completion Stats**: Detailed breakdown when text is completed

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/swiftflow.git
   cd swiftflow
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## 🛠️ Tech Stack

- **Frontend Framework**: Vue.js 3 with Composition API
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Animations**: CSS Transitions + Canvas Confetti
- **Language**: JavaScript (ES6+)

## 📁 Project Structure

```
src/
├── components/
│   ├── common/
│   │   ├── ButtonCustom.vue      # Custom button component
│   │   └── IconButton.vue        # Icon button with tooltips
│   ├── Layouts/
│   │   └── Nav.vue              # Navigation component
│   └── ParagraphToType.vue      # Main typing test component
├── constants/
│   └── paragraphs.js            # Text passages for typing
├── views/
│   └── HomeView.vue             # Home page
├── App.vue                      # Root component
├── main.js                      # Application entry point
└── style.css                    # Global styles
```

## 🎮 How to Use

1. **Start Typing**: Click on the text area and begin typing
2. **Real-time Feedback**:
   - Green characters = Correct
   - Red characters = Incorrect
   - White highlight = Current position
3. **Auto-pause**: Stop typing for 3 seconds to auto-pause
4. **Resume**: Start typing again to automatically resume
5. **Navigation**: Use the control buttons to navigate between texts
6. **Completion**: Finish the text to see confetti celebration and detailed stats

## 🎨 Customization

### Adding New Text Passages

Edit `src/constants/paragraphs.js`:

```javascript
export const paragraphs = [
  "Your first text passage here...",
  "Your second text passage here...",
  // Add more passages
];
```

### Styling Customization

The app uses Tailwind CSS. Key customization areas:

- **Colors**: Modify the gradient backgrounds in component classes
- **Animations**: Adjust transition durations in CSS classes
- **Layout**: Change grid layouts and spacing using Tailwind utilities

### Confetti Customization

Modify the `triggerConfetti()` function in `ParagraphToType.vue`:

```javascript
const triggerConfetti = () => {
  // Customize duration, particle count, colors, etc.
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#ff0000", "#00ff00", "#0000ff"], // Custom colors
  });
};
```

## 📱 Responsive Design

SwiftFlow is fully responsive and works on:

- **Desktop**: Full 4-column stats layout
- **Tablet**: 2-column stats layout
- **Mobile**: Single column layout with touch-friendly controls

## 🎯 Performance Features

- **Efficient Rendering**: Vue 3's Composition API for optimal performance
- **Canvas Confetti**: Hardware-accelerated confetti animations
- **Lazy Loading**: Components load only when needed
- **Optimized Build**: Vite for fast development and production builds

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Heroicons](https://heroicons.com/) - Beautiful hand-crafted SVG icons
- [Canvas Confetti](https://github.com/catdad/canvas-confetti) - Confetti animation library
- [Vite](https://vitejs.dev/) - Next generation frontend tooling

## 📞 Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/yourusername/swiftflow/issues) page
2. Create a new issue if your problem isn't already reported
3. Contact the maintainers

---

**Happy Typing! 🎉**

Made with ❤️ by [Your Name]
