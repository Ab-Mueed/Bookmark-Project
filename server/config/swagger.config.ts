import { SwaggerOptions } from 'swagger-ui-express';

export const swaggerOptions: SwaggerOptions = {
  openapi: '3.0.0',
  info: {
    title: 'Bookmark Categorization API',
    version: '1.0.0',
    description: 'API for categorizing bookmarks using AI',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  paths: {
    '/api/bookmarks/categorize': {
      post: {
        tags: ['Bookmarks'],
        summary: 'Categorize bookmarks',
        description: 'Accepts user\'s persona and list of bookmarks, returns categorized bookmarks',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['persona', 'bookmarks'],
                properties: {
                  persona: {
                    type: 'string',
                    description: 'User\'s persona or preferences',
                  },
                  bookmarks: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['url', 'title'],
                      properties: {
                        url: {
                          type: 'string',
                          description: 'URL of the bookmark',
                        },
                        title: {
                          type: 'string',
                          description: 'Title of the bookmark',
                        },
                        description: {
                          type: 'string',
                          description: 'Optional description of the bookmark',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Bookmarks successfully categorized',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    categories: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: {
                            type: 'string',
                            description: 'Category name',
                          },
                          bookmarks: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                url: {
                                  type: 'string',
                                },
                                title: {
                                  type: 'string',
                                },
                                description: {
                                  type: 'string',
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Bad request - Invalid input data',
          },
          '500': {
            description: 'Internal server error',
          },
        },
      },
    },
  },
}; 