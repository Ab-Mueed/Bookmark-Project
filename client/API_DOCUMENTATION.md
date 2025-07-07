# Backend API Documentation

This document specifies the exact JSON structure that your backend API must implement to work with the Bookmark Categorizer Chrome extension.

## 🔗 API Endpoint

```
POST /api/bookmarks/categorize
Content-Type: application/json
```

## 📤 Request Format

### Complete Request Example
```json
{
  "userContext": {
    "persona": "React, AI, Marketing, Design, Finance, TypeScript, Web Development",
    "preferred_structure": "nested_folders"
  },
  "bookmarks": [
    {
      "title": "React Documentation",
      "url": "https://react.dev",
      "description": "Official React documentation and guides for building user interfaces with React components, hooks, and modern patterns",
      "id": "12345",
      "dateAdded": 1703123456789,
      "parentId": "67890"
    },
    {
      "title": "OpenAI API Guide",
      "url": "https://platform.openai.com/docs",
      "description": "Comprehensive guide to using OpenAI's API for AI applications, including authentication, endpoints, and best practices",
      "id": "12346",
      "dateAdded": 1703123456790,
      "parentId": "67891"
    },
    {
      "title": "Tailwind CSS Documentation",
      "url": "https://tailwindcss.com/docs",
      "description": "Utility-first CSS framework documentation with examples, configuration options, and component patterns",
      "id": "12347",
      "dateAdded": 1703123456791,
      "parentId": "67892"
    }
  ]
}
```

### Request Field Details

#### userContext Object
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `persona` | string | Comma-separated list of user interests and expertise areas | `"React, AI, Marketing, Design, Finance"` |
| `preferred_structure` | string | Either `"flat_folders"` or `"nested_folders"` | `"nested_folders"` |

#### bookmarks Array
Each bookmark object contains:

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `title` | string | ✅ | Bookmark title | `"React Documentation"` |
| `url` | string | ✅ | Bookmark URL | `"https://react.dev"` |
| `description` | string | ✅ | Page description (fetched from meta tags) | `"Official React documentation..."` |
| `id` | string | ❌ | Chrome bookmark ID | `"12345"` |
| `dateAdded` | number | ❌ | Timestamp when bookmark was added | `1703123456789` |
| `parentId` | string | ❌ | Parent folder ID in Chrome | `"67890"` |

## 📥 Response Format

### Complete Response Example
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
    },
    {
      "title": "Tailwind CSS Documentation",
      "url": "https://tailwindcss.com/docs",
      "category": ["Design", "Development", "CSS"],
      "summary": "Utility-first CSS framework documentation for rapid UI development with pre-built utility classes"
    }
  ]
}
```

### Response Field Details

#### bookmarks Array
Each categorized bookmark object contains:

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `title` | string | ✅ | Bookmark title (can be modified) | `"React Documentation"` |
| `url` | string | ✅ | Bookmark URL | `"https://react.dev"` |
| `category` | string \| string[] | ✅ | Category or nested categories | `["Learning", "Development", "React"]` |
| `summary` | string | ✅ | AI-generated one-line summary | `"Official React documentation..."` |

### Category Structure Rules

#### For `preferred_structure: "flat_folders"`
```json
{
  "category": "React"
}
```

#### For `preferred_structure: "nested_folders"`
```json
{
  "category": ["Learning", "Development", "React"]
}
```

## 🔄 Structure Mapping

The frontend maps the `preferred_structure` parameter as follows:

| Frontend Value | Backend Expected Value |
|----------------|----------------------|
| `"flattened"` | `"flat_folders"` |
| `"nested"` | `"nested_folders"` |

## ⚠️ Error Handling

### Error Response Format
```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes
- `200`: Successful categorization
- `400`: Invalid request format or missing required fields
- `500`: Server error or AI processing failure

### Common Error Scenarios
```json
// Missing required fields
{
  "error": "Missing required field: bookmarks"
}

// Invalid structure preference
{
  "error": "Invalid preferred_structure. Must be 'flat_folders' or 'nested_folders'"
}

// AI processing error
{
  "error": "Failed to categorize bookmarks: AI service unavailable"
}
```

## 🧪 Testing Examples

### Test Case 1: Flattened Structure
**Request:**
```json
{
  "userContext": {
    "persona": "Web Development, Design",
    "preferred_structure": "flat_folders"
  },
  "bookmarks": [
    {
      "title": "CSS Grid Guide",
      "url": "https://css-tricks.com/snippets/css/complete-guide-grid/",
      "description": "Complete guide to CSS Grid layout system"
    }
  ]
}
```

**Expected Response:**
```json
{
  "bookmarks": [
    {
      "title": "CSS Grid Guide",
      "url": "https://css-tricks.com/snippets/css/complete-guide-grid/",
      "category": "CSS",
      "summary": "Comprehensive guide to CSS Grid layout system for modern web design"
    }
  ]
}
```

### Test Case 2: Nested Structure
**Request:**
```json
{
  "userContext": {
    "persona": "Software Engineering, AI, Machine Learning",
    "preferred_structure": "nested_folders"
  },
  "bookmarks": [
    {
      "title": "TensorFlow Tutorial",
      "url": "https://www.tensorflow.org/tutorials",
      "description": "Official TensorFlow tutorials and guides"
    }
  ]
}
```

**Expected Response:**
```json
{
  "bookmarks": [
    {
      "title": "TensorFlow Tutorial",
      "url": "https://www.tensorflow.org/tutorials",
      "category": ["AI", "Machine Learning", "TensorFlow"],
      "summary": "Official TensorFlow tutorials and guides for machine learning development"
    }
  ]
}
```

## 🔧 Implementation Notes

### Required Backend Features
1. **AI Integration**: Use Gemini or similar AI service for categorization
2. **Persona Processing**: Parse comma-separated persona string for context
3. **Structure Logic**: Handle both flat and nested categorization
4. **Summary Generation**: Create concise, descriptive summaries
5. **Error Handling**: Proper HTTP status codes and error messages

### Performance Considerations
- **Batch Processing**: Handle multiple bookmarks efficiently
- **Rate Limiting**: Implement appropriate delays for AI API calls
- **Caching**: Cache similar categorization requests
- **Timeout Handling**: Set reasonable timeouts for AI processing

### Security Considerations
- **Input Validation**: Validate all incoming data
- **CORS**: Configure CORS for Chrome extension origin
- **Rate Limiting**: Prevent abuse of the API
- **Error Sanitization**: Don't expose sensitive information in errors

## 📋 Checklist for Backend Implementation

- [ ] Endpoint: `POST /api/bookmarks/categorize`
- [ ] Accept JSON with `userContext` and `bookmarks` fields
- [ ] Process `persona` string for AI context
- [ ] Handle `preferred_structure` parameter
- [ ] Integrate AI service for categorization
- [ ] Generate summaries for each bookmark
- [ ] Return proper JSON response format
- [ ] Implement error handling with status codes
- [ ] Configure CORS for Chrome extension
- [ ] Add input validation
- [ ] Test with provided examples
- [ ] Document API endpoints
- [ ] Set up monitoring and logging 