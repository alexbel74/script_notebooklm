// Background Script for NotebookLM Importer
// Compatible with Chrome (MV3) and Firefox (MV2)

// ============================================
// Browser API Compatibility
// ============================================
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// ============================================
// Utilities
// ============================================
async function fetchWithTimeout(url, options = {}, timeout = 30000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

// ============================================
// NotebookLM API Client
// ============================================
const NotebookLMAPI = {
  BASE_URL: 'https://notebooklm.google.com',
  tokens: null,

  async getTokens(authuser = 0) {
    try {
      const url = authuser > 0
        ? `${this.BASE_URL}/?authuser=${authuser}&pageId=none`
        : this.BASE_URL;

      const response = await fetchWithTimeout(url, {
        credentials: 'include',
        redirect: 'manual'
      });

      if (!response.ok && response.type !== 'opaqueredirect') {
        throw new Error('Failed to fetch NotebookLM page');
      }

      const html = await response.text();
      const bl = this.extractToken('cfb2h', html);
      const at = this.extractToken('SNlM0e', html);

      if (!bl || !at) {
        throw new Error('Not authorized. Please login to NotebookLM first.');
      }

      this.tokens = { bl, at, authuser };
      return this.tokens;
    } catch (error) {
      console.error('getTokens error:', error);
      throw new Error('Please login to NotebookLM first');
    }
  },

  extractToken(key, html) {
    const regex = new RegExp(`"${key}":"([^"]+)"`);
    const match = regex.exec(html);
    return match ? match[1] : null;
  },

  async listNotebooks() {
    const response = await this.rpc('wXbhsf', [null, 1, null, [2]]);
    return this.parseNotebookList(response);
  },

  parseNotebookList(responseText) {
    try {
      const lines = responseText.split('\n');
      const dataLine = lines.find(line => line.includes('wrb.fr'));
      if (!dataLine) return [];

      const parsed = JSON.parse(dataLine);
      const innerData = JSON.parse(parsed[0][2]);

      if (!innerData || !innerData[0]) return [];

      return innerData[0]
        .filter(item => item && item.length >= 3)
        .filter(item => {
          const metadata = item[5];
          return !(Array.isArray(metadata) && metadata.length > 0 && metadata[0] === 3);
        })
        .map(item => ({
          id: item[2],
          name: item[0]?.trim() || 'Untitled notebook',
          sources: item[1]?.length || 0,
          emoji: item[3] || '📔'
        }));
    } catch (error) {
      console.error('parseNotebookList error:', error);
      return [];
    }
  },

  async createNotebook(title, emoji = '📔') {
    const response = await this.rpc('CCqFvf', [title]);
    const uuidMatch = response.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
    if (!uuidMatch) {
      throw new Error('Failed to create notebook');
    }
    return { id: uuidMatch[0], name: title, emoji };
  },

  async addSource(notebookId, url) {
    return this.addSources(notebookId, [url]);
  },

  async addSources(notebookId, urls) {
    const sources = urls.map(url => {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return [null, null, null, null, null, null, null, [url]];
      }
      return [null, null, [url]];
    });

    const response = await this.rpc('izAoDd', [sources, notebookId], `/notebook/${notebookId}`);
    return response;
  },

  async addTextSource(notebookId, text, title = 'Imported content') {
    const source = [[null, [title, text], null, null, null, null, null, null]];
    const response = await this.rpc('izAoDd', [source, notebookId, [2], null, null], `/notebook/${notebookId}`);
    return response;
  },

  async getNotebookStatus(notebookId) {
    const response = await this.rpc('rLM1Ne', [notebookId, null, [2]], `/notebook/${notebookId}`);
    return !response.includes(`null,\\"${notebookId}`);
  },

  async waitForSources(notebookId, maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      const ready = await this.getNotebookStatus(notebookId);
      if (ready) return true;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return false;
  },

  async getNotebook(notebookId) {
    const response = await this.rpc('rLM1Ne', [notebookId, null, [2], null, 0], `/notebook/${notebookId}`);
    return this.parseNotebookDetails(response);
  },

  parseNotebookDetails(responseText) {
    try {
      const lines = responseText.split('\n');
      const dataLine = lines.find(line => line.includes('wrb.fr'));
      if (!dataLine) return { sources: [] };

      const parsed = JSON.parse(dataLine);
      const innerData = JSON.parse(parsed[0][2]);

      if (!innerData || !innerData[0]) return { sources: [] };

      const notebookData = innerData[0];
      const sourcesArray = notebookData[3] || [];

      const sources = sourcesArray
        .filter(source => source && source[0])
        .map(source => {
          const sourceType = source[3]?.[0] || 0;
          const typeNames = {
            1: 'url',
            3: 'text',
            4: 'youtube',
            7: 'pdf',
            8: 'audio'
          };

          return {
            id: source[0],
            title: source[2] || 'Untitled',
            type: typeNames[sourceType] || 'unknown',
            typeCode: sourceType,
            url: source[3]?.[1] || null,
            status: source[4] || 0
          };
        });

      return {
        id: notebookData[0],
        title: notebookData[1],
        sources
      };
    } catch (error) {
      console.error('parseNotebookDetails error:', error);
      return { sources: [] };
    }
  },

  async deleteSource(notebookId, sourceId) {
    const response = await this.rpc('tGMBJ', [[[sourceId]]], `/notebook/${notebookId}`);
    return response;
  },

  async deleteSources(notebookId, sourceIds) {
    if (sourceIds.length === 0) {
      return { success: true, deletedCount: 0 };
    }

    const BATCH_SIZE = 20;
    let deletedCount = 0;

    for (let i = 0; i < sourceIds.length; i += BATCH_SIZE) {
      const batch = sourceIds.slice(i, i + BATCH_SIZE);
      const batchPayload = [batch.map(id => [id])];
      await this.rpc('tGMBJ', batchPayload, `/notebook/${notebookId}`);
      deletedCount += batch.length;
    }

    return { success: true, deletedCount };
  },

  async rpc(rpcId, params, sourcePath = '/') {
    if (!this.tokens) {
      await this.getTokens();
    }

    const url = new URL(`${this.BASE_URL}/_/LabsTailwindUi/data/batchexecute`);
    const reqId = Math.floor(Math.random() * 900000 + 100000).toString();

    url.searchParams.set('rpcids', rpcId);
    url.searchParams.set('source-path', sourcePath);
    url.searchParams.set('bl', this.tokens.bl);
    url.searchParams.set('_reqid', reqId);
    url.searchParams.set('rt', 'c');

    if (this.tokens.authuser > 0) {
      url.searchParams.set('authuser', this.tokens.authuser);
    }

    const body = new URLSearchParams({
      'f.req': JSON.stringify([[[rpcId, JSON.stringify(params), null, 'generic']]]),
      'at': this.tokens.at
    });

    const response = await fetchWithTimeout(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      credentials: 'include',
      body: body.toString()
    });

    if (!response.ok) {
      throw new Error(`RPC call failed: ${response.status}`);
    }

    return await response.text();
  },

  async listAccounts() {
    try {
      const response = await fetchWithTimeout(
        'https://accounts.google.com/ListAccounts?json=standard&source=ogb&md=1&cc=1&mn=1&mo=1&gpsia=1&fwput=860&listPages=1&origin=https%3A%2F%2Fwww.google.com',
        { credentials: 'include' }
      );

      const text = await response.text();
      const match = text.match(/postMessage\('([^']*)'\s*,\s*'https:/);
      if (!match) return [];

      const decoded = match[1]
        .replace(/\\x5b/g, '[')
        .replace(/\\x5d/g, ']')
        .replace(/\\x22/g, '"');

      const parsed = JSON.parse(decoded);
      const accounts = parsed[1] || [];

      return accounts
        .filter(acc => acc[3] && acc[3].includes('@'))
        .map((acc, idx) => ({
          name: acc[2] || null,
          email: acc[3] || null,
          avatar: acc[4] || null,
          isActive: acc[5] || false,
          isDefault: acc[6] || false,
          index: idx
        }));
    } catch (error) {
      console.error('listAccounts error:', error);
      return [];
    }
  },

  getNotebookUrl(notebookId, authuser = 0) {
    const base = `${this.BASE_URL}/notebook/${notebookId}`;
    return authuser > 0 ? `${base}?authuser=${authuser}` : base;
  }
};

// ============================================
// YouTube Playlist Parser
// ============================================
const YouTubePlaylistParser = {
  async getPlaylistVideos(playlistUrl) {
    try {
      const url = new URL(playlistUrl);
      const listId = url.searchParams.get('list');
      
      if (!listId) {
        throw new Error('Invalid playlist URL');
      }
      
      // Fetch playlist page
      const response = await fetch(`https://www.youtube.com/playlist?list=${listId}`);
      const html = await response.text();
      
      // Extract video IDs from ytInitialData
      const match = html.match(/var ytInitialData = ({.*?});/);
      if (!match) {
        throw new Error('Could not parse playlist data');
      }
      
      const data = JSON.parse(match[1]);
      const videos = [];
      
      // Navigate to playlist contents
      const contents = data?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]
        ?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]
        ?.itemSectionRenderer?.contents?.[0]
        ?.playlistVideoListRenderer?.contents || [];
      
      for (const item of contents) {
        if (item.playlistVideoRenderer) {
          const videoId = item.playlistVideoRenderer.videoId;
          if (videoId) {
            videos.push(`https://www.youtube.com/watch?v=${videoId}`);
          }
        }
      }
      
      // Limit to 50 videos
      return videos.slice(0, 50);
      
    } catch (error) {
      console.error('getPlaylistVideos error:', error);
      throw error;
    }
  }
};

