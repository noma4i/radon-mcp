import { request } from 'https';
import { truncateChars } from '../lib/pagination.js';
import { validateNpmPackageName, validateReadmeLimit } from '../lib/validators.js';

export const DOCS_TOOLS = [
  {
    name: 'get_library_description',
    description: `Get npm package information including metadata, dependencies, and README.

USE CASES:
- Check library compatibility before adding to project
- Find peer dependencies for React Native libraries
- Read installation instructions from README

RESPONSE INCLUDES:
- Version, license, homepage, repository URL
- Dependencies and peer dependencies (important for RN!)
- README content (truncated by readmeLimit)

RELATED TOOLS:
- query_documentation: Search official RN/Expo docs
- view_application_logs: Check for errors after installing

EXAMPLES:
- Full info: {library_npm_name: "react-native-reanimated"}
- Quick lookup: {library_npm_name: "expo-camera", readmeLimit: 1000}`,
    inputSchema: {
      type: 'object',
      properties: {
        library_npm_name: {
          type: 'string',
          description: 'The npm package name exactly as published. Examples: "react-native-reanimated", "@react-navigation/native", "expo-camera"',
        },
        readmeLimit: {
          type: 'number',
          description: 'Max characters to include from README. Use smaller values (1000-2000) for quick lookups, larger (5000-10000) for installation guides.',
          default: 5000,
        },
      },
      required: ['library_npm_name'],
    },
  },
  {
    name: 'query_documentation',
    description: `Generate links to React Native or Expo documentation.

Returns URLs to official documentation pages. Use WebFetch to retrieve content.

RELATED TOOLS:
- get_library_description: Get npm package info and README
- view_application_logs: Debug after following docs`,
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Search query for documentation',
        },
        source: {
          type: 'string',
          enum: ['react-native', 'expo', 'both'],
          description: 'Documentation source to search',
          default: 'both',
        },
      },
      required: ['text'],
    },
  },
];

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = request(url, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

export async function getLibraryDescription(args) {
  const { library_npm_name } = args;
  const readmeLimit = validateReadmeLimit(args.readmeLimit);

  const nameCheck = validateNpmPackageName(library_npm_name);
  if (!nameCheck.valid) {
    return {
      content: [{ type: 'text', text: `Error: ${nameCheck.error}` }],
    };
  }

  try {
    const data = await httpsGet(`https://registry.npmjs.org/${encodeURIComponent(library_npm_name)}`);
    const pkg = JSON.parse(data);

    const latestVersion = pkg['dist-tags']?.latest;
    const latest = pkg.versions?.[latestVersion] || {};

    let text = `=== ${pkg.name} ===\n`;
    text += `Version: ${latestVersion}\n`;
    if (pkg.description) text += `Description: ${pkg.description}\n`;
    if (latest.license) text += `License: ${latest.license}\n`;
    if (pkg.homepage) text += `Homepage: ${pkg.homepage}\n`;
    if (pkg.repository?.url) text += `Repository: ${pkg.repository.url}\n`;

    if (pkg.keywords?.length) {
      text += `\nKeywords: ${pkg.keywords.slice(0, 10).join(', ')}\n`;
    }

    const deps = Object.keys(latest.dependencies || {});
    if (deps.length) {
      text += `\nDependencies (${deps.length}): ${deps.slice(0, 15).join(', ')}${deps.length > 15 ? '...' : ''}\n`;
    }

    const peerDeps = Object.keys(latest.peerDependencies || {});
    if (peerDeps.length) {
      text += `Peer Dependencies: ${peerDeps.join(', ')}\n`;
    }

    if (pkg.readme) {
      const truncated = truncateChars(pkg.readme, readmeLimit);
      text += `\n--- README ---\n${truncated}`;
    }

    return {
      content: [{ type: 'text', text }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error fetching package info: ${error.message}` }],
    };
  }
}

export async function queryDocumentation(args) {
  const { text, source = 'both' } = args;

  if (!text) {
    return {
      content: [{ type: 'text', text: 'Error: text is required' }],
    };
  }

  let responseText = `=== Documentation Search: "${text}" ===\n\n`;

  if (source === 'react-native' || source === 'both') {
    const url = `https://reactnative.dev/docs/${encodeURIComponent(text.toLowerCase().replace(/\s+/g, '-'))}`;
    responseText += `React Native:\n${url}\n\n`;
  }

  if (source === 'expo' || source === 'both') {
    const url = `https://docs.expo.dev/search/?q=${encodeURIComponent(text)}`;
    responseText += `Expo:\n${url}\n\n`;
  }

  responseText += `For detailed documentation, visit the URLs above or use WebFetch to retrieve content.`;

  return {
    content: [{ type: 'text', text: responseText }],
  };
}

export const DOCS_HANDLERS = {
  get_library_description: getLibraryDescription,
  query_documentation: queryDocumentation,
};
