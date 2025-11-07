import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { apiFetch } from '../api';

function Posts() {
  const { token } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState('');
  
  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [category, setCategory] = useState('general');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const categories = [
    { value: 'general', label: '💬 General Discussion', color: 'bg-blue-100 text-blue-800' },
    { value: 'scam-alert', label: '🚨 Scam Alert', color: 'bg-red-100 text-red-800' },
    { value: 'security-tip', label: '🛡️ Security Tip', color: 'bg-green-100 text-green-800' },
    { value: 'experience', label: '📖 Personal Experience', color: 'bg-purple-100 text-purple-800' },
    { value: 'question', label: '❓ Question/Help', color: 'bg-yellow-100 text-yellow-800' }
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/posts');
      const data = await res.json();
      
      if (data.success && data.posts) {
        setPosts(Array.isArray(data.posts) ? data.posts : []);
      } else {
        // Fallback for backward compatibility
        setPosts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading posts', err);
      setMessage('Error loading posts');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Image size should be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setMessage('Please select a valid image file');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!token) {
      setMessage('Please log in to create a post');
      return;
    }

    if (!content.trim() && !selectedImage) {
      setMessage('Please enter some content or select an image');
      return;
    }

    try {
      setPosting(true);
      setMessage('');
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', title.trim() || '');
      formData.append('content', content.trim());
      formData.append('anonymous', anonymous);
      formData.append('category', category);
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const res = await apiFetch('/api/posts', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header for FormData - browser will set it with boundary
      }, token);

      const data = await res.json();
      
      if (data.success && data.post) {
        setPosts([data.post, ...posts]);
        setTitle('');
        setContent('');
        setAnonymous(false);
        setCategory('general');
        setSelectedImage(null);
        setImagePreview(null);
        setShowCreateForm(false);
        setMessage('Post created successfully! 🎉');
      } else {
        setMessage(data.message || 'Error creating post');
      }
    } catch (err) {
      console.error('Post creation error', err);
      setMessage('Error creating post');
    } finally {
      setPosting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return date.toLocaleDateString();
  };

  const getCategoryStyle = (postCategory) => {
    const cat = categories.find(c => c.value === postCategory);
    return cat ? cat.color : 'bg-gray-100 text-gray-800';
  };

  const getCategoryLabel = (postCategory) => {
    const cat = categories.find(c => c.value === postCategory);
    return cat ? cat.label : '💬 General';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-brown-primary mb-2">Community Posts</h1>
          <p className="text-gray-600 text-lg">Share experiences, ask questions, and help protect our community</p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-brown-primary hover:text-brown-secondary font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Create Post Section */}
        {token ? (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-2 border-brown-primary/10">
            {!showCreateForm ? (
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Share with the Community</h3>
                <p className="text-gray-600 mb-4">Have a security tip, scam alert, or question? Let others know!</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-brown-primary hover:bg-brown-secondary text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Post
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-800">Create New Post</h3>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-primary focus:border-brown-primary"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={anonymous}
                        onChange={(e) => setAnonymous(e.target.checked)}
                        className="mr-2 h-4 w-4 text-brown-primary focus:ring-brown-primary border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Post anonymously</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your post a title..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-primary focus:border-brown-primary"
                    maxLength="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your thoughts, experiences, or ask a question..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-primary focus:border-brown-primary h-32 resize-none"
                    maxLength="1000"
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {content.length}/1000 characters
                  </div>
                </div>

                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Share an Image (Optional)</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-brown-primary transition-colors">
                    <div className="space-y-1 text-center">
                      {imagePreview ? (
                        <div className="relative">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="mx-auto h-32 w-auto rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <>
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-brown-primary hover:text-brown-secondary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brown-primary">
                              <span>Upload an image</span>
                              <input 
                                id="image-upload" 
                                name="image-upload" 
                                type="file" 
                                className="sr-only" 
                                accept="image/*"
                                onChange={handleImageSelect}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={posting || (!content.trim() && !selectedImage)}
                    className="bg-brown-primary hover:bg-brown-secondary disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex-1"
                  >
                    {posting ? 'Posting...' : 'Share Post'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      removeImage();
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 text-center border-2 border-brown-primary/10">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Join the Conversation</h3>
            <p className="text-gray-600 mb-4">Log in to share your experiences and help protect the community</p>
            <Link
              to="/auth"
              className="bg-brown-primary hover:bg-brown-secondary text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
            >
              Sign In to Post
            </Link>
          </div>
        )}

        {/* Messages */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.includes('Error') || message.includes('Please log in') 
            ? 'bg-red-100 text-red-700 border border-red-300' 
            : 'bg-green-100 text-green-700 border border-green-300'}`}>
            {message}
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brown-primary"></div>
              <p className="mt-2 text-gray-600">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No posts yet</h3>
              <p className="text-gray-600">Be the first to share something with the community!</p>
            </div>
          ) : (
            posts.map((post, index) => (
              <div key={post._id || post.id || index} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-brown-primary hover:shadow-xl transition-shadow">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-brown-primary rounded-full flex items-center justify-center text-white font-semibold">
                      {post.anonymous ? '🎭' : (post.author?.name || post.author || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-800">
                          {post.anonymous ? 'Anonymous User' : (post.author?.name || post.author || 'Unknown User')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryStyle(post.category)}`}>
                          {getCategoryLabel(post.category)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(post.createdAt)} • {post.content?.length || 0} characters
                      </div>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                {post.title && (
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{post.title}</h3>
                )}
                
                {post.content && (
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
                    {post.content}
                  </div>
                )}

                {/* Post Image */}
                {post.imageUrl && (
                  <div className="mb-4">
                    <img 
                      src={`http://localhost:5000${post.imageUrl}`}
                      alt="Post attachment" 
                      className="max-w-full h-auto rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => window.open(`http://localhost:5000${post.imageUrl}`, '_blank')}
                    />
                  </div>
                )}

                {/* Post Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <button className="flex items-center space-x-1 hover:text-brown-primary transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>Helpful</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-brown-primary transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.436L3 21l1.436-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                      </svg>
                      <span>Reply</span>
                    </button>
                  </div>
                  <button className="text-sm text-gray-500 hover:text-brown-primary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More Button */}
        {posts.length > 0 && (
          <div className="text-center mt-8">
            <button className="bg-white hover:bg-gray-50 text-brown-primary border-2 border-brown-primary px-6 py-3 rounded-lg font-medium transition-colors">
              Load More Posts
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Posts;