// ============================================
// YouTube Comments Parser
// ============================================
const YouTubeCommentsAPI = {
  async getVideoMetadataFromDOM(tabId) {
    try {
      // Use tabs.executeScript for Firefox compatibility (MV2)
      if (browserAPI.scripting) {
        // Chrome MV3
        const results = await browserAPI.scripting.executeScript({
          target: { tabId },
          func: () => {
            const title = document.querySelector('h1.ytd-video-primary-info-renderer')?.textContent?.trim() 
              || document.querySelector('yt-formatted-string.ytd-video-primary-info-renderer')?.textContent?.trim()
              || document.title.replace(' - YouTube', '');
            
            const countEl = document.querySelector('#count .count-text, #comments #count');
            let commentCount = 0;
            if (countEl) {
              const match = countEl.textContent.match(/[\d,]+/);
              if (match) {
                commentCount = parseInt(match[0].replace(/,/g, ''), 10);
              }
            }
            
            const channelEl = document.querySelector('#channel-name a, ytd-channel-name a');
            const channel = channelEl?.textContent?.trim() || '';
            
            return { title, commentCount, channel };
          }
        });
        return results[0]?.result || { title: '', commentCount: 0, channel: '' };
      } else {
        // Firefox MV2
        const results = await browserAPI.tabs.executeScript(tabId, {
          code: `(function() {
            const title = document.querySelector('h1.ytd-video-primary-info-renderer')?.textContent?.trim() 
              || document.querySelector('yt-formatted-string.ytd-video-primary-info-renderer')?.textContent?.trim()
              || document.title.replace(' - YouTube', '');
            
            const countEl = document.querySelector('#count .count-text, #comments #count');
            let commentCount = 0;
            if (countEl) {
              const match = countEl.textContent.match(/[\\d,]+/);
              if (match) {
                commentCount = parseInt(match[0].replace(/,/g, ''), 10);
              }
            }
            
            const channelEl = document.querySelector('#channel-name a, ytd-channel-name a');
            const channel = channelEl?.textContent?.trim() || '';
            
            return { title, commentCount, channel };
          })();`
        });
        return results[0] || { title: '', commentCount: 0, channel: '' };
      }
    } catch (error) {
      console.error('getVideoMetadataFromDOM error:', error);
      return { title: '', commentCount: 0, channel: '' };
    }
  },

  async fetchAllComments(videoId, options = {}) {
    const { progressCallback, cancelToken, maxComments = 1000, mode = 'top', includeReplies = true } = options;
    
    const comments = [];
    let continuation = null;
    
    // Get initial data
    const initialUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const response = await fetch(initialUrl);
    const html = await response.text();
    
    // Extract ytInitialData
    const match = html.match(/var ytInitialData = ({.*?});/);
    if (!match) {
      throw new Error('Could not find initial data');
    }
    
    const initialData = JSON.parse(match[1]);
    
    // Find comments section
    const contents = initialData?.contents?.twoColumnWatchNextResults?.results?.results?.contents || [];
    let commentSection = null;
    
    for (const content of contents) {
      if (content.itemSectionRenderer?.sectionIdentifier === 'comment-item-section') {
        commentSection = content.itemSectionRenderer;
        break;
      }
    }
    
    if (!commentSection) {
      // Try to find continuation token for comments
      for (const content of contents) {
        if (content.itemSectionRenderer?.contents?.[0]?.continuationItemRenderer) {
          continuation = content.itemSectionRenderer.contents[0].continuationItemRenderer.continuationEndpoint?.continuationCommand?.token;
          break;
        }
      }
    }
    
    // Fetch comments using continuation
    while (continuation && (maxComments === 0 || comments.length < maxComments)) {
      if (cancelToken?.cancelled) break;
      
      const apiUrl = 'https://www.youtube.com/youtubei/v1/next?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8';
      const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: 'WEB',
              clientVersion: '2.20231101.00.00'
            }
          },
          continuation
        })
      });
      
      const data = await apiResponse.json();
      
      // Parse comments from response
      const actions = data?.onResponseReceivedEndpoints || [];
      let newContinuation = null;
      
      for (const action of actions) {
        const items = action?.reloadContinuationItemsCommand?.continuationItems 
          || action?.appendContinuationItemsAction?.continuationItems 
          || [];
        
        for (const item of items) {
          if (item.commentThreadRenderer) {
            const comment = this.parseComment(item.commentThreadRenderer);
            if (comment) {
              comments.push(comment);
              
              // Fetch replies if needed
              if (includeReplies && item.commentThreadRenderer.replies) {
                const repliesContinuation = item.commentThreadRenderer.replies.commentRepliesRenderer?.contents?.[0]?.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token;
                if (repliesContinuation) {
                  // TODO: Fetch replies
                }
              }
            }
          }
          
          if (item.continuationItemRenderer) {
            newContinuation = item.continuationItemRenderer.continuationEndpoint?.continuationCommand?.token;
          }
        }
      }
      
      continuation = newContinuation;
      
      if (progressCallback) {
        progressCallback({ fetched: comments.length, phase: 'fetching' });
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return comments;
  },

  parseComment(threadRenderer) {
    try {
      const comment = threadRenderer.comment?.commentRenderer;
      if (!comment) return null;
      
      const text = comment.contentText?.runs?.map(r => r.text).join('') || '';
      const author = comment.authorText?.simpleText || '';
      const likes = comment.voteCount?.simpleText || '0';
      const time = comment.publishedTimeText?.runs?.[0]?.text || '';
      
      return {
        author,
        text,
        likes,
        time,
        replies: []
      };
    } catch (error) {
      return null;
    }
  }
};

