// AI Dock Conversation Sidebar - ENHANCED with Folder Management
// UI component for managing saved conversations and organizing them into folders

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Clock,
  X,
  Loader2,
  Check,
  Folder,
  FolderPlus,
  MoreVertical
} from 'lucide-react';
import { conversationService } from '../../services/conversationService';
import { projectService } from '../../services/projectService';
import { 
  ConversationSummary, 
  ConversationListResponse,
  ConversationServiceError 
} from '../../types/conversation';
import { ProjectSummary } from '../../types/project';
import { formatConversationTimestamp } from '../../utils/chatHelpers';

interface ConversationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (conversationId: number) => void;
  onCreateNew: () => void;
  currentConversationId?: number;
  onConversationUpdate?: (conversationId: number, messageCount: number) => void;
  refreshTrigger?: number;
  onSidebarReady?: (updateFn: (id: number, count: number, backendData?: Partial<ConversationSummary>) => void, addFn: (conv: any) => void) => void;
  isStreaming?: boolean;
  embedded?: boolean;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  isOpen,
  onClose,
  onSelectConversation,
  onCreateNew,
  currentConversationId,
  refreshTrigger,
  onSidebarReady,
  isStreaming = false,
  embedded = false
}) => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const conversationsRef = useRef<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ConversationSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // NEW: Folder management state
  const [folders, setFolders] = useState<ProjectSummary[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [showFolderDropdown, setShowFolderDropdown] = useState<number | null>(null);
  const [assigningToFolder, setAssigningToFolder] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{top: number, left: number} | null>(null);
  
  // 🔧 FIXED: Improved dropdown click handling - no timing delays needed
  useEffect(() => {
    if (showFolderDropdown !== null) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        // Check if click is outside both the dropdown button and dropdown menu
        if (!target.closest('.folder-dropdown-container') && 
            !target.closest('.folder-dropdown-menu')) {
          setShowFolderDropdown(null);
        }
      };
      
      // Add listener on next tick to avoid immediate closure
      const timer = requestAnimationFrame(() => {
        document.addEventListener('click', handleClickOutside);
      });
      
      return () => {
        cancelAnimationFrame(timer);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [showFolderDropdown]);
  
  useEffect(() => {
    if (isOpen) {
      loadConversations();
      loadFolders();
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0 && isOpen) {
      console.log('🔄 Refreshing conversations due to trigger:', refreshTrigger);
      loadConversations();
      loadFolders(); // Also reload folders to get updated conversation counts
    }
  }, [refreshTrigger, isOpen]);
  
  useEffect(() => {
    if (searchQuery.trim()) {
      searchConversations();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);
  
  // NEW: Load available folders
  const loadFolders = useCallback(async () => {
    try {
      setLoadingFolders(true);
      const data = await projectService.getProjects();
      setFolders(data);
    } catch (error) {
      console.error('❌ Failed to load folders:', error);
    } finally {
      setLoadingFolders(false);
    }
  }, []);
  
  // NEW: Handle folder assignment
  const handleAssignToFolder = useCallback(async (conversationId: number, folderId: number | null) => {
    try {
      setAssigningToFolder(conversationId);
      
      // Find current conversation
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;
      
      console.log('📏 Frontend: Assigning conversation', conversationId, 'to folder', folderId);
      
      // If conversation is currently in a folder, remove it first
      if (conversation.project?.id) {
        console.log('  - Removing from current folder:', conversation.project.name);
        await projectService.removeConversationFromProject(conversation.project.id, conversationId);
      }
      
      // If assigning to a new folder (not removing), add it
      if (folderId) {
        console.log('  - Adding to new folder:', folderId);
        await projectService.addConversationToProject(folderId, conversationId);
      }
      
      console.log('✅ Folder assignment complete');
      console.log('✅ Successfully updated conversation folder assignment');
      
    } catch (error) {
      console.error('❌ Failed to assign conversation to folder:', error);
      setError('Failed to update folder assignment');
    } finally {
      setAssigningToFolder(null);
      setShowFolderDropdown(null);
      
      // 🔧 FIXED: Trigger refresh after assignment by re-calling load functions
      setTimeout(() => {
        // Force re-render by clearing and reloading conversations
        setConversations([]);
        setFolders([]);
        setIsLoading(true);
        setLoadingFolders(true);
        
        // This will trigger a fresh load
        const refreshData = async () => {
          try {
            // Refresh conversations
            const response = await conversationService.getConversations({ limit: 50, offset: 0 });
            setConversations(response.conversations);
            conversationsRef.current = response.conversations;
            setTotalCount(response.total_count);
            setHasMore(response.has_more);
            
            // Refresh folders
            const folderData = await projectService.getProjects();
            setFolders(folderData);
            
            console.log('🔄 Refreshed conversations and folders after folder assignment');
          } catch (error) {
            console.error('Failed to refresh data:', error);
          } finally {
            setIsLoading(false);
            setLoadingFolders(false);
          }
        };
        
        refreshData();
      }, 100); // Small delay to ensure backend is updated
    }
  }, [conversations]);
  
  const updateConversationMessageCount = useCallback((conversationId: number, newMessageCount: number) => {
    const updateConversation = (conv: ConversationSummary) => 
      conv.id === conversationId ? { ...conv, message_count: newMessageCount } : conv;
    
    setConversations(prev => {
      const updated = prev.map(updateConversation);
      conversationsRef.current = updated;
      return updated;
    });
    setSearchResults(prev => prev.map(updateConversation));
  }, []);

  const moveConversationToTop = useCallback((conversationId: number, newMessageCount: number, backendData?: Partial<ConversationSummary>) => {
    const updateConversation = (conv: ConversationSummary) => {
      if (conv.id !== conversationId) return conv;
      
      const updatedConv = { 
        ...conv, 
        message_count: newMessageCount,
        ...(backendData?.last_message_at && { last_message_at: backendData.last_message_at }),
        ...(backendData?.updated_at && { updated_at: backendData.updated_at })
      };
      
      return updatedConv;
    };
    
    setConversations(prev => {
      const updated = prev.map(updateConversation);
      const sorted = updated.sort((a, b) => {
        const dateA = new Date(a.last_message_at || a.updated_at || a.created_at);
        const dateB = new Date(b.last_message_at || b.updated_at || b.created_at);
        return dateB.getTime() - dateA.getTime();
      });
      conversationsRef.current = sorted;
      return sorted;
    });
    
    setSearchResults(prev => prev.map(updateConversation));
  }, []);
  
  const addNewConversation = useCallback((newConversation: ConversationSummary) => {
    setConversations(prev => {
      const exists = prev.some(conv => conv.id === newConversation.id);
      let updated;
      if (exists) {
        updated = prev.map(conv => conv.id === newConversation.id ? newConversation : conv);
      } else {
        updated = [newConversation, ...prev];
      }
      conversationsRef.current = updated;
      return updated;
    });
    setTotalCount(prev => prev + 1);
  }, []);
  
  useEffect(() => {
    if (onSidebarReady) {
      onSidebarReady(moveConversationToTop, addNewConversation);
    }
  }, [onSidebarReady, moveConversationToTop, addNewConversation]);
  
  const loadConversations = useCallback(async (append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      
      // Use ref to get current length without dependency
      const offset = append ? conversationsRef.current.length : 0;
      const response: ConversationListResponse = await conversationService.getConversations({
        limit: 50,
        offset
      });
      
      // 🔧 DEBUG: Log conversation data to check for project info
      console.log('📊 Frontend: Received conversations:', response.conversations.length);
      response.conversations.slice(0, 5).forEach(conv => {
        console.log(`  - Conversation ${conv.id}: "${conv.title}"`);
        console.log(`    project_id: ${conv.project_id}`);
        console.log(`    project: ${conv.project ? JSON.stringify(conv.project) : 'null'}`);
        if (conv.project_id && !conv.project) {
          console.warn(`    ⚠️ Conversation has project_id but no project object!`);
        }
      });
      
      // Count conversations with and without folders
      const withFolders = response.conversations.filter(c => c.project?.name).length;
      const withProjectId = response.conversations.filter(c => c.project_id).length;
      console.log(`📁 Folder Summary: ${withFolders}/${response.conversations.length} have folder names, ${withProjectId} have project_id`);
      
      if (append) {
        const newConversations = [...conversationsRef.current, ...response.conversations];
        setConversations(newConversations);
        conversationsRef.current = newConversations;
      } else {
        setConversations(response.conversations);
        conversationsRef.current = response.conversations;
      }
      
      setTotalCount(response.total_count);
      setHasMore(response.has_more);
      
    } catch (error) {
      console.error('❌ Failed to load conversations:', error);
      setError(error instanceof ConversationServiceError ? error.message : 'Failed to load conversations');
    } finally {
      if (append) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);
  
  const searchConversations = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      const results = await conversationService.searchConversations({
        query: searchQuery.trim(),
        limit: 20
      });
      setSearchResults(results);
    } catch (error) {
      console.error('❌ Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);
  
  const handleSelectConversation = (conversationId: number) => {
    if (isStreaming) {
      console.log('🚫 Cannot switch conversations while AI is streaming a response');
      return;
    }
    onSelectConversation(conversationId);
  };
  
  const handleDeleteConversation = async (conversationId: number) => {
    try {
      await conversationService.deleteConversation(conversationId);
      setConversations(prev => {
        const filtered = prev.filter(c => c.id !== conversationId);
        conversationsRef.current = filtered;
        return filtered;
      });
      setSearchResults(prev => prev.filter(c => c.id !== conversationId));
      setSelectedForDelete(null);
    } catch (error) {
      console.error('❌ Failed to delete conversation:', error);
      setError(error instanceof ConversationServiceError ? error.message : 'Failed to delete conversation');
    }
  };
  
  const handleEditTitle = async (conversationId: number) => {
    if (!newTitle.trim()) {
      setEditingTitle(null);
      return;
    }
    
    try {
      const updated = await conversationService.updateConversation(conversationId, {
        title: newTitle.trim()
      });
      
      const updateConversation = (conv: ConversationSummary) => 
        conv.id === conversationId ? { ...conv, title: updated.title } : conv;
      
      setConversations(prev => {
        const mapped = prev.map(updateConversation);
        conversationsRef.current = mapped;
        return mapped;
      });
      setSearchResults(prev => prev.map(updateConversation));
      setEditingTitle(null);
      setNewTitle('');
    } catch (error) {
      console.error('❌ Failed to update title:', error);
      setError(error instanceof ConversationServiceError ? error.message : 'Failed to update conversation title');
    }
  };
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
    
    if (isNearBottom && hasMore && !isLoadingMore && !isLoading && !searchQuery.trim()) {
      loadConversations(true);
    }
  }, [hasMore, isLoadingMore, isLoading, searchQuery, loadConversations]);

  const groupConversationsByTime = useCallback((conversations: ConversationSummary[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const groups = {
      today: [] as ConversationSummary[],
      yesterday: [] as ConversationSummary[],
      thisWeek: [] as ConversationSummary[],
      thisMonth: [] as ConversationSummary[],
      older: [] as ConversationSummary[]
    };

    const sortedConversations = [...conversations].sort((a, b) => {
      const dateA = new Date(a.last_message_at || a.updated_at || a.created_at);
      const dateB = new Date(b.last_message_at || b.updated_at || b.created_at);
      return dateB.getTime() - dateA.getTime();
    });

    sortedConversations.forEach(conversation => {
      const conversationDate = new Date(conversation.last_message_at || conversation.updated_at || conversation.created_at);
      
      if (conversationDate >= today) {
        groups.today.push(conversation);
      } else if (conversationDate >= yesterday) {
        groups.yesterday.push(conversation);
      } else if (conversationDate >= thisWeek) {
        groups.thisWeek.push(conversation);
      } else if (conversationDate >= thisMonth) {
        groups.thisMonth.push(conversation);
      } else {
        groups.older.push(conversation);
      }
    });

    return groups;
  }, []);

  const displayConversations = searchQuery.trim() ? searchResults : conversations;
  const groupedConversations = !searchQuery.trim() ? groupConversationsByTime(displayConversations) : null;

  // NEW: Render folder dropdown menu
  const renderFolderDropdown = (conversation: ConversationSummary) => {
    if (showFolderDropdown !== conversation.id) return null;

    return (
      <>
        {/* Backdrop to catch clicks */}
        <div 
          className="fixed inset-0 z-[9998]" 
          onClick={() => setShowFolderDropdown(null)}
        />
        {/* Dropdown menu */}
        <div className="fixed w-56 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200 z-[9999] folder-dropdown-menu"
             onClick={(e) => e.stopPropagation()}
             style={{
               top: dropdownPosition?.top || '20%',
               left: dropdownPosition?.left || '1rem',
               maxHeight: '70vh',
               overflowY: 'auto',
               transform: 'translateY(-50%)' // Center vertically relative to click point
             }}>
          <div className="py-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide border-b border-gray-200">
              Move to Folder
            </div>
          
          {/* No folder option */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log('Clicked No Folder!');
              handleAssignToFolder(conversation.id, null);
            }}
            className={`flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 transition-colors cursor-pointer ${
              !conversation.project ? 'text-gray-900 font-medium' : 'text-gray-700'
            }`}
            disabled={assigningToFolder === conversation.id}
          >
            <X className="w-4 h-4 mr-2" />
            No Folder
            {!conversation.project && <span className="ml-auto text-xs">✓</span>}
          </button>
          
          <div className="border-t border-gray-200 my-1"></div>
          
          {/* Folder options */}
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log(`Clicked folder: ${folder.name}`);
                handleAssignToFolder(conversation.id, folder.id);
              }}
              className={`flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 transition-colors cursor-pointer ${
                conversation.project?.id === folder.id ? 'text-gray-900 font-medium' : 'text-gray-700'
              }`}
              disabled={assigningToFolder === conversation.id}
            >
              <span className="w-4 h-4 mr-2 text-center">{folder.icon || '📁'}</span>
              <span className="truncate">{folder.name}</span>
              {conversation.project?.id === folder.id && <span className="ml-auto text-xs">✓</span>}
            </button>
          ))}
          
          {folders.length === 0 && (
            <div className="px-3 py-4 text-center text-xs text-gray-500">
              No folders available
            </div>
          )}
          
          {/* Close button for testing */}
          <div className="border-t border-gray-200 mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowFolderDropdown(null);
              }}
              className="w-full px-3 py-2 text-xs text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
          </div>
          </div>
        </div>
      </>
    );
  };

  const renderConversationItem = (conversation: ConversationSummary) => (
    <div
      key={conversation.id}
      className={`group relative mx-2 mb-1 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        currentConversationId === conversation.id
          ? 'bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 shadow-lg'
          : isStreaming
          ? 'bg-white/5 backdrop-blur-sm border border-white/10 opacity-60 cursor-not-allowed'
          : 'hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 hover:shadow-lg'
      }`}
      onClick={() => {
        if (!isStreaming) {
          onSelectConversation(conversation.id);
        }
      }}
      title={isStreaming ? 'Cannot switch conversations while AI is responding' : undefined}
    >
      {editingTitle === conversation.id ? (
        <div className="flex items-center space-x-2 mb-1" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleEditTitle(conversation.id);
              } else if (e.key === 'Escape') {
                setEditingTitle(null);
                setNewTitle('');
              }
            }}
            className="flex-1 px-2 py-1 text-sm font-medium border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
            placeholder="Conversation title"
            autoFocus
          />
          <button
            onClick={() => handleEditTitle(conversation.id)}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
            title="Save"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              setEditingTitle(null);
              setNewTitle('');
            }}
            className="p-1 text-gray-500 hover:bg-gray-50 rounded"
            title="Cancel"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <h3 className="text-sm font-medium text-white truncate mb-1">
          {conversation.title}
        </h3>
      )}

      <div className="flex items-center space-x-3 text-xs text-blue-300">
        <div className="flex items-center">
          <MessageSquare className="w-3 h-3 mr-1" />
          <span>{conversation.message_count} message{conversation.message_count !== 1 ? 's' : ''}</span>
        </div>
        
        <div className="flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          <span>{formatConversationTimestamp(conversation.last_message_at || conversation.updated_at)}</span>
        </div>
        
        {conversation.project?.name && (
          <div className="flex items-center text-blue-400 font-medium">
            <span className="text-blue-500 mr-1">📁</span>
            <span>{conversation.project.name}</span>
          </div>
        )}
      </div>

      {!isStreaming && editingTitle !== conversation.id && (
        <div 
          className={`flex items-center space-x-1 transition-opacity absolute top-3 right-3 ${
            showFolderDropdown === conversation.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          onClick={(e) => e.stopPropagation()} // Prevent conversation selection when clicking action buttons
        >
          {/* Folder assignment button - FIXED dropdown behavior */}
           <div className="relative folder-dropdown-container">
            <button
              onClick={(e) => {
                e.stopPropagation();
                
                // Calculate position near the clicked button
                const rect = e.currentTarget.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                const dropdownWidth = 224; // 56 * 4 (w-56 in Tailwind)
                const dropdownHeight = 300; // Approximate max height
                
                // Position to the left of the button, but keep on screen
                let left = rect.left - dropdownWidth - 8; // 8px gap
                let top = rect.top + (rect.height / 2); // Center on button
                
                // Keep dropdown on screen horizontally
                if (left < 16) {
                  left = rect.right + 8; // Show to the right instead
                }
                if (left + dropdownWidth > viewportWidth - 16) {
                  left = viewportWidth - dropdownWidth - 16;
                }
                
                // Keep dropdown on screen vertically
                if (top - dropdownHeight/2 < 16) {
                  top = 16 + dropdownHeight/2;
                }
                if (top + dropdownHeight/2 > viewportHeight - 16) {
                  top = viewportHeight - dropdownHeight/2 - 16;
                }
                
                setDropdownPosition({ top, left });
                
                if (showFolderDropdown === conversation.id) {
                  setShowFolderDropdown(null);
                } else {
                  setShowFolderDropdown(conversation.id);
                }
              }}
              className="p-1 text-blue-300 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Move to folder"
              disabled={assigningToFolder === conversation.id}
            >
              {assigningToFolder === conversation.id ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : conversation.project ? (
                <Folder className="w-3 h-3" />
              ) : (
                <FolderPlus className="w-3 h-3" />
              )}
            </button>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingTitle(conversation.id);
              setNewTitle(conversation.title);
            }}
            className="p-1 text-blue-300 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Rename conversation"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedForDelete(conversation.id);
            }}
            className="p-1 text-blue-300 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
            title="Delete conversation"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}

      {selectedForDelete === conversation.id && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm rounded-lg border border-red-400/30 flex items-center justify-center z-10">
          <div className="text-center p-3">
            <p className="text-white text-sm mb-2 font-medium">
              Delete "{conversation.title}"?
            </p>
            <p className="text-blue-300 text-xs mb-3">
              This action cannot be undone.
            </p>
            <div className="flex space-x-2 justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConversation(conversation.id);
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md transition-colors"
              >
                Delete
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedForDelete(null);
                }}
                className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTimeGroup = (title: string, conversations: ConversationSummary[]) => {
    if (conversations.length === 0) return null;
    
    return (
      <div key={title} className="mb-4">
        <div className="px-4 py-2 text-xs font-semibold text-blue-300 uppercase tracking-wide">
          {title}
        </div>
        <div className="py-1">
          {conversations.map(renderConversationItem)}
        </div>
      </div>
    );
  };
  
  if (!isOpen) return null;

  const content = (
    <>
      <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-lg shadow-md">
            <MessageSquare className="w-4 h-4 text-blue-200" />
          </div>
          <h2 className="text-lg font-semibold text-white">Conversations</h2>
          {totalCount > 0 && (
            <span className="px-2 py-1 text-xs bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 text-blue-200 rounded-full">
              {totalCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={isStreaming ? undefined : onCreateNew}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isStreaming
                ? 'text-blue-400 cursor-not-allowed opacity-50'
                : 'text-blue-200 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:scale-105 transform'
            }`}
            title={isStreaming ? 'Cannot create new conversation while AI is responding' : 'New conversation'}
            disabled={isStreaming}
          >
            <Plus className="w-4 h-4" />
          </button>
          {!embedded && (
            <button
              onClick={onClose}
              className="p-2 text-blue-200 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg transition-all duration-200 hover:scale-105 transform"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="p-4 border-b border-white/10 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-sm text-white placeholder-blue-300 transition-all duration-200"
          />
          
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-blue-300" />
          )}
        </div>
      </div>
      
      {error && (
        <div className="p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 mx-4 mt-4 rounded-xl flex-shrink-0">
          <p className="text-red-200 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-300 hover:text-red-100 text-xs mt-1 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
      
      <div 
        className="flex-1 overflow-y-auto min-h-0 scroll-smooth conversation-scrollbar"
        onScroll={handleScroll}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-300" />
            <span className="ml-2 text-blue-200">Loading conversations...</span>
          </div>
        ) : displayConversations.length === 0 ? (
          <div className="text-center py-8 px-4">
            {searchQuery.trim() ? (
              <div>
                <div className="flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg mx-auto mb-4">
                  <Search className="w-8 h-8 text-blue-300" />
                </div>
                <p className="text-white font-medium">No conversations found</p>
                <p className="text-blue-300 text-sm mt-1">Try a different search term</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-blue-300" />
                </div>
                <p className="text-white font-medium">No conversations yet</p>
                <p className="text-blue-300 text-sm mt-1">Start chatting to save conversations</p>
                <button
                  onClick={onCreateNew}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-medium"
                >
                  Start New Chat
                </button>
              </div>
            )}
          </div>
        ) : groupedConversations ? (
          <div className="py-2">
            {renderTimeGroup('Today', groupedConversations.today)}
            {renderTimeGroup('Yesterday', groupedConversations.yesterday)}
            {renderTimeGroup('This Week', groupedConversations.thisWeek)}
            {renderTimeGroup('This Month', groupedConversations.thisMonth)}
            {renderTimeGroup('Older', groupedConversations.older)}
            
            {isLoadingMore && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-blue-300" />
                <span className="ml-2 text-sm text-blue-200">Loading more...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="py-2">
            {displayConversations.map(renderConversationItem)}
          </div>
        )}
      </div>
      
      {!isLoading && conversations.length > 0 && (
        <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-lg flex-shrink-0">
          <p className="text-xs text-blue-300 text-center">
            {searchQuery.trim() ? (
              `${searchResults.length} search results`
            ) : (
              `${conversations.length} of ${totalCount} conversations`
            )}
          </p>
          
          {hasMore && !searchQuery.trim() && !isLoadingMore && (
            <button
              onClick={() => loadConversations(true)}
              className="w-full mt-3 px-4 py-2 text-xs text-blue-200 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg transition-all duration-200 font-medium"
            >
              Load more conversations
            </button>
          )}
        </div>
      )}
      
      {/* Render folder dropdown outside scroll container */}
      {showFolderDropdown && (
        <>
          {conversations.concat(searchResults).map(conv => 
            conv.id === showFolderDropdown ? renderFolderDropdown(conv) : null
          )}
        </>
      )}

    </>
  );

  if (embedded) {
    return <div className="h-full w-full flex flex-col">{content}</div>;
  }

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-80">
      <div className="h-full w-full bg-white/5 backdrop-blur-lg border-r border-white/10 shadow-2xl flex flex-col">
        {content}
      </div>
    </div>
  );
};
