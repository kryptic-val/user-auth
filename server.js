import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, Eye, EyeOff, UserPlus, LogIn, LogOut, Shield, MessageCircle, Send, Clock } from 'lucide-react';

const AuthenticatedCommentBoard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  // Auth form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  // Comment board states
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "Sarah Johnson",
      email: "sarah@example.com",
      content: "Welcome to our authenticated comment board! This is a great place to share thoughts securely.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      avatar: "SJ"
    },
    {
      id: 2,
      author: "Mike Chen",
      email: "mike@example.com",
      content: "I love how this system ensures only registered users can participate in discussions. Much safer this way!",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      avatar: "MC"
    }
  ]);
  const [newComment, setNewComment] = useState('');

  // JSONBin configuration from environment variables
  const JSONBIN_BIN_ID = process.env.REACT_APP_JSONBIN_BIN_ID;
  const JSONBIN_API_KEY = process.env.REACT_APP_JSONBIN_API_KEY;
  const JSONBIN_BASE_URL = 'https://api.jsonbin.io/v3/b';

  // Initialize - check for existing session
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Helper functions
  const hashPassword = (password) => {
    return btoa(password + 'salt123');
  };

  const fetchUsers = async () => {
    if (!JSONBIN_BIN_ID || !JSONBIN_API_KEY) {
      console.warn('JSONBin credentials not configured. Using demo mode.');
      return [];
    }

    try {
      const response = await fetch(`${JSONBIN_BASE_URL}/${JSONBIN_BIN_ID}/latest`, {
        headers: {
          'X-Master-Key': JSONBIN_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      return data.record.users || [];
    } catch (err) {
      console.error('Error fetching users:', err);
      return [];
    }
  };

  const saveUsers = async (users) => {
    if (!JSONBIN_BIN_ID || !JSONBIN_API_KEY) {
      console.warn('JSONBin credentials not configured. Cannot save users.');
      return false;
    }

    try {
      const response = await fetch(`${JSONBIN_BASE_URL}/${JSONBIN_BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_API_KEY,
        },
        body: JSON.stringify({ users }),
      });

      if (!response.ok) {
        throw new Error('Failed to save users');
      }

      return true;
    } catch (err) {
      console.error('Error saving users:', err);
      return false;
    }
  };

  // Authentication handlers
  const handleRegister = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (registerForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const users = await fetchUsers();
      
      if (!JSONBIN_BIN_ID || !JSONBIN_API_KEY) {
        setError('JSONBin credentials not configured. Please check your environment variables.');
        setIsLoading(false);
        return;
      }
      
      if (users.find(u => u.email === registerForm.email)) {
        setError('User with this email already exists');
        setIsLoading(false);
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        name: registerForm.name,
        email: registerForm.email,
        password: hashPassword(registerForm.password),
        createdAt: new Date().toISOString(),
      };

      const updatedUsers = [...users, newUser];
      const saved = await saveUsers(updatedUsers);

      if (saved) {
        setSuccess('Registration successful! Please log in.');
        setRegisterForm({ name: '', email: '', password: '', confirmPassword: '' });
        setActiveTab('login');
      } else {
        setError('Failed to register user. Please try again.');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    }

    setIsLoading(false);
  };

  const handleLogin = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!loginForm.email || !loginForm.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const users = await fetchUsers();
      
      if (!JSONBIN_BIN_ID || !JSONBIN_API_KEY) {
        setError('JSONBin credentials not configured. Please check your environment variables.');
        setIsLoading(false);
        return;
      }
      
      const user = users.find(u => 
        u.email === loginForm.email && 
        u.password === hashPassword(loginForm.password)
      );

      if (user) {
        const userSession = {
          id: user.id,
          name: user.name,
          email: user.email,
          loginTime: new Date().toISOString(),
        };

        setCurrentUser(userSession);
        localStorage.setItem('currentUser', JSON.stringify(userSession));
        setSuccess('Login successful! Welcome to the comment board.');
        setLoginForm({ email: '', password: '' });
        setError('');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }

    setIsLoading(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setSuccess('');
    setError('');
    setNewComment('');
    setLoginForm({ email: '', password: '' });
    setRegisterForm({ name: '', email: '', password: '', confirmPassword: '' });
  };

  // Comment board handlers
  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      author: currentUser.name,
      email: currentUser.email,
      content: newComment,
      timestamp: new Date(),
      avatar: currentUser.name.split(' ').map(name => name[0]).join('').toUpperCase()
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getAvatarColor = (author) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
    ];
    const index = author.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const showDemoInstructions = () => {
    setError('');
    const isConfigured = JSONBIN_BIN_ID && JSONBIN_API_KEY;
    
    if (isConfigured) {
      setSuccess('✅ JSONBin is properly configured! The system is ready for production use.');
    } else {
      setSuccess(`
        🔧 Environment Setup Instructions:
        
        1. Create a .env file in your project root:
           REACT_APP_JSONBIN_BIN_ID=your_bin_id_here
           REACT_APP_JSONBIN_API_KEY=your_api_key_here
        
        2. Get your credentials from jsonbin.io:
           - Sign up for a free account
           - Create a new bin with: {"users": []}
           - Copy your Bin ID and API Key
        
        3. Restart your development server
        
        4. The system will automatically use cloud storage!
        
        Current Status: ${!JSONBIN_BIN_ID ? '❌ Missing Bin ID' : '✅ Bin ID found'} | ${!JSONBIN_API_KEY ? '❌ Missing API Key' : '✅ API Key found'}
      `);
    }
  };

  // If user is not authenticated, show login/register
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Comment Board</h1>
            <p className="text-gray-600">Please log in to join the conversation</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'login'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Login
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'register'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              Register
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm whitespace-pre-line">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-700 text-sm whitespace-pre-line">{success}</p>
            </div>
          )}

          {/* Login Form */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Logging in...' : 'Login to Comment Board'}
              </button>
            </div>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                    placeholder="Create a password"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={handleRegister}
                disabled={isLoading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          )}

          {/* Demo Instructions */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={showDemoInstructions}
              className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
            >
              Show Setup Instructions
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated, show comment board
  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header with User Info */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Comment Board</h1>
                <p className="text-gray-600">Welcome back, {currentUser.name}!</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Comment Form */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="space-y-4">
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                Share your thoughts
              </label>
              <textarea
                id="comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="What's on your mind?"
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Posting as <span className="font-medium">{currentUser.name}</span>
              </p>
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
                Post Comment
              </button>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Discussion ({comments.length})
            </h2>
          </div>

          {comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${getAvatarColor(comment.author)}`}>
                    {comment.avatar}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{comment.author}</h3>
                      {comment.email === currentUser.email && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">You</span>
                      )}
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <Clock className="w-3 h-3" />
                        {formatTime(comment.timestamp)}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthenticatedCommentBoard;