// ============================================
// Comments to Markdown Formatter
// ============================================
const CommentsToMd = {
  format(metadata, comments, options = {}) {
    const { lang = 'en' } = options;
    const parts = [];
    const MAX_CHARS = 450000; // NotebookLM limit
    
    let currentPart = '';
    let partIndex = 1;
    
    const header = `# ${metadata.title}\n\n**Channel:** ${metadata.channel}\n**Comments:** ${comments.length}\n\n---\n\n`;
    currentPart = header;
    
    for (const comment of comments) {
      const commentMd = `### ${comment.author}\n${comment.text}\n\n*${comment.likes} likes • ${comment.time}*\n\n---\n\n`;
      
      if (currentPart.length + commentMd.length > MAX_CHARS) {
        parts.push({
          title: `${metadata.title} - Comments Part ${partIndex}`,
          text: currentPart
        });
        partIndex++;
        currentPart = header + commentMd;
      } else {
        currentPart += commentMd;
      }
    }
    
    if (currentPart.length > header.length) {
      parts.push({
        title: parts.length > 0 ? `${metadata.title} - Comments Part ${partIndex}` : `${metadata.title} - Comments`,
        text: currentPart
      });
    }
    
    return parts;
  }
};

// ============================================
// State Management
// ============================================
let currentAuthuser = 0;
let parseState = {
  active: false,
  videoId: null,
  progress: { fetched: 0, total: null, phase: 'idle' },
  cancelToken: null,
  error: null,
  result: null
};

