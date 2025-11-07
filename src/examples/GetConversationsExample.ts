/**
 * Example: How to get all conversations for the logged-in user
 * 
 * Based on API Integration Guide section 3.3
 */

import { api } from '../services/api';

/**
 * Get all conversations for the current logged-in user
 * 
 * Usage:
 * ```typescript
 * const conversations = await getMyConversations();
 * console.log('My conversations:', conversations);
 * ```
 */
export async function getMyConversations() {
  try {
    // Get first 20 conversations (default)
    const response = await api.getConversations(20, 0);
    
    console.log('Total conversations:', response.total);
    console.log('Conversations:', response.conversations);
    
    return response;
  } catch (error) {
    console.error('Failed to get conversations:', error);
    throw error;
  }
}

/**
 * Get conversations with pagination
 * 
 * Usage:
 * ```typescript
 * // Get first page (20 conversations)
 * const page1 = await getConversationsPage(1, 20);
 * 
 * // Get second page
 * const page2 = await getConversationsPage(2, 20);
 * ```
 */
export async function getConversationsPage(page: number, limit: number = 20) {
  const offset = (page - 1) * limit;
  
  try {
    const response = await api.getConversations(limit, offset);
    return response;
  } catch (error) {
    console.error('Failed to get conversations page:', error);
    throw error;
  }
}

/**
 * Get a specific conversation by ID
 * 
 * Usage:
 * ```typescript
 * const conversation = await getConversationById(123);
 * console.log('Conversation details:', conversation);
 * ```
 */
export async function getConversationById(conversationId: number) {
  try {
    const conversation = await api.getConversation(conversationId);
    return conversation;
  } catch (error) {
    console.error('Failed to get conversation:', error);
    throw error;
  }
}

/**
 * Example: Load all conversations in ThreadList component
 * 
 * ```typescript
 * import { useEffect, useState } from 'react';
 * import { api } from '../services/api';
 * 
 * function ThreadList() {
 *   const [conversations, setConversations] = useState([]);
 *   const [loading, setLoading] = useState(true);
 * 
 *   useEffect(() => {
 *     async function loadConversations() {
 *       try {
 *         const response = await api.getConversations(20, 0);
 *         setConversations(response.conversations);
 *       } catch (error) {
 *         console.error('Failed to load conversations:', error);
 *       } finally {
 *         setLoading(false);
 *       }
 *     }
 * 
 *     loadConversations();
 *   }, []);
 * 
 *   if (loading) return <div>Loading...</div>;
 * 
 *   return (
 *     <div>
 *       {conversations.map(conv => (
 *         <div key={conv.id}>
 *           {conv.type === 'direct' ? (
 *             <span>Chat with {conv.members[0]?.user?.username}</span>
 *           ) : (
 *             <span>Group: {conv.name}</span>
 *           )}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */



