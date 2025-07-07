# Bookmark Categorizer Chrome Extension

A smart Chrome extension that automatically categorizes and organizes bookmarks using AI-powered analysis. Built with React, TypeScript, and Chrome Extensions API.

## 🚀 Features

- **AI-Powered Categorization**: Uses Gemini API for intelligent bookmark organization
- **Flexible Structure**: Supports both flattened and nested folder organization
- **Smart Detection**: Prevents duplicate categorization of already sorted bookmarks
- **Rich Metadata**: Fetches page descriptions and generates AI summaries
- **Beautiful UI**: Clean, aesthetic design with smooth navigation
- **Real-time Progress**: Live categorization progress tracking
- **Chrome Integration**: Seamless sync with native Chrome bookmarks

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** with custom liquid glass design
- **Chrome Extensions API** for bookmark management
- **Custom Hooks** for state management

### Key Components
- `SetupWizard`: One-time onboarding for user preferences
- `Dashboard`: Main interface with categorization workflow
- `ColumnView`: macOS Finder-style navigation
- `IntentSearch`: Smart search with AI-powered suggestions
- `ProgressBar`: Real-time categorization progress

## 📦 Installation

### Prerequisites
- Node.js 16+
- Chrome browser
- Backend API running (see API section below)

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd client

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Load Extension in Chrome
1. Open Chrome Extensions (`chrome://extensions/`)
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder
5. The extension icon should appear in your toolbar

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_CORS_PROXY=https://api.allorigins.win
```

### Manifest Configuration
The extension requires these permissions:
- `bookmarks`: Access to Chrome bookmarks
- `storage`: Local data persistence
- `host_permissions`: API access and CORS proxy

## 🔄 API Integration

### Backend Requirements

Your backend should provide a REST API endpoint that accepts and returns the following JSON structures:

#### Request Format
```json
POST /api/bookmarks/categorize
Content-Type: application/json

{
  "userContext": {
    "persona": "React, AI, Marketing, Design, Finance",
    "preferred_structure": "nested_folders"
  },
  "bookmarks": [
    {
      "title": "React Documentation",
      "url": "https://react.dev",
      "description": "Official React documentation and guides for building user interfaces",
      "id": "12345",
      "dateAdded": 1703123456789,
      "parentId": "67890"
    },
    {
      "title": "OpenAI API Guide",
      "url": "https://platform.openai.com/docs",
      "description": "Comprehensive guide to using OpenAI's API for AI applications",
      "id": "12346",
      "dateAdded": 1703123456790,
      "parentId": "67891"
    }
  ]
}
```

#### Response Format
```json
{
  "bookmarks": [
    {
      "title": "React Documentation",
      "url": "https://react.dev",
      "category": ["Learning", "Development", "React"],
      "summary": "Official React documentation and guides for building modern user interfaces with React components and hooks"
    },
    {
      "title": "OpenAI API Guide",
      "url": "https://platform.openai.com/docs",
      "category": ["AI", "Development", "API"],
      "summary": "Comprehensive guide to integrating OpenAI's powerful AI models into applications through their REST API"
    }
  ]
}
```

### API Endpoint Details

#### Request Parameters
- **userContext.persona**: Comma-separated string of user interests
- **userContext.preferred_structure**: Either `"flat_folders"` or `"nested_folders"`
- **bookmarks**: Array of bookmark objects with metadata

#### Response Fields
- **bookmarks**: Array of categorized bookmark objects
- **category**: For nested structure, an array of strings (e.g., `["Learning", "Development", "React"]`)
- **summary**: AI-generated one-line summary of the bookmark content

### Error Handling
The backend should return appropriate HTTP status codes:
- `200`: Successful categorization
- `400`: Invalid request format
- `500`: Server error

Error response format:
```json
{
  "error": "Error message describing what went wrong"
}
```

## 🎨 UI/UX Design

### Design Principles
- **Subtle & Aesthetic**: Clean, minimal design without round elements
- **Liquid Glass**: Modern glassmorphism effects with transparency
- **Consistent Spacing**: Uniform padding and margins throughout
- **Clear Hierarchy**: Distinct visual levels for different content types

### Color Scheme
- **Primary**: Liquid gradient blues and purples
- **Background**: Subtle gradient backgrounds
- **Text**: High contrast slate colors
- **Accents**: White/transparent overlays

### Components
- **Setup Wizard**: Step-by-step onboarding with persona input
- **Dashboard**: Main interface with categorization controls
- **Column View**: Finder-style navigation for nested folders
- **Progress Bar**: Real-time categorization progress
- **Search**: Intent-based search with AI suggestions

## 🔄 Workflow

### 1. Initial Setup
```
User opens extension → Setup Wizard → Enter persona → Choose structure → Save settings
```

### 2. Bookmark Processing
```
Fetch uncategorized bookmarks → Extract descriptions → Send to API → Receive categories → Organize in Chrome → Update dashboard
```

### 3. Data Flow
```
Chrome Bookmarks → Extension Storage → Backend API → Chrome Folders → Dashboard Display
```

## 📁 File Structure

```
src/
├── components/
│   ├── Dashboard.tsx              # Main dashboard component
│   ├── SetupWizard.tsx            # Onboarding wizard
│   ├── PopupDashboard.tsx         # Popup interface
│   └── ui/
│       ├── ColumnView.tsx         # Finder-style column view
│       ├── ProgressBar.tsx        # Categorization progress
│       ├── IntentSearch.tsx       # Smart search component
│       ├── Button.tsx             # Reusable button component
│       └── Input.tsx              # Reusable input component
├── hooks/
│   └── useBookmarks.ts            # Bookmark state management
├── api/
│   └── bookmarks.ts               # API integration
├── utils/
│   ├── chrome-bookmarks.ts        # Chrome bookmarks API wrapper
│   └── chrome-storage.ts          # Chrome storage utilities
├── types/
│   └── index.ts                   # TypeScript type definitions
├── pages/
│   └── Dashboard.tsx              # Dashboard page component
└── App.tsx                        # Main application component
```

## 🔒 Security & Privacy

### Data Handling
- **Local Storage**: User settings and categorized data stored locally
- **No External Tracking**: No analytics or tracking services
- **Secure API**: HTTPS-only communication with backend
- **Minimal Permissions**: Only bookmarks and storage access

### CORS Handling
- **Proxy Service**: Uses allorigins.win for fetching page descriptions
- **Fallback Strategy**: Graceful degradation when descriptions unavailable
- **Rate Limiting**: Built-in delays between batch requests

## 🚀 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Development Workflow
1. Make changes to source files
2. Run `npm run dev` for live reloading
3. Test in Chrome extension
4. Run `npm run build` for production
5. Reload extension in Chrome

### Debugging
- Open Chrome DevTools for the extension
- Check console for detailed logs
- Use React DevTools for component debugging
- Monitor network requests in DevTools

## 🐛 Troubleshooting

### Common Issues

#### Extension Not Loading
- Ensure `dist` folder exists after build
- Check Chrome extension permissions
- Verify manifest.json is valid

#### API Connection Failed
- Ensure backend is running on correct port
- Check CORS settings on backend
- Verify network connectivity
- Check API endpoint URL in configuration

#### Bookmarks Not Loading
- Check Chrome bookmarks API permissions
- Verify extension has bookmarks permission
- Clear extension storage and retry
- Check console for error messages

#### Categorization Fails
- Verify API response format matches expected structure
- Check persona format (comma-separated)
- Ensure backend returns proper JSON
- Review browser console for detailed errors

### Debug Mode
Enable debug logging by setting `localStorage.debug = true` in the extension console.

## 📈 Performance

### Optimization Features
- **Batch Processing**: Processes bookmarks in configurable batches (default: 50)
- **Memoization**: React.memo for optimized re-renders
- **Lazy Loading**: Components loaded on demand
- **Efficient Storage**: Compressed bookmark data storage

### Memory Management
- Efficient bookmark filtering and deduplication
- Cleanup of non-existent bookmarks
- Optimized Chrome storage synchronization

## 🔮 Future Enhancements

### Planned Features
- **Search & Filter**: Advanced bookmark search capabilities
- **Custom Categories**: User-defined category rules
- **Export/Import**: Backup and restore functionality
- **Analytics**: Usage statistics and insights
- **Keyboard Shortcuts**: Power user navigation

### Technical Improvements
- **Service Worker**: Background processing for large datasets
- **Offline Support**: Cached categorization results
- **Sync**: Cross-device bookmark synchronization
- **Performance**: WebAssembly for heavy processing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation
- Contact the development team

## 🙏 Acknowledgments

- Chrome Extensions API for bookmark management
- React team for the amazing framework
- Vite for fast build tooling
- Tailwind CSS for utility-first styling
- All contributors and users of this extension 