// ============================================
// Message Handler
// ============================================
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  handleMessage(request, sender)
    .then(sendResponse)
    .catch(error => {
      console.error('Message handler error:', error);
      sendResponse({ error: error.message });
    });
  return true;
});

async function handleMessage(request, sender) {
  const { cmd, ...params } = request;

  const storage = await browserAPI.storage.sync.get(['selectedAccount']);
  currentAuthuser = storage.selectedAccount || 0;

  const noTokenCommands = ['list-accounts', 'ping', 'get-current-tab', 'get-all-tabs', 'get-parse-status', 'cancel-parse'];

  if (!noTokenCommands.includes(cmd)) {
    try {
      await NotebookLMAPI.getTokens(currentAuthuser);
    } catch (error) {
      return { error: 'Please login to NotebookLM first' };
    }
  }

  switch (cmd) {
    case 'ping':
      return { ok: true };

    case 'list-accounts':
      const accounts = await NotebookLMAPI.listAccounts();
      return { accounts };

    case 'list-notebooks':
      const notebooks = await NotebookLMAPI.listNotebooks();
      return { notebooks };

    case 'create-notebook':
      const notebook = await NotebookLMAPI.createNotebook(params.title, params.emoji);
      return { notebook };

    case 'add-source':
      await NotebookLMAPI.addSource(params.notebookId, params.url);
      return { success: true };

    case 'import-playlist':
      const playlistVideos = await YouTubePlaylistParser.getPlaylistVideos(params.url);
      if (playlistVideos.length === 0) {
        return { error: 'No videos found in playlist' };
      }
      await NotebookLMAPI.addSources(params.notebookId, playlistVideos);
      await NotebookLMAPI.waitForSources(params.notebookId);
      return { 
        success: true, 
        count: playlistVideos.length,
        notebookUrl: NotebookLMAPI.getNotebookUrl(params.notebookId, currentAuthuser) 
      };

    case 'add-sources':
      await NotebookLMAPI.addSources(params.notebookId, params.urls);
      await NotebookLMAPI.waitForSources(params.notebookId);
      return { 
        success: true, 
        notebookUrl: NotebookLMAPI.getNotebookUrl(params.notebookId, currentAuthuser) 
      };

    case 'add-text-source':
      await NotebookLMAPI.addTextSource(params.notebookId, params.text, params.title);
      return { success: true };

    case 'get-current-tab':
      const [tab] = await browserAPI.tabs.query({ active: true, currentWindow: true });
      return { 
        tab: { 
          id: tab.id, 
          url: tab.url, 
          title: tab.title, 
          favIconUrl: tab.favIconUrl 
        } 
      };

    case 'get-all-tabs':
      const tabs = await browserAPI.tabs.query({});
      return {
        tabs: tabs
          .filter(t => t.url && t.url.startsWith('http'))
          .map(t => ({
            id: t.id,
            url: t.url,
            title: t.title,
            favIconUrl: t.favIconUrl,
            windowId: t.windowId
          }))
      };

    case 'get-notebook':
      const notebookDetails = await NotebookLMAPI.getNotebook(params.notebookId);
      return { notebook: notebookDetails };

    case 'get-sources':
      const nbDetails = await NotebookLMAPI.getNotebook(params.notebookId);
      return { sources: nbDetails.sources || [] };

    case 'delete-source':
      await NotebookLMAPI.deleteSource(params.notebookId, params.sourceId);
      return { success: true };

    case 'delete-sources':
      const deleteResult = await NotebookLMAPI.deleteSources(params.notebookId, params.sourceIds);
      return { success: true, successCount: deleteResult.deletedCount };

    case 'get-parse-status':
      return {
        active: parseState.active,
        videoId: parseState.videoId,
        progress: parseState.progress,
        error: parseState.error,
        result: parseState.result
      };

    case 'cancel-parse':
      if (parseState.cancelToken) {
        parseState.cancelToken.cancelled = true;
        parseState.progress.phase = 'cancelled';
        parseState.active = false;
      }
      return { success: true };

    case 'parse-comments':
      if (parseState.active) {
        return { error: 'Parse already in progress' };
      }
      doParseComments(params.notebookId, params.videoId, params.tabId);
      return { started: true };

    default:
      return { error: `Unknown command: ${cmd}` };
  }
}

// ============================================
// Parse Comments (Fire and Forget)
// ============================================
async function doParseComments(notebookId, videoId, tabId) {
  const cancelToken = { cancelled: false };
  parseState = {
    active: true,
    videoId,
    progress: { fetched: 0, total: null, phase: 'fetching' },
    cancelToken,
    error: null,
    result: null
  };

  try {
    const metadata = await YouTubeCommentsAPI.getVideoMetadataFromDOM(tabId);
    parseState.progress.total = metadata.commentCount;

    if (cancelToken.cancelled) return;

    const settings = await browserAPI.storage.local.get(['commentsMode', 'commentsLimit', 'commentsIncludeReplies']);
    const mode = settings.commentsMode || 'top';
    const includeReplies = settings.commentsIncludeReplies !== undefined ? settings.commentsIncludeReplies : true;
    const maxComments = mode === 'top' ? 0 : (settings.commentsLimit || 1000);

    const comments = await YouTubeCommentsAPI.fetchAllComments(videoId, {
      progressCallback: ({ fetched, phase }) => {
        parseState.progress.fetched = fetched;
        parseState.progress.phase = phase;
      },
      cancelToken,
      mode,
      maxComments,
      includeReplies
    });

    if (cancelToken.cancelled) return;

    parseState.progress.phase = 'formatting';
    const storage = await browserAPI.storage.sync.get(['language']);
    const lang = storage.language || 'en';
    const parts = CommentsToMd.format(metadata, comments, { lang });

    if (cancelToken.cancelled) return;

    parseState.progress.phase = 'sending';
    await NotebookLMAPI.getTokens(currentAuthuser);
    
    for (let i = 0; i < parts.length; i++) {
      if (cancelToken.cancelled) return;
      await NotebookLMAPI.addTextSource(notebookId, parts[i].text, parts[i].title);
    }

    parseState.progress.phase = 'done';
    parseState.result = {
      commentCount: comments.length,
      totalComments: metadata.commentCount,
      partCount: parts.length,
      videoTitle: metadata.title
    };
  } catch (e) {
    console.error('doParseComments error:', e);
    parseState.progress.phase = 'error';
    parseState.error = { code: e.code || 'UNKNOWN', message: e.message };
  } finally {
    parseState.active = false;
  }
}

// ============================================
// Context Menu
// ============================================
browserAPI.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    browserAPI.storage.sync.set({
      selectedAccount: 0,
      lastNotebook: null,
      theme: 'dark',
      language: 'en'
    });
  }

  browserAPI.contextMenus.removeAll(() => {
    browserAPI.contextMenus.create({
      id: 'add-to-notebooklm',
      title: '📔 Add to NotebookLM',
      contexts: ['page', 'link']
    });
  });
});

browserAPI.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'add-to-notebooklm') {
    const url = info.linkUrl || info.pageUrl;
    
    await browserAPI.storage.local.set({
      pendingUrl: url,
      pendingTitle: tab.title
    });

    browserAPI.tabs.create({
      url: browserAPI.runtime.getURL(`app/app.html?url=${encodeURIComponent(url)}`)
    });
  }
});

console.log('NotebookLM Importer: Background script started');